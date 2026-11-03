import { useEffect, useState, useMemo } from 'react'
import { Routes, Route, NavLink, Link, useParams, useLocation } from 'react-router-dom'
import { load, save, backend } from './storage'
import { defaultDays, SUPPLIES, STORES } from './data'
import { SEED_IDEAS, mergeSeeds } from './ideas'
import { Dashboard, Ideas, IdeaPage, Library, TryList } from './Pages'
import { Lights, Snow } from './Fx'
import { Ctx, useM, T, ImageField, Del } from './Manage'

function usePersist(key, init, fix) {
  const [v, setV] = useState(init); const [ready, setReady] = useState(false)
  useEffect(() => { load(key, init).then(async x => { setV(fix ? await fix(x) : x); setReady(true) }) }, [key])
  useEffect(() => { if (ready) save(key, v) }, [v, ready])
  return [v, setV]
}
export const uid = () => Math.random().toString(36).slice(2)
export const money = n => '$' + (Number(n) || 0).toFixed(2)

export default function App() {
  const [days, setDays] = usePersist('days', defaultDays())
  const [supplies, setSupplies] = usePersist('supplyList', null, async x => x || Object.entries(await load('closet', Object.fromEntries(SUPPLIES.map(s => [s, false])))).map(([name, own]) => ({ id: uid(), name, store: '', cost: '', link: '', image: '', purchased: !!own })))
  const [stores, setStores] = usePersist('stores', STORES)
  const [texts, setTexts] = usePersist('texts', {})
  const [edit, setEdit] = useState(() => localStorage.getItem('elfplanner:edit') === '1')
  useEffect(() => { localStorage.setItem('elfplanner:edit', edit ? '1' : '0'); document.body.classList.toggle('editing', edit) }, [edit])
  const closet = useMemo(() => Object.fromEntries((supplies || []).map(s => [s.name, s.purchased])), [supplies])
  const setCloset = c => setSupplies(supplies.map(s => ({ ...s, purchased: !!c[s.name] })))
  const [ideas, setIdeas] = usePersist('ideas', SEED_IDEAS, mergeSeeds)
  const [library, setLibrary] = usePersist('library', [])
  const [tryList, setTryList] = usePersist('tryList', [])
  const [menu, setMenu] = useState(false)
  useEffect(() => { document.body.classList.remove('still'); localStorage.removeItem('elfplanner:motion') }, [])
  const loc = useLocation()
  useEffect(() => setMenu(false), [loc.pathname])
  const P = { days, setDays, closet, ideas: ideas.filter(x => !x.deleted), allIdeas: ideas, setIdeas, supplies: supplies || [], setSupplies, stores, library, setLibrary, tryList, setTryList }
  const M = { edit, texts, setText: (k, v) => setTexts(t => ({ ...t, [k]: v })) }
  return <Ctx.Provider value={M}><div>
    <Snow />
    <header className="top no-print">
      <Lights />
      <Link to="/" className="logo"><T k="site.name" d="Ellie & Ozzy's North Pole HQ" /></Link>
      <button className={'burger' + (menu ? ' on' : '')} aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}><i /><i /><i /></button>
      {menu && <div className="menu">
        <button className={'editbtn' + (edit ? ' on' : '')} onClick={() => { setEdit(!edit); setMenu(false) }}>{edit ? '✅ Done managing' : '✏️ Manage'}</button>
      </div>}
      <nav>{[['/', 'Home'], ['/ideas', 'Ideas'], ['/try', 'To Try'], ['/library', 'Library'], ['/print', 'Printables']].map(([to, l]) =>
        <NavLink key={to} to={to} end={to === '/'}>{l}</NavLink>)}</nav>
    </header>
    <main className="blurzone"><div className="page" key={loc.pathname}>
      <Routes location={loc}>
        <Route path="/" element={<Dashboard {...P} />} />
        <Route path="/ideas" element={<Ideas {...P} />} />
        <Route path="/idea/:id" element={<IdeaPage {...P} />} />
        <Route path="/try" element={<TryList {...P} />} />
        <Route path="/library" element={<Library {...P} />} />
        <Route path="/day/:n" element={<Day {...P} />} />
        <Route path="/print" element={<Printables />} />
        <Route path="*" element={<Dashboard {...P} />} />
      </Routes>
    </div></main>
    {edit && <div className="editbar no-print">✏️ Manager mode: tap any dotted text to change it. Changes save automatically. <button onClick={() => setEdit(false)}>Done</button></div>}
    <footer className="no-print">Private planner · storage: {backend} · lighthearted chaos only, no naughty lists ✨</footer>
  </div></Ctx.Provider>
}

