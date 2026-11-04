import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { T, useM, Del, shrink } from './Manage'
import { Calendar, titleFor, uid, money } from './App'
import Planner from './Planner'
import { aiOn, aiTitle, aiSupplies } from './ai'
const B = import.meta.env.BASE_URL

const supCost = s => (+s.cost || 0) * (+s.qty || 1)
export function shopTotals(ideas, days) {
  const rows = [...ideas.filter(x => x.status === 'Approved').flatMap(x => x.supplies || []).map(s => ({ c: supCost(s), b: s.bought })),
    ...Object.values(days).flatMap(d => d.shopping).map(x => ({ c: (+x.qty || 0) * (+x.price || 0), b: x.own || +x.actual > 0 }))]
  return { total: rows.reduce((t, r) => t + r.c, 0), left: rows.filter(r => !r.b).reduce((t, r) => t + r.c, 0) }
}

function Upload({ label, onFile, max = 900 }) {
  const [busy, setBusy] = useState(false)
  return <label className="btn upload">{busy ? 'Working…' : label}<input type="file" accept="image/*" hidden onChange={async e => {
    const f = e.target.files[0]; if (!f) return; setBusy(true); try { await onFile(await shrink(f, max)) } finally { setBusy(false); e.target.value = '' } }} /></label>
}

export function Dashboard(P) {
  const { days, ideas } = P
  const now = new Date(), dec = now.getMonth() === 11 && now.getFullYear() === 2026
  const tn = dec ? Math.min(now.getDate() + 1, 25) : 1, tm = tn + 1
  const daysTo = Math.ceil((new Date(2026, 10, 30, 20) - now) / 864e5)
  const scene = n => n > 24 ? 'Ellie & Ozzy return with Santa' : titleFor(n, days, ideas) || 'Unscheduled'
  const approved = ideas.filter(x => x.status === 'Approved')
  const upcoming = approved.filter(x => x.date && +x.date >= tn).sort((a, b) => a.date - b.date).slice(0, 4)
  return <section className="dash">
    <div className="hero">
      <div className="hero-bg" style={{ backgroundImage: `url(${B}hero-ferrero.jpg)` }} />
      <picture><source srcSet={B + 'hero-ferrero.webp'} type="image/webp" />
        <img className="hero-main" src={B + 'hero-ferrero.jpg'} alt="Ellie and Ozzy with a giant golden Ferrero Rocher" width="1000" height="1075" fetchpriority="high" /></picture>
      <div className="hero-txt"><T as="h1" k="home.title" d="Ellie & Ozzy's North Pole HQ" />
        <p className="count">{dec ? `December ${now.getDate()}` : daysTo > 0 ? <><b>{daysTo}</b> days until Ellie &amp; Ozzy arrive</> : 'Arrival night!'}</p></div>
    </div>
    <Planner {...P} />
    <figure className="framed"><picture><source srcSet={B + 'hero.webp'} type="image/webp" /><img src={B + 'hero.jpg'} alt="Ellie, Ozzy and friends by the Christmas tree" loading="lazy" width="1000" height="1000" /></picture>
      <figcaption><T k="home.photo" d="The whole crew, Christmas 2026" /></figcaption></figure>
  </section>
}

