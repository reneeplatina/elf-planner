import { useRef } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { usePersist, uid, money } from './App'
import { priceOf } from './Planner'

// Generic spreadsheet table: inline cells, Enter moves down (adds a row at the end), × deletes.
export function Sheet({ cols, rows, check, onCell, onAdd, onDel, extra }) {
  const ref = useRef()
  const add = () => { const id = onAdd(); setTimeout(() => ref.current?.querySelector(`[data-r="${id}"] [data-c="${cols[0].k}"]`)?.focus(), 60) }
  const key = (e, i, c) => { if (e.key !== 'Enter' || e.shiftKey) return; e.preventDefault(); const n = ref.current.querySelectorAll(`[data-c="${c}"]`)[i + 1]; n ? n.focus() : add() }
  return <div ref={ref}>
    <table className={'sheet-t gsheet' + (check ? ' hasck' : '')}><thead><tr>{check && <th className="ck" title="Bought">✓</th>}{cols.map(c => <th key={c.k} style={{ width: c.w }}>{c.h}</th>)}<th className="dl" /></tr></thead>
      <tbody>{rows.map((r, i) => <tr key={r.id} data-r={r.id} className={check && r.bought ? 'got' : ''}>
        {check && <td className="ck"><input type="checkbox" checked={!!r.bought} onChange={e => onCell(r.id, 'bought', e.target.checked)} aria-label="Bought" /></td>}
        {cols.map((c, j) => <td key={c.k} className={j ? 'cx' : 'c0'} data-h={c.h}><input data-c={c.k} value={r[c.k] ?? ''} placeholder={j ? '' : c.ph || ''} onChange={e => onCell(r.id, c.k, e.target.value)} onKeyDown={e => key(e, i, c.k)} /></td>)}
        <td className="dl"><button className="rowdel" title="Delete row" aria-label="Delete row" onClick={() => onDel(r.id)}>×</button></td></tr>)}</tbody></table>
    <div className="tfoot"><button className="addrow" onClick={add}>+ Add row</button>{extra}</div>
  </div>
}

export const useGeneral = () => usePersist('general', [], x => Array.isArray(x) ? x : [])

export function Supplies() {
  const [g, setG] = useGeneral()
  const total = g.reduce((t, r) => t + priceOf(r.price), 0), left = g.filter(r => !r.bought).reduce((t, r) => t + priceOf(r.price), 0)
  return <section><h1 className="title">General Supplies</h1>
    <p className="hint lt center">Things to buy that aren't for one night. They also show in the planner's To buy list as "General".</p>
    <div className="sheetcard"><div className="band"><b>General</b><span className="ntotal">{money(total)}</span></div><div className="sbody">
      <Sheet check rows={g} cols={[{ k: 'item', h: 'Item', ph: 'Item', w: '30%' }, { k: 'store', h: 'Store / Link', w: '24%' }, { k: 'price', h: 'Price', w: '14%' }, { k: 'notes', h: 'Notes' }]}
        onCell={(id, k, v) => setG(a => a.map(r => r.id === id ? { ...r, [k]: v } : r))}
        onAdd={() => { const id = uid(); setG(a => [...a, { id, item: '', store: '', price: '', notes: '', bought: false }]); return id }}
        onDel={id => setG(a => a.filter(r => r.id !== id))}
        extra={<span>Still to buy <b>{money(left)}</b></span>} /></div></div>
  </section>
}

export function IdeaTabs() {
  return <div className="seg center-seg"><NavLink to="/ideas" end className={({ isActive }) => isActive ? 'on' : ''}>✨ All ideas</NavLink><NavLink to="/mylist" className={({ isActive }) => isActive ? 'on' : ''}>📝 My list</NavLink></div>
}

const supText = x => x.listSupplies ?? (x.supplies || []).map(s => s.name).filter(Boolean).join(', ')
export function MyList({ allIdeas, setIdeas }) {
  const mine = allIdeas.filter(x => x.myList && !x.deleted).sort((a, b) => a.myList - b.myList)
  const rows = mine.map(x => ({ id: x.id, title: x.title, sup: supText(x), notes: x.notes || '', date: x.date }))
  const set = (id, patch) => setIdeas(a => a.map(x => x.id === id ? { ...x, ...patch } : x))
  return <section><h1 className="title">My Ideas</h1><IdeaTabs />
    <div className="sheetcard"><div className="band"><b>My list</b><span className="ntotal">{rows.length} ideas</span></div><div className="sbody">
      <Sheet rows={rows} cols={[{ k: 'title', h: 'Idea', ph: 'Idea', w: '42%' }, { k: 'sup', h: 'Supplies', w: '30%' }, { k: 'notes', h: 'Notes' }]}
        onCell={(id, k, v) => set(id, k === 'sup' ? { listSupplies: v } : { [k]: v })}
        onAdd={() => { const id = 'my-' + uid(); setIdeas(a => [...a, { id, title: '', description: '', kid: 'Both', date: '', status: 'Approved', link: '', image: '', steps: [], supplies: [], notes: '', myList: Math.max(0, ...a.map(x => x.myList || 0)) + 1 }]); return id }}
        onDel={id => setIdeas(a => a.map(x => x.id !== id ? x : x.id.startsWith('my-') && !x.date ? { ...x, myList: 0, deleted: true } : { ...x, myList: 0 }))} /></div></div>
    <p className="hint lt center">Each row is a real idea — it also shows under All ideas. Tap an idea there to give it a night.</p>
  </section>
}
