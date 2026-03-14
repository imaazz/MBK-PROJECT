import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import PurchaseOrder from './purchase_order.js'
import CatalogItem from './catalog_item.js'

export default class PurchaseOrderLine extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'purchase_order_id' })
  declare purchaseOrderId: number

  @column({ columnName: 'item_id' })
  declare itemId: string

  @column()
  declare quantity: number

  @column({ columnName: 'unit_price' })
  declare unitPrice: number

  @column({ columnName: 'lead_time_days' })
  declare leadTimeDays: number

  @column({ columnName: 'line_total' })
  declare lineTotal: number

  @belongsTo(() => PurchaseOrder)
  declare purchaseOrder: BelongsTo<typeof PurchaseOrder>

  @belongsTo(() => CatalogItem, {
    foreignKey: 'itemId',
  })
  declare item: BelongsTo<typeof CatalogItem>
}

