import { useEffect, useRef } from 'react'
const COLORS = ['#ff3b3b', '#ffd93b', '#3bff7a', '#3bc8ff', '#ff6bd6']
export function Lights() {
  return <div className="lights" aria-hidden="true"><svg className="wire" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0,2 Q5,8 10,2 T20,2 T30,2 T40,2 T50,2 T60,2 T70,2 T80,2 T90,2 T100,2" /></svg>
    {Array.from({ length: 20 }, (_, i) => <i key={i} style={{ left: (i * 5 + 2.5) + '%', '--c': COLORS[i % 5], animationDelay: (i % 5) * 0.3 + 's' }} />)}</div>
}
export function Snow() {
  const ref = useRef()
  useEffect(() => {
    const c = ref.current, x = c.getContext('2d'); let raf, W, H
    const size = () => { W = c.width = innerWidth; H = c.height = innerHeight }; size(); addEventListener('resize', size)
    const n = innerWidth < 600 ? 45 : 90
    const f = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 2.5 + .8, s: Math.random() * .6 + .3, d: Math.random() * 6 }))
    const tick = t => {
      x.clearRect(0, 0, W, H); x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath()
      for (const p of f) { p.y += p.s; p.x += Math.sin(t / 1500 + p.d) * .3; if (p.y > H) { p.y = -5; p.x = Math.random() * W } x.moveTo(p.x, p.y); x.arc(p.x, p.y, p.r, 0, 7) }
      x.fill(); raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size) }
  }, [])
  return <canvas ref={ref} className="snow" aria-hidden="true" />
}
