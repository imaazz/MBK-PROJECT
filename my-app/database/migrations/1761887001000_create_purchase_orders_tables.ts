import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected ordersTable = 'purchase_orders'
  protected linesTable = 'purchase_order_lines'
  protected eventsTable = 'purchase_order_status_events'

  async up() {
    this.schema.createTable(this.ordersTable, (table) => {
      table.increments('id').primary()
      table.string('po_number').notNullable().unique()
      table.string('supplier').notNullable()
      table.string('requestor').notNullable()
      table.string('cost_center').notNullable()
      table.date('needed_by_date').notNullable()
      table.string('payment_terms').notNullable()
      table
        .enu('status', ['Draft', 'Submitted', 'Approved', 'Rejected', 'Fulfilled'], {
          useNative: false,
          enumName: 'purchase_order_status',
        })
        .notNullable()
        .defaultTo('Draft')
      table.timestamp('created_at', { useTz: false }).notNullable()
      table.timestamp('updated_at', { useTz: false }).nullable()

      table.index(['supplier'], 'purchase_orders_supplier_index')
      table.index(['status'], 'purchase_orders_status_index')
    })

    this.schema.createTable(this.linesTable, (table) => {
      table.increments('id').primary()
      table
        .integer('purchase_order_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable(this.ordersTable)
        .onDelete('CASCADE')
      table.string('item_id').notNullable().references('id').inTable('catalog_items')
      table.integer('quantity').notNullable()
      table.integer('unit_price').notNullable()
      table.integer('lead_time_days').notNullable()
      table.integer('line_total').notNullable()

      table.index(['purchase_order_id'], 'po_lines_order_index')
      table.index(['item_id'], 'po_lines_item_index')
    })

    this.schema.createTable(this.eventsTable, (table) => {
      table.increments('id').primary()
      table
        .integer('purchase_order_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable(this.ordersTable)
        .onDelete('CASCADE')
      table.string('from_status').nullable()
      table.string('to_status').notNullable()
      table.string('reason').nullable()
      table.timestamp('changed_at', { useTz: false }).notNullable()

      table.index(['purchase_order_id'], 'po_events_order_index')
    })

    // Postgres trigger to enforce single supplier at DB level
    this.schema.raw(`
      CREATE OR REPLACE FUNCTION enforce_po_single_supplier()
      RETURNS trigger AS $$
      BEGIN
        IF (
          SELECT supplier FROM ${this.ordersTable} WHERE id = NEW.purchase_order_id
        ) IS NULL THEN
          RAISE EXCEPTION 'PURCHASE_ORDER_NOT_FOUND';
        ELSIF (
          SELECT supplier FROM ${this.ordersTable} WHERE id = NEW.purchase_order_id
        ) != (
          SELECT supplier FROM catalog_items WHERE id = NEW.item_id
        ) THEN
          RAISE EXCEPTION 'SUPPLIER_MISMATCH';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `)

    this.schema.raw(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_trigger WHERE tgname = 'po_lines_supplier_enforcement'
        ) THEN
          CREATE TRIGGER po_lines_supplier_enforcement
          BEFORE INSERT ON ${this.linesTable}
          FOR EACH ROW
          EXECUTE FUNCTION enforce_po_single_supplier();
        END IF;
      END;
      $$;
    `)
  }

  async down() {
    this.schema.raw(`DROP TRIGGER IF EXISTS po_lines_supplier_enforcement ON ${this.linesTable}`)
    this.schema.raw(`DROP FUNCTION IF EXISTS enforce_po_single_supplier()`)
    this.schema.dropTable(this.eventsTable)
    this.schema.dropTable(this.linesTable)
    this.schema.dropTable(this.ordersTable)
  }
}