export function Ideas({ ideas, days }) {
  const [q, setQ] = useState(''), [st, setSt] = useState('Approved')
  const nav = useNavigate(); const { edit } = useM()
  const list = ideas.filter(x => (st === 'All' || x.status === st) && (x.title + ' ' + x.description).toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (+a.date || 99) - (+b.date || 99))
  const t = shopTotals(ideas, days)
  return <section><h1 className="title"><T k="ideas.title" d="Ideas" /></h1>
    <div className="card filters"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search ideas" />
      <div className="chips">{['Approved', 'Maybe', 'Rejected', 'All'].map(s => <button key={s} className={'chip ' + (st === s ? 'on' : '')} onClick={() => setSt(s)}>{s} {s !== 'All' && <small>{ideas.filter(x => x.status === s).length}</small>}</button>)}</div>
      {edit && <NewIdea nav={nav} />}</div>
    <div className="idealist">{list.map(x => <Link key={x.id} to={`/idea/${x.id}`} className={'irow s-' + x.status}>
      {x.image ? <img src={x.image} alt="" /> : <span className="idate">{x.date ? <>Dec<b>{x.date}</b></> : '✨'}</span>}
      <span className="imain"><b>{x.title}</b><small>{x.date ? `Dec ${x.date}` : x.status === 'Approved' ? 'Not dated yet' : x.status}{(x.supplies || []).length ? ` · ${x.supplies.length} supplies` : ''}</small></span><span className="chev">›</span></Link>)}</div>
    {!list.length && <p className="hint">No ideas match.</p>}
    <p className="totals">Shopping for approved ideas: <b>{money(t.total)}</b> · still to buy <b>{money(t.left)}</b></p>
  </section>
}
function NewIdea({ nav }) {
  return <button className="bigadd" onClick={() => nav('/idea/new')}>+ Add a new idea</button>
}

