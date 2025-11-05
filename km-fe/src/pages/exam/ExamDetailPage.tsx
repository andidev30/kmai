import { useMemo } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft, Download, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ExamDetail = {
  id: string
  title: string
  description: string
  date: string
  duration: number
}

type ExamSubmission = {
  studentId: string
  studentName: string
  status: "not-submitted" | "grading" | "graded"
}

const SAMPLE_EXAMS: ExamDetail[] = [
  {
    id: "1",
    title: "Midterm Exam",
    description: "Covers chapters 1-6 with a focus on core problem-solving skills.",
    date: "2025-11-15",
    duration: 90,
  },
  {
    id: "2",
    title: "Final Exam",
    description: "Comprehensive assessment over the entire semester.",
    date: "2025-12-15",
    duration: 120,
  },
  {
    id: "3",
    title: "Quiz 1",
    description: "Short quiz on introductory concepts to gauge early understanding.",
    date: "2025-10-20",
    duration: 30,
  },
  {
    id: "4",
    title: "Quiz 2",
    description: "Follow-up quiz to reinforce content from weeks 5-7.",
    date: "2025-11-05",
    duration: 30,
  },
]

const SAMPLE_SUBMISSIONS: Record<string, ExamSubmission[]> = {
  "1": [
    {
      studentId: "S001",
      studentName: "Alice Smith",
      status: "graded",
    },
    {
      studentId: "S002",
      studentName: "Bob Johnson",
      status: "grading",
    },
    {
      studentId: "S003",
      studentName: "Charlie Brown",
      status: "not-submitted",
    },
  ],
  "2": [
    {
      studentId: "S001",
      studentName: "Alice Smith",
      status: "graded",
    },
    {
      studentId: "S002",
      studentName: "Bob Johnson",
      status: "grading",
    },
  ],
  "3": [
    {
      studentId: "S001",
      studentName: "Alice Smith",
      status: "graded",
    },
    {
      studentId: "S002",
      studentName: "Bob Johnson",
      status: "graded",
    },
    {
      studentId: "S003",
      studentName: "Charlie Brown",
      status: "grading",
    },
  ],
  "4": [
    {
      studentId: "S001",
      studentName: "Alice Smith",
      status: "graded",
    },
    {
      studentId: "S003",
      studentName: "Charlie Brown",
      status: "grading",
    },
    {
      studentId: "S004",
      studentName: "Diana Prince",
      status: "not-submitted",
    },
  ],
}

function ExamDetailPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const examId = params.id ?? "1"
  const classId = searchParams.get("classId") ?? "class-1"

  const exam = useMemo(() => {
    return SAMPLE_EXAMS.find((item) => item.id === examId) ?? SAMPLE_EXAMS[0]
  }, [examId])

  const submissions = useMemo(() => {
    return SAMPLE_SUBMISSIONS[examId] ?? []
  }, [examId])

  const handleBack = () => {
    navigate(`/dashboard/class?id=${classId}&tab=exams`)
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
                  <span className="font-semibold text-slate-800">Duration:</span> {exam.duration} minutes
                </p>
              </div>
              <Button
                className="flex items-center gap-2 rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
                onClick={() => {
                  // placeholder action
                  alert("Downloading all exam questions...")
                }}
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
            {submissions.length === 0 ? (
              <Card className="border border-dashed border-slate-300 bg-white/80 p-6 text-center text-sm text-slate-500">
                No submissions recorded yet.
              </Card>
            ) : (
              submissions.map((submission) => (
                <Card
                  key={submission.studentId}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {submission.studentName}
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Status:{" "}
                      <span
                        className={
                          submission.status === "graded"
                            ? "text-green-600"
                            : submission.status === "grading"
                              ? "text-amber-500"
                              : "text-slate-500"
                        }
                      >
                        {submission.status === "graded"
                          ? "Graded"
                          : submission.status === "grading"
                            ? "Grading"
                            : "Not submitted"}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 rounded-full border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                    >
                      Upload photo answer
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 rounded-full border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 rounded-full border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
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
      </div>
    </main>
  )
}

export default ExamDetailPage
