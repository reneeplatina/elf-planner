import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { usePersist, uid, money, titleFor } from './App'
import { shrink } from './Manage'
const B = import.meta.env.BASE_URL
const NIGHTS = Array.from({ length: 25 }, (_, i) => String(i + 1))
const blankNight = () => ({ title: '', label: '', image: '', rows: [] })
const fixPlan = p => { const o = { ...(p || {}) }; NIGHTS.forEach(n => { o[n] = { ...blankNight(), ...(o[n] || {}) } }); return o }
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const dateLabel = n => `${WD[new Date(2026, 11, +n).getDay()]} Dec ${n}`
// Price/Store is free text: "5 for 10" -> 10, "1.5?" -> 1.5, "33 Amazon" -> 33, "Walmart" -> 0
export const priceOf = t => { t = String(t || ''); const f = t.match(/\d+(?:\.\d+)?\s*for\s*\$?(\d+(?:\.\d+)?)/i); if (f) return +f[1]; const m = t.match(/\$?(\d+(?:\.\d+)?)/); return m ? +m[1] : 0 }
const storeOf = t => { const s = String(t || '').replace(/\(.*?\)/g, '').replace(/\d+(?:\.\d+)?\s*for\s*\$?\d+(?:\.\d+)?/ig, '').replace(/[$?\d.]/g, '').trim(); return s ? s.replace(/\b\w/g, c => c.toUpperCase()) : '' }
const isFree = t => /already have/i.test(t) || /^\s*0\s*$/.test(String(t))
const src = u => !u ? '' : /^(https?:|data:|blob:)/.test(u) ? u : B + u.replace(/^\//, '')
const nightTotal = rows => rows.reduce((t, r) => t + priceOf(r.price), 0)

export default function Planner({ days, ideas }) {
  const [plan, setPlan] = usePersist('planner', fixPlan(null), fixPlan)
  const [view, setView] = useState('nights')
  const up = (n, patch) => setPlan(p => ({ ...p, [n]: { ...p[n], ...patch } }))
  const grand = NIGHTS.reduce((t, n) => t + nightTotal(plan[n].rows), 0)
  const left = NIGHTS.reduce((t, n) => t + nightTotal(plan[n].rows.filter(r => !r.bought)), 0)
  return <section className="planner">
    <div className="ptop">
      <div className="seg"><button className={view === 'nights' ? 'on' : ''} onClick={() => setView('nights')}>🎄 Nights</button><button className={view === 'buy' ? 'on' : ''} onClick={() => setView('buy')}>🛒 To buy</button></div>
      <div className="grand"><span>Grand total <b>{money(grand)}</b></span><span>Still to buy <b>{money(left)}</b></span></div>
    </div>
    {view === 'nights' ? <>
      <div className="jump">{NIGHTS.map(n => <a key={n} href={`#n${n}`} onClick={e => { e.preventDefault(); document.getElementById('n' + n)?.scrollIntoView({ behavior: 'smooth' }) }} className={plan[n].rows.length || titleFor(+n, days, ideas) || plan[n].title ? 'has' : ''}>{n}</a>)}</div>
      {NIGHTS.map(n => <Night key={n} n={n} night={plan[n]} up={p => up(n, p)} days={days} ideas={ideas} />)}
    </> : <ToBuy plan={plan} setPlan={setPlan} />}
  </section>
}

function Night({ n, night, up, days, ideas }) {
  const idea = ideas.find(x => x.status === 'Approved' && x.date === n)
  const fallbackTitle = n === '25' ? 'Ellie & Ozzy return with Santa' : titleFor(+n, days, ideas)
  const img = night.image || days[n]?.image || idea?.image || ''
  const tbl = useRef()
  const rows = night.rows
  const setRow = (id, k, v) => up({ rows: rows.map(r => r.id === id ? { ...r, [k]: v } : r) })
  const addRow = (focus = true) => { const r = { id: uid(), supply: '', price: '', notes: '', bought: false }; up({ rows: [...rows, r] }); if (focus) setTimeout(() => tbl.current?.querySelector(`[data-r="${r.id}"] input[data-c="supply"]`)?.focus(), 30) }
  const key = (e, i, c) => {
    if (e.key !== 'Enter') return; e.preventDefault()
    const next = tbl.current.querySelectorAll(`input[data-c="${c}"]`)[i + 1]
    if (next) next.focus(); else addRow()
  }
  const total = nightTotal(rows)
  return <article className="night-block" id={'n' + n}>
    <div className="band"><input className="dlabel" value={night.label || dateLabel(n)} onChange={e => up({ label: e.target.value === dateLabel(n) ? '' : e.target.value })} aria-label="Date" />
      <span className="ntotal">{money(total)}</span></div>
    <div className="nbody">
      <div className="nleft">
        <input className="ntitle" value={night.title || fallbackTitle || ''} placeholder="Scene title…" onChange={e => up({ title: e.target.value })} aria-label="Scene title" />
        <ImgSpot value={img} own={!!night.image} onChange={v => up({ image: v })} />
        {idea && <Link className="ilink" to={`/idea/${idea.id}`}>Open idea →</Link>}
      </div>
      <div className="nright" ref={tbl}>
        <table className="sheet-t"><thead><tr><th className="ck" title="Bought">✓</th><th>Supplies</th><th>Price / Store</th><th>Notes</th><th className="dl" /></tr></thead>
          <tbody>{rows.map((r, i) => <tr key={r.id} data-r={r.id} className={r.bought ? 'got' : ''}>
            <td className="ck"><input type="checkbox" checked={!!r.bought} onChange={e => setRow(r.id, 'bought', e.target.checked)} aria-label="Bought" /></td>
            {['supply', 'price', 'notes'].map(c => <td key={c} data-h={c === 'supply' ? 'Supply' : c === 'price' ? 'Price / Store' : 'Notes'}><input data-c={c} value={r[c] || ''} onChange={e => setRow(r.id, c, e.target.value)} onKeyDown={e => key(e, i, c)} placeholder={c === 'supply' ? 'Item' : ''} /></td>)}
            <td className="dl"><button className="rowdel" title="Delete row" aria-label="Delete row" onClick={() => up({ rows: rows.filter(x => x.id !== r.id) })}>×</button></td></tr>)}</tbody></table>
        <div className="tfoot"><button className="addrow" onClick={() => addRow()}>+ Add row</button><span>Night total <b>{money(total)}</b></span></div>
      </div>
    </div>
  </article>
}

function ImgSpot({ value, own, onChange }) {
  const [busy, setBusy] = useState(false), [paste, setPaste] = useState(false)
  return <div className="imgspot">
    {value ? <img src={src(value)} alt="" /> : <div className="ph"><span>✨</span><small>Scene picture</small></div>}
    <div className="imgbtns">
      <label className="mini-btn">{busy ? '…' : '📷 Upload'}<input type="file" accept="image/*" hidden onChange={async e => { const f = e.target.files[0]; if (!f) return; setBusy(true); try { onChange(await shrink(f, 900)) } finally { setBusy(false); e.target.value = '' } }} /></label>
      <button className="mini-btn" onClick={() => setPaste(!paste)}>🔗 Link</button>
      {own && <button className="mini-btn" onClick={() => onChange('')}>Remove</button>}
    </div>
    {paste && <input className="imgurl" autoFocus placeholder="Paste image link, then Enter" onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) { onChange(e.target.value.trim()); setPaste(false) } }} />}
  </div>
}

