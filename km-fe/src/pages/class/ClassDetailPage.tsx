import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ClipboardList, Users } from "lucide-react"
import { type ComponentType, type SVGProps, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"


function ClassDetailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const classInfo = useMemo(
    () => ({
      id: searchParams.get("id") ?? "class-1",
      name: "X12 RPL 1",
      subject: "Matematika",
    }),
    [searchParams]
  )

  return (
    <main className="min-h-screen bg-[#f9fafb] text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="space-y-4">
          <Card className="bg-white/95 shadow-lg shadow-blue-500/5">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                Class — {classInfo.name}
              </CardTitle>
              <p className="text-sm text-slate-500">{classInfo.name} — {classInfo.subject}</p>
            </CardHeader>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Quick Access</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAccessCard
              icon={BookOpen}
              label="Materials"
              onClick={() => navigate(`/dashboard/class?id=${classInfo.id}&tab=materials`)}
            />
            <QuickAccessCard
              icon={Users}
              label="Students"
              onClick={() => navigate(`/dashboard/class?id=${classInfo.id}&tab=students`)}
            />
            <QuickAccessCard
              icon={ClipboardList}
              label="Exams"
              onClick={() => navigate(`/dashboard/class?id=${classInfo.id}&tab=exams`)}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

type QuickAccessCardProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  onClick: () => void
}

function QuickAccessCard({ icon: Icon, label, onClick }: QuickAccessCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white/95 p-6 text-center shadow-lg shadow-blue-500/5 transition hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onClick()
        }
      }}
    >
      <Icon className="h-8 w-8 text-blue-500" />
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </Card>
  )
}

export default ClassDetailPage
