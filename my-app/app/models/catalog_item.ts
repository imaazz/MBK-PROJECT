import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class CatalogItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare category: string

  @column()
  declare supplier: string

  @column()
  declare manufacturer: string

  @column()
  declare model: string

  @column()
  declare description: string

  @column({ columnName: 'lead_time_days' })
  declare leadTimeDays: number

  @column({ columnName: 'price_usd' })
  declare priceUsd: number

  @column({ columnName: 'in_stock' })
  declare inStock: boolean

  @column()
  declare specs: Record<string, unknown>
}