export const titleFor = (n, days, ideas) => ideas.find(x => x.status === 'Approved' && x.date === String(n))?.title || days[n]?.idea.title || ''
export function Calendar({ days, ideas }) {
  const cells = [...Array(2).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)]
  return <section>
    <h1 className="title"><T k="cal.title" d="December 2026" /> <T as="span" k="cal.sub" d="Weekends = big-setup nights" /></h1>
    <div className="cal">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="dow">{d}</div>)}
      {cells.map((n, i) => n == null ? <div key={i} /> : n <= 24 ?
        <Link key={i} to={`/day/${n}`} className={'cell ' + (titleFor(n, days, ideas) ? 'planned ' : '') + (i % 7 === 0 || i % 7 === 6 ? 'wknd' : '')}>
          <span className="num">{n}</span>{days[n]?.image && <img className="cimg" src={days[n].image} alt="" />}<span className={'t' + (titleFor(n, days, ideas) ? '' : ' none')} title={titleFor(n, days, ideas) || 'Unscheduled'}>{titleFor(n, days, ideas) || 'Unscheduled'}</span>{(i % 7 === 0 || i % 7 === 6) && <span className="wk"><span className="wkt">big setup</span></span>}
        </Link> : n === 25 ? <div key={i} className="cell xmas"><span className="num">25</span><span className="t" title="Ellie &amp; Ozzy return with Santa">Ellie &amp; Ozzy return with Santa</span></div> : <div key={i} className="cell off"><span className="num">{n}</span></div>)}
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

