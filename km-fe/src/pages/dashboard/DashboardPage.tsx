import "./DashboardPage.css"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { listClasses, type ClassSummary } from "@/lib/api"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function DashboardPage() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<ClassSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listClasses()
      .then((response) => setClasses(response.items))
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setIsLoading(false))
  }, [])

  const goToClass = (cls: ClassSummary) => {
    navigate(`/dashboard/class?id=${cls.id}`)
  }

  return (
    <div className="relative flex flex-col gap-10 pb-24">
      <section>
        <Card className="bg-white text-center shadow-md">
          <CardHeader className="mb-0">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Welcome back
            </CardTitle>
            <p className="text-sm font-normal text-slate-500">
              Plan smarter, teach bolder, and keep every student engaged today.
            </p>
          </CardHeader>
        </Card>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Your classes</h2>
          <p className="text-sm text-slate-500">
            Choose a class below to jump back into planning.
          </p>
        </div>

        {isLoading ? (
          <p className="text-sm text-slate-500">Loading classes…</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Card
                key={cls.id}
                role="button"
                tabIndex={0}
                className="group flex h-full cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                onClick={() => goToClass(cls)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    goToClass(cls)
                  }
                }}
              >
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    {cls.name}
                  </CardTitle>
                  <p className="mt-1 text-sm text-slate-500">{cls.subject}</p>
                </div>
                <span className="mt-4 text-xs font-medium uppercase tracking-wide text-blue-500">
                  View class
                </span>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Button
        size="lg"
        className="fixed bottom-6 right-6 z-10 h-14 cursor-pointer rounded-full bg-blue-500 px-6 text-base font-semibold shadow-lg shadow-blue-500/40 transition hover:-translate-y-0.5 hover:bg-blue-400"
        onClick={() => navigate("/dashboard/class?id=new")}
        aria-label="Create your class"
      >
        Create your class
      </Button>
    </div>
  )
}

export default DashboardPage
