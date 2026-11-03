// AI plug-in point. When a Supabase Edge Function named "elf-ai" is deployed
// (with an OPENAI_API_KEY or XAI_API_KEY stored as a Supabase secret) and the
// site is built with VITE_AI=on, uploads get a smart title / supply list.
// Without it, everything works with manual typing.
import { sb } from './storage'
export const aiOn = !!sb && import.meta.env.VITE_AI === 'on'
async function ask(task, image) {
  if (!aiOn) return null
  try { const { data, error } = await sb.functions.invoke('elf-ai', { body: { task, image } }); return error ? null : data } catch { return null }
}
export const aiTitle = async image => (await ask('title', image))?.title || null
export const aiSupplies = async image => (await ask('supplies', image))?.supplies || null
