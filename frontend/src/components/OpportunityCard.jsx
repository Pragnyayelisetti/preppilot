import './OpportunityCard.css'

const STATUS_LABEL = {
  shortlisted: "Shortlisted",
  interview: "Interview stage",
  assessment: "Assessment",
  selected: "Selected",
  applied: "Applied",
  rejected: "Not selected",
  new: "New",
}

function urgencyClass(days) {
  if (days == null) return ''
  if (days <= 3) return 'urgent'
  if (days <= 7) return 'soon'
  return ''
}

export default function OpportunityCard({ opp }) {
  return (
    <div className="opp-card">

      {/* Top section */}
      <div className="opp-top">
        <div>
          <div className="opp-org">
            {opp.company_or_org}
          </div>

          <div className="opp-title">
            {opp.role_or_title}
          </div>
        </div>

        <div
          className={`opp-match ${
            opp.match_score >= 80
              ? 'high'
              : opp.match_score >= 50
              ? 'mid'
              : 'low'
          }`}
        >
          {opp.match_score}%
        </div>
      </div>

      {/* Status + remaining days */}
      <div className="opp-meta">

        <span className="opp-status">
          {STATUS_LABEL[opp.status] || opp.status}
        </span>

        {opp.days_remaining != null && (
          <span
            className={`opp-days ${urgencyClass(
              opp.days_remaining
            )}`}
          >
            {opp.days_remaining}d left
          </span>
        )}

      </div>

      {/* Required Skills */}
      {opp.required_skills?.length > 0 && (
        <div className="opp-skills">

          <div className="opp-section-label">
            Required skills
          </div>

          <div className="opp-skills-list">
            {opp.required_skills.map((skill, i) => (
              <span className="opp-skill" key={i}>
                {skill}
              </span>
            ))}
          </div>

        </div>
      )}

      {/* Focus Areas */}
      {opp.focus_areas?.length > 0 && (
        <div className="opp-focus-section">

          <div className="opp-section-label">
            Preparation focus
          </div>

          <div className="opp-focus">
            {opp.focus_areas.map((focus, i) => (
              <span className="opp-chip" key={i}>
                {focus}
              </span>
            ))}
          </div>

        </div>
      )}

      {/* Today's Task */}
      {opp.todays_task && (
        <div className="opp-task">

          <span className="opp-task-icon">
            🎯
          </span>

          <div>
            <span className="opp-task-label">
              Today's task
            </span>

            <div className="opp-task-text">
              {opp.todays_task}
            </div>
          </div>

        </div>
      )}

      {/* View Preparation */}
      <button className="opp-button">
        View Preparation
        <span>→</span>
      </button>

    </div>
  )
}