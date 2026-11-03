// Not deployed yet. Deploy: supabase functions deploy elf-ai --no-verify-jwt
// Secret: supabase secrets set OPENAI_API_KEY=...   (never commit the key)
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const { task, image } = await req.json()
  const prompt = task === 'title'
    ? 'This is an Elf on the Shelf setup photo. Reply JSON {"title": "<short fun title, max 6 words>"}.'
    : 'This is an Elf on the Shelf idea from social media. List the supplies needed to recreate it. Reply JSON {"supplies": ["item", ...]}.'
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini', response_format: { type: 'json_object' }, messages: [{ role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: image } }] }] }),
  })
  const j = await r.json()
  return new Response(j.choices?.[0]?.message?.content || '{}', { headers: { ...cors, 'Content-Type': 'application/json' } })
})
