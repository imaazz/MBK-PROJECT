import { BaseSeeder } from '@adonisjs/lucid/seeders'
import CatalogItem from '#models/catalog_item'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export default class CatalogItemSeeder extends BaseSeeder {
  public static environment = ['development', 'test']

  async run() {
    const filePath = join(process.cwd(), '..', 'requirements', 'refinery_items_50_5suppliers_strict.json')
    const raw = readFileSync(filePath, 'utf-8')
    const items: any[] = JSON.parse(raw)

    await CatalogItem.updateOrCreateMany(
      'id',
      items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        supplier: item.supplier,
        manufacturer: item.manufacturer,
        model: item.model,
        description: item.description,
        leadTimeDays: item.leadTimeDays,
        priceUsd: item.priceUsd,
        inStock: item.inStock,
        specs: item.specs,
      }))
    )
  }
}

