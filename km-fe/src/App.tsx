import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import LandingPage from "@/pages/landing/Landing"
import LoginPage from "@/pages/login/Login"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import RegisterPage from "@/pages/register/Register"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
