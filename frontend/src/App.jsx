import { useState, useCallback, useRef } from 'react'

const API_URL = 'https://backend-ai-qu3u.onrender.com'
const MIN_WORDS = 20

// ── SVG Icon System (no external deps) ───────────────────────────
const Icon = ({ name, size = 16, className = '' }) => {
  const icons = {
    sparkle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
      </svg>
    ),
    scan: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    ),
    layers: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    copy: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    ),
    refresh: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
      </svg>
    ),
    alert: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    file: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    sprint: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    arch: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
        <line x1="6" y1="9" x2="6" y2="15" />
        <line x1="9" y1="18" x2="15" y2="18" />
        <line x1="8.5" y1="7.5" x2="15.5" y2="15.5" />
      </svg>
    ),
    doc: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    ),
    clock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    activity: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    chevronRight: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
  }
  return (
    <svg width={size} height={size} className={className} style={{ display: 'inline-block', flexShrink: 0 }}>
      {icons[name]}
    </svg>
  )
}

// ── Inline Markdown ───────────────────────────────────────────────
function InlineMd({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**') && p.length > 4)
          return <strong key={i}>{p.slice(2, -2)}</strong>
        if (p.startsWith('`') && p.endsWith('`') && p.length > 2)
          return <code key={i} className="icode">{p.slice(1, -1)}</code>
        return p
      })}
    </>
  )
}

function SimpleMarkdown({ content }) {
  if (!content) return null
  return (
    <div className="md-body">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('#### ')) return <h4 key={i} className="md-h4">{line.slice(5)}</h4>
        if (line.startsWith('### ')) return <h3 key={i} className="md-h3">{line.slice(4)}</h3>
        if (line.startsWith('## ')) return <h2 key={i} className="md-h2">{line.slice(3)}</h2>
        if (line.startsWith('# ')) return <h1 key={i} className="md-h1">{line.slice(2)}</h1>
        if (line.match(/^-{3,}$/)) return <hr key={i} className="md-hr" />
        if (line.trim() === '') return <div key={i} className="md-gap" />
        if (line.match(/^[-*] /)) return <li key={i} className="md-li"><InlineMd text={line.slice(2)} /></li>
        if (line.match(/^\d+\. /)) return <li key={i} className="md-oli"><InlineMd text={line.replace(/^\d+\. /, '')} /></li>
        return <p key={i} className="md-p"><InlineMd text={line} /></p>
      })}
    </div>
  )
}

const wordCount = str => str.trim().split(/\s+/).filter(Boolean).length

const STEPS = [
  { label: 'Extracting & Architecting', sub: 'Features · Dependencies · Tech stack', icon: 'scan' },
  { label: 'Sprint Planning', sub: 'User stories · Story points · API design', icon: 'layers' },
]

const TABS = [
  { key: 'sprint_plan', label: 'Sprint Plan', icon: 'sprint' },
  { key: 'raw_features', label: 'Analysis', icon: 'arch' },
  { key: 'final_structured_plan', label: 'Full Doc', icon: 'doc' },
]

