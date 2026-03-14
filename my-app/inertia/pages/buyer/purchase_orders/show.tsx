import { useEffect, useState } from 'react'

type PurchaseOrderStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Fulfilled'

type CatalogItem = {
  id: string
  name: string
  supplier: string
}

type PurchaseOrderLine = {
  id: number
  itemId: string
  quantity: number
  unitPrice: number
  leadTimeDays: number
  lineTotal: number
  item: CatalogItem
}

type StatusEvent = {
  id: number
  fromStatus: PurchaseOrderStatus | null
  toStatus: PurchaseOrderStatus
  reason: string | null
  changedAt: string
}

type PurchaseOrder = {
  id: number
  poNumber: string
  supplier: string
  requestor: string
  costCenter: string
  neededByDate: string
  paymentTerms: string
  status: PurchaseOrderStatus
  lines: PurchaseOrderLine[]
  statusEvents: StatusEvent[]
}

const cellStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '1px solid #eee',
}

export default function PurchaseOrdersShowPage() {
  const [po, setPo] = useState<PurchaseOrder | null>(null)

  useEffect(() => {
    const parts = window.location.pathname.split('/')
    const id = parts[parts.length - 1]

    fetch(`/api/procurement/purchase-orders/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load PO')
        const json = (await res.json()) as any
        const data = json?.data ?? json
        const attrs = data?.$attributes ?? data
        const preloaded = data?.$preloaded ?? {}
        const lines = data?.lines ?? preloaded?.lines ?? []
        const statusEvents = data?.statusEvents ?? preloaded?.statusEvents ?? []
        setPo({
          id: attrs?.id ?? data?.id,
          poNumber: attrs?.poNumber ?? data?.poNumber,
          supplier: attrs?.supplier ?? data?.supplier,
          requestor: attrs?.requestor ?? data?.requestor,
          costCenter: attrs?.costCenter ?? data?.costCenter,
          neededByDate: attrs?.neededByDate ?? data?.neededByDate,
          paymentTerms: attrs?.paymentTerms ?? data?.paymentTerms,
          status: attrs?.status ?? data?.status,
          lines: Array.isArray(lines) ? lines : [],
          statusEvents: Array.isArray(statusEvents) ? statusEvents : [],
        })
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  if (!po) {
    return (
      <div style={{ padding: '24px' }}>
        <p>Loading purchase order…</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
        <h1>Purchase Order {po.poNumber}</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
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
          <a
            href="/buyer/catalog"
            style={{
              padding: '6px 10px',
              borderRadius: 4,
              border: '1px solid var(--gray-4)',
              fontSize: 14,
            }}
          >
            Catalog
          </a>
        </div>
      </div>
      <p style={{ marginTop: '8px' }}>
        Supplier: <strong>{po.supplier}</strong> · Status: <strong>{po.status}</strong>
      </p>

      <h2 style={{ marginTop: '24px' }}>Lines</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
        <thead>
          <tr>
            <th style={cellStyle}>Item</th>
            <th style={cellStyle}>Quantity</th>
            <th style={cellStyle}>Unit Price</th>
            <th style={cellStyle}>Lead Time</th>
            <th style={cellStyle}>Total</th>
          </tr>
        </thead>
        <tbody>
          {po.lines && po.lines.map((line) => (
            <tr key={line.id}>
              <td style={cellStyle}>
                {line.itemId} – {line.item?.name}
              </td>
              <td style={cellStyle}>{line.quantity}</td>
              <td style={cellStyle}>{line.unitPrice}</td>
              <td style={cellStyle}>{line.leadTimeDays}</td>
              <td style={cellStyle}>{line.lineTotal}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: '24px' }}>Activity log</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
        <thead>
          <tr>
            <th style={cellStyle}>When</th>
            <th style={cellStyle}>From → To</th>
            <th style={cellStyle}>Reason</th>
          </tr>
        </thead>
        <tbody>
          {po.statusEvents && po.statusEvents.map((event) => (
            <tr key={event.id}>
              <td style={cellStyle}>{new Date(event.changedAt).toLocaleString()}</td>
              <td style={cellStyle}>
                {event.fromStatus ?? '—'} → <strong>{event.toStatus}</strong>
              </td>
              <td style={cellStyle}>{event.reason || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

