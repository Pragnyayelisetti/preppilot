import './Navbar.css'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">

        <Link to="/" className="navbar-logo">
          PrepPilot
        </Link>

        <div className="navbar-links">

          <Link to="/dashboard">
            Dashboard
          </Link>

          <a href="#how">
            How it works
          </a>

          <Link to="/login" className="login-link">
            Login
          </Link>

          <Link to="/signup" className="signup-button">
            Sign Up
          </Link>

        </div>

      </div>
    </nav>
  )
}