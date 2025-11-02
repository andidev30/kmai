import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import LandingPage from "@/pages/landing/Landing"
import LoginPage from "@/pages/login/Login"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
