import { useEffect, useMemo, useState } from 'react'

type CatalogItem = {
  id: string
  name: string
  category: string
  supplier: string
  manufacturer: string
  model: string
  description: string
  leadTimeDays: number
  priceUsd: number
  inStock: boolean
}

type CatalogResponse = {
  data: CatalogItem[]
}

const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price Low → High' },
  { value: 'price_desc', label: 'Price High → Low' },
  { value: 'lead_time_asc', label: 'Lead Time Low → High' },
  { value: 'lead_time_desc', label: 'Lead Time High → Low' },
  { value: 'supplier_asc', label: 'Supplier A–Z' },
] as const

const DRAFT_STORAGE_KEY = 'refinery_po_draft_id'

export default function BuyerCatalogPage() {
  const initialParams = new URLSearchParams(window.location.search)

  const [query, setQuery] = useState(initialParams.get('q') ?? '')
  const [category, setCategory] = useState(initialParams.get('category') ?? '')
  const [inStock, setInStock] = useState(initialParams.get('inStock') ?? '')
  const [sort, setSort] = useState(initialParams.get('sort') || 'price_asc')

  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [draftId, setDraftId] = useState<number | null>(() => {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  })
  const [actionLoading, setActionLoading] = useState(false)
  const [supplierBlockMessage, setSupplierBlockMessage] = useState<string | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const cellStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '1px solid #eee',
  }

  const debouncedQuery = useDebouncedValue(query, 300)

  useEffect(() => {
    const next = new URLSearchParams()
    if (debouncedQuery) next.set('q', debouncedQuery)
    if (category) next.set('category', category)
    if (inStock) next.set('inStock', inStock)
    if (sort) next.set('sort', sort)

    const url = `${window.location.pathname}?${next.toString()}`
    window.history.replaceState(null, '', url)
  }, [debouncedQuery, category, inStock, sort])

  useEffect(() => {
    const controller = new AbortController()
    const qs = new URLSearchParams()
    if (debouncedQuery) qs.set('q', debouncedQuery)
    if (category) qs.set('category', category)
    if (inStock) qs.set('inStock', inStock)
    if (sort) qs.set('sort', sort)

    setLoading(true)

    fetch(`/api/catalog/items?${qs.toString()}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to load catalog')
        }
        const json = (await res.json()) as any
        const data = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : []
        setItems(data as CatalogItem[])
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          // Simple failure handling for assignment scope
          console.error(error)
        }
      })
      .finally(() => {
        setLoading(false)
      })

    return () => controller.abort()
  }, [debouncedQuery, category, inStock, sort])

  const categories = useMemo(() => {
    const source = Array.isArray(items) ? items : []
    return Array.from(new Set(source.map((i) => i.category))).sort()
  }, [items])

  async function addToDraft(item: CatalogItem) {
    const qty = Math.max(1, Number(quantities[item.id] ?? 1))

    setActionLoading(true)
    setSupplierBlockMessage(null)

    try {
      if (!draftId) {
        const res = await fetch('/api/procurement/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requestor: 'Buyer',
            costCenter: 'CC-1234',
            neededByDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
            paymentTerms: 'Net 30',
            firstLine: { itemId: item.id, quantity: qty },
          }),
        })

        const contentType = res.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) {
          const text = await res.text()
          console.error('Unexpected non-JSON response from /api/procurement/drafts:', text)
          throw new Error('Draft creation failed: non-JSON response')
        }

        const json = (await res.json()) as any
        if (!res.ok) throw new Error(json?.message || 'Failed to create draft')

        // Handle serializer-wrapped Lucid model:
        // { data: { $attributes: { id: 45 }, $original: { id: 45 }, ... } }
        const poObject = json?.data ?? json
        const newId = Number(
          poObject?.id ?? poObject?.$attributes?.id ?? poObject?.$original?.id
        )
        if (Number.isFinite(newId)) {
          window.localStorage.setItem(DRAFT_STORAGE_KEY, String(newId))
          setDraftId(newId)
        }
      } else {
        const res = await fetch(`/api/procurement/drafts/${draftId}/lines`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: item.id, quantity: qty }),
        })

        if (res.status === 409) {
          const body = await res.json().catch(() => null)
          setSupplierBlockMessage(
            body?.message ||
              'Supplier mismatch: all items in the draft must be from the same supplier as the first item.'
          )
          return
        }

        if (!res.ok) {
          throw new Error('Failed to add line')
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
        <h1>Catalog</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a
            href="/buyer/draft"
            style={{
              padding: '6px 10px',
              borderRadius: 4,
              border: '1px solid var(--gray-4)',
              fontSize: 14,
            }}
          >
            Open draft
          </a>
          <a
            href="/buyer/purchase-orders"
            style={{
              padding: '6px 10px',
              borderRadius: 4,
              border: '1px solid var(--gray-4)',
              fontSize: 14,
            }}
          >
            PO list
          </a>
        </div>
      </div>

      {draftId && (
        <p style={{ marginTop: '8px' }}>
          Current draft: <strong>#{draftId}</strong>
        </p>
      )}

      {supplierBlockMessage && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px',
            border: '1px solid #fb2c36',
            background: '#fb2c361a',
          }}
        >
          {supplierBlockMessage}
        </div>
      )}

      <div style={{ marginTop: '16px', marginBottom: '16px', display: 'flex', gap: '12px' }}>
        <input
          type="search"
          placeholder="Search by name, id, supplier, manufacturer, model"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select value={inStock} onChange={(e) => setInStock(e.target.value)}>
          <option value="">Stock: All</option>
          <option value="true">In stock only</option>
          <option value="false">Out of stock only</option>
        </select>

        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <div>Loading catalog…</div>}

      {!loading && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
          <thead>
            <tr>
              <th style={cellStyle}>ID</th>
              <th style={cellStyle}>Name</th>
              <th style={cellStyle}>Supplier</th>
              <th style={cellStyle}>Category</th>
              <th style={cellStyle}>Lead Time (days)</th>
              <th style={cellStyle}>Price (USD)</th>
              <th style={cellStyle}>Stock</th>
              <th style={cellStyle}>Qty</th>
              <th style={cellStyle} />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td style={cellStyle}>{item.id}</td>
                <td style={cellStyle}>{item.name}</td>
                <td style={cellStyle}>{item.supplier}</td>
                <td style={cellStyle}>{item.category}</td>
                <td style={cellStyle}>{item.leadTimeDays}</td>
                <td style={cellStyle}>{item.priceUsd}</td>
                <td style={cellStyle}>{item.inStock ? 'In stock' : 'Out of stock'}</td>
                <td style={{ ...cellStyle, width: 110 }}>
                  <input
                    type="number"
                    min={1}
                    value={quantities[item.id] ?? 1}
                    onChange={(e) =>
                      setQuantities((prev) => ({ ...prev, [item.id]: Math.max(1, Number(e.target.value)) }))
                    }
                  />
                </td>
                <td style={{ ...cellStyle, width: 180 }}>
                  <button type="button" onClick={() => addToDraft(item)} disabled={actionLoading}>
                    {draftId ? 'Add to draft' : 'Start draft'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}

