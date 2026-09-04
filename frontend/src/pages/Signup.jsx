import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Auth.css'

export default function Signup() {

  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = (e) => {
    e.preventDefault()

    if (!name || !email || !password) {
      alert('Please fill all fields')
      return
    }

    // Temporary frontend signup
    localStorage.setItem('user', JSON.stringify({
      name,
      email
    }))

    alert('Account created successfully!')

    // After signup → login
    navigate('/login')
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>Create account</h1>

        <p className="auth-subtitle">
          Join PrepPilot and never miss an opportunity
        </p>

        <form onSubmit={handleSignup}>

          <label>Name</label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="auth-button">
            Sign Up
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">
            Login
          </Link>
        </p>

      </div>

    </div>
  )
}