// ── App ───────────────────────────────────────────────────────────
export default function App() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inputErr, setInputErr] = useState('')
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(0)
  const [activeTab, setActiveTab] = useState('sprint_plan')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef(null)
  const stepRef = useRef(null)

  const startTimer = () => { setElapsed(0); timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000) }
  const stopAll = () => { clearInterval(timerRef.current); clearTimeout(stepRef.current) }
  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleInput = useCallback(e => {
    const v = e.target.value
    setInput(v)
    if (inputErr && wordCount(v) >= MIN_WORDS) setInputErr('')
  }, [inputErr])

  const validate = () => {
    const wc = wordCount(input)
    if (!input.trim()) { setInputErr('Please describe your project requirements.'); return false }
    if (wc < MIN_WORDS) { setInputErr(`Minimum ${MIN_WORDS} words required. You have ${wc}.`); return false }

    const words = input.trim().split(/\s+/).filter(Boolean)

    // Check for gibberish like 'd d d d'
    const avgLength = words.reduce((acc, w) => acc + w.length, 0) / wc
    if (avgLength < 2.5) {
      setInputErr('Please provide proper requirements. The input seems to be just random short letters.')
      return false
    }

    // Check for repetitive words like 'test test test test'
    const uniqueWords = new Set(words.map(w => w.toLowerCase())).size
    if (uniqueWords < (wc * 0.4)) {
      setInputErr('Please provide proper requirements instead of repetitive words.')
      return false
    }

    setInputErr(''); return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true); setError(''); setResult(null); setCopied(false)
    setStep(1); startTimer()

    try {
      const ping = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(3000) })
      if (!ping.ok) throw new Error('unhealthy')
    } catch {
      stopAll(); setStep(0)
      setError('Cannot reach backend. Make sure the server is running on port 8000.')
      setLoading(false); return
    }

    stepRef.current = setTimeout(() => setStep(2), 18000)

    try {
      const ctrl = new AbortController()
      const to = setTimeout(() => ctrl.abort(), 120000)
      const res = await fetch(`${API_URL}/api/structure-requirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input }),
        signal: ctrl.signal,
      })
      clearTimeout(to); stopAll()
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `Error ${res.status}`) }
      const data = await res.json()
      setStep(3); setResult(data); setActiveTab('sprint_plan')
    } catch (err) {
      stopAll(); setStep(0)
      setError(err.name === 'AbortError' ? 'Request timed out (2 min). Try again.' : err.message || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result?.[activeTab] || '')
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const handleReset = () => { setResult(null); setError(''); setInputErr(''); setStep(0); setInput(''); setElapsed(0); stopAll() }

  const wc = wordCount(input)
  const progress = Math.min((wc / MIN_WORDS) * 100, 100)
  const isReady = wc >= MIN_WORDS

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg:        #050609;
          --surface:   #0c0e14;
          --surface2:  #111520;
          --border:    #1c2030;
          --border2:   #242840;
          --text:      #e4e8f4;
          --text2:     #8892aa;
          --text3:     #3d4660;
          --accent:    #5b6ef5;
          --accent2:   #818cf8;
          --accent-bg: rgba(91,110,245,0.08);
          --green:     #34d399;
          --green-bg:  rgba(52,211,153,0.07);
          --red:       #f87171;
          --red-bg:    rgba(248,113,113,0.07);
          --radius:    12px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', system-ui, sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          /* Subtle dot-grid texture */
          background-image: radial-gradient(circle, #1c2030 1px, transparent 1px);
          background-size: 28px 28px;
        }

        /* ── Layout ── */
        .app { max-width: 880px; margin: 0 auto; padding: 3rem 1.5rem 6rem; }

        /* ── Header ── */
        .header { text-align: center; margin-bottom: 3rem; }

        .badge {
          display: inline-flex; align-items: center; gap: 0.55rem;
          background: var(--surface2); border: 1px solid var(--border2);
          color: var(--text2); font-size: 0.72rem; font-weight: 500;
          padding: 0.32rem 0.9rem; border-radius: 100px;
          margin-bottom: 1.6rem; letter-spacing: 0.04em; text-transform: uppercase;
        }
        .pulse-dot {
          width: 6px; height: 6px; background: var(--green);
          border-radius: 50%; flex-shrink: 0;
          box-shadow: 0 0 6px var(--green);
          animation: pulseAnim 2.2s ease-in-out infinite;
        }
        @keyframes pulseAnim { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

        .header-title {
          font-size: 2.6rem; font-weight: 700; letter-spacing: -0.04em;
          color: var(--text); line-height: 1.15; margin-bottom: 1rem;
          /* Subtle shimmer on title */
          background: linear-gradient(135deg, #f0f3ff 0%, #c4caee 40%, var(--accent2) 70%, #f0f3ff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: titleShimmer 6s linear infinite;
        }
        @keyframes titleShimmer { 0%{background-position:0%} 100%{background-position:200%} }

        .header-sub {
          color: var(--text3); font-size: 0.95rem; line-height: 1.7;
          max-width: 520px; margin: 0 auto; font-weight: 400;
        }

        /* ── Stats row under header ── */
        .stats-row {
          display: flex; justify-content: center; gap: 2rem;
          margin-top: 1.8rem; flex-wrap: wrap;
        }
        .stat {
          display: flex; align-items: center; gap: 0.45rem;
          font-size: 0.78rem; color: var(--text3); font-weight: 500;
        }
        .stat-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

        /* ── Cards ── */
        .card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 1.6rem; margin-bottom: 1.2rem;
          position: relative; overflow: hidden;
        }
        /* top accent line */
        .card::before {
          content: ''; position: absolute; top: 0; left: 1.5rem; right: 1.5rem;
          height: 1px; background: linear-gradient(90deg, transparent, var(--border2), transparent);
        }

        /* ── Section label ── */
        .section-label {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.78rem; font-weight: 600; color: var(--text3);
          text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 0.9rem;
        }
        .section-label svg { color: var(--accent2); }

        /* ── Textarea ── */
        textarea {
          width: 100%; min-height: 148px;
          background: var(--bg); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 1rem 1.1rem;
          color: var(--text); font-size: 0.93rem;
          font-family: 'DM Sans', system-ui, sans-serif; line-height: 1.7;
          resize: vertical; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          display: block;
        }
        textarea::placeholder { color: var(--text3); }
        textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(91,110,245,0.12);
        }
        textarea:disabled { opacity: 0.4; cursor: not-allowed; }
        textarea.invalid { border-color: rgba(248,113,113,0.45); }

        /* word-count bar */
        .wc-row { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.6rem; }
        .wc-track { flex: 1; height: 2px; background: var(--border); border-radius: 2px; overflow: hidden; }
        .wc-fill {
          height: 100%; border-radius: 2px;
          background: linear-gradient(90deg, var(--accent), var(--green));
          transition: width 0.22s ease;
        }
        .wc-label { font-size: 0.72rem; font-weight: 500; font-family: 'JetBrains Mono', monospace; white-space: nowrap; }
        .wc-label.ok  { color: var(--green); }
        .wc-label.low { color: var(--text3); }

        .field-err {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.76rem; color: var(--red); margin-top: 0.5rem;
        }

        /* ── Footer row ── */
        .input-footer { display: flex; justify-content: flex-end; margin-top: 1rem; }

        /* ── Primary button ── */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 0.5rem;
          background: var(--accent); color: #fff;
          border: none; padding: 0.68rem 1.4rem;
          border-radius: 9px; font-size: 0.88rem; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.18s, transform 0.1s, box-shadow 0.18s;
          letter-spacing: 0.01em; user-select: none;
          box-shadow: 0 1px 12px rgba(91,110,245,0.25);
        }
        .btn-primary:hover:not(:disabled) {
          background: #6b7ff8;
          box-shadow: 0 2px 20px rgba(91,110,245,0.4);
          transform: translateY(-1px);
        }
        .btn-primary:disabled { opacity: 0.32; cursor: not-allowed; box-shadow: none; transform: none; }

        .spinner {
          width: 13px; height: 13px; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.25); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.65s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Error banner ── */
        .err-banner {
          display: flex; align-items: flex-start; gap: 0.7rem;
          background: var(--red-bg); border: 1px solid rgba(248,113,113,0.18);
          border-radius: var(--radius); padding: 0.9rem 1.1rem;
          margin-bottom: 1.2rem; color: var(--red);
          font-size: 0.86rem; line-height: 1.6;
          animation: slideDown 0.25s ease;
        }
        .err-banner svg { flex-shrink: 0; margin-top: 1px; }
        @keyframes slideDown { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }

        /* ── Pipeline ── */
        .pipeline {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; padding: 1.3rem 1.5rem; margin-bottom: 1.2rem;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }

        .pipe-head {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem;
        }
        .pipe-title {
          display: flex; align-items: center; gap: 0.45rem;
          font-size: 0.7rem; font-weight: 700; color: var(--text3);
          text-transform: uppercase; letter-spacing: 0.1em;
        }
        .pipe-timer {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.75rem; font-weight: 500; color: var(--accent2);
          font-family: 'JetBrains Mono', monospace;
        }
        .pipe-timer.done { color: var(--green); }

        .pipe-steps { display: flex; flex-direction: column; gap: 0.5rem; }

        .pipe-step {
          display: flex; align-items: flex-start; gap: 0.85rem;
          padding: 0.85rem 1rem; border-radius: 10px;
          border: 1px solid var(--border); background: var(--bg);
          transition: border-color 0.25s, background 0.25s, box-shadow 0.25s;
          position: relative; overflow: hidden;
        }
        .pipe-step.active {
          border-color: var(--accent); background: var(--accent-bg);
          box-shadow: 0 0 20px rgba(91,110,245,0.12);
          animation: stepGlow 1.8s ease-in-out infinite alternate;
        }
        .pipe-step.done {
          border-color: rgba(52,211,153,0.2); background: var(--green-bg);
        }
        @keyframes stepGlow {
          from { box-shadow: 0 0 8px rgba(91,110,245,0.08); }
          to   { box-shadow: 0 0 24px rgba(91,110,245,0.22); }
        }

        /* shimmer bar on active step */
        .pipe-step.active::after {
          content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(91,110,245,0.06), transparent);
          animation: sweep 2.2s ease-in-out infinite;
        }
        @keyframes sweep { 0%{left:-60%} 100%{left:120%} }

        .step-ico-wrap {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text3); transition: all 0.25s;
        }
        .pipe-step.active .step-ico-wrap {
          background: rgba(91,110,245,0.15); border-color: var(--accent);
          color: var(--accent2);
        }
        .pipe-step.done .step-ico-wrap {
          background: rgba(52,211,153,0.12); border-color: rgba(52,211,153,0.3);
          color: var(--green);
        }

        .step-body { flex: 1; }
        .step-lbl {
          font-size: 0.86rem; font-weight: 600; color: var(--text2);
          transition: color 0.25s;
        }
        .pipe-step.active .step-lbl { color: var(--text); }
        .pipe-step.done  .step-lbl { color: var(--green); }
        .step-sub { font-size: 0.73rem; color: var(--text3); margin-top: 0.12rem; letter-spacing: 0.01em; }
        .pipe-step.active .step-sub { color: rgba(91,110,245,0.7); }

        .dots { display: flex; gap: 3px; margin-top: 0.3rem; }
        .dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: var(--accent); animation: dotAnim 1.1s ease-in-out infinite;
        }
        .dot:nth-child(2){animation-delay:.16s}
        .dot:nth-child(3){animation-delay:.32s}
        @keyframes dotAnim { 0%,80%,100%{opacity:.15;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }

        /* ── Shimmer placeholder ── */
        .shimmer {
          height: 68px; border-radius: var(--radius); margin-bottom: 1.2rem;
          background: linear-gradient(90deg, var(--surface) 25%, var(--surface2) 50%, var(--surface) 75%);
          background-size: 200% 100%; animation: shimmerAnim 1.5s infinite;
        }
        @keyframes shimmerAnim { 0%{background-position:200%} 100%{background-position:-200%} }

        /* ── Output card ── */
        .out-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 16px; overflow: hidden;
          animation: fadeIn 0.35s ease;
        }
        .out-head {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.1rem 1.5rem; border-bottom: 1px solid var(--border);
          flex-wrap: wrap; gap: 0.6rem;
          background: linear-gradient(to bottom, var(--surface2), var(--surface));
        }
        .out-title-wrap {}
        .out-title { font-size: 0.93rem; font-weight: 700; color: var(--text); }
        .out-meta  { font-size: 0.72rem; color: var(--text3); margin-top: 0.15rem; }

        .btn-row { display: flex; gap: 0.4rem; }

        /* Icon buttons */
        .btn-icon {
          display: inline-flex; align-items: center; gap: 0.4rem;
          background: var(--surface2); border: 1px solid var(--border);
          color: var(--text2); padding: 0.38rem 0.85rem;
          border-radius: 7px; font-size: 0.78rem; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.18s; user-select: none;
        }
        .btn-icon:hover          { border-color: var(--accent); color: var(--accent2); background: var(--accent-bg); }
        .btn-icon.copied         { border-color: rgba(52,211,153,0.35); color: var(--green); background: var(--green-bg); }
        .btn-icon.danger:hover   { border-color: rgba(248,113,113,0.35); color: var(--red); background: var(--red-bg); }

        /* ── Tabs ── */
        .tabs {
          display: flex; border-bottom: 1px solid var(--border);
          overflow-x: auto; background: var(--surface2);
          scrollbar-width: none;
        }
        .tabs::-webkit-scrollbar { display: none; }
        .tab {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.72rem 1.25rem; font-size: 0.81rem; font-weight: 500;
          color: var(--text3); border: none; background: transparent;
          cursor: pointer; white-space: nowrap; transition: color 0.18s;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          font-family: 'DM Sans', sans-serif; user-select: none;
        }
        .tab svg { opacity: 0.5; transition: opacity 0.18s; }
        .tab:hover       { color: var(--text2); }
        .tab:hover svg   { opacity: 0.75; }
        .tab.active      { color: var(--accent2); border-bottom-color: var(--accent); }
        .tab.active svg  { opacity: 1; }

        /* ── Markdown body ── */
        .md-body {
          padding: 1.8rem 1.9rem; color: #9aa3b8;
          line-height: 1.8; font-size: 0.91rem;
          font-family: 'DM Sans', system-ui, sans-serif;
        }
        .md-h1 {
          font-size: 1.35rem; color: var(--text); font-weight: 700;
          margin: 1.6rem 0 0.7rem; padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border); letter-spacing: -0.02em;
        }
        .md-h1:first-child { margin-top: 0; }
        .md-h2 { font-size: 1.07rem; color: #c4caee; font-weight: 600; margin: 1.5rem 0 0.5rem; letter-spacing: -0.01em; }
        .md-h3 { font-size: 0.93rem; color: var(--accent2); font-weight: 600; margin: 1.1rem 0 0.35rem; }
        .md-h4 { font-size: 0.83rem; color: #6b78a0; font-weight: 600; margin: 0.85rem 0 0.25rem; text-transform: uppercase; letter-spacing: 0.06em; }
        .md-p  { margin-bottom: 0.42rem; }
        .md-li {
          list-style: none; padding-left: 1.3rem; margin-bottom: 0.3rem; position: relative;
        }
        .md-li::before {
          content: ''; position: absolute; left: 0; top: 0.58em;
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--accent); opacity: 0.7;
        }
        .md-oli { list-style: none; padding-left: 1.5rem; margin-bottom: 0.3rem; position: relative; }
        .md-oli::before {
          content: '›'; position: absolute; left: 0.15rem;
          color: var(--accent2); font-size: 1.1rem; line-height: 1.4;
        }
        .md-hr  { border: none; border-top: 1px solid var(--border); margin: 1.1rem 0; }
        .md-gap { height: 0.3rem; }
        .icode  {
          background: var(--surface2); color: var(--accent2);
          padding: 0.1rem 0.4rem; border-radius: 5px;
          font-size: 0.82em; font-family: 'JetBrains Mono', monospace;
          border: 1px solid var(--border2);
        }
        .md-body strong { color: var(--text); font-weight: 600; }

        /* ── Footer ── */
        .footer {
          text-align: center; margin-top: 4rem;
          color: var(--text3); font-size: 0.72rem; letter-spacing: 0.03em;
          display: flex; align-items: center; justify-content: center; gap: 0.6rem;
        }
        .footer-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--border2); }
      `}</style>

      <div className="app">

        {/* ── Header ── */}
        <header className="header">
          <div className="badge">
            <span className="pulse-dot" />
            AI-Powered · Groq LLaMA 3.3
          </div>
          <h1 className="header-title">AI Agile Sprint Planner</h1>
          <p className="header-sub">
            Transform unstructured project requirements into a complete,
            sprint-ready Agile plan with user stories, story points, and API design.
          </p>
          <div className="stats-row">
            {['2 Specialized Agents', 'Sprint Planning', 'Story Points', 'API Design'].map((s, i) => (
              <div className="stat" key={i}><span className="stat-dot" />{s}</div>
            ))}
          </div>
        </header>

        {/* ── Error ── */}
        {error && (
          <div className="err-banner">
            <Icon name="alert" size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* ── Input card ── */}
        <div className="card">
          <div className="section-label">
            <Icon name="file" size={13} />
            Project Requirements
          </div>
          <textarea
            value={input}
            onChange={handleInput}
            className={inputErr ? 'invalid' : ''}
            placeholder="Describe your project in detail. Example: We need a freelance marketplace where clients post jobs with budget. Freelancers submit proposals. Milestone-based payments. Real-time chat. Admin handles disputes and analytics..."
            disabled={loading}
          />
          <div className="wc-row">
            <div className="wc-track">
              <div className="wc-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className={`wc-label ${isReady ? 'ok' : 'low'}`}>
              {wc}/{MIN_WORDS} words{isReady ? ' ✓' : ''}
            </span>
          </div>
          {inputErr && (
            <div className="field-err">
              <Icon name="alert" size={12} />
              {inputErr}
            </div>
          )}
          <div className="input-footer">
            <button className="btn-primary" onClick={handleSubmit} disabled={loading || !isReady}>
              {loading
                ? <><span className="spinner" />Processing…</>
                : <><Icon name="sparkle" size={14} />Generate Sprint Plan</>}
            </button>
          </div>
        </div>

        {/* ── Pipeline ── */}
        {step > 0 && (
          <div className="pipeline">
            <div className="pipe-head">
              <div className="pipe-title">
                <Icon name="activity" size={12} />
                AI Pipeline
              </div>
              {loading && (
                <div className="pipe-timer">
                  <Icon name="clock" size={12} />{fmt(elapsed)}
                </div>
              )}
              {!loading && step === 3 && (
                <div className="pipe-timer done">
                  <Icon name="check" size={12} />Completed in {fmt(elapsed)}
                </div>
              )}
            </div>
            <div className="pipe-steps">
              {STEPS.map((s, idx) => {
                const n = idx + 1
                const isActive = step === n
                const isDone = step > n
                return (
                  <div key={idx} className={`pipe-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                    <div className="step-ico-wrap">
                      {isDone
                        ? <Icon name="check" size={14} />
                        : <Icon name={s.icon} size={14} />}
                    </div>
                    <div className="step-body">
                      <div className="step-lbl">{s.label}</div>
                      <div className="step-sub">{s.sub}</div>
                      {isActive && <div className="dots"><div className="dot" /><div className="dot" /><div className="dot" /></div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Shimmer ── */}
        {loading && <div className="shimmer" />}

        {/* ── Output ── */}
        {result && !loading && (
          <div className="out-card">
            <div className="out-head">
              <div className="out-title-wrap">
                <div className="out-title">Sprint Plan Ready</div>
                <div className="out-meta">All features covered · Story points included · API endpoints mapped</div>
              </div>
              <div className="btn-row">
                <button className={`btn-icon ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                  <Icon name={copied ? 'check' : 'copy'} size={13} />
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button className="btn-icon danger" onClick={handleReset}>
                  <Icon name="refresh" size={13} />
                  New Plan
                </button>
              </div>
            </div>

            <div className="tabs">
              {TABS.map(t => (
                <button key={t.key} className={`tab ${activeTab === t.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.key)}>
                  <Icon name={t.icon} size={13} />{t.label}
                </button>
              ))}
            </div>

            <SimpleMarkdown content={result[activeTab] || ''} />
          </div>
        )}

        {/* ── Footer ── */}
        <footer className="footer">
          <span>FastAPI</span><span className="footer-dot" />
          <span>CrewAI</span><span className="footer-dot" />
          <span>Groq LLaMA 3.3</span><span className="footer-dot" />
          <span>Agile Sprint Planning</span>
          <span>Sivavg ❤️</span>
        </footer>
      </div>
    </>
  )
}