function ToBuy({ plan, setPlan }) {
  const items = NIGHTS.flatMap(n => plan[n].rows.filter(r => !r.bought && r.supply.trim() && !isFree(r.price)).map(r => ({ ...r, n, store: storeOf(r.price) || 'No store yet' })))
  const stores = [...new Set(items.map(x => x.store))].sort((a, b) => (a === 'No store yet') - (b === 'No store yet') || a.localeCompare(b))
  const tick = (n, id) => setPlan(p => ({ ...p, [n]: { ...p[n], rows: p[n].rows.map(r => r.id === id ? { ...r, bought: true } : r) } }))
  if (!items.length) return <p className="hint lt center">Nothing left to buy. 🎉</p>
  return <div className="tobuy">{stores.map(s => { const it = items.filter(x => x.store === s); return <div key={s} className="storeblock">
    <div className="band"><b>{s}</b><span className="ntotal">{money(nightTotal(it))}</span></div>
    <ul>{it.map(x => <li key={x.id}><label><input type="checkbox" onChange={() => tick(x.n, x.id)} /><span>{x.supply}<small>Dec {x.n}{x.price ? ` · ${x.price}` : ''}{x.notes ? ` · ${x.notes}` : ''}</small></span></label></li>)}</ul></div> })}
    <p className="hint lt center">Store comes from the Price / Store column (e.g. "1.5 Dollar Tree"). Tick to mark bought.</p></div>
}