export function IdeaPage({ ideas, allIdeas, setIdeas, days, stores }) {
  const { edit } = useM(); const { id } = useParams(); const nav = useNavigate()
  const [step, setStep] = useState(''), [sup, setSup] = useState('')
  if (id === 'new') { const nid = 'new-' + uid(); setTimeout(() => { setIdeas([{ id: nid, title: 'New idea', description: '', kid: 'Both', date: '', status: 'Maybe', link: '', image: '', steps: [], supplies: [] }, ...allIdeas]); nav('/idea/' + nid, { replace: true }) }); return null }
  const x = ideas.find(i => i.id === id); if (!x) return <p className="hint">Idea not found. <Link to="/ideas">Back to Ideas</Link></p>
  const up = p => setIdeas(allIdeas.map(i => i.id === id ? { ...i, ...p } : i))
  const steps = x.steps || [], sups = x.supplies || [], d = x.date && days[x.date]
  const taken = Object.fromEntries(ideas.filter(i => i.date && i.status === 'Approved' && i.id !== id).map(i => [i.date, i.title]))
  const chS = (s, k, v) => up({ supplies: sups.map(y => y.id === s.id ? { ...y, [k]: v } : y) })
  const total = sups.reduce((t, s) => t + supCost(s), 0) + (d ? d.shopping.reduce((t, i) => t + i.qty * i.price, 0) : 0)
  return <section className="ideapage sparkle">
    <p className="back"><Link to="/ideas">‹ All ideas</Link></p>
    {edit ? <input className="big" value={x.title} onChange={e => up({ title: e.target.value })} /> : <h1 className="title">{x.title}</h1>}
    <div className="chips center">{['Approved', 'Maybe', 'Rejected'].map(s => <button key={s} className={'chip ' + (x.status === s ? 'on' : '')} onClick={() => up({ status: s, date: s === 'Approved' ? x.date : '' })}>{s}</button>)}
      {x.status === 'Approved' && <select className="datesel" value={x.date} onChange={e => up({ date: e.target.value })}><option value="">Pick a night…</option>
        {Array.from({ length: 24 }, (_, i) => String(i + 1)).map(n => <option key={n} value={n} disabled={!!taken[n]}>Dec {n}{taken[n] ? ` (${taken[n]})` : ''}</option>)}</select>}</div>
    {x.image && <img className="ideaimg" src={x.image} alt="" />}
    {edit && <div className="row"><Upload label="📷 Photo" onFile={v => up({ image: v })} />{x.image && <button className="danger" onClick={() => up({ image: '' })}>Remove photo</button>}</div>}
    <div className="card">{edit ? <textarea rows={5} value={x.description} placeholder="What's the scene?" onChange={e => up({ description: e.target.value })} /> : <p>{x.description || <span className="hint">No description yet. Tap Manage in the menu to add one.</span>}</p>}
      {edit ? <input value={x.link || ''} placeholder="Inspiration link (optional)" onChange={e => up({ link: e.target.value })} /> : x.link && <a href={x.link} target="_blank" rel="noreferrer">🔗 Inspiration</a>}</div>
    <div className="card night"><h2>🌙 How to set it up</h2>
      <ol className="tasks">{steps.map(s => <li key={s.id}><label><input type="checkbox" checked={s.done} onChange={() => up({ steps: steps.map(y => y.id === s.id ? { ...y, done: !y.done } : y) })} /><span className={s.done ? 'done' : ''}>{s.text}</span></label>
        <button className="x" onClick={() => up({ steps: steps.filter(y => y.id !== s.id) })}>✕</button></li>)}</ol>
      {d && (d.prep.length + d.night.length > 0) && <p className="hint lt">Plus {d.prep.length} prep + {d.night.length} night-of steps on <Link to={`/day/${x.date}`}>Dec {x.date}</Link>.</p>}
      <form className="row" onSubmit={e => { e.preventDefault(); if (step.trim()) { up({ steps: [...steps, { id: uid(), text: step.trim(), done: false }] }); setStep('') } }}><input value={step} onChange={e => setStep(e.target.value)} placeholder="Add a step" /><button>Add</button></form></div>
    <div className="card"><h2>🛍️ Supplies to get</h2>
      <ul className="shoplist">{sups.map(s => <li key={s.id} className={s.bought ? 'got' : ''}>
        <label><input type="checkbox" checked={!!s.bought} onChange={() => chS(s, 'bought', !s.bought)} /><span><b>{s.name}</b>{(s.store || s.cost) && <small>{[s.store, +s.cost > 0 && money(supCost(s))].filter(Boolean).join(' · ')}</small>}</span></label>
        {edit && <span className="supedit"><select value={s.store || ''} onChange={e => chS(s, 'store', e.target.value)}><option value="">Store</option>{stores.map(o => <option key={o}>{o}</option>)}</select><input type="number" step="0.01" placeholder="$" value={s.cost || ''} onChange={e => chS(s, 'cost', e.target.value)} /></span>}
        <button className="x" onClick={() => up({ supplies: sups.filter(y => y.id !== s.id) })}>✕</button></li>)}
        {d && d.shopping.map(i => <li key={i.id} className={i.own ? 'got' : ''}><span><b>{i.item}</b><small>{i.store} · {money(i.qty * i.price)} · on <Link to={`/day/${x.date}`}>Dec {x.date}</Link></small></span></li>)}</ul>
      <form className="row" onSubmit={e => { e.preventDefault(); if (sup.trim()) { up({ supplies: [...sups, { id: uid(), name: sup.trim(), store: '', cost: '', qty: 1, bought: false }] }); setSup('') } }}><input value={sup} onChange={e => setSup(e.target.value)} placeholder="Add a supply" /><button>Add</button></form>
      {total > 0 && <p className="total">Est. {money(total)}</p>}</div>
    {x.date && <p className="center"><Link className="btn" to={`/day/${x.date}`}>Open Dec {x.date} plan →</Link></p>}
    {edit && <Del onClick={() => { up({ deleted: true, date: '' }); nav('/ideas') }} label="Delete idea" />}
  </section>
}

