import { useEffect, useState } from 'react'
import { sb, migrateLocal } from './storage'
export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined), [email, setEmail] = useState(''), [msg, setMsg] = useState('')
  useEffect(() => {
    if (!sb) return
    sb.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])
  const [ready, setReady] = useState(false)
  useEffect(() => { if (session) migrateLocal().finally(() => setReady(true)) }, [session])
  if (!sb) return children
  if (session === undefined || (session && !ready)) return <p style={{ padding: 24 }}>Loading…</p>
  if (session) return <>{children}<button className="no-print" style={{ position: 'fixed', top: 8, right: 8 }} onClick={() => sb.auth.signOut()}>Sign out</button></>
  const send = async e => {
    e.preventDefault(); setMsg('Sending…')
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin + import.meta.env.BASE_URL, shouldCreateUser: true } })
    setMsg(error ? error.message : 'Check your email for the magic link ✨')
  }
  return <form onSubmit={send} style={{ maxWidth: 360, margin: '15vh auto', padding: 24, textAlign: 'center' }}>
    <h1>🧝 Elf Planner</h1><p>Sign in to sync your plans.</p>
    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ width: '100%', padding: 8 }} />
    <button type="submit" style={{ marginTop: 12 }}>Send magic link</button><p>{msg}</p>
  </form>
}
