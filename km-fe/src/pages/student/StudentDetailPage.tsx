import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { getStudentProfile, type StudentProfile } from "@/lib/api"

function StudentDetailPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const studentId = params.id ?? "1"
  const classId = searchParams.get("classId") ?? "class-1"

  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    getStudentProfile(studentId)
      .then((data) => {
        setProfile(data)
        setError(null)
      })
      .catch((cause: Error) => {
        setError(cause.message)
      })
      .finally(() => setIsLoading(false))
  }, [studentId])

  const handleBack = () => {
    navigate(`/dashboard/class?id=${classId}&tab=students`)
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] text-slate-900">
        <p>Loading student profile…</p>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] text-slate-900">
        <div className="space-y-4 text-center">
          <p className="text-sm text-red-500">{error ?? "Student not found"}</p>
          <Button onClick={handleBack}>Back to class</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f9fafb] text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 pt-4 sm:px-6 lg:px-0">
        <Button
          variant="ghost"
          className="w-fit rounded-full text-sm font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
          onClick={handleBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to class
        </Button>

        <Card className="bg-white/95 shadow-lg shadow-blue-500/5">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-slate-900">
              Name: {profile.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
              <p className="mt-2 text-sm text-slate-600">{profile.overview}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">What&apos;s strong</h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {profile.strengths.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">What&apos;s challenging</h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-600">
                  {profile.challenges.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Exam results</h2>
          <div className="space-y-4">
            {profile.exams.length === 0 ? (
              <Card className="border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500">
                No exams recorded for this student yet.
              </Card>
            ) : (
              profile.exams.map((exam) => (
                <details
                  key={exam.id}
                  className="group rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:border-blue-300"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-slate-900 transition group-open:text-blue-600">
                    <span>{exam.title}</span>
                    <span className="text-sm font-normal text-slate-500">{exam.summary}</span>
                  </summary>
                  <div className="mt-3 border-t border-slate-100 pt-3 text-sm text-slate-600">
                    {exam.details}
                  </div>
                </details>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default StudentDetailPage
