import { createContext, useContext, useState } from 'react'
export const Ctx = createContext({ edit: false, texts: {}, setText: () => {} })
export const useM = () => useContext(Ctx)
// Editable page text. In Manager mode, tap to edit; saves when you tap away.
export function T({ k, d, as: Tag = 'span', className }) {
  const { edit, texts, setText } = useM()
  const v = texts[k] ?? d
  if (!edit) return <Tag className={className}>{v}</Tag>
  return <Tag className={(className || '') + ' editable'} contentEditable suppressContentEditableWarning
    onBlur={e => { const t = e.currentTarget.innerText.trim(); if (t !== v) setText(k, t || d) }}>{v}</Tag>
}
export function shrink(file, max = 700) {
  return new Promise((res, rej) => {
    const r = new FileReader(); r.onerror = rej
    r.onload = () => { const img = new Image(); img.onerror = rej; img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas')
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      let u = c.toDataURL('image/webp', .72); if (!u.startsWith('data:image/webp')) u = c.toDataURL('image/jpeg', .72); res(u) }; img.src = r.result }
    r.readAsDataURL(file)
  })
}
// Image picker: paste a URL or upload a photo (shrunk on the phone before saving).
export function ImageField({ value, onChange }) {
  const [busy, setBusy] = useState(false)
  return <div className="imgfield">
    {value && <img src={value} alt="" />}
    <input value={value?.startsWith('data:') ? '' : value || ''} placeholder={value?.startsWith('data:') ? 'Uploaded photo' : 'Paste image link (optional)'} onChange={e => onChange(e.target.value)} />
    <div className="row wrap">
      <label className="btn">{busy ? 'Shrinking…' : '📷 Upload photo'}<input type="file" accept="image/*" hidden onChange={async e => { const f = e.target.files[0]; if (!f) return; setBusy(true); try { onChange(await shrink(f)) } finally { setBusy(false); e.target.value = '' } }} /></label>
      {value && <button type="button" className="danger" onClick={() => onChange('')}>Remove image</button>}
    </div>
  </div>
}
export const Del = ({ onClick, label = 'Delete' }) => <button type="button" className="danger" onClick={() => { if (confirm('Delete this? It cannot be undone.')) onClick() }}>🗑 {label}</button>
