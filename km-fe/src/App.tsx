import { RouterProvider, createBrowserRouter } from "react-router-dom"

import DashboardLayout from "@/components/DashboardLayout"
import ClassDetailPage from "@/pages/class/ClassDetailPage"
import DashboardNotFoundPage from "@/pages/dashboard/DashboardNotFoundPage"
import DashboardPage from "@/pages/dashboard/DashboardPage"
import ExamDetailPage from "@/pages/exam/ExamDetailPage"
import LandingPage from "@/pages/landing/Landing"
import LoginPage from "@/pages/login/Login"
import NotFoundPage from "@/pages/not-found/NotFoundPage"
import RegisterPage from "@/pages/register/Register"
import StudentDetailPage from "@/pages/student/StudentDetailPage"
import MaterialDetailPage from "@/pages/material/MaterialDetailPage"

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
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "class",
        element: <ClassDetailPage />,
      },
      {
        path: "exam/:id",
        element: <ExamDetailPage />,
      },
      {
        path: "material/:id",
        element: <MaterialDetailPage />,
      },
      {
        path: "student/:id",
        element: <StudentDetailPage />,
      },
      {
        path: "*",
        element: <DashboardNotFoundPage />,
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
