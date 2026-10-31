
import { useEffect, useState } from 'react'
import LightPillar from './components/LightPillar.jsx'

const initialTransactions = [
  {
    id: 'PF-2048', name: 'Acme Studio', amount: '$1,250.00',
    status: 'Matched', tone: 'matched', detail: 'Evidence complete',
    paymentMethod: 'Card', reference: 'PAY-882104',
    evidence: ['Payment record', 'Receipt', 'Settlement record'],
    note: 'Payment amount and settlement record match.',
  },
  {
    id: 'PF-2047', name: 'Jordan Lee', amount: '$480.00',
    status: 'Review', tone: 'review', detail: 'Receipt needs review',
    paymentMethod: 'Bank transfer', reference: 'PAY-882103',
    evidence: ['Payment record', 'Receipt requires verification'],
    note: '',
  },
  {
    id: 'PF-2046', name: 'Northstar Labs', amount: '$2,400.00',
    status: 'Pending', tone: 'pending', detail: 'Awaiting confirmation',
    paymentMethod: 'Card', reference: 'PAY-882102',
    evidence: ['Payment record', 'Settlement confirmation pending'],
    note: '',
  },
]

const DEMO_SESSION_KEY = 'proofflow-demo-session'

function readDemoSession() {
  try {
    return JSON.parse(sessionStorage.getItem(DEMO_SESSION_KEY)) || null
  } catch {
    return null
  }
}
function formatInlineMarkdown(text) {
  return text.split(/(`[^`]+`|\*\*.*?\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>
    }

    return part
  })
}
function AiAnalysisReport({ content }) {
  return (
    <div className="ai-report">
      {content.split('\n').map((line, index) => {
        const trimmed = line.trim()

        if (!trimmed) return null

        // Markdown headings
        if (/^#{1,4}\s/.test(trimmed)) {
          const heading = trimmed.replace(/^#{1,4}\s*/, '')

          return (
            <h4 key={index}>
              {formatInlineMarkdown(heading)}
            </h4>
          )
        }

        // Markdown separators
        if (/^[-*_]{3,}$/.test(trimmed)) {
          return <hr key={index} />
        }

        // Bullet points
        if (/^[-*•]\s/.test(trimmed)) {
          return (
            <p className="ai-report-bullet" key={index}>
              <span>• </span>
              {formatInlineMarkdown(trimmed.replace(/^[-*•]\s*/, ''))}
            </p>
          )
        }

        // Normal paragraphs
        return (
          <p key={index}>
            {formatInlineMarkdown(trimmed)}
          </p>
        )
      })}
    </div>
  )
}function App() {
  const [account, setAccount] = useState(readDemoSession)
  const [page, setPage] = useState(() =>
    readDemoSession() ? 'home' : 'login'
  )
  const [accountMenu, setAccountMenu] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  
const [transactions, setTransactions] = useState(() => {
  try {
    const saved = localStorage.getItem('proofflow-investigations')
    return saved ? JSON.parse(saved) : initialTransactions
  } catch {
    return initialTransactions
  }
})

  const [apiStatus, setApiStatus] = useState('loading')
  const [apiError, setApiError] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [saved, setSaved] = useState(false)
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (account) {
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(account))
    } else {
      sessionStorage.removeItem(DEMO_SESSION_KEY)
    }
  }, [account])
  
useEffect(() => {
  let cancelled = false

  async function loadPayPalTransactions() {
    try {
      setApiStatus('loading')
      setApiError('')

      const response = await fetch('/api/paypal/transactions')

      if (!response.ok) {
        throw new Error(`API request failed (${response.status})`)
      }

      const data = await response.json()

      const mappedTransactions = (data.transactions || []).map(
        (item, index) => {
          const info = item.transaction_info || {}
          const currency = info.transaction_amount?.currency_code || 'USD'
          const value = Number(info.transaction_amount?.value || 0)

          return {
            id: `PF-${info.transaction_id || index + 1}`,
            name: info.transaction_subject || 'PayPal transaction',
            amount: new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency,
            }).format(value),
            status: 'Review',
            tone: 'review',
            detail: 'PayPal Sandbox · Needs reconciliation',
            paymentMethod: info.instrument_type || 'PayPal',
            reference: info.transaction_id || 'No reference',
            evidence: ['PayPal transaction record'],
            note: '',
            
transactionDate: info.transaction_initiation_date || '',
updatedDate: info.transaction_updated_date || '',
eventCode: info.transaction_event_code || '',
paypalStatus: info.transaction_status || '',
endingBalance: info.ending_balance
  ? `${info.ending_balance.currency_code} ${info.ending_balance.value}`
  : 'Unavailable',
availableBalance: info.available_balance
  ? `${info.available_balance.currency_code} ${info.available_balance.value}`
  : 'Unavailable',
protectionEligibility: info.protection_eligibility || 'Unavailable',
instrumentSubtype: info.instrument_sub_type || 'Unavailable',

          }
        }
      )

      
if (cancelled) return

const savedInvestigations = (() => {
  try {
    return JSON.parse(
      localStorage.getItem('proofflow-investigations') || '[]'
    )
  } catch {
    return []
  }
})()

const savedByReference = new Map(
  savedInvestigations.map((item) => [item.reference, item])
)

const mergedTransactions = mappedTransactions.map((transaction) => {
  const saved = savedByReference.get(transaction.reference)

  if (!saved) return transaction

  return {
    ...transaction,
    status: saved.status,
    tone: saved.tone,
    detail: saved.detail,
    note: saved.note,
  }
})

setTransactions(
  mergedTransactions.length ? mergedTransactions : initialTransactions
)
setApiStatus(mergedTransactions.length ? 'connected' : 'empty')

    } catch (error) {
      if (cancelled) return

      setApiStatus('error')
      setApiError(error.message || 'Could not load PayPal transactions')
      
    }
  }

  loadPayPalTransactions()

  return () => {
    cancelled = true
  }
}, [])


  const selected = transactions.find((item) => item.id === selectedId)
  async function analyzeTransaction() {
  if (!selected) return

  setAiLoading(true)
  setAiError('')
  setAiAnalysis(null)

  try {
    const response = await fetch('/api/ai/analyze-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: selected,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.detail || 'AI analysis failed')
    }

    setAiAnalysis(data)
  } catch (error) {
    setAiError(error.message || 'Could not analyze transaction')
  } finally {
    setAiLoading(false)
  }
}

  function openAuthScreen(screen) {
    setPage(screen)
    setAuthMessage('')
    setAuthPassword('')
    setAccountMenu(false)
  }

  function signIn(event) {
    event.preventDefault()

    if (!authEmail.trim() || !authPassword) {
      setAuthMessage('Enter an email and password to continue.')
      return
    }

    // Demo only: no password is stored, sent, or verified.
    const profile = {
      name: authName.trim() || authEmail.split('@')[0],
      email: authEmail.trim(),
    }

    setAccount(profile)
    setPage('home')
    setAuthMessage('')
    setAuthPassword('')
  }

  function register(event) {
    event.preventDefault()

    if (!authName.trim() || !authEmail.trim() || !authPassword) {
      setAuthMessage('Complete all fields to continue.')
      return
    }

    // Demo only: this does not create a real account.
    setAccount({ name: authName.trim(), email: authEmail.trim() })
    setPage('home')
    setAuthMessage('')
    setAuthPassword('')
  }

  function resetPassword(event) {
    event.preventDefault()

    if (!authEmail.trim()) {
      setAuthMessage('Enter your email to continue.')
      return
    }

    // No email is sent. This only demonstrates the UI flow.
    setAuthMessage(
      `Demo complete: a real reset email was not sent to ${authEmail.trim()}.`
    )
  }

  function signOut() {
    setAccount(null)
    setAccountMenu(false)
    setSelectedId(null)
    setPage('login')
    setAuthName('')
    setAuthEmail('')
    setAuthPassword('')
    setAuthMessage('You have signed out of the demo session.')
  }

  function goHome() {
    if (!account) {
      openAuthScreen('login')
      return
    }
    setPage('home')
    setSelectedId(null)
    setAccountMenu(false)
  }

  function goToQueue() {
    if (!account) {
      openAuthScreen('login')
      return
    }
    setPage('queue')
    setSelectedId(null)
    setAccountMenu(false)
  }

  function openInvestigation(id) {
    if (!account) {
      openAuthScreen('login')
      return
    }
    setSelectedId(id)
    setSaved(false)
    setPage('detail')
  }

  

function updateTransaction(id, changes) {
  setTransactions((current) => {
    const updated = current.map((item) =>
      item.id === id ? { ...item, ...changes } : item
    )

    try {
      localStorage.setItem(
        'proofflow-investigations',
        JSON.stringify(updated)
      )
    } catch (error) {
      console.error('Could not save investigations:', error)
    }

    return updated
  })

  setSaved(false)
}


const filteredTransactions = transactions.filter((item) => {
  const matchesSearch =
    `${item.id} ${item.name} ${item.reference}`
      .toLowerCase()
      .includes(search.toLowerCase())

  return matchesSearch && (filter === 'All' || item.status === filter)
})


  const isAuthPage = ['login', 'register', 'reset'].includes(page)

  return (
    <main className="app-shell">
      <div className="ambient-background" aria-hidden="true">
        <LightPillar
          topColor="#5227FF"
          bottomColor="#FF9FFC"
          intensity={1}
          glowAmount={0.002}
          bloom={0.5}
          pillarWidth={3}
          pillarHeight={0.4}
          pillarRotation={56}
          rotationSpeed={0.3}
          interactive
          clickPulse
          intro
          quality="high"
          mixBlendMode="screen"
        />
      </div>

      <div className="app-content">
        <header className="topbar">
          <button className="brand brand-button" onClick={goHome}>
            <span className="brand-mark">P</span>
            <span>ProofFlow</span>
          </button>

          <span className="workspace-label">
            <span className="live-dot" />
            {isAuthPage ? 'DEMO ACCOUNT ACCESS' : 'Investigation workspace'}
          </span>

          {account && !isAuthPage ? (
            <div className="account-area">
              <button
                className="profile-button"
                aria-label="Open account menu"
                aria-expanded={accountMenu}
                onClick={() => setAccountMenu((open) => !open)}
              >
                {(account.name || 'S').charAt(0).toUpperCase()}
              </button>

              {accountMenu && (
                <div className="account-dropdown">
                  <p className="account-dropdown-label">DEMO ACCOUNT</p>
                  <strong>{account.name}</strong>
                  <span className="account-email">{account.email}</span>
                  <div className="account-divider" />
                  <button
                    className="account-menu-item"
                    onClick={() => {
                      setPage('profile')
                      setAccountMenu(false)
                    }}
                  >
                    My profile
                  </button>
                  <button
                    className="account-menu-item"
                    onClick={() => {
                      setPage('home')
                      setAccountMenu(false)
                    }}
                  >
                    Workspace
                  </button>
                  <button
                    className="account-menu-item signout-item"
                    onClick={signOut}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <span className="demo-header-label">DEMO MODE</span>
          )}
        </header>

        {isAuthPage && (
          <section className="auth-layout">
            <div className="auth-card">
              <div className="auth-brand-mark">P</div>
              <p className="section-kicker">PROOFFLOW / DEMO ACCESS</p>

              {page === 'login' && (
                <>
                  <h1 className="auth-title">Welcome back.</h1>
                  <p className="auth-subtitle">
                    Sign in to enter your investigation workspace.
                  </p>

                  <form className="auth-form" onSubmit={signIn}>
                    <label className="field-label" htmlFor="login-email">
                      Email address
                    </label>
                    <input
                      id="login-email"
                      className="auth-input"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required
                    />

                    <label className="field-label" htmlFor="login-password">
                      Password
                    </label>
                    <div className="password-wrap">
                      <input
                        id="login-password"
                        className="auth-input"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Enter any demo password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    <button
                      type="button"
                      className="forgot-link"
                      onClick={() => openAuthScreen('reset')}
                    >
                      Forgot password?
                    </button>

                    {authMessage && (
                      <p className="auth-message" role="status">{authMessage}</p>
                    )}

                    <button className="primary-button auth-submit" type="submit">
                      Enter demo workspace <span>↗</span>
                    </button>
                  </form>

                  <p className="auth-switch">
                    New to ProofFlow?{' '}
                    <button onClick={() => openAuthScreen('register')}>
                      Create an account
                    </button>
                  </p>
                </>
              )}

              {page === 'register' && (
                <>
                  <h1 className="auth-title">Create your profile.</h1>
                  <p className="auth-subtitle">
                    Set up a sample account to explore ProofFlow.
                  </p>

                  <form className="auth-form" onSubmit={register}>
                    <label className="field-label" htmlFor="register-name">
                      Full name
                    </label>
                    <input
                      id="register-name"
                      className="auth-input"
                      autoComplete="name"
                      placeholder="Your name"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required
                    />

                    <label className="field-label" htmlFor="register-email">
                      Email address
                    </label>
                    <input
                      id="register-email"
                      className="auth-input"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      required
                    />

                    <label className="field-label" htmlFor="register-password">
                      Demo password
                    </label>
                    <input
                      id="register-password"
                      className="auth-input"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Any non-empty value"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                    />

                    <p className="demo-note">
                      Demo only. This does not create a real account or store your password.
                    </p>

                    {authMessage && (
                      <p className="auth-message" role="status">{authMessage}</p>
                    )}

                    <button className="primary-button auth-submit" type="submit">
                      Create demo profile <span>↗</span>
                    </button>
                  </form>

                  <p className="auth-switch">
                    Already explored ProofFlow?{' '}
                    <button onClick={() => openAuthScreen('login')}>
                      Back to login
                    </button>
                  </p>
                </>
              )}

              {page === 'reset' && (
                <>
                  <h1 className="auth-title">Reset password.</h1>
                  <p className="auth-subtitle">
                    Try the password-reset experience with a demo email address.
                  </p>

                  <form className="auth-form" onSubmit={resetPassword}>
                    <label className="field-label" htmlFor="reset-email">
                      Email address
                    </label>
                    <input
                      id="reset-email"
                      className="auth-input"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={authEmail}
                      onChange={(e) => {
                        setAuthEmail(e.target.value)
                        setAuthMessage('')
                      }}
                      required
                    />

                    {authMessage && (
                      <p className="auth-message" role="status">{authMessage}</p>
                    )}

                    <button className="primary-button auth-submit" type="submit">
                      Simulate reset request <span>↗</span>
                    </button>
                  </form>

                  <p className="auth-switch">
                    Remembered it?{' '}
                    <button onClick={() => openAuthScreen('login')}>
                      Back to login
                    </button>
                  </p>
                </>
              )}

              <div className="demo-disclaimer">
                <span>✳</span>
                Demo authentication · No real accounts, passwords, or emails
              </div>
            </div>
          </section>
        )}

        {page === 'home' && account && (
          <>
            <section className="hero">
              <p className="eyebrow">
                <span className="eyebrow-line" /> PAYMENT OPERATIONS
              </p>
              <h1>
                Every transaction.<br />
                <span>One clear picture.</span>
              </h1>
              <p className="hero-copy">
                A focused workspace to reconcile payments, inspect evidence,
                and resolve exceptions with confidence.
              </p>
              <div className="hero-actions">
                <button className="primary-button" onClick={goToQueue}>
                  Open investigations <span>↗</span>
                </button>
                <span className="secure-note">
                  <span>✳</span> Evidence-first by design
                </span>
              </div>
            </section>

            <section className="dashboard-panel" aria-label="Recent investigations">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">OVERVIEW</p>
                  <h2>Recent investigations</h2>
                </div>
                <span className="date-chip">Demo workspace <span>⌄</span></span>
              </div>

              <div className="stats-grid">
                <article className="stat-card">
                  <span className="stat-label">Transactions reviewed</span>
                  <strong>128</strong>
                  <span className="stat-foot">Across this workspace</span>
                </article>
                <article className="stat-card">
                  <span className="stat-label">Needs attention</span>
                  <strong>
                    {String(transactions.filter(
                      (t) => t.status === 'Review' || t.status === 'Pending'
                    ).length).padStart(2, '0')}
                  </strong>
                  <span className="stat-foot pink-text">Requires follow-up</span>
                </article>
                <article className="stat-card">
                  <span className="stat-label">Reconciled amount</span>
                  <strong>$24,680</strong>
                  <span className="stat-foot">This reporting period</span>
                </article>
              </div>

              <div className="table-heading">
                <h3>Transaction queue</h3>
                <button className="text-action" onClick={goToQueue}>View all ↗</button>
              </div>

              <div className="transaction-list">
                {transactions.map((item) => (
                  <article className="transaction-row" key={item.id}>
                    <div className="transaction-icon">{item.name.slice(0, 1)}</div>
                    <div className="transaction-main">
                      <strong>{item.name}</strong>
                      <span>{item.id} · {item.detail}</span>
                    </div>
                    <strong className="amount">{item.amount}</strong>
                    <span className={`status status-${item.tone}`}>
                      <i />{item.status}
                    </span>
                    <button
                      className="row-action"
                      aria-label={`Open ${item.id}`}
                      onClick={() => openInvestigation(item.id)}
                    >
                      ↗
                    </button>
                  </article>
                ))}
              </div>

              <p className="demo-note">
                Connected to PayPal Sandbox · Transaction data may be simulated ·
              </p>
            </section>
          </>
        )}

        {page === 'queue' && account && (
          <section className="workflow-panel">
            <button className="back-link" onClick={goHome}>← Back to overview</button>
            <p className="section-kicker">PAYMENT OPERATIONS / QUEUE</p>
            <h1 className="workflow-title">Investigations</h1>
            <p className="workflow-copy">
              Review transactions, inspect supporting evidence, and track resolutions.
            </p>

            <div className="queue-toolbar">
              <input
                className="queue-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, ID or reference..."
                aria-label="Search investigations"
              />
              <select
                className="queue-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="All">All statuses</option>
                <option value="Matched">Matched</option>
                <option value="Review">Review</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div className="table-heading">
              <h3>Transaction queue</h3>
              <span>{filteredTransactions.length} records</span>
            </div>

            <div className="transaction-list">
              {filteredTransactions.map((item) => (
                <article className="transaction-row" key={item.id}>
                  <div className="transaction-icon">{item.name.slice(0, 1)}</div>
                  <div className="transaction-main">
                    <strong>{item.name}</strong>
                    <span>{item.id} · {item.detail}</span>
                  </div>
                  <strong className="amount">{item.amount}</strong>
                  <span className={`status status-${item.tone}`}>
                    <i />{item.status}
                  </span>
                  <button
                    className="row-action"
                    aria-label={`Inspect ${item.id}`}
                    onClick={() => openInvestigation(item.id)}
                  >
                    ↗
                  </button>
                </article>
              ))}
              {filteredTransactions.length === 0 && (
                <p className="empty-state">No matching investigations found.</p>
              )}
            </div>
            <p className="demo-note">Demo data only · Changes are held in this page session.</p>
          </section>
        )}

        {page === 'detail' && account && selected && (
          <section className="workflow-panel">
            <button className="back-link" onClick={goToQueue}>
              ← Back to investigations
            </button>
            <p className="section-kicker">INVESTIGATION / {selected.id}</p>

            <div className="detail-heading">
              <div>
                <h1 className="workflow-title">{selected.name}</h1>
                <p className="workflow-copy">
                  Review the payment record and document your findings.
                </p>
              </div>
              <span className={`status status-${selected.tone}`}>
                <i />{selected.status}
              </span>
            </div>

            <div className="detail-grid">
              <article className="detail-card">
                <p className="section-kicker">PAYMENT DETAILS</p>
                <span className="detail-label">Transaction amount</span>
                <strong className="detail-amount">{selected.amount}</strong>
                <div className="detail-field">
                  <span>Transaction ID</span><strong>{selected.id}</strong>
                </div>
                <div className="detail-field">
                  <span>Payment reference</span><strong>{selected.reference}</strong>
                </div>
                <div className="detail-field">
                  <span>Payment method</span><strong>{selected.paymentMethod}</strong>
                </div>
                
<div className="detail-field">
  <span>PayPal transaction status</span>
  <strong>{selected.paypalStatus || 'Unavailable'}</strong>
</div>

<div className="detail-field">
  <span>Transaction initiated</span>
  <strong>
    {selected.transactionDate
      ? new Date(selected.transactionDate).toLocaleString()
      : 'Unavailable'}
  </strong>
</div>

<div className="detail-field">
  <span>Last updated</span>
  <strong>
    {selected.updatedDate
      ? new Date(selected.updatedDate).toLocaleString()
      : 'Unavailable'}
  </strong>
</div>

<div className="detail-field">
  <span>Event code</span>
  <strong>{selected.eventCode || 'Unavailable'}</strong>
</div>

<div className="detail-field">
  <span>Ending balance</span>
  <strong>{selected.endingBalance || 'Unavailable'}</strong>
</div>

<div className="detail-field">
  <span>Available balance</span>
  <strong>{selected.availableBalance || 'Unavailable'}</strong>
</div>

<div className="detail-field">
  <span>Payment instrument subtype</span>
  <strong>{selected.instrumentSubtype || 'Unavailable'}</strong>
</div>

<div className="detail-field">
  <span>Protection eligibility</span>
  <strong>{selected.protectionEligibility || 'Unavailable'}</strong>
</div>

              </article>

              <article className="detail-card">
                <p className="section-kicker">EVIDENCE REVIEW</p>
                <p className="workflow-copy">
                  Review the available items before deciding on the outcome.
                </p>
                <div className="evidence-list">
                  {selected.evidence.map((evidence, index) => (
                    <div className="evidence-item" key={`${selected.id}-${index}`}>
                      <span className="evidence-symbol">
                        {evidence.toLowerCase().includes('pending') ||
                        evidence.toLowerCase().includes('requires') ? '!' : '✓'}
                      </span>
                      <span>{evidence}</span>
                    </div>
                  ))}
                </div>
                <p className="demo-note">
                  Illustrative evidence labels, not uploaded documents.
                </p>
              </article>
            </div>
            <article className="detail-card">
  <p className="section-kicker">AI TRANSACTION ANALYSIS</p>

  <p className="workflow-copy">
    Generate an AI-assisted review of the available transaction information.
  </p>

  <button
    className="primary-button"
    onClick={analyzeTransaction}
    disabled={aiLoading}
  >
    {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
    {!aiLoading && <span> ↗</span>}
  </button>
  

  {aiError && (
    <p className="demo-note">{aiError}</p>
  )}

  {aiAnalysis && (
  <div>
    <h3>Analysis report</h3>

    <AiAnalysisReport content={aiAnalysis.analysis} />
    

    <p className="demo-note">
      {aiAnalysis.disclaimer}
    </p>
  </div>
)}
</article>      
            <article className="detail-card resolution-card">
              <p className="section-kicker">INVESTIGATION OUTCOME</p>
              <label className="field-label" htmlFor="investigation-status">
                Investigation status
              </label>
              <select
                id="investigation-status"
                className="queue-filter status-select"
                value={selected.status}
                onChange={(e) => {
                  const status = e.target.value
                  const tone = status.toLowerCase()
                  const detail = {
                    Matched: 'Evidence complete',
                    Review: 'Requires further review',
                    Pending: 'Awaiting confirmation',
                  }[status]
                  updateTransaction(selected.id, { status, tone, detail })
                }}
              >
                <option value="Matched">Matched</option>
                <option value="Review">Review</option>
                <option value="Pending">Pending</option>
              </select>

              <label className="field-label" htmlFor="investigation-note">
                Investigation notes
              </label>
              <textarea
                id="investigation-note"
                className="investigation-notes"
                rows={4}
                value={selected.note}
                onChange={(e) => updateTransaction(selected.id, { note: e.target.value })}
                placeholder="Record what you checked and the reason for your decision..."
              />

              <div className="resolution-actions">
                {saved && <span className="saved-message">Changes saved for this session.</span>}
                <button className="primary-button" onClick={() => setSaved(true)}>
                  Save investigation <span>✓</span>
                </button>
              </div>
            </article>
            <p className="demo-note">
              Demo only · No backend or real payment records are connected.
            </p>
          </section>
        )}

        {page === 'profile' && account && (
          <section className="workflow-panel">
            <button className="back-link" onClick={goHome}>← Back to workspace</button>
            <p className="section-kicker">ACCOUNT / PROFILE</p>
            <h1 className="workflow-title">Your profile</h1>
            <div className="detail-card profile-card">
              <div className="profile-avatar-large">
                {(account.name || 'S').charAt(0).toUpperCase()}
              </div>
              <div className="detail-field">
                <span>Name</span><strong>{account.name}</strong>
              </div>
              <div className="detail-field">
                <span>Email</span><strong>{account.email}</strong>
              </div>
              <p className="demo-note">
                Demo profile only. This information is not a verified identity.
              </p>
              <button className="primary-button" onClick={signOut}>Sign out</button>
            </div>
          </section>
        )}

        <footer className="footer">
          <span>ProofFlow</span>
          <span>Make every payment traceable.</span>
        </footer>
      </div>
    </main>
  )
}

export default App
