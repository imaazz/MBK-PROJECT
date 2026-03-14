import CatalogItem from '#models/catalog_item'
import type { HttpContext } from '@adonisjs/core/http'

export default class CatalogController {
  /**
   * Search/filter/sort catalog items.
   *
   * Query params:
   * - q: text search across name, id, supplier, manufacturer, model
   * - category: exact match
   * - supplier: exact match
   * - inStock: 'true' | 'false'
   * - sort: 'price_asc' | 'price_desc' | 'lead_time_asc' | 'lead_time_desc' | 'supplier_asc'
   */
  async index({ request, serialize }: HttpContext) {
    const { q, category, supplier, inStock, sort } = request.qs()

    const query = CatalogItem.query()

    if (q && typeof q === 'string') {
      const like = `%${q}%`
      query.where((builder) => {
        builder
          .whereILike('name', like)
          .orWhereILike('id', like)
          .orWhereILike('supplier', like)
          .orWhereILike('manufacturer', like)
          .orWhereILike('model', like)
      })
    }

    if (category && typeof category === 'string') {
      query.where('category', category)
    }

    if (supplier && typeof supplier === 'string') {
      query.where('supplier', supplier)
    }

    if (inStock === 'true') {
      query.where('in_stock', true)
    } else if (inStock === 'false') {
      query.where('in_stock', false)
    }

    switch (sort) {
      case 'price_asc':
        query.orderBy('price_usd', 'asc')
        break
      case 'price_desc':
        query.orderBy('price_usd', 'desc')
        break
      case 'lead_time_asc':
        query.orderBy('lead_time_days', 'asc')
        break
      case 'lead_time_desc':
        query.orderBy('lead_time_days', 'desc')
        break
      case 'supplier_asc':
        query.orderBy('supplier', 'asc')
        break
      default:
        query.orderBy('name', 'asc')
    }

    const items = await query

    return serialize(items)
  }
}

