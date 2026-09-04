import './Hero.css'

export default function Hero() {
  return (
    <section className="hero container">
      <div className="hero-copy">
        <p className="hero-kicker">for students, from a missed-deadline story</p>
        <h1 className="hero-title">
          We don't just tell you about the opportunity.
          <br />
          We tell you how to prepare for it.
        </h1>
        <p className="hero-sub">
          PrepPilot reads your opportunity emails, figures out how good a fit each one is,
          how much time you have left, and sends you a straight answer on WhatsApp —
          before the deadline sneaks up on you.
        </p>
        <div className="hero-actions">
          <button className="btn-primary">See it on your inbox</button>
          <button className="btn-ghost">How it works</button>
        </div>
      </div>

      <div className="hero-visual">
        <div className="phone">
          <div className="phone-notch" />
          <div className="phone-screen">
            <div className="wa-header">
              <div className="wa-avatar">PP</div>
              <div>
                <div className="wa-name">PrepPilot</div>
                <div className="wa-status">online</div>
              </div>
            </div>
            <div className="wa-bubble">
              <div className="wa-line wa-title">🎉 Shortlisted for Software Engineer Interview</div>
              <div className="wa-line wa-data">⏰ Interview in 5 days</div>
              <div className="wa-line wa-data wa-match">🎯 Match: 82%</div>
              <div className="wa-line wa-label">Prepare:</div>
              <ul className="wa-list">
                <li>DSA</li>
                <li>OOP</li>
                <li>DBMS</li>
                <li>Your projects</li>
                <li>Resume questions</li>
              </ul>
              <div className="wa-focus">Your focus: <strong>DSA + OOP</strong></div>
              <div className="wa-task">Today's task: Practice 10 DSA problems</div>
              <div className="wa-time">9:14 AM ✓✓</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
