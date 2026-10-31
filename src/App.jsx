import { useEffect, useState, useMemo } from 'react'
import { Routes, Route, NavLink, Link, useParams } from 'react-router-dom'
import { load, save, backend } from './storage'
import { defaultDays, SUPPLIES, STORES } from './data'

function usePersist(key, init) {
  const [v, setV] = useState(init); const [ready, setReady] = useState(false)
  useEffect(() => { load(key, init).then(x => { setV(x); setReady(true) }) }, [key])
  useEffect(() => { if (ready) save(key, v) }, [v, ready])
  return [v, setV]
}
const uid = () => Math.random().toString(36).slice(2)
const money = n => '$' + (Number(n) || 0).toFixed(2)

export default function App() {
  const [days, setDays] = usePersist('days', defaultDays())
  const [closet, setCloset] = usePersist('closet', Object.fromEntries(SUPPLIES.map(s => [s, false])))
  const [inbox, setInbox] = usePersist('inbox', [])
  const [secret, setSecret] = usePersist('secret', false)
  const [nov, setNov] = usePersist('november', 'Buy Advent calendars AFTER payday! Order on Amazon by ~Nov 20 so they arrive before Dec 1.\n\nBills:\n- ')
  const P = { days, setDays, closet, setCloset, inbox, setInbox, nov, setNov }
  return <div className={secret ? 'secret' : ''}>
    <header className="top no-print">
      <Link to="/" className="logo">🎄 Ellie &amp; Ozzy HQ</Link>
      <button className="secretbtn" onClick={() => setSecret(!secret)}>{secret ? '🙈 Secret ON' : '👀 Secret off'}</button>
      <nav>{[['/', 'Calendar'], ['/prep', 'Prep'], ['/shop', 'Shopping'], ['/closet', 'Closet'], ['/print', 'Printables'], ['/inbox', 'Ideas'], ['/nov', 'November']].map(([to, l]) =>
        <NavLink key={to} to={to} end>{l}</NavLink>)}</nav>
    </header>
    <main className="blurzone">
      <Routes>
        <Route path="/" element={<Calendar {...P} />} />
        <Route path="/day/:n" element={<Day {...P} />} />
        <Route path="/prep" element={<Prep {...P} />} />
        <Route path="/shop" element={<Shop {...P} />} />
        <Route path="/closet" element={<Closet {...P} />} />
        <Route path="/print" element={<Printables />} />
        <Route path="/inbox" element={<Inbox {...P} />} />
        <Route path="/nov" element={<Nov {...P} />} />
      </Routes>
    </main>
    <footer className="no-print">Private planner · storage: {backend} · lighthearted chaos only, no naughty lists ✨</footer>
  </div>
}

function Calendar({ days }) {
  const cells = [...Array(2).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)]
  return <section>
    <h1 className="title">December 2026 <span>✨ Elf Magic ✨</span></h1>
    <div className="cal">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="dow">{d}</div>)}
      {cells.map((n, i) => n == null ? <div key={i} /> : n <= 24 ?
        <Link key={i} to={`/day/${n}`} className={'cell ' + (days[n]?.idea.title ? 'planned' : '')}>
          <span className="num">{n}</span><span className="t">{days[n]?.idea.title || '+ plan'}</span>
        </Link> : <div key={i} className="cell off"><span className="num">{n}</span>{n === 25 && <span className="t">🎅 Christmas</span>}</div>)}
    </div>
  </section>
}

function List({ items, set, placeholder, numbered }) {
  const [t, setT] = useState('')
  const Tag = numbered ? 'ol' : 'ul'
  return <div>
    <Tag className="tasks">{items.map(x => <li key={x.id}>
      <label><input type="checkbox" checked={x.done} onChange={() => set(items.map(y => y.id === x.id ? { ...y, done: !y.done } : y))} />
        <span className={x.done ? 'done' : ''}>{x.text}</span></label>
      <button className="x" onClick={() => set(items.filter(y => y.id !== x.id))}>✕</button></li>)}</Tag>
    <form className="row" onSubmit={e => { e.preventDefault(); if (t) { set([...items, { id: uid(), text: t, done: false }]); setT('') } }}>
      <input value={t} onChange={e => setT(e.target.value)} placeholder={placeholder} /><button>Add</button></form>
  </div>
}

