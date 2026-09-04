import { useEffect, useMemo, useState } from 'react'
import OpportunityCard from './OpportunityCard'
import { mockOpportunities } from '../data/mock'
import './Dashboard.css'

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState(mockOpportunities)
  const [usingLiveData, setUsingLiveData] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetch('/api/opportunities')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        if (data && data.length > 0) {
          setOpportunities(data)
          setUsingLiveData(true)
        }
      })
      .catch(() => {
        // Backend not running — keep demo data
      })
  }, [])

  const handleSync = async () => {
    setSyncing(true)

    try {
      await fetch('/api/sync-inbox?limit=10', {
        method: 'POST'
      })

      const res = await fetch('/api/opportunities')
      const data = await res.json()

      if (data && data.length > 0) {
        setOpportunities(data)
        setUsingLiveData(true)
      }
    } catch (e) {
      console.error('Sync failed', e)
    }

    setSyncing(false)
  }

  // =========================
  // DASHBOARD STATISTICS
  // =========================

  const totalOpportunities = opportunities.length

  const urgentOpportunities = opportunities.filter(
    opp => opp.days_remaining != null && opp.days_remaining <= 3
  ).length

  const averageMatch = opportunities.length
    ? Math.round(
        opportunities.reduce(
          (sum, opp) => sum + (opp.match_score || 0),
          0
        ) / opportunities.length
      )
    : 0

  const upcomingOpportunities = opportunities.filter(
    opp => opp.days_remaining != null && opp.days_remaining <= 7
  ).length

  // =========================
  // TODAY'S TASK
  // =========================

  const todaysOpportunity = useMemo(() => {
    if (!opportunities.length) return null

    return [...opportunities]
      .filter(opp => opp.todays_task)
      .sort(
        (a, b) =>
          (a.days_remaining ?? 999) -
          (b.days_remaining ?? 999)
      )[0]
  }, [opportunities])

  return (
    <section id="dashboard" className="dashboard container">

      {/* =========================
          HEADER
      ========================= */}

      <div className="dashboard-header">

        <div>
          <p className="dashboard-eyebrow">
            YOUR PREPARATION HUB
          </p>

          <h2 className="dashboard-title">
            Your opportunities
          </h2>

          <p className="dashboard-sub">
            {usingLiveData
              ? 'Synced from your inbox'
              : 'Demo data — connect your inbox to see real results'}
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? 'Syncing…' : 'Sync inbox'}
        </button>

      </div>


      {/* =========================
          STATISTICS
      ========================= */}

      <div className="dashboard-stats">

        <div className="stat-card">
          <div className="stat-icon">📩</div>

          <div>
            <div className="stat-value">
              {totalOpportunities}
            </div>

            <div className="stat-label">
              Opportunities
            </div>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">🔥</div>

          <div>
            <div className="stat-value">
              {urgentOpportunities}
            </div>

            <div className="stat-label">
              Urgent
            </div>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">🎯</div>

          <div>
            <div className="stat-value">
              {averageMatch}%
            </div>

            <div className="stat-label">
              Average Match
            </div>
          </div>
        </div>


        <div className="stat-card">
          <div className="stat-icon">⏰</div>

          <div>
            <div className="stat-value">
              {upcomingOpportunities}
            </div>

            <div className="stat-label">
              Due within 7 days
            </div>
          </div>
        </div>

      </div>


      {/* =========================
          TODAY'S PREPARATION
      ========================= */}

      {todaysOpportunity && (
        <div className="today-card">

          <div className="today-left">

            <div className="today-badge">
              🎯 TODAY'S PREPARATION
            </div>

            <h3>
              {todaysOpportunity.role_or_title}
            </h3>

            <p className="today-company">
              {todaysOpportunity.company_or_org}
            </p>

            <p className="today-task">
              {todaysOpportunity.todays_task}
            </p>

          </div>


          <div className="today-right">

            <div className="today-days">
              <span>⏰</span>

              <strong>
                {todaysOpportunity.days_remaining}
              </strong>

              <small>
                days left
              </small>
            </div>


            <div className="today-match">
              <span>Match</span>

              <strong>
                {todaysOpportunity.match_score}%
              </strong>
            </div>

          </div>

        </div>
      )}


      {/* =========================
          OPPORTUNITIES
      ========================= */}

      <div className="opportunities-heading">

        <div>
          <h3>
            All opportunities
          </h3>

          <p>
            Prioritized by urgency and fit
          </p>
        </div>

      </div>


      <div className="dashboard-grid">

        {opportunities.map((opp, i) => (
          <OpportunityCard
            opp={opp}
            key={i}
          />
        ))}

      </div>

    </section>
  )
}