function Day({ days, setDays, closet, ideas, setIdeas, allIdeas, stores, supplies }) {
  const { edit } = useM()
  const n = +useParams().n; const d = days[n]; const [link, setLink] = useState('')
  if (!d) return <p>No such day.</p>
  const up = (k, v) => setDays({ ...days, [n]: { ...d, [k]: v } })
  const total = d.shopping.filter(x => !x.own).reduce((s, x) => s + x.qty * x.price, 0)
  const missing = d.supplies.filter(s => !closet[s])
  const assigned = ideas.find(x => x.status === 'Approved' && x.date === String(n))
  const assign = id => setIdeas(allIdeas.map(x => x.date === String(n) && x.status === 'Approved' ? { ...x, date: '' } : x.id === id ? { ...x, status: 'Approved', date: String(n) } : x))
  return <section className="day sparkle">
    {assigned && <div className="card assigned"><h2>⭐ <Link to={`/idea/${assigned.id}`}>{assigned.title}</Link></h2><p>{assigned.description}</p></div>}
    <div className="daynav"><Link to={n > 1 ? `/day/${n - 1}` : '/'}>‹</Link><h1>Dec {n}</h1><Link to={n < 24 ? `/day/${n + 1}` : '/'}>›</Link></div>
    {d.image && !edit && <img className="dayimg" src={d.image} alt="" />}
    {d.notes && !edit && <div className="card"><h2>📝 Notes</h2><p className="pre">{d.notes}</p></div>}
    {edit && <div className="card mgr"><h2>✏️ Manage this day</h2>
      <label className="field"><b>Scene from the Idea Library</b><select value={assigned?.id || ''} onChange={e => assign(e.target.value)}>
        <option value="">None (unscheduled)</option>{ideas.filter(x => x.status !== 'Rejected').map(x => <option key={x.id} value={x.id}>{x.title}{x.date && x.date !== String(n) ? ` (now Dec ${x.date})` : ''}{x.status === 'Maybe' ? ' (Maybe)' : ''}</option>)}</select></label>
      <label className="field"><b>Notes</b><textarea rows={4} value={d.notes || ''} onChange={e => up('notes', e.target.value)} placeholder="Anything to remember for this day" /></label>
      <div className="field"><b>Day picture</b><ImageField value={d.image} onChange={v => up('image', v)} /></div></div>}
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
      <div className="tablewrap"><table><thead><tr><th>Item</th><th>Qty</th><th>Store</th><th>Est $</th><th>Bought</th>{edit && <th>Link</th>}<th /></tr></thead><tbody>
        {d.shopping.map(x => { const ch = (k, v) => up('shopping', d.shopping.map(y => y.id === x.id ? { ...y, [k]: v } : y)); return <tr key={x.id}>
          <td><input value={x.item} onChange={e => ch('item', e.target.value)} /></td>
          <td><input type="number" className="sm" value={x.qty} onChange={e => ch('qty', +e.target.value)} /></td>
          <td><select value={x.store} onChange={e => ch('store', e.target.value)}>{[...new Set([...stores, x.store])].filter(Boolean).map(s => <option key={s}>{s}</option>)}</select></td>
          <td><input type="number" step="0.01" className="sm" value={x.price} onChange={e => ch('price', +e.target.value)} /></td>
          <td><input type="checkbox" checked={x.own} onChange={e => ch('own', e.target.checked)} /></td>
          {edit && <td><input value={x.link || ''} placeholder="https://" onChange={e => ch('link', e.target.value)} /></td>}
          <td><button className="x" onClick={() => up('shopping', d.shopping.filter(y => y.id !== x.id))}>✕</button></td></tr> })}
      </tbody></table></div>
      <div className="row"><button onClick={() => up('shopping', [...d.shopping, { id: uid(), item: '', qty: 1, store: stores[0] || 'Other', price: 1.5, actual: '', own: false }])}>+ Item</button>
        <b className="total">Est. total: {money(total)}</b></div>
      <p className="hint">Prices are estimates (Oct 2026 web checks: Sonic Advent ~$33 Amazon, Fuggler Advent $30–35, Dollar Tree $1.50).</p>
      <h3>From the Craft Closet</h3>
      <div className="chips">{[...new Set([...supplies.map(x => x.name), ...d.supplies])].map(s => <button key={s} className={'chip ' + (d.supplies.includes(s) ? (closet[s] ? 'on' : 'miss') : '')}
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

const RULES = ['Look, laugh, but don\'t touch! Our magic works best when we\'re hands-off.', 'Accidents happen! If we get bumped, no worries: a grown-up will do a cinnamon rescue and we\'ll be good as new.', 'Every elf family is different, and that\'s okay! Our friends\' elves do things their own way.', 'Talk to us! You can leave us notes and drawings anytime.', 'We\'re Santa\'s helpers, here just for FUN and Christmas magic.', 'Expect the unexpected. We get a little silly at night!']
function Printables() {
  const [tab, setTab] = useState('rules')
  const TABS = { rules: 'House Elf Rules', rescue: 'Magic Malfunction', welcome: 'Welcome Back', kit: 'Rescue Kit', cards: 'Note Cards (8/sheet)' }
  return <section><h1 className="title no-print"><T k="print.title" d="Printables & Messages Studio" /></h1>
    <div className="chips no-print">{Object.entries(TABS).map(([k, v]) => <button key={k} className={'chip ' + (tab === k ? 'on' : '')} onClick={() => setTab(k)}>{v}</button>)}
      <button className="print" onClick={() => window.print()}>🖨️ Print</button></div>
    <div className="sheet" hidden={tab === 'cards'}>
      {tab === 'rules' && <><h1>Rocky's House Elf Rules</h1><ol className="rules">{RULES.map(r => <li key={r}>{r}</li>)}</ol><p className="sig">Love, Ellie &amp; Ozzy 💚❤️</p></>}
      {tab === 'rescue' && <><h1>⚠️ Magic Malfunction! ⚠️</h1><p>Uh-oh! Our magic got a little wobbly. Don't worry, this happens to the best elves!</p><p>A grown-up sprinkled a pinch of <b>magic cinnamon</b> next to us, and by tonight our sparkle will be totally recharged so we can zoom back to the North Pole.</p><p>Thanks for helping us. You're the best!</p><p className="sig">Love, Ellie &amp; Ozzy</p></>}
      {tab === 'welcome' && <><h1>WE'RE BACK!!! 🎉</h1><p>Dear Rocky &amp; Lia,</p><p>Guess who flew ALL the way from the North Pole? (Ozzy blew up every single balloon. Ellie supervised in her fancy hat.)</p><p>We missed you SO much! This year we're bringing extra fun, extra chaos, and extra Christmas magic. Check your surprises and get ready for 24 days of wild!</p><p className="sig">Love, Ellie &amp; Ozzy</p></>}
      {tab === 'kit' && <><h1>Elf Magic Rescue Kit</h1><ul className="kit">{['Ground cinnamon in a little jar labeled "Magic Cinnamon"', 'Magic Malfunction notes (printed)', 'Tongs / clean gloves (no-touch moves!)', 'Poster putty & glue dots', 'Mini Command hooks', 'Clear tape & fishing line', 'Spare batteries', 'Backup tiny prop (hat, candy cane)', 'Flashlight / phone red-light mode', 'Pen & sticky notes for emergency notes'].map(x => <li key={x}>☐ {x}</li>)}</ul></>}
    </div>
    {tab === 'cards' && <div className="cardsheet">{Array.from({ length: 8 }, (_, i) => <div key={i} className="notecard"><div className="nc-lines" /><div className="nc-sig">Ellie &amp; Ozzy</div></div>)}</div>}
    </section>
}

