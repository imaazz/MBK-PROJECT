import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'catalog_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('name').notNullable()
      table.string('category').notNullable()
      table.string('supplier').notNullable()
      table.string('manufacturer').notNullable()
      table.string('model').notNullable()
      table.text('description').notNullable()
      table.integer('lead_time_days').notNullable()
      table.integer('price_usd').notNullable()
      table.boolean('in_stock').notNullable()
      table.json('specs').notNullable()

      table.index(['category'], 'catalog_items_category_index')
      table.index(['supplier'], 'catalog_items_supplier_index')
      table.index(['manufacturer'], 'catalog_items_manufacturer_index')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

