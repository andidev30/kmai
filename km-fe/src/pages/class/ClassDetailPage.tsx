import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, ClipboardList, Users } from "lucide-react"
import { type ComponentType, type SVGProps, useMemo } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { StudentListPage } from "@/components/StudentListPage"
import { MaterialListPage } from "@/components/MaterialListPage"
import { ExamListPage } from "@/components/ExamListPage"


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

  const activeTab = useMemo(() => searchParams.get("tab"), [searchParams])

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
          <h2 className="text-lg font-semibold text-slate-900">Access</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAccessCard
              icon={BookOpen}
              label="Materials"
              onClick={() => navigate(`/dashboard/class?id=${classInfo.id}&tab=materials`)}
              isActive={activeTab === "materials"}
            />
            <QuickAccessCard
              icon={Users}
              label="Students"
              onClick={() => navigate(`/dashboard/class?id=${classInfo.id}&tab=students`)}
              isActive={activeTab === "students"}
            />
            <QuickAccessCard
              icon={ClipboardList}
              label="Exams"
              onClick={() => navigate(`/dashboard/class?id=${classInfo.id}&tab=exams`)}
              isActive={activeTab === "exams"}
            />
          </div>
        </section>

        {activeTab === "students" && (
          <section className="space-y-4">
            <StudentListPage />
          </section>
        )}

        {activeTab === "materials" && (
          <section className="space-y-4">
            <MaterialListPage classId={classInfo.id} />
          </section>
        )}

        {activeTab === "exams" && (
          <section className="space-y-4">
            <ExamListPage />
          </section>
        )}
      </div>
    </main>
  )
}

type QuickAccessCardProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  onClick: () => void
  isActive: boolean
}

function QuickAccessCard({ icon: Icon, label, onClick, isActive }: QuickAccessCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border p-6 text-center shadow-lg shadow-blue-500/5 transition hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${isActive ? "border-blue-500 bg-blue-100" : "border-slate-200 bg-white/95"}`}
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
