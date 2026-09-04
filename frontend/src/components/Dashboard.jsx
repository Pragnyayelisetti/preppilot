import { useEffect, useState } from 'react'
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
        // backend not running or empty — keep demo data, no error shown to user
      })
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await fetch('/api/sync-inbox?limit=10', { method: 'POST' })
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

  return (
    <section id="dashboard" className="dashboard container">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Your opportunities</h2>
          <p className="dashboard-sub">
            {usingLiveData ? 'Synced from your inbox' : 'Demo data — connect your inbox to see real results'}
          </p>
        </div>
        <button className="btn-primary" onClick={handleSync} disabled={syncing}>
          {syncing ? 'Syncing…' : 'Sync inbox'}
        </button>
      </div>

      <div className="dashboard-grid">
        {opportunities.map((opp, i) => (
          <OpportunityCard opp={opp} key={i} />
        ))}
      </div>
    </section>
  )
}