function Day({ days, setDays, closet }) {
  const n = +useParams().n; const d = days[n]; const [link, setLink] = useState('')
  if (!d) return <p>No such day.</p>
  const up = (k, v) => setDays({ ...days, [n]: { ...d, [k]: v } })
  const total = d.shopping.filter(x => !x.own).reduce((s, x) => s + x.qty * x.price, 0)
  const missing = d.supplies.filter(s => !closet[s])
  return <section className="day">
    <div className="daynav"><Link to={n > 1 ? `/day/${n - 1}` : '/'}>‹</Link><h1>Dec {n}</h1><Link to={n < 24 ? `/day/${n + 1}` : '/'}>›</Link></div>
    <div className="card"><h2>💡 The Idea</h2>
      <input className="big" value={d.idea.title} placeholder="Title" onChange={e => up('idea', { ...d.idea, title: e.target.value })} />
      <textarea rows={5} value={d.idea.description} placeholder="Describe the scene" onChange={e => up('idea', { ...d.idea, description: e.target.value })} />
      <div className="thumbs">{d.idea.links.map((l, i) => <div key={i} className="thumb">
        {/\.(png|jpe?g|gif|webp)/i.test(l) && <img src={l} alt="" />}<a href={l} target="_blank">{l.slice(0, 40)}</a>
        <button className="x" onClick={() => up('idea', { ...d.idea, links: d.idea.links.filter((_, j) => j !== i) })}>✕</button></div>)}</div>
      <form className="row" onSubmit={e => { e.preventDefault(); if (link) { up('idea', { ...d.idea, links: [...d.idea.links, link] }); setLink('') } }}>
        <input value={link} onChange={e => setLink(e.target.value)} placeholder="Inspiration link or image URL" /><button>Add</button></form>
    </div>
    <div className="card"><h2>🛍️ Shopping & Supplies</h2>
      <div className="tablewrap"><table><thead><tr><th>Item</th><th>Qty</th><th>Store</th><th>Est $</th><th>Own</th><th /></tr></thead><tbody>
        {d.shopping.map(x => { const ch = (k, v) => up('shopping', d.shopping.map(y => y.id === x.id ? { ...y, [k]: v } : y)); return <tr key={x.id}>
          <td><input value={x.item} onChange={e => ch('item', e.target.value)} /></td>
          <td><input type="number" className="sm" value={x.qty} onChange={e => ch('qty', +e.target.value)} /></td>
          <td><select value={x.store} onChange={e => ch('store', e.target.value)}>{STORES.map(s => <option key={s}>{s}</option>)}</select></td>
          <td><input type="number" step="0.01" className="sm" value={x.price} onChange={e => ch('price', +e.target.value)} /></td>
          <td><input type="checkbox" checked={x.own} onChange={e => ch('own', e.target.checked)} /></td>
          <td><button className="x" onClick={() => up('shopping', d.shopping.filter(y => y.id !== x.id))}>✕</button></td></tr> })}
      </tbody></table></div>
      <div className="row"><button onClick={() => up('shopping', [...d.shopping, { id: uid(), item: '', qty: 1, store: 'Dollar Tree', price: 1.5, actual: '', own: false }])}>+ Item</button>
        <b className="total">Est. total: {money(total)}</b></div>
      <p className="hint">Prices are estimates (Oct 2026 web checks: Sonic Advent ~$33 Amazon, Fuggler Advent $30–35, Dollar Tree $1.50).</p>
      <h3>From the Craft Closet</h3>
      <div className="chips">{SUPPLIES.map(s => <button key={s} className={'chip ' + (d.supplies.includes(s) ? (closet[s] ? 'on' : 'miss') : '')}
        onClick={() => up('supplies', d.supplies.includes(s) ? d.supplies.filter(y => y !== s) : [...d.supplies, s])}>{s}</button>)}</div>
      {missing.length > 0 && <p className="warn">Missing from closet: {missing.join(', ')}</p>}
    </div>
    <div className="card"><h2>📋 Prep Ahead</h2><List items={d.prep} set={v => up('prep', v)} placeholder="Daytime prep task" /></div>
    <div className="card night"><h2>🌙 Night-of Instructions</h2><List numbered items={d.night} set={v => up('night', v)} placeholder="Next step" /></div>
    <div className="card"><h2>🎁 Gifts & Games</h2>{['Rocky', 'Lia'].map(k => <label key={k} className="field"><b>{k}</b>
      <input value={d.gifts[k]} onChange={e => up('gifts', { ...d.gifts, [k]: e.target.value })} /></label>)}</div>
    <div className="card"><h2>✉️ Message</h2>
      <div className="chips">{['Letter Board', 'Printable', 'Handwritten', 'None'].map(t => <button key={t} className={'chip ' + (d.message.type === t ? 'on' : '')} onClick={() => up('message', { ...d.message, type: t })}>{t}</button>)}</div>
      <textarea rows={3} value={d.message.text} onChange={e => up('message', { ...d.message, text: e.target.value })} placeholder="Message text" /></div>
    <div className="card"><h2>📸 Photos & Memories</h2>
      <textarea rows={3} value={d.memories.notes} placeholder="What did they say? Best reaction?" onChange={e => up('memories', { ...d.memories, notes: e.target.value })} />
      <input type="file" accept="image/*" onChange={e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => {
        const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); const s = Math.min(1, 800 / img.width); c.width = img.width * s; c.height = img.height * s
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); up('memories', { ...d.memories, photos: [...d.memories.photos, c.toDataURL('image/jpeg', .7)] }) }; img.src = r.result }; r.readAsDataURL(f) }} />
      <div className="thumbs">{d.memories.photos.map((p, i) => <img key={i} src={p} className="mem" />)}</div></div>
  </section>
}

