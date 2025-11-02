import "./DashboardPage.css"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

type ClassInfo = {
  id: string
  name: string
  subject: string
}

type Organization = {
  id: string
  name: string
  classes: ClassInfo[]
}

const sampleOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "SMKN Bantarkalong",
    classes: [
      { id: "class-1", name: "X12 RPL 1", subject: "Matematika" },
      { id: "class-2", name: "X12 RPL 2", subject: "B. Indo" },
    ],
  },
  {
    id: "org-2",
    name: "Less PastiPintar",
    classes: [{ id: "class-3", name: "Batch 64", subject: "Inggris" }],
  },
]

function DashboardPage() {
  const navigate = useNavigate()
  const [expandedOrganizations, setExpandedOrganizations] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sampleOrganizations.map((org) => [org.id, true]))
  )

  const handleToggleOrganization = (id: string) => {
    setExpandedOrganizations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const goToClass = (cls: ClassInfo) => {
    navigate(`/dashboard/class?id=${cls.id}`)
  }

  return (
    <div className="flex flex-col gap-10">
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

      <section>
        <div className="grid gap-4 sm:grid-cols-2">
          <Button
            size="lg"
            className="h-auto cursor-pointer rounded-2xl bg-blue-500 px-8 py-6 text-base font-semibold shadow-lg shadow-blue-500/30 transition hover:scale-[1.01] hover:bg-blue-400"
            onClick={() => navigate("/dashboard/welcome")}
          >
            Create your first class
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto cursor-pointer rounded-2xl border-2 border-blue-200 bg-white px-8 py-6 text-base font-semibold text-blue-600 transition hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50"
            onClick={() => navigate("/dashboard")}
          >
            Explore templates
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Organizations</h2>
          <p className="text-sm text-slate-500">
            Choose a class below to jump back into planning.
          </p>
        </div>

        <div className="space-y-8">
          {sampleOrganizations.map((org) => (
            <div key={org.id} className="space-y-4">
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-2xl bg-transparent text-left text-base font-semibold text-slate-800 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                onClick={() => handleToggleOrganization(org.id)}
              >
                {org.name}
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform",
                    expandedOrganizations[org.id] ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>
              {expandedOrganizations[org.id] && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {org.classes.map((cls) => (
                    <Card
                      key={cls.id}
                      role="button"
                      tabIndex={0}
                      className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
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
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
