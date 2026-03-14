import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import PurchaseOrder from './purchase_order.js'
import type { PurchaseOrderStatus } from './purchase_order.js'

export default class PurchaseOrderStatusEvent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'purchase_order_id' })
  declare purchaseOrderId: number

  @column({ columnName: 'from_status' })
  declare fromStatus: PurchaseOrderStatus | null

  @column({ columnName: 'to_status' })
  declare toStatus: PurchaseOrderStatus

  @column({ columnName: 'reason' })
  declare reason: string | null

  @column.dateTime({ columnName: 'changed_at', autoCreate: true })
  declare changedAt: DateTime

  @belongsTo(() => PurchaseOrder)
  declare purchaseOrder: BelongsTo<typeof PurchaseOrder>
}

