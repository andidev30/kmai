import { RouterProvider, createBrowserRouter } from "react-router-dom"

import DashboardLayout from "@/components/DashboardLayout"
import ClassDetailPage from "@/pages/class/ClassDetailPage"
import DashboardNotFoundPage from "@/pages/dashboard/DashboardNotFoundPage"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import LandingPage from "@/pages/landing/Landing"
import LoginPage from "@/pages/login/Login"
import NotFoundPage from "@/pages/not-found/NotFoundPage"
import WelcomeWizard from "@/pages/onboarding/WelcomeWizard"
import RegisterPage from "@/pages/register/Register"

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    handle: {
      crumb: () => ({ label: "Dashboard", to: "/dashboard" }),
    },
    children: [
      {
        index: true,
        element: <DashboardPage />,
        handle: { crumb: () => ({ label: "Overview" }) },
      },
      {
        path: "welcome",
        element: <WelcomeWizard />,
        handle: { crumb: () => ({ label: "Welcome" }) },
      },
      {
        path: "class",
        element: <ClassDetailPage />,
        handle: { crumb: () => ({ label: "Class Detail" }) },
      },
      {
        path: "*",
        element: <DashboardNotFoundPage />,
        handle: { crumb: () => ({ label: "Not found" }) },
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App