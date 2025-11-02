import { BrowserRouter, Route, Routes } from "react-router-dom"

import LandingPage from "@/pages/landing/Landing"
import LoginPage from "@/pages/login/Login"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import RegisterPage from "@/pages/register/Register"
import WelcomeWizard from "@/pages/onboarding/WelcomeWizard"
import ClassDetailPage from "@/pages/class/ClassDetailPage"
import NotFoundPage from "@/pages/not-found/NotFoundPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/welcome" element={<WelcomeWizard />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/class/:id" element={<ClassDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
