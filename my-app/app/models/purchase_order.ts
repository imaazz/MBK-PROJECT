import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import PurchaseOrderLine from './purchase_order_line.js'
import PurchaseOrderStatusEvent from './purchase_order_status_event.js'

export type PurchaseOrderStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Fulfilled'

export default class PurchaseOrder extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'po_number' })
  declare poNumber: string

  @column()
  declare supplier: string

  @column()
  declare requestor: string

  @column({ columnName: 'cost_center' })
  declare costCenter: string

  @column.date({ columnName: 'needed_by_date' })
  declare neededByDate: DateTime

  @column({ columnName: 'payment_terms' })
  declare paymentTerms: string

  @column()
  declare status: PurchaseOrderStatus

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => PurchaseOrderLine)
  declare lines: HasMany<typeof PurchaseOrderLine>

  @hasMany(() => PurchaseOrderStatusEvent)
  declare statusEvents: HasMany<typeof PurchaseOrderStatusEvent>
}

