import { createClient } from '@supabase/supabase-js'
const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY
const sb = url && key ? createClient(url, key) : null
export const backend = sb ? 'supabase' : 'localStorage'
const P = 'elfplanner:'
export async function load(k, fallback) {
  if (sb) {
    const { data, error } = await sb.from('elf_store').select('value').eq('key', k).maybeSingle()
    if (!error && data) return data.value
    if (!error) return fallback
  }
  try { const v = localStorage.getItem(P + k); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
export async function save(k, v) {
  localStorage.setItem(P + k, JSON.stringify(v))
  if (sb) await sb.from('elf_store').upsert({ key: k, value: v, updated_at: new Date().toISOString() })
}
