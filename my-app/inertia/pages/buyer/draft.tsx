import { useEffect, useMemo, useState } from 'react'

type PurchaseOrderStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Fulfilled'

type CatalogItem = {
  id: string
  name: string
  supplier: string
  leadTimeDays: number
  priceUsd: number
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

type PoResponse = { data: PurchaseOrder }

type Step = 'header' | 'review' | 'submit'

const DRAFT_STORAGE_KEY = 'refinery_po_draft_id'

export default function BuyerDraftPage() {
  const [step, setStep] = useState<Step>('header')
  const [draftId, setDraftId] = useState<number | null>(() => {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [po, setPo] = useState<PurchaseOrder | null>(null)

  const [requestor, setRequestor] = useState('Buyer')
  const [costCenter, setCostCenter] = useState('CC-1234')
  const [neededByDate, setNeededByDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    return d.toISOString().slice(0, 10)
  })
  const [paymentTerms, setPaymentTerms] = useState('Net 30')

  useEffect(() => {
    if (!draftId) return

    setLoading(true)
    setError(null)

    fetch(`/api/procurement/drafts/${draftId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load draft')
        const json = (await res.json()) as any
        const data = json?.data ?? json
        const attrs = data?.$attributes ?? data
        setPo(data)
        setRequestor(attrs?.requestor ?? data?.requestor ?? 'Buyer')
        setCostCenter(attrs?.costCenter ?? data?.costCenter ?? 'CC-1234')
        const rawDate = attrs?.neededByDate ?? data?.neededByDate
        setNeededByDate(rawDate ? String(rawDate).slice(0, 10) : new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10))
        setPaymentTerms(attrs?.paymentTerms ?? data?.paymentTerms ?? 'Net 30')
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load draft'))
      .finally(() => setLoading(false))
  }, [draftId])

  const lineCellStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '1px solid #eee',
  }

  const { linesForView, subtotal } = useMemo(() => {
    const raw = (po as any)?.lines ?? (po as any)?.$preloaded?.lines ?? []
    const safeLines: PurchaseOrderLine[] = Array.isArray(raw) ? raw : []
    const subtotalValue = safeLines.reduce((sum, l) => sum + (l.lineTotal || 0), 0)
    return { linesForView: safeLines, subtotal: subtotalValue }
  }, [po])

  async function saveHeader() {
    if (!draftId) {
      setError('No draft yet. Add an item from the catalog first.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/procurement/drafts/${draftId}/header`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestor, costCenter, neededByDate, paymentTerms }),
      })
      if (!res.ok) {
        throw new Error('Failed to update header')
      }
      const json = (await res.json()) as PoResponse
      setPo(json.data)
      setStep('review')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update header')
    } finally {
      setLoading(false)
    }
  }

  async function updateLineQuantity(lineId: number, quantity: number) {
    if (!draftId) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/procurement/drafts/${draftId}/lines/${lineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })
      if (!res.ok) throw new Error('Failed to update line')
      const json = (await res.json()) as PoResponse
      setPo(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update line')
    } finally {
      setLoading(false)
    }
  }

  async function removeLine(lineId: number) {
    if (!draftId) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/procurement/drafts/${draftId}/lines/${lineId}`, {
        method: 'DELETE',
      })
      if (!res.ok && res.status !== 204) throw new Error('Failed to remove line')

      const refreshed = await fetch(`/api/procurement/drafts/${draftId}`)
      if (!refreshed.ok) throw new Error('Failed to reload draft')
      const json = (await refreshed.json()) as PoResponse
      setPo(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove line')
    } finally {
      setLoading(false)
    }
  }

  async function submitDraft() {
    if (!draftId) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/procurement/drafts/${draftId}/submit`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to submit draft')
      const json = (await res.json()) as PoResponse
      setPo(json.data)
      setStep('submit')

      window.localStorage.removeItem(DRAFT_STORAGE_KEY)
      setDraftId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit draft')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
        <h1>Purchase Order Draft</h1>
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
            Back to catalog
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

      {po?.supplier && (
        <p style={{ marginTop: '8px' }}>
          Supplier locked to: <strong>{po.supplier}</strong>
        </p>
      )}

      {error && (
        <div style={{ marginTop: '12px', padding: '10px', border: '1px solid #fb2c36', background: '#fb2c361a' }}>
          {error}
        </div>
      )}

      {loading && <p style={{ marginTop: '12px' }}>Working…</p>}

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
        <button type="button" onClick={() => setStep('header')} disabled={step === 'header'}>
          Header
        </button>
        <button type="button" onClick={() => setStep('review')} disabled={step === 'review'}>
          Review
        </button>
        <button type="button" onClick={() => setStep('submit')} disabled={step === 'submit'}>
          Submit
        </button>
      </div>

      {step === 'header' && (
        <div style={{ marginTop: '16px' }}>
          <h2>Header</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
            <div>
              <label>Requestor</label>
              <input value={requestor} onChange={(e) => setRequestor(e.target.value)} />
            </div>
            <div>
              <label>Cost center</label>
              <input value={costCenter} onChange={(e) => setCostCenter(e.target.value)} />
            </div>
            <div>
              <label>Needed-by date</label>
              <input type="date" value={neededByDate} onChange={(e) => setNeededByDate(e.target.value)} />
            </div>
            <div>
              <label>Payment terms</label>
              <input value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '12px' }}>
            <button type="button" onClick={saveHeader} disabled={!draftId || loading}>
              Save & Continue
            </button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div style={{ marginTop: '16px' }}>
          <h2>Review</h2>

          {!po && <p style={{ marginTop: '12px' }}>Add an item from the catalog to start a draft.</p>}

          {po && (
            <>
              <div style={{ marginTop: '12px' }}>
                <p>
                  <strong>Requestor:</strong> {(po as any)?.$attributes?.requestor ?? po.requestor}
                </p>
                <p>
                  <strong>Cost center:</strong> {(po as any)?.$attributes?.costCenter ?? po.costCenter}
                </p>
                <p>
                  <strong>Needed-by:</strong> {(() => {
                    const raw = (po as any)?.$attributes?.neededByDate ?? po.neededByDate
                    return raw ? String(raw).slice(0, 10) : '—'
                  })()}
                </p>
                <p>
                  <strong>Payment terms:</strong> {(po as any)?.$attributes?.paymentTerms ?? po.paymentTerms}
                </p>
              </div>

              <h3 style={{ marginTop: '16px' }}>Lines</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                <thead>
                  <tr>
                    <th style={lineCellStyle}>Item</th>
                    <th style={lineCellStyle}>Qty</th>
                    <th style={lineCellStyle}>Unit</th>
                    <th style={lineCellStyle}>Total</th>
                    <th style={lineCellStyle} />
                  </tr>
                </thead>
                <tbody>
                  {linesForView.map((line) => (
                    <tr key={line.id}>
                      <td style={lineCellStyle}>
                        {line.itemId} – {line.item?.name}
                      </td>
                      <td style={{ ...lineCellStyle, width: 120 }}>
                        <input
                          type="number"
                          min={1}
                          value={line.quantity ?? 1}
                          onChange={(e) => updateLineQuantity(line.id, Number(e.target.value))}
                        />
                      </td>
                      <td style={lineCellStyle}>{line.unitPrice}</td>
                      <td style={lineCellStyle}>{line.lineTotal}</td>
                      <td style={{ ...lineCellStyle, width: 140 }}>
                        <button type="button" onClick={() => removeLine(line.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '12px' }}>
                <p>
                  Subtotal: <strong>{subtotal}</strong>
                </p>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setStep('header')}>
                  Edit header
                </button>
                <button type="button" onClick={submitDraft} disabled={loading}>
                  Submit PO
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 'submit' && (
        <div style={{ marginTop: '16px' }}>
          <h2>Submit</h2>
          {!po && <p style={{ marginTop: '12px' }}>Submit a draft from the review step.</p>}
          {po && (
            <div style={{ marginTop: '12px' }}>
              <p>
                Submitted. PO number: <strong>{po.poNumber}</strong>
              </p>
              <p>
                Current status: <strong>{po.status}</strong>
              </p>
              <div style={{ marginTop: '12px' }}>
                <a href="/buyer/purchase-orders">Go to PO list</a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

