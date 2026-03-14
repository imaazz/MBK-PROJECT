import { BaseSeeder } from '@adonisjs/lucid/seeders'
import CatalogItem from '#models/catalog_item'
import PurchaseOrder from '#models/purchase_order'
import PurchaseOrderLine from '#models/purchase_order_line'
import PurchaseOrderStatusEvent from '#models/purchase_order_status_event'
import { DateTime } from 'luxon'

export default class PurchaseOrderSampleSeeder extends BaseSeeder {
  public static environment = ['development', 'test']

  public async run() {
    const firstItem = await CatalogItem.query().orderBy('id', 'asc').first()
    const secondItem = await CatalogItem.query()
      .where('supplier', firstItem?.supplier || '')
      .whereNot('id', firstItem?.id || '')
      .orderBy('id', 'asc')
      .first()

    if (!firstItem || !secondItem) {
      // Not enough catalog data to create example POs
      return
    }

    // Draft PO
    const draftPo = await PurchaseOrder.create({
      supplier: firstItem.supplier,
      requestor: 'Buyer Draft',
      costCenter: 'CC-1234',
      neededByDate: DateTime.utc().plus({ days: 14 }),
      paymentTerms: 'Net 30',
      status: 'Draft',
      poNumber: 'PENDING',
    })

    draftPo.poNumber = `PO-${DateTime.utc().toFormat('yyyyLLdd')}-${String(draftPo.id).padStart(4, '0')}`
    await draftPo.save()

    await PurchaseOrderLine.create({
      purchaseOrderId: draftPo.id,
      itemId: firstItem.id,
      quantity: 2,
      unitPrice: firstItem.priceUsd,
      leadTimeDays: firstItem.leadTimeDays,
      lineTotal: firstItem.priceUsd * 2,
    })

    await PurchaseOrderStatusEvent.create({
      purchaseOrderId: draftPo.id,
      fromStatus: null,
      toStatus: 'Draft',
      reason: 'Sample draft created by seeder',
    })

    // Submitted PO
    const submittedPo = await PurchaseOrder.create({
      supplier: firstItem.supplier,
      requestor: 'Buyer Submitted',
      costCenter: 'CC-5678',
      neededByDate: DateTime.utc().plus({ days: 21 }),
      paymentTerms: 'Net 45',
      status: 'Submitted',
      poNumber: 'PENDING',
    })

    submittedPo.poNumber = `PO-${DateTime.utc().toFormat('yyyyLLdd')}-${String(submittedPo.id).padStart(4, '0')}`
    await submittedPo.save()

    await PurchaseOrderLine.createMany([
      {
        purchaseOrderId: submittedPo.id,
        itemId: firstItem.id,
        quantity: 1,
        unitPrice: firstItem.priceUsd,
        leadTimeDays: firstItem.leadTimeDays,
        lineTotal: firstItem.priceUsd,
      },
      {
        purchaseOrderId: submittedPo.id,
        itemId: secondItem.id,
        quantity: 3,
        unitPrice: secondItem.priceUsd,
        leadTimeDays: secondItem.leadTimeDays,
        lineTotal: secondItem.priceUsd * 3,
      },
    ])

    await PurchaseOrderStatusEvent.createMany([
      {
        purchaseOrderId: submittedPo.id,
        fromStatus: null,
        toStatus: 'Draft',
        reason: 'Sample draft created by seeder',
      },
      {
        purchaseOrderId: submittedPo.id,
        fromStatus: 'Draft',
        toStatus: 'Submitted',
        reason: 'Sample PO submitted by seeder',
      },
      {
        purchaseOrderId: submittedPo.id,
        fromStatus: 'Submitted',
        toStatus: 'Approved',
        reason: 'Approved by seeder for activity log demo',
      },
      {
        purchaseOrderId: submittedPo.id,
        fromStatus: 'Approved',
        toStatus: 'Fulfilled',
        reason: 'Fulfilled by seeder for activity log demo',
      },
    ])

    // One more PO with full lifecycle for activity log
    const fulfilledPo = await PurchaseOrder.create({
      supplier: firstItem.supplier,
      requestor: 'Buyer Fulfilled',
      costCenter: 'CC-9999',
      neededByDate: DateTime.utc().plus({ days: 7 }),
      paymentTerms: 'Net 15',
      status: 'Fulfilled',
      poNumber: 'PENDING',
    })
    fulfilledPo.poNumber = `PO-${DateTime.utc().toFormat('yyyyLLdd')}-${String(fulfilledPo.id).padStart(4, '0')}`
    await fulfilledPo.save()

    await PurchaseOrderLine.create({
      purchaseOrderId: fulfilledPo.id,
      itemId: firstItem.id,
      quantity: 1,
      unitPrice: firstItem.priceUsd,
      leadTimeDays: firstItem.leadTimeDays,
      lineTotal: firstItem.priceUsd,
    })

    await PurchaseOrderStatusEvent.createMany([
      { purchaseOrderId: fulfilledPo.id, fromStatus: null, toStatus: 'Draft', reason: 'Draft created' },
      { purchaseOrderId: fulfilledPo.id, fromStatus: 'Draft', toStatus: 'Submitted', reason: 'Submitted' },
      { purchaseOrderId: fulfilledPo.id, fromStatus: 'Submitted', toStatus: 'Approved', reason: 'Approved' },
      { purchaseOrderId: fulfilledPo.id, fromStatus: 'Approved', toStatus: 'Fulfilled', reason: 'Fulfilled' },
    ])
  }
}

