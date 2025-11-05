import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"
import { AddStudentModal } from "./AddStudentModal"
import { addClassStudent, listClassStudents, type StudentSummary } from "@/lib/api"

type StudentListPageProps = {
  classId: string
}

export function StudentListPage({ classId }: StudentListPageProps) {
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 3
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoading(true)
    listClassStudents(classId)
      .then((response) => {
        setStudents(response.items)
        setError(null)
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setIsLoading(false))
  }, [classId])

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [students, searchTerm])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem)

  const handleAddStudent = async (input: {
    name: string
    email: string
    dob?: string
    gender?: string
    phone?: string
  }) => {
    const newStudentId = `S${String(students.length + 1).padStart(3, "0")}`
    const { id } = await addClassStudent(classId, {
      name: input.name,
      email: input.email,
      studentId: newStudentId,
      gender: input.gender,
      phone: input.phone,
    })

    setStudents((prev) => [
      ...prev,
      {
        id: id ?? `temp-${Date.now()}`,
        name: input.name,
        email: input.email,
        studentId: newStudentId,
        gender: input.gender,
        phone: input.phone,
      },
    ])
  }

  const onViewProgress = (studentId: string) => {
    navigate(`/dashboard/student/${studentId}?classId=${classId}`)
  }

  return (
    <div className="pt-4">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="relative w-full grow md:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search students by name..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <Button
          onClick={() => setIsAddStudentModalOpen(true)}
          className="w-full rounded-lg bg-[#2563eb] px-6 py-2 text-white transition-colors hover:bg-[#1d4ed8] md:w-auto"
        >
          Add Student
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading students…</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : currentStudents.length > 0 ? (
          currentStudents.map((student) => (
            <Card
              key={student.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 shadow-sm"
            >
              <div>
                <CardTitle className="text-lg font-semibold text-[#1e1e1e]">
                  {student.name}
                </CardTitle>
                <p className="text-sm text-[#6b7280]">
                  ID: {student.studentId} | Email: {student.email}
                  {student.phone ? ` | Phone: ${student.phone}` : ""}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => onViewProgress(student.id)}
                className="rounded-lg border-[#2563eb] px-4 py-2 text-[#2563eb] transition-colors hover:bg-[#2563eb] hover:text-white"
              >
                View Progress
              </Button>
            </Card>
          ))
        ) : (
          <p className="text-center text-[#6b7280]">No students found.</p>
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
          Page {currentPage} of {Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage))}
        </span>
        <Button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage)), prev + 1),
            )
          }
          disabled={currentPage === Math.max(1, Math.ceil(filteredStudents.length / itemsPerPage))}
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-white transition-colors hover:bg-[#1d4ed8]"
        >
          Next
        </Button>
      </div>

      <AddStudentModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        onAddStudent={handleAddStudent}
      />
    </div>
  )
}
