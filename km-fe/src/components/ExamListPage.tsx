import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "./ui/input"
import { Search } from "lucide-react"
import { AddExamModal } from "./AddExamModal"
import {
  createExam,
  listClassExams,
  listClassMaterials,
  type ExamSummary,
  type MaterialSummary,
} from "@/lib/api"
import { Badge } from "@/components/ui/badge"

type ExamListPageProps = {
  classId: string
}

export function ExamListPage({ classId }: ExamListPageProps) {
  const [exams, setExams] = useState<ExamSummary[]>([])
  const [materials, setMaterials] = useState<MaterialSummary[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [materialsError, setMaterialsError] = useState<string | null>(null)
  const navigate = useNavigate()
  const itemsPerPage = 3

  useEffect(() => {
    setIsLoading(true)
    Promise.all([listClassExams(classId), listClassMaterials(classId)])
      .then(([examResponse, materialResponse]) => {
        setExams(examResponse.items)
        setMaterials(materialResponse.items)
        setError(null)
        setMaterialsError(null)
      })
      .catch((cause: Error) => {
        setError(cause.message)
      })
      .finally(() => setIsLoading(false))
  }, [classId])

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => exam.title.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [exams, searchTerm])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentExams = filteredExams.slice(indexOfFirstItem, indexOfLastItem)

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

  const handleCreateExam = async (payload: {
    title: string
    materialIds: string[]
    mcq: number
    essay: number
    uniquePerStudent: boolean
  }) => {
    setMaterialsError(null)
    const { id, status, uniquePerStudent } = await createExam(classId, payload)
    const optimisticExam: ExamSummary = {
      id,
      title: payload.title,
      date: new Date().toISOString(),
      duration: 90,
      status: status ?? "pending",
      uniquePerStudent,
    }
    setExams((prev) => {
      const updated = [optimisticExam, ...prev]
      return updated.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
    })
    setCurrentPage(1)
  }

  const materialOptions = materials.map((material) => ({
    value: material.id,
    label: `${material.title}`,
  }))

  return (
    <div className="pt-4">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="relative w-full grow md:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search exams by name..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <Button
          onClick={() => setIsAddExamModalOpen(true)}
          className="w-full rounded-lg bg-[#2563eb] px-6 py-2 text-white transition-colors hover:bg-[#1d4ed8] md:w-auto"
        >
          Add Exam
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading exams…</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : currentExams.length > 0 ? (
          currentExams.map((exam) => (
            <Card
              key={exam.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 shadow-sm"
            >
              <div>
                <CardTitle className="text-lg font-semibold text-[#1e1e1e]">
                  {exam.title}
                </CardTitle>
                <p className="text-sm text-[#6b7280]">
                  Date: {formatDate(exam.date)} | Duration: {exam.duration} mins
                </p>
                <div className="mt-2">
                  <Badge
                    variant={exam.status === "done" ? "default" : "secondary"}
                    className={
                      exam.status === "done"
                        ? "bg-green-600 text-white hover:bg-green-500"
                        : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                    }
                  >
                    {exam.status === "done" ? "Ready to download" : "Generating"}
                  </Badge>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-lg border-[#2563eb] px-4 py-2 text-[#2563eb] transition-colors hover:bg-[#2563eb] hover:text-white"
                onClick={() => navigate(`/dashboard/exam/${exam.id}?classId=${classId}`)}
              >
                View Details
              </Button>
            </Card>
          ))
        ) : (
          <p className="text-center text-[#6b7280]">No exams found.</p>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-white transition-colors hover:bg-[#1d4ed8]"
        >
          Previous
        </Button>
        <span className="text-[#1e1e1e]">
          Page {currentPage} of {Math.max(1, Math.ceil(filteredExams.length / itemsPerPage))}
        </span>
        <Button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(Math.max(1, Math.ceil(filteredExams.length / itemsPerPage)), prev + 1),
            )
          }
          disabled={currentPage === Math.max(1, Math.ceil(filteredExams.length / itemsPerPage))}
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-white transition-colors hover:bg-[#1d4ed8]"
        >
          Next
        </Button>
      </div>

      <AddExamModal
        isOpen={isAddExamModalOpen}
        onClose={() => setIsAddExamModalOpen(false)}
        materials={materialOptions}
        onSubmit={async (data) => {
          try {
            await handleCreateExam(data)
            setIsAddExamModalOpen(false)
          } catch (cause) {
            setMaterialsError(
              cause instanceof Error ? cause.message : "Failed to generate exam",
            )
          }
        }}
      />
      {materialsError && <p className="mt-4 text-sm text-red-500">{materialsError}</p>}
    </div>
  )
}
