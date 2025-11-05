import { useMemo } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

type StudentProfile = {
  id: string
  name: string
  overview: string
  strengths: string[]
  challenges: string[]
  exams: Array<{
    id: string
    title: string
    summary: string
    details: string
  }>
}

const SAMPLE_STUDENTS: Record<string, StudentProfile> = {
  "1": {
    id: "1",
    name: "Alice Smith",
    overview:
      "Alice is an enthusiastic learner who participates actively in class discussions and consistently meets assignment deadlines.",
    strengths: [
      "Demonstrates a solid grasp of foundational concepts",
      "High engagement during collaborative work",
      "Delivers clear and concise written answers",
    ],
    challenges: [
      "Occasionally rushes through multiple-choice questions",
      "Benefits from additional practice on advanced problem-solving exercises",
    ],
    exams: [
      {
        id: "exam-1",
        title: "Midterm Exam",
        summary: "Overall score: 92 — excels in algebraic reasoning and structured answers.",
        details:
          "Alice showed excellent performance in algebraic manipulation, word problems, and data interpretation. Minor deductions were made on time management during the last section.",
      },
      {
        id: "exam-2",
        title: "Quiz 2",
        summary: "Overall score: 88 — strong analytical approach with minor accuracy slips.",
        details:
          "Most answers were correct with well-explained steps. Two geometry questions had calculation slips, which can be improved with additional checking time.",
      },
    ],
  },
  "2": {
    id: "2",
    name: "Bob Johnson",
    overview:
      "Bob is a steady performer who prefers working through problems methodically. He thrives when provided with structured guidance.",
    strengths: [
      "Careful and methodical approach to problem solving",
      "Consistent improvement across practice sessions",
      "Strong collaboration skills in group assignments",
    ],
    challenges: [
      "Tends to second-guess correct answers",
      "Needs reminders to summarize reasoning in open-ended questions",
    ],
    exams: [
      {
        id: "exam-1",
        title: "Midterm Exam",
        summary: "Overall score: 85 — reliable performance with opportunities in applied questions.",
        details:
          "Bob performed well on conceptual questions and demonstrated solid understanding. Applied scenarios required additional clarification which can be addressed with targeted practice.",
      },
    ],
  },
  "3": {
    id: "3",
    name: "Charlie Brown",
    overview:
      "Charlie brings creativity to class projects and often proposes unique solutions. Continued guidance helps translate ideas into structured answers.",
    strengths: [
      "Creative thinker with original perspectives",
      "Strong visual reasoning skills in geometry-related topics",
    ],
    challenges: [
      "Needs support to organize lengthy responses",
      "Can benefit from reviewing foundational formulas regularly",
    ],
    exams: [
      {
        id: "exam-1",
        title: "Midterm Exam",
        summary: "Overall score: 78 — creative reasoning with room to tighten calculations.",
        details:
          "Charlie explained concepts clearly but missed several calculation steps, leading to partial credit. Focus on accuracy will significantly boost results.",
      },
    ],
  },
}

function StudentDetailPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const studentId = params.id ?? "1"
  const classId = searchParams.get("classId") ?? "class-1"

  const profile = useMemo(() => {
    return SAMPLE_STUDENTS[studentId] ?? SAMPLE_STUDENTS["1"]
  }, [studentId])

  const handleBack = () => {
    navigate(`/dashboard/class?id=${classId}&tab=students`)
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
            {profile.exams.map((exam) => (
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
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default StudentDetailPage
