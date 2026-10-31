import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const sb = url && key ? createClient(url, key) : null
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
export async function save(k, v) {
  localStorage.setItem(P + k, JSON.stringify(v))
  if (sb) await sb.from('elf_store').upsert({ key: k, value: v, updated_at: new Date().toISOString() }, { onConflict: 'user_id,key' })
}
// On first sign-in, push any localStorage keys that don't exist in the cloud yet.
export async function migrateLocal() {
  if (!sb || localStorage.getItem(P + '__migrated')) return
  const keys = Object.keys(localStorage).filter(k => k.startsWith(P) && k !== P + '__migrated').map(k => k.slice(P.length))
  const { data } = await sb.from('elf_store').select('key')
  const have = new Set((data || []).map(r => r.key))
  const rows = keys.filter(k => !have.has(k)).map(k => ({ key: k, value: local(k), updated_at: new Date().toISOString() }))
  if (rows.length) { const { error } = await sb.from('elf_store').insert(rows); if (error) return }
  localStorage.setItem(P + '__migrated', '1')
}
