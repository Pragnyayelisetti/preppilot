import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Dashboard from './components/Dashboard'

import Login from './pages/Login'
import Signup from './pages/Signup'

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Dashboard />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home page */}
        <Route path="/" element={<Home />} />

        {/* Authentication pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Unknown URL */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App