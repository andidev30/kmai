import { useState, type FormEvent } from "react"
import "./date-input.css"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onAddStudent: (input: {
    name: string
    email: string
    dob?: string
    gender?: string
    phone?: string
  }) => Promise<void> | void
}

export function AddStudentModal({ isOpen, onClose, onAddStudent }: AddStudentModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [dob, setDob] = useState("")
  const [gender, setGender] = useState("")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setName("")
    setEmail("")
    setDob("")
    setGender("")
    setPhone("")
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email) {
      setError("Name and Email are required.")
      return
    }

    try {
      setIsSubmitting(true)
      await onAddStudent({
        name,
        email,
        dob: dob || undefined,
        gender: gender || undefined,
        phone: phone || undefined,
      })
      resetForm()
      onClose()
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Failed to add student"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-black">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-black"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-black">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-black"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dob" className="text-black">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(event) => setDob(event.target.value)}
                className="date-input rounded-2xl border-gray-200 bg-white text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-blue-400/40"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender" className="text-black">Gender</Label>
              <Select onValueChange={setGender} value={gender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone" className="text-black">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-black"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
