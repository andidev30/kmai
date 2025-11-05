import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft, Download, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  getExamDetail,
  getExamDownloadUrl,
  getStudentSubmissionUrl,
  uploadExamAnswer,
  type ExamDetail as ExamDetailResponse,
} from "@/lib/api"

type StudentRow = ExamDetailResponse["students"][number]

function ExamDetailPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const examId = params.id ?? "1"
  const classId = searchParams.get("classId") ?? "class-1"

  const [exam, setExam] = useState<ExamDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const loadExam = () => {
    setIsLoading(true)
    getExamDetail(examId)
      .then((data) => {
        setExam(data)
        setError(null)
      })
      .catch((cause: Error) => {
        setError(cause.message)
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadExam()
  }, [examId])

  const handleBack = () => {
    navigate(`/dashboard/class?id=${classId}&tab=exams`)
  }

  const handleDownloadExam = async () => {
    try {
      const { url } = await getExamDownloadUrl(examId)
      window.open(url, "_blank")
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Unable to download exam questions")
    }
  }

  const handleViewSubmission = async (student: StudentRow) => {
    try {
      const { url } = await getStudentSubmissionUrl(examId, student.id)
      window.open(url, "_blank")
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Unable to open submission")
    }
  }

  const handleDownloadSubmission = async (student: StudentRow) => {
    try {
      const { url } = await getStudentSubmissionUrl(examId, student.id)
      window.open(url, "_blank")
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Unable to download submission")
    }
  }

  const handleUploadAnswer = async (student: StudentRow, file: File) => {
    try {
      await uploadExamAnswer(examId, student.id, file)
      setMessage(`Uploaded answer for ${student.name}`)
      loadExam()
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Upload failed")
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] text-slate-900">
        <p>Loading exam detail…</p>
      </main>
    )
  }

  if (error || !exam) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] text-slate-900">
        <div className="space-y-4 text-center">
          <p className="text-sm text-red-500">{error ?? "Exam not found"}</p>
          <Button onClick={handleBack}>Back to class</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f9fafb] text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="space-y-4">
          <Button
            variant="ghost"
            className="mt-4 w-fit rounded-full text-sm font-semibold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to class
          </Button>
          <Card className="bg-white/95 shadow-lg shadow-blue-500/5">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                {exam.title}
              </CardTitle>
              <p className="text-sm text-slate-500">{exam.description}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">Date:</span> {exam.date}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Duration:</span>{" "}
                  {exam.duration} minutes
                </p>
              </div>
              <Button
                className="flex items-center gap-2 rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
                onClick={handleDownloadExam}
              >
                <Download className="h-4 w-4" />
                Download all exam questions
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Students</h2>
            <p className="text-sm text-slate-500">
              Review each student&apos;s work, open their responses, or download exam files.
            </p>
          </div>

          <div className="grid gap-4">
            {exam.students.length === 0 ? (
              <Card className="border border-dashed border-slate-300 bg-white/80 p-6 text-center text-sm text-slate-500">
                No submissions recorded yet.
              </Card>
            ) : (
              exam.students.map((student) => (
                <Card
                  key={student.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900">{student.name}</p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Status:{" "}
                      <span
                        className={
                          student.status === "graded"
                            ? "text-green-600"
                            : student.status === "grading"
                              ? "text-amber-500"
                              : "text-slate-500"
                        }
                      >
                        {student.status === "graded"
                          ? "Graded"
                          : student.status === "grading"
                            ? "Grading"
                            : "Not submitted"}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 rounded-full border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                      onClick={() => {
                        const input = document.createElement("input")
                        input.type = "file"
                        input.accept = ".pdf,.jpg,.jpeg,.png"
                        input.onchange = async (event) => {
                          const target = event.target as HTMLInputElement
                          const file = target.files?.[0]
                          if (file) {
                            await handleUploadAnswer(student, file)
                          }
                        }
                        input.click()
                      }}
                    >
                      Upload photo answer
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 rounded-full border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                      onClick={() => handleViewSubmission(student)}
                      disabled={student.status === "not-submitted"}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 rounded-full border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                      onClick={() => handleDownloadSubmission(student)}
                      disabled={student.status === "not-submitted"}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {message && (
          <p className="text-sm font-medium text-blue-600" role="status">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}

export default ExamDetailPage