function Prep({ days, setDays }) {
  return <section><h1 className="title">Prep Dashboard</h1><p className="hint">Do it all in daylight, so nights are just "place & go."</p>
    {Object.entries(days).filter(([, d]) => d.prep.length).map(([n, d]) => <div className="card" key={n}>
      <h2><Link to={`/day/${n}`}>Dec {n}: {d.idea.title}</Link> <small>{d.prep.filter(x => x.done).length}/{d.prep.length}</small></h2>
      <List items={d.prep} set={v => setDays({ ...days, [n]: { ...d, prep: v } })} placeholder="Add prep task" /></div>)}</section>
}

function Shop({ days, setDays, closet }) {
  const rows = Object.entries(days).flatMap(([n, d]) => d.shopping.map(x => ({ ...x, n })))
  const ch = (r, k, v) => setDays({ ...days, [r.n]: { ...days[r.n], shopping: days[r.n].shopping.map(y => y.id === r.id ? { ...y, [k]: v } : y) } })
  const missing = [...new Set(Object.values(days).flatMap(d => d.supplies))].filter(s => !closet[s])
  let E = 0, A = 0
  return <section><h1 className="title">Shopping List</h1>
    {missing.length > 0 && <div className="card"><h2>🧰 Closet gaps</h2><p>{missing.join(' · ')}</p></div>}
    {STORES.map(s => { const r = rows.filter(x => x.store === s && !x.own); if (!r.length) return null
      const e = r.reduce((t, x) => t + x.qty * x.price, 0), a = r.reduce((t, x) => t + (+x.actual || 0), 0); E += e; A += a
      return <div className="card" key={s}><h2>{s} <small>est {money(e)} · actual {money(a)}</small></h2>
        <div className="tablewrap"><table><thead><tr><th>Item</th><th>Day</th><th>Qty</th><th>Est</th><th>Actual $</th></tr></thead><tbody>
          {r.map(x => <tr key={x.id}><td>{x.item}</td><td>{x.n}</td><td>{x.qty}</td><td>{money(x.qty * x.price)}</td>
            <td><input type="number" step="0.01" className="sm" value={x.actual} onChange={e => ch(x, 'actual', e.target.value)} /></td></tr>)}</tbody></table></div></div> })}
    <div className="card grand"><b>Estimated: {money(E)}</b> · <b>Actual: {money(A)}</b> · <b>{A > E ? 'Over' : 'Under'}: {money(Math.abs(E - A))}</b></div></section>
}

function Closet({ closet, setCloset, days }) {
  const [t, setT] = useState('')
  const need = [...new Set(Object.values(days).flatMap(d => d.supplies))]
  const missing = need.filter(s => !closet[s])
  return <section><h1 className="title">Craft Supply Closet</h1>
    <div className="card"><h2>Check what you have</h2><div className="grid2">{Object.keys(closet).map(s => <label key={s} className="check">
      <input type="checkbox" checked={closet[s]} onChange={e => setCloset({ ...closet, [s]: e.target.checked })} />{s}</label>)}</div>
      <form className="row" onSubmit={e => { e.preventDefault(); if (t) { setCloset({ ...closet, [t]: false }); setT('') } }}><input value={t} onChange={e => setT(e.target.value)} placeholder="Add supply" /><button>Add</button></form></div>
    <div className="card"><h2>🛒 Buy only what I'm missing</h2>{missing.length ? <ul>{missing.map(s => <li key={s}>{s} <small>(Days {Object.entries(days).filter(([, d]) => d.supplies.includes(s)).map(([n]) => n).join(', ')})</small></li>)}</ul> : <p>All stocked! 🎉</p>}</div></section>
}

