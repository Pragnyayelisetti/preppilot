import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <div className="navbar-logo">PrepPilot</div>
        <div className="navbar-links">
          <a href="#dashboard">Dashboard</a>
          <a href="#how">How it works</a>
        </div>
      </div>
    </nav>
  )
}
