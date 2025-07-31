// src/App.jsx
import React from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import Finance from './pages/Finance'
import Crops from './pages/Crops'
import ChatLauncher from './components/ChatLauncher'
import LanguageToggle from './components/LanguageToggle'

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

function AppContent() {
  const { pathname } = useLocation()
  const isLoggedIn = !!localStorage.getItem('token')           // e.g. returns true if user is authenticated
  const showChat = isLoggedIn && pathname !== '/profile'

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/finance" element={<Finance />} />
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/crops" element={<Crops />} />
      </Routes>

      <Footer />

      {showChat && <ChatLauncher />}

      <LanguageToggle />
    </>
  )
}

export default App