const RULES = ['Look, laugh, but don\'t touch! Our magic works best when we\'re hands-off.', 'Accidents happen! If we get bumped, no worries: a grown-up will do a cinnamon rescue and we\'ll be good as new.', 'Every elf family is different, and that\'s okay! Our friends\' elves do things their own way.', 'Talk to us! You can leave us notes and drawings anytime.', 'We\'re Santa\'s helpers, here just for FUN and Christmas magic.', 'Expect the unexpected. We get a little silly at night!']
function Printables() {
  const [tab, setTab] = useState('rules')
  const T = { rules: 'House Elf Rules', rescue: 'Magic Malfunction', welcome: 'Welcome Back', kit: 'Rescue Kit' }
  return <section><h1 className="title no-print">Printables & Messages Studio</h1>
    <div className="chips no-print">{Object.entries(T).map(([k, v]) => <button key={k} className={'chip ' + (tab === k ? 'on' : '')} onClick={() => setTab(k)}>{v}</button>)}
      <button className="print" onClick={() => window.print()}>🖨️ Print</button></div>
    <div className="sheet">
      {tab === 'rules' && <><h1>Rocky's House Elf Rules</h1><ol className="rules">{RULES.map(r => <li key={r}>{r}</li>)}</ol><p className="sig">Love, Ellie &amp; Ozzy 💚❤️</p></>}
      {tab === 'rescue' && <><h1>⚠️ Magic Malfunction! ⚠️</h1><p>Uh-oh! Our magic got a little wobbly. Don't worry, this happens to the best elves!</p><p>A grown-up sprinkled a pinch of <b>magic cinnamon</b> next to us, and by tonight our sparkle will be totally recharged so we can zoom back to the North Pole.</p><p>Thanks for helping us. You're the best!</p><p className="sig">Love, Ellie &amp; Ozzy</p></>}
      {tab === 'welcome' && <><h1>WE'RE BACK!!! 🎉</h1><p>Dear Rocky &amp; Lia,</p><p>Guess who flew ALL the way from the North Pole? (Ozzy blew up every single balloon. Ellie supervised in her fancy hat.)</p><p>We missed you SO much! This year we're bringing extra fun, extra chaos, and extra Christmas magic. Check your surprises and get ready for 24 days of wild!</p><p className="sig">Love, Ellie &amp; Ozzy</p></>}
      {tab === 'kit' && <><h1>Elf Magic Rescue Kit</h1><ul className="kit">{['Ground cinnamon in a little jar labeled "Magic Cinnamon"', 'Magic Malfunction notes (printed)', 'Tongs / clean gloves (no-touch moves!)', 'Poster putty & glue dots', 'Mini Command hooks', 'Clear tape & fishing line', 'Spare batteries', 'Backup tiny prop (hat, candy cane)', 'Flashlight / phone red-light mode', 'Pen & sticky notes for emergency notes'].map(x => <li key={x}>☐ {x}</li>)}</ul></>}
    </div></section>
}

function Inbox({ inbox, setInbox, days, setDays }) {
  const [u, setU] = useState(''), [note, setNote] = useState('')
  const src = x => /tiktok/.test(x) ? 'TikTok' : /pin/.test(x) ? 'Pinterest' : /facebook|fb\./.test(x) ? 'Facebook' : 'Link'
  return <section><h1 className="title">Idea Inbox</h1>
    <form className="card" onSubmit={e => { e.preventDefault(); if (u) { setInbox([{ id: uid(), url: u, note, src: src(u) }, ...inbox]); setU(''); setNote('') } }}>
      <input value={u} onChange={e => setU(e.target.value)} placeholder="Paste TikTok / Pinterest / Facebook link" />
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (e.g. great for Rocky, Sonic theme)" /><button>Save idea</button></form>
    {inbox.map(x => <div className="card idea" key={x.id}><span className={'badge ' + x.src}>{x.src}</span> <a href={x.url} target="_blank">{x.url}</a><p>{x.note}</p>
      <select defaultValue="" onChange={e => { const n = e.target.value; if (!n) return; setDays({ ...days, [n]: { ...days[n], idea: { ...days[n].idea, links: [...days[n].idea.links, x.url] } } }) }}>
        <option value="">Attach to day…</option>{Array.from({ length: 24 }, (_, i) => <option key={i} value={i + 1}>Dec {i + 1}</option>)}</select>
      <button className="x" onClick={() => setInbox(inbox.filter(y => y.id !== x.id))}>✕</button></div>)}</section>
}

function Nov({ nov, setNov }) {
  return <section><h1 className="title">November: Shopping & Bills</h1><div className="card"><p className="warn">💸 Buy Advent calendars after payday!</p>
    <textarea rows={12} value={nov} onChange={e => setNov(e.target.value)} /></div></section>
}
