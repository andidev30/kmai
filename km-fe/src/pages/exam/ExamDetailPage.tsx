import { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft, Download, Eye } from "lucide-react"
import ReactMarkdown from "react-markdown"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  downloadExamArchive,
  downloadStudentExamPdf,
  getExamDetail,
  getStudentExamContent,
  uploadExamAnswer,
  type ExamDetail as ExamDetailResponse,
} from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const [isFetchingContent, setIsFetchingContent] = useState(false)
  const [contentModal, setContentModal] = useState<{
    isOpen: boolean
    student?: StudentRow
    content?: string
  }>({ isOpen: false })

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
    if (!exam || exam.status !== "done") {
      setMessage("Exam is still being generated. Please try again later.")
      return
    }
    try {
      const response = await downloadExamArchive(examId)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = downloadUrl
      anchor.download = `${exam.title || "exam"}-questions.zip`
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1_000)
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Unable to download exam questions")
    }
  }

  const handleViewSharedExam = () => {
    if (!exam || exam.status !== "done") {
      setMessage("Exam content is not ready yet.")
      return
    }
    if (!exam.sharedQuestion?.content) {
      setMessage("Exam content is unavailable.")
      return
    }
    setContentModal({
      isOpen: true,
      student: undefined,
      content: exam.sharedQuestion.content,
    })
  }

  const handleViewExamContent = async (student: StudentRow) => {
    if (!exam?.uniquePerStudent) {
      setMessage("This exam uses the same questions for every student.")
      return
    }
    if (exam.status !== "done") {
      setMessage("Exam content is not ready yet.")
      return
    }
    if (!student.questionId) {
      setMessage("Questions for this student are not available yet.")
      return
    }
    try {
      setIsFetchingContent(true)
      const { content } = await getStudentExamContent(examId, student.id)
      setContentModal({
        isOpen: true,
        student,
        content,
      })
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Unable to load exam content")
    } finally {
      setIsFetchingContent(false)
    }
  }

  const handleDownloadExamContent = async (student: StudentRow) => {
    if (!exam?.uniquePerStudent) {
      setMessage("This exam uses the same questions for every student.")
      return
    }
    if (exam.status !== "done") {
      setMessage("Exam content is not ready yet.")
      return
    }
    if (!student.questionId) {
      setMessage("Questions for this student are not available yet.")
      return
    }
    try {
      const response = await downloadStudentExamPdf(examId, student.id)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = downloadUrl
      anchor.download = `${student.name}-exam.pdf`
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 1_000)
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Unable to download exam content")
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

  const formatDate = (isoString: string) => {
    const parsed = new Date(isoString)
    if (Number.isNaN(parsed.getTime())) {
      return isoString
    }
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
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
              <Badge
                variant={exam.status === "done" ? "default" : "secondary"}
                className={
                  exam.status === "done"
                    ? "mt-2 inline-flex bg-green-600 text-white hover:bg-green-500"
                    : "mt-2 inline-flex bg-amber-100 text-amber-800 hover:bg-amber-100"
                }
              >
                {exam.status === "done" ? "Ready" : "Generating"}
              </Badge>
              <p className="text-sm text-slate-500">{exam.description}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-800">Date:</span>{" "}
                  {formatDate(exam.date)}
                </p>
                <p>
                  <span className="font-semibold text-slate-800">Duration:</span>{" "}
                  {exam.duration} minutes
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="flex items-center gap-2 rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
                  onClick={handleDownloadExam}
                  disabled={exam.status !== "done"}
                >
                  <Download className="h-4 w-4" />
                  {exam.status === "done" ? "Download all exam questions" : "Exam in progress"}
                </Button>
                {!exam.uniquePerStudent && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 rounded-full border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                    onClick={handleViewSharedExam}
                    disabled={exam.status !== "done" || !exam.sharedQuestion}
                  >
                    <Eye className="h-4 w-4" />
                    View questions
                  </Button>
                )}
              </div>
            </CardContent>
            {exam.status !== "done" && (
              <p className="px-6 pb-4 text-sm text-amber-600">
                Exam questions are being prepared by the AI. You’ll get a download link once the
                status turns ready.
              </p>
            )}
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
                      disabled={student.status === "graded"}
                    >
                      Upload photo answer
                    </Button>
                    {exam.uniquePerStudent && (
                      <>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 rounded-full border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                          onClick={() => handleViewExamContent(student)}
                          disabled={exam.status !== "done" || isFetchingContent}
                        >
                          <Eye className="h-4 w-4" />
                          View questions
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 rounded-full border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                          onClick={() => handleDownloadExamContent(student)}
                          disabled={exam.status !== "done"}
                        >
                          <Download className="h-4 w-4" />
                          Download PDF
                        </Button>
                      </>
                    )}
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
      <Dialog
        open={contentModal.isOpen}
        onOpenChange={(open) => setContentModal((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {contentModal.student
                ? `Exam for ${contentModal.student.name}`
                : "Exam questions"}
            </DialogTitle>
          </DialogHeader>
          <div className="prose max-w-none text-sm text-slate-700">
            {contentModal.content ? (
              <ReactMarkdown>{contentModal.content}</ReactMarkdown>
            ) : (
              "No exam content available."
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default ExamDetailPage
