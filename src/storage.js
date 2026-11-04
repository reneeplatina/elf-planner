import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const sb = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null
export const backend = sb ? 'supabase' : 'localStorage'
const P = 'elfplanner:'
const local = k => { try { const v = localStorage.getItem(P + k); return v ? JSON.parse(v) : undefined } catch { return undefined } }
export async function load(k, fallback) {
  if (sb) {
    const { data, error } = await sb.from('elf_store').select('value').eq('key', k).maybeSingle()
    if (!error && data) return data.value
    if (!error) return fallback
  }
  return local(k) ?? fallback
}
// Save status: 'idle' | 'saving' | 'saved' | 'error'. Failed saves are kept for retry.
let status = 'idle', pending = 0; const failed = new Map(), subs = new Set()
const emit = s => { status = s; subs.forEach(f => f(s)) }
export const onSave = f => { subs.add(f); f(status); return () => subs.delete(f) }
export async function save(k, v) {
  localStorage.setItem(P + k, JSON.stringify(v))
  if (!sb) return
  pending++; emit('saving')
  let err
  try { const r = await sb.from('elf_store').upsert({ key: k, value: v, updated_at: new Date().toISOString() }); err = r.error } catch (e) { err = e }
  pending--
  if (err) failed.set(k, v); else failed.delete(k)
  if (!pending) emit(failed.size ? 'error' : 'saved')
}
export const retrySaves = () => [...failed].forEach(([k, v]) => save(k, v))
// On first load, push any localStorage keys that don't exist in the cloud yet.
export async function migrateLocal() {
  if (!sb || localStorage.getItem(P + '__migrated')) return
  const keys = Object.keys(localStorage).filter(k => k.startsWith(P) && k !== P + '__migrated').map(k => k.slice(P.length))
  const { data } = await sb.from('elf_store').select('key')
  const have = new Set((data || []).map(r => r.key))
  const rows = keys.filter(k => !have.has(k)).map(k => ({ key: k, value: local(k), updated_at: new Date().toISOString() }))
  if (rows.length) { const { error } = await sb.from('elf_store').insert(rows); if (error) return }
  localStorage.setItem(P + '__migrated', '1')
}
