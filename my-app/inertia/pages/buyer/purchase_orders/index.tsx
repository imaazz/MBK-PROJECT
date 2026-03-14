import { useEffect, useState } from 'react'

type PurchaseOrderStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Fulfilled'

type PurchaseOrder = {
  id: number
  poNumber: string
  supplier: string
  requestor: string
  costCenter: string
  neededByDate: string
  paymentTerms: string
  status: PurchaseOrderStatus
}

export default function PurchaseOrdersIndexPage() {
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | ''>('')
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const cellStyle: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid #eee' }

  useEffect(() => {
    const qs = new URLSearchParams()
    if (statusFilter) qs.set('status', statusFilter)

    fetch(`/api/procurement/purchase-orders?${qs.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load orders')
        const json = (await res.json()) as any
        const data = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : []
        setOrders(data as PurchaseOrder[])
      })
      .catch((error) => {
        console.error(error)
      })
  }, [statusFilter])

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
        <h1>Purchase Orders</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
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
          <a
            href="/buyer/draft"
            style={{
              padding: '6px 10px',
              borderRadius: 4,
              border: '1px solid var(--gray-4)',
              fontSize: 14,
            }}
          >
            Draft
          </a>
        </div>
      </div>

      <div style={{ marginTop: '16px', marginBottom: '16px' }}>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PurchaseOrderStatus | '')}>
          <option value="">All statuses</option>
          <option value="Draft">Draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Fulfilled">Fulfilled</option>
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
        <thead>
          <tr>
            <th style={cellStyle}>PO Number</th>
            <th style={cellStyle}>Supplier</th>
            <th style={cellStyle}>Requestor</th>
            <th style={cellStyle}>Cost Center</th>
            <th style={cellStyle}>Needed By</th>
            <th style={cellStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((po) => (
            <tr key={po.id}>
              <td style={cellStyle}>
                <a href={`/buyer/purchase-orders/${po.id}`}>{po.poNumber}</a>
              </td>
              <td style={cellStyle}>{po.supplier}</td>
              <td style={cellStyle}>{po.requestor}</td>
              <td style={cellStyle}>{po.costCenter}</td>
              <td style={cellStyle}>{po.neededByDate}</td>
              <td style={cellStyle}>{po.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

