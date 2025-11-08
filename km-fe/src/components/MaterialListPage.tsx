import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddMaterialModal } from "./AddMaterialModal"
import { Input } from "./ui/input"
import { Search } from "lucide-react"
import { createClassMaterial, listClassMaterials, type MaterialSummary } from "@/lib/api"

type MaterialListPageProps = {
  classId: string
}

export function MaterialListPage({ classId }: MaterialListPageProps) {
  const [materials, setMaterials] = useState<MaterialSummary[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 3
  const navigate = useNavigate()

  useEffect(() => {
    setIsLoading(true)
    listClassMaterials(classId)
      .then((response) => {
        setMaterials(response.items)
        setError(null)
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setIsLoading(false))
  }, [classId])

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) =>
      material.title.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [materials, searchTerm])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentMaterials = filteredMaterials.slice(indexOfFirstItem, indexOfLastItem)

  const handleCreateMaterial = async (payload: {
    title: string
    description?: string
    dateStart?: string
    dateEnd?: string
    files: File[]
  }) => {
    const { id, files } = await createClassMaterial(classId, payload)
    setMaterials((prev) => [
      {
        id,
        title: payload.title,
        description: payload.description ?? "",
        files,
      },
      ...prev,
    ])
  }

  return (
    <div className="pt-4">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="relative w-full grow md:w-auto">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search materials by name..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full rounded-lg bg-[#2563eb] px-6 py-2 text-white transition-colors hover:bg-[#1d4ed8] md:w-auto"
        >
          Add Material
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading materials…</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : currentMaterials.length > 0 ? (
          currentMaterials.map((material) => (
            <Card
              key={material.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 shadow-sm"
            >
              <div>
                <CardTitle className="text-lg font-semibold text-[#1e1e1e]">
                  {material.title}
                </CardTitle>
                <p className="text-sm text-[#6b7280]">{material.description}</p>
                {material.files?.length ? (
                  <p className="text-xs text-[#2563eb]">
                    {material.files.length} attachment{material.files.length > 1 ? "s" : ""}
                  </p>
                ) : null}
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/dashboard/material/${material.id}?classId=${classId}`)
                }
                className="rounded-lg border-[#2563eb] px-4 py-2 text-[#2563eb] transition-colors hover:bg-[#2563eb] hover:text-white"
              >
                View Material
              </Button>
            </Card>
          ))
        ) : (
          <p className="text-center text-[#6b7280]">No materials found.</p>
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
          Page {currentPage} of {Math.max(1, Math.ceil(filteredMaterials.length / itemsPerPage))}
        </span>
        <Button
          onClick={() =>
            setCurrentPage((prev) =>
              Math.min(Math.max(1, Math.ceil(filteredMaterials.length / itemsPerPage)), prev + 1),
            )
          }
          disabled={currentPage === Math.max(1, Math.ceil(filteredMaterials.length / itemsPerPage))}
          className="rounded-lg bg-[#2563eb] px-4 py-2 text-white transition-colors hover:bg-[#1d4ed8]"
        >
          Next
        </Button>
      </div>

      <AddMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await handleCreateMaterial(data)
          setIsModalOpen(false)
        }}
      />
    </div>
  )
}
