import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()

    // Temporary frontend login
    if (email && password) {
      localStorage.setItem('isLoggedIn', 'true')

      // Go to dashboard
      navigate('/dashboard')
    } else {
      alert('Please enter email and password')
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>Welcome back</h1>

        <p className="auth-subtitle">
          Login to continue to PrepPilot
        </p>

        <form onSubmit={handleLogin}>

          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="auth-button">
            Login
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup">
            Sign up
          </Link>
        </p>

      </div>

    </div>
  )
}