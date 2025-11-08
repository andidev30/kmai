import { useState, type FormEvent } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "./ui/checkbox"

interface AddExamModalProps {
  isOpen: boolean
  onClose: () => void
  materials: MaterialOption[]
  onSubmit: (payload: {
    title: string
    materialIds: string[]
    mcq: number
    essay: number
    uniquePerStudent: boolean
  }) => Promise<void> | void
}

interface MaterialOption {
  value: string
  label: string
}

export function AddExamModal({ isOpen, onClose, materials, onSubmit }: AddExamModalProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [mcqQuestions, setMcqQuestions] = useState<number | string>("")
  const [essayQuestions, setEssayQuestions] = useState<number | string>("")
  const [examName, setExamName] = useState("")
  const [error, setError] = useState("")
  const [generateUniqueQuestions, setGenerateUniqueQuestions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleMaterialSelect = (materialId: string, checked: boolean) => {
    if (checked) {
      setSelectedMaterials((prev) => [...prev, materialId])
    } else {
      setSelectedMaterials((prev) => prev.filter((id) => id !== materialId))
    }
  }

  const resetForm = () => {
    setSelectedMaterials([])
    setMcqQuestions("")
    setEssayQuestions("")
    setExamName("")
    setGenerateUniqueQuestions(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (selectedMaterials.length === 0) {
      setError("Please select at least one material.")
      return
    }

    if (!mcqQuestions && !essayQuestions) {
      setError("Please enter at least one question count.")
      return
    }

    if (!examName.trim()) {
      setError("Please enter an exam name.")
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        title: examName.trim(),
        materialIds: selectedMaterials,
        mcq: Number(mcqQuestions || 0),
        essay: Number(essayQuestions || 0),
        uniquePerStudent: generateUniqueQuestions,
      })
      resetForm()
      onClose()
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Failed to generate exam"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Exam</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="exam-name" className="text-black">Exam Name</Label>
            <Input
              id="exam-name"
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="e.g. Midterm Assessment"
              className="text-black"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="materials" className="text-black">Select List Materials for Exam</Label>
            <div className="h-48 overflow-y-auto rounded-md border p-4">
              {materials.length === 0 ? (
                <p className="text-sm text-slate-500">No materials available. Add material first.</p>
              ) : (
                materials.map((material) => (
                  <div key={material.value} className="mb-2 flex items-center space-x-2">
                    <Checkbox
                      id={`material-${material.value}`}
                      checked={selectedMaterials.includes(material.value)}
                      onCheckedChange={(checked: boolean) =>
                        handleMaterialSelect(material.value, checked)
                      }
                    />
                    <Label htmlFor={`material-${material.value}`} className="text-black">
                      {material.label}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mcq-questions" className="text-black">Number of Questions (Multiple Choice)</Label>
            <Input
              id="mcq-questions"
              type="number"
              min="1"
              value={mcqQuestions}
              onChange={(e) => setMcqQuestions(e.target.value)}
              className="text-black"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="essay-questions" className="text-black">Number of Questions (Essay)</Label>
            <Input
              id="essay-questions"
              type="number"
              min="0"
              value={essayQuestions}
              onChange={(e) => setEssayQuestions(e.target.value)}
              className="text-black"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="generate-unique"
              checked={generateUniqueQuestions}
              onCheckedChange={(checked: boolean) => setGenerateUniqueQuestions(checked)}
            />
            <Label htmlFor="generate-unique" className="text-black">Generate unique questions for every student</Label>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg px-6 py-2 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Generating…" : "Generate Exam"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
