import CatalogItem from '#models/catalog_item'
import PurchaseOrder, { type PurchaseOrderStatus } from '#models/purchase_order'
import PurchaseOrderLine from '#models/purchase_order_line'
import PurchaseOrderStatusEvent from '#models/purchase_order_status_event'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

type DraftPayload = {
  requestor: string
  costCenter: string
  neededByDate: string
  paymentTerms: string
  firstLine: {
    itemId: string
    quantity: number
  }
}

export default class ProcurementController {
  private generatePoNumber(id: number): string {
    const today = DateTime.now().toFormat('yyyyLLdd')
    const seq = String(id).padStart(4, '0')
    return `PO-${today}-${seq}`
  }

  private assertTransition(from: PurchaseOrderStatus, to: PurchaseOrderStatus) {
    const allowed: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
      Draft: ['Submitted'],
      Submitted: ['Approved', 'Rejected'],
      Approved: ['Fulfilled'],
      Rejected: [],
      Fulfilled: [],
    }

    if (!allowed[from]?.includes(to)) {
      throw new Error(`INVALID_STATUS_TRANSITION:${from}->${to}`)
    }
  }

  /**
   * Create a new draft PO. First line defines supplier.
   */
  async createDraft({ request, response, serialize }: HttpContext) {
    const body = request.only(['requestor', 'costCenter', 'neededByDate', 'paymentTerms', 'firstLine']) as DraftPayload

    const item = await CatalogItem.findOrFail(body.firstLine.itemId)

    const po = await PurchaseOrder.create({
      supplier: item.supplier,
      requestor: body.requestor,
      costCenter: body.costCenter,
      neededByDate: DateTime.fromISO(body.neededByDate),
      paymentTerms: body.paymentTerms,
      status: 'Draft',
      poNumber: 'PENDING',
    })

    po.poNumber = this.generatePoNumber(po.id)
    await po.save()

    const unitPrice = item.priceUsd
    const quantity = body.firstLine.quantity
    const lineTotal = unitPrice * quantity

    await PurchaseOrderLine.create({
      purchaseOrderId: po.id,
      itemId: item.id,
      quantity,
      unitPrice,
      leadTimeDays: item.leadTimeDays,
      lineTotal,
    })

    await PurchaseOrderStatusEvent.create({
      purchaseOrderId: po.id,
      fromStatus: null,
      toStatus: 'Draft',
      reason: 'Draft created',
    })

    await po.load('lines', (query) => query.preload('item'))
    await po.load('statusEvents')

    response.status(201)
    return serialize(po)
  }

  /**
   * Get a single purchase order (used for both drafts and submitted POs).
   */
  async show({ params, serialize }: HttpContext) {
    const po = await PurchaseOrder.query()
      .where('id', params.id)
      .preload('lines', (query) => query.preload('item'))
      .preload('statusEvents', (query) => query.orderBy('changed_at', 'asc'))
      .firstOrFail()

    return serialize(po)
  }

  /**
   * Update draft header fields.
   */
  async updateDraftHeader({ params, request, response, serialize }: HttpContext) {
    const po = await PurchaseOrder.findOrFail(params.id)

    if (po.status !== 'Draft') {
      return response.status(409).send({
        error: 'ONLY_DRAFT_EDITABLE',
      })
    }

    const payload = request.only(['requestor', 'costCenter', 'neededByDate', 'paymentTerms'])

    if (payload.requestor) po.requestor = payload.requestor
    if (payload.costCenter) po.costCenter = payload.costCenter
    if (payload.neededByDate) po.neededByDate = DateTime.fromISO(payload.neededByDate)
    if (payload.paymentTerms) po.paymentTerms = payload.paymentTerms

    await po.save()

    await PurchaseOrderStatusEvent.create({
      purchaseOrderId: po.id,
      fromStatus: 'Draft',
      toStatus: 'Draft',
      reason: 'Header updated',
    })

    await po.load('lines', (query) => query.preload('item'))
    await po.load('statusEvents', (query) => query.orderBy('changed_at', 'asc'))

    return serialize(po)
  }

  /**
   * Add a line to an existing draft.
   * Returns 409 Conflict when supplier mismatch is detected.
   */
  async addLine({ params, request, response, serialize }: HttpContext) {
    const po = await PurchaseOrder.findOrFail(params.id)

    if (po.status !== 'Draft') {
      return response.status(409).send({
        error: 'ONLY_DRAFT_EDITABLE',
      })
    }

    const { itemId, quantity } = request.only(['itemId', 'quantity'])
    const item = await CatalogItem.findOrFail(itemId)

    if (item.supplier !== po.supplier) {
      return response.status(409).send({
        error: 'SUPPLIER_MISMATCH',
        message:
          'All items in a purchase order draft must come from the same supplier as the first item in the draft.',
        supplier: po.supplier,
        attemptedSupplier: item.supplier,
      })
    }

    const unitPrice = item.priceUsd
    const qty = Number(quantity)
    const lineTotal = unitPrice * qty

    const line = await PurchaseOrderLine.create({
      purchaseOrderId: po.id,
      itemId: item.id,
      quantity: qty,
      unitPrice,
      leadTimeDays: item.leadTimeDays,
      lineTotal,
    })

    await po.load('lines', (query) => query.preload('item'))
    await po.load('statusEvents', (query) => query.orderBy('changed_at', 'asc'))

    response.status(201)
    return serialize({ order: po, newLine: line })
  }

  /**
   * Update a draft line (e.g. quantity).
   */
  async updateLine({ params, request, response, serialize }: HttpContext) {
    const po = await PurchaseOrder.findOrFail(params.id)

    if (po.status !== 'Draft') {
      return response.status(409).send({
        error: 'ONLY_DRAFT_EDITABLE',
      })
    }

    const line = await PurchaseOrderLine.query()
      .where('purchase_order_id', po.id)
      .andWhere('id', params.lineId)
      .firstOrFail()

    const { quantity } = request.only(['quantity'])
    const qty = Number(quantity)

    line.quantity = qty
    line.lineTotal = line.unitPrice * qty
    await line.save()

    await po.load('lines', (query) => query.preload('item'))

    return serialize(po)
  }

  /**
   * Remove a line from a draft.
   */
  async removeLine({ params, response }: HttpContext) {
    const po = await PurchaseOrder.findOrFail(params.id)

    if (po.status !== 'Draft') {
      return response.status(409).send({
        error: 'ONLY_DRAFT_EDITABLE',
      })
    }

    const deleted = await PurchaseOrderLine.query()
      .where('purchase_order_id', po.id)
      .andWhere('id', params.lineId)
      .delete()

    if (!deleted) {
      return response.status(404).send({ error: 'LINE_NOT_FOUND' })
    }

    return response.noContent()
  }

  /**
   * Submit a draft purchase order.
   * This operation is idempotent: re-submitting an already submitted PO returns the same PO.
   */
  async submitDraft({ params, response, serialize }: HttpContext) {
    const po = await PurchaseOrder.findOrFail(params.id)

    if (po.status === 'Submitted' || po.status === 'Approved' || po.status === 'Rejected' || po.status === 'Fulfilled') {
      await po.load('lines', (query) => query.preload('item'))
      await po.load('statusEvents', (query) => query.orderBy('changed_at', 'asc'))
      return serialize(po)
    }

    if (po.status !== 'Draft') {
      return response.status(409).send({
        error: 'ONLY_DRAFT_SUBMITTABLE',
      })
    }

    const fromStatus = po.status
    po.status = 'Submitted'
    await po.save()

    await PurchaseOrderStatusEvent.create({
      purchaseOrderId: po.id,
      fromStatus,
      toStatus: 'Submitted',
      reason: 'PO submitted',
    })

    await po.load('lines', (query) => query.preload('item'))
    await po.load('statusEvents', (query) => query.orderBy('changed_at', 'asc'))

    return serialize(po)
  }

  /**
   * List purchase orders with optional status filter.
   */
  async listOrders({ request, serialize }: HttpContext) {
    const { status } = request.qs()

    const query = PurchaseOrder.query().orderBy('created_at', 'desc')

    if (status && typeof status === 'string') {
      query.where('status', status)
    }

    const orders = await query

    return serialize(orders)
  }

  /**
   * Transition status for an existing purchase order.
   */
  async transitionStatus({ params, request, response, serialize }: HttpContext) {
    const po = await PurchaseOrder.findOrFail(params.id)
    const { toStatus, reason } = request.only(['toStatus', 'reason']) as {
      toStatus: PurchaseOrderStatus
      reason?: string
    }

    try {
      this.assertTransition(po.status, toStatus)
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('INVALID_STATUS_TRANSITION')) {
        return response.status(409).send({ error: error.message })
      }
      throw error
    }

    const fromStatus = po.status
    po.status = toStatus
    await po.save()

    await PurchaseOrderStatusEvent.create({
      purchaseOrderId: po.id,
      fromStatus,
      toStatus,
      reason: reason || null,
    })

    await po.load('lines', (query) => query.preload('item'))
    await po.load('statusEvents', (query) => query.orderBy('changed_at', 'asc'))

    return serialize(po)
  }
}

