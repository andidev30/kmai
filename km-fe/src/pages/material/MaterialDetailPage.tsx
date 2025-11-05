import { useEffect, useState } from "react"
import { useParams, useSearchParams, useNavigate } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download } from "lucide-react"
import { getMaterialDetail, type MaterialDetail } from "@/lib/api"

function MaterialDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const classId = searchParams.get("classId") ?? "class-1"

  const [material, setMaterial] = useState<MaterialDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    getMaterialDetail(id)
      .then((data) => {
        setMaterial(data)
        setError(null)
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] text-slate-900">
        <p>Loading material…</p>
      </main>
    )
  }

  if (error || !material) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] text-slate-900">
        <div className="space-y-4 text-center">
          <p className="text-sm text-red-500">{error ?? "Material not found"}</p>
          <Button onClick={() => navigate(`/dashboard/class?id=${classId}&tab=materials`)}>
            Back to class
          </Button>
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
          onClick={() => navigate(`/dashboard/class?id=${classId}&tab=materials`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to class
        </Button>
        <Card className="bg-white/95 shadow-lg shadow-blue-500/5">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold">{material.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{material.description}</p>
              </div>
              <Button
                className="flex items-center gap-2 rounded-full bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]"
                onClick={() => window.open(material.fileUrl, "_blank")}
              >
                <Download className="h-4 w-4" />
                Download file
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="font-medium text-gray-500">Material ID</div>
                  <div>{material.id}</div>
                  <div className="font-medium text-gray-500">Start Date</div>
                  <div>{material.dateStart ?? "—"}</div>
                  <div className="font-medium text-gray-500">End Date</div>
                  <div>{material.dateEnd ?? "—"}</div>
                  <div className="font-medium text-gray-500">Source</div>
                  <div>{material.source}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Content</h3>
              <p className="text-sm text-muted-foreground">{material.content}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

export default MaterialDetailPage
