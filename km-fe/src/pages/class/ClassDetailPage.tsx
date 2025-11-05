import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StudentListPage } from "@/components/StudentListPage"
import { MaterialListPage } from "@/components/MaterialListPage"
import { ExamListPage } from "@/components/ExamListPage"
import { ArrowLeft, BookOpen, ClipboardList, Users } from "lucide-react"
import { type ComponentType, type FormEvent, type SVGProps, useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { createClass, getClassDetail } from "@/lib/api"

function ClassDetailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const classIdParam = searchParams.get("id")
  const isCreatingNewClass = !classIdParam || classIdParam === "new"
  const [classInfo, setClassInfo] = useState<{ id: string; name: string; subject: string; description?: string }>()
  const [isLoading, setIsLoading] = useState(!isCreatingNewClass)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isCreatingNewClass) return

    setIsLoading(true)
    getClassDetail(classIdParam!)
      .then((response) => {
        setClassInfo(response)
        setError(null)
      })
      .catch((cause: Error) => {
        setError(cause.message)
      })
      .finally(() => setIsLoading(false))
  }, [classIdParam, isCreatingNewClass])

  const activeTab = useMemo(() => searchParams.get("tab") ?? "students", [searchParams])

  if (isCreatingNewClass) {
    return (
      <CreateClassView
        onCancel={() => navigate("/dashboard")}
        onCreate={(name, subject) =>
          createClass({ name, subject })
            .then((created) => navigate(`/dashboard/class?id=${created.id}&tab=students`))
            .catch((cause: Error) => {
              console.error("[CreateClassView] failed", cause)
              throw cause
            })
        }
      />
    )
  }

  if (isLoading || !classInfo) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] text-slate-900">
        {error ? <p className="text-sm text-red-500">{error}</p> : <p>Loading class…</p>}
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f9fafb] text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="space-y-4">
          <Button
            variant="ghost"
            className="w-fit rounded-full text-sm font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to classes
          </Button>
          <Card className="bg-white/95 shadow-lg shadow-blue-500/5">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                Class — {classInfo.name}
              </CardTitle>
              <p className="text-sm text-slate-500">
                {classInfo.name} — {classInfo.subject}
              </p>
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
            <StudentListPage classId={classInfo.id} />
          </section>
        )}

        {activeTab === "materials" && (
          <section className="space-y-4">
            <MaterialListPage classId={classInfo.id} />
          </section>
        )}

        {activeTab === "exams" && (
          <section className="space-y-4">
            <ExamListPage classId={classInfo.id} />
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

type CreateClassViewProps = {
  onCancel: () => void
  onCreate: (className: string, subject: string) => void
}

function CreateClassView({ onCancel, onCreate }: CreateClassViewProps) {
  const [className, setClassName] = useState("")
  const [subject, setSubject] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = className.trim().length > 0 && subject.trim().length > 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isValid || isSubmitting) return
    setIsSubmitting(true)
    setError(null)
    Promise.resolve(onCreate(className.trim(), subject.trim()))
      .catch((cause) => {
        const message = cause instanceof Error ? cause.message : "Failed to create class"
        setError(message)
      })
      .finally(() => setIsSubmitting(false))
  }

  return (
    <main className="min-h-screen bg-[#f9fafb] text-slate-900">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 sm:px-6 lg:px-0">
        <Button
          variant="ghost"
          className="mt-4 w-fit rounded-full text-sm font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
          onClick={onCancel}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to classes
        </Button>

        <Card className="w-full bg-white/95 shadow-lg shadow-blue-500/5">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Create a class
            </CardTitle>
            <p className="text-sm text-slate-500">
              Add a name and subject so your students know where they belong. You can edit this later.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="new-class-name" className="text-slate-600">
                  Class name
                </Label>
                <Input
                  id="new-class-name"
                  placeholder="e.g. X12 RPL 3"
                  value={className}
                  onChange={(event) => setClassName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-class-subject" className="text-slate-600">
                  Subject
                </Label>
                <Input
                  id="new-class-subject"
                  placeholder="e.g. Matematika"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-full bg-blue-500 text-white hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!isValid || isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create class"}
                </Button>
              </div>
            </form>
            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default ClassDetailPage