export function Library({ library, setLibrary }) {
  const { edit } = useM(); const [view, setView] = useState(null)
  const add = async img => { const id = uid(); setLibrary(l => [{ id, image: img, title: '', added: new Date().toISOString().slice(0, 10) }, ...l])
    const t = await aiTitle(img); if (t) setLibrary(l => l.map(x => x.id === id && !x.title ? { ...x, title: t } : x)) }
  const ch = (id, p) => setLibrary(library.map(x => x.id === id ? { ...x, ...p } : x))
  return <section><h1 className="title"><T k="lib.title" d="Renee's Family Library" /></h1>
    <p className="center"><Upload label="📷 Add a setup photo" onFile={add} max={1100} /></p>
    <p className="hint center lt">{aiOn ? 'A smart title is added automatically. Tap a title to change it.' : 'Give each photo a title (tap it to type). Automatic titles turn on once AI is connected.'}</p>
    <div className="gallery">{library.map(x => <figure key={x.id}>
      <img src={x.image} alt={x.title} onClick={() => setView(x)} />
      <input className="ptitle" value={x.title} placeholder="Name this setup" onChange={e => ch(x.id, { title: e.target.value })} />
      {edit && <Del label="" onClick={() => setLibrary(library.filter(y => y.id !== x.id))} />}</figure>)}</div>
    {!library.length && <p className="hint center lt">No photos yet. Your setups will show up here like a portfolio.</p>}
    {view && <div className="lightbox" onClick={() => setView(null)}><img src={view.image} alt="" /><b>{view.title}</b></div>}
  </section>
}

export function TryList({ tryList, setTryList, allIdeas, setIdeas }) {
  const nav = useNavigate(); const [txt, setTxt] = useState({})
  const add = async img => { const id = uid(); setTryList(l => [{ id, image: img, title: '', supplies: [], scanning: aiOn }, ...l])
    const s = await aiSupplies(img); setTryList(l => l.map(x => x.id === id ? { ...x, scanning: false, supplies: [...x.supplies, ...(s || []).map(name => ({ id: uid(), name, have: false }))] } : x)) }
  const ch = (id, p) => setTryList(tryList.map(x => x.id === id ? { ...x, ...p } : x))
  const promote = x => { const nid = 'try-' + x.id; setIdeas([{ id: nid, title: x.title || 'Idea from social', description: '', kid: 'Both', date: '', status: 'Maybe', link: '', image: x.image, steps: [], supplies: x.supplies.map(s => ({ id: s.id, name: s.name, store: '', cost: '', qty: 1, bought: s.have })) }, ...allIdeas]); ch(x.id, { moved: nid }); nav('/idea/' + nid) }
  return <section><h1 className="title"><T k="try.title" d="Ideas I Want to Try" /></h1>
    <p className="center"><Upload label="📷 Add a screenshot" onFile={add} /></p>
    <p className="hint center lt">{aiOn ? 'Supplies are pulled from the picture automatically. Add or remove any.' : 'Save a screenshot from TikTok, Instagram or Facebook, then list the supplies. Automatic supply lists turn on once AI is connected.'}</p>
    {tryList.map(x => <div key={x.id} className="card tryc">
      <img src={x.image} alt="" />
      <div><input className="big" value={x.title} placeholder="What is it?" onChange={e => ch(x.id, { title: e.target.value })} />
        {x.scanning && <p className="hint">✨ Reading supplies…</p>}
        <ul className="sups">{x.supplies.map(s => <li key={s.id}><label><input type="checkbox" checked={s.have} onChange={() => ch(x.id, { supplies: x.supplies.map(y => y.id === s.id ? { ...y, have: !y.have } : y) })} /><span className={s.have ? 'done' : ''}>{s.name}</span></label>
          <button className="x" onClick={() => ch(x.id, { supplies: x.supplies.filter(y => y.id !== s.id) })}>✕</button></li>)}</ul>
        <form className="row" onSubmit={e => { e.preventDefault(); const v = (txt[x.id] || '').trim(); if (v) { ch(x.id, { supplies: [...x.supplies, { id: uid(), name: v, have: false }] }); setTxt({ ...txt, [x.id]: '' }) } }}>
          <input value={txt[x.id] || ''} onChange={e => setTxt({ ...txt, [x.id]: e.target.value })} placeholder="Add a supply" /><button>Add</button></form>
        <div className="row">{x.moved ? <Link to={'/idea/' + x.moved}>In Ideas →</Link> : <button onClick={() => promote(x)}>Move to Ideas</button>}
          <Del label="" onClick={() => setTryList(tryList.filter(y => y.id !== x.id))} /></div></div></div>)}
  </section>
}
