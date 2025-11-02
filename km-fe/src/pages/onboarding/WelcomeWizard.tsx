import { type MutableRefObject, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const PRIMARY_COLOR = "#2563eb"

const STEPS = [
  { id: 1, label: "Organization" },
  { id: 2, label: "Class" },
]

function WelcomeWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [organizationName, setOrganizationName] = useState("")
  const [className, setClassName] = useState("")
  const [classSubject, setClassSubject] = useState("")

  const stepOneInputRef = useRef<HTMLInputElement | null>(null)
  const stepTwoInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (step === 1) {
      stepOneInputRef.current?.focus()
    } else {
      stepTwoInputRef.current?.focus()
    }
  }, [step])

  const userName = useMemo(() => "Andi", [])

  const handleSkip = () => {
    navigate("/dashboard")
  }

  const handleNext = () => {
    if (step === STEPS.length) {
      navigate("/dashboard")
      return
    }
    setStep((prev) => Math.min(prev + 1, STEPS.length))
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-4 text-slate-900">
      <div className="w-full max-w-xl animate-[fade-in_0.5s_ease-out] space-y-8">
        <div className="text-center">
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Welcome, {userName}! Try Your First Class
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Set up your workspace in two quick steps. You can skip and do it later.
          </p>
        </div>

        <StepIndicator currentStep={step} />

        <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-lg shadow-blue-500/5 backdrop-blur">
          {step === 1 ? (
            <StepOrganization
              organizationName={organizationName}
              onOrganizationNameChange={setOrganizationName}
              inputRef={stepOneInputRef}
            />
          ) : (
            <StepClass
              className={className}
              classSubject={classSubject}
              onClassNameChange={setClassName}
              onClassSubjectChange={setClassSubject}
              inputRef={stepTwoInputRef}
            />
          )}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            className="h-11 cursor-pointer rounded-full border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            onClick={handleSkip}
          >
            Skip
          </Button>
          <Button
            className="h-11 cursor-pointer rounded-full bg-[#2563eb] text-white transition hover:bg-[#1d4ed8]"
            onClick={handleNext}
          >
            {step === STEPS.length ? "Finish" : "Next"}
          </Button>
        </div>
      </div>
    </main>
  )
}

type StepIndicatorProps = {
  currentStep: number
}

function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id
        const isCompleted = currentStep > step.id
        return (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition"
              style={{
                borderColor: isActive || isCompleted ? PRIMARY_COLOR : "#CBD5F5",
                backgroundColor: isCompleted ? PRIMARY_COLOR : "white",
                color: isCompleted ? "white" : isActive ? PRIMARY_COLOR : "#64748b",
              }}
            >
              {step.id}
            </div>
            {index !== STEPS.length - 1 && (
              <div className="h-0.5 w-10 rounded-full bg-linear-to-r from-blue-200 via-blue-300 to-blue-200" />
            )}
          </div>
        )
      })}
    </div>
  )
}

type StepOrganizationProps = {
  organizationName: string
  onOrganizationNameChange: (value: string) => void
  inputRef: MutableRefObject<HTMLInputElement | null>
}

function StepOrganization({ organizationName, onOrganizationNameChange, inputRef }: StepOrganizationProps) {
  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="mb-4 space-y-2 text-center">
        <CardTitle className="text-xl font-semibold text-slate-900">
          Create your organization
        </CardTitle>
        <p className="text-sm text-slate-500">
          We&apos;ll group your classes under an organization so your team can collaborate easily.
        </p>
      </CardHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-name" className=" text-slate-900">Organization name</Label>
          <Input
            id="org-name"
            value={organizationName}
            onChange={(event) => onOrganizationNameChange(event.target.value)}
            placeholder="e.g. SMKN Bantarkalong"
            className="h-11 rounded-xl border-slate-200 bg-white text-slate-900"
            ref={inputRef}
          />
        </div>
      </div>
    </Card>
  )
}

type StepClassProps = {
  className: string
  classSubject: string
  onClassNameChange: (value: string) => void
  onClassSubjectChange: (value: string) => void
  inputRef: MutableRefObject<HTMLInputElement | null>
}

function StepClass({ className, classSubject, onClassNameChange, onClassSubjectChange, inputRef }: StepClassProps) {
  return (
    <Card className="border-none bg-transparent shadow-none">
      <CardHeader className="mb-4 space-y-2 text-center">
        <CardTitle className="text-xl font-semibold text-slate-900">Create your class</CardTitle>
        <p className="text-sm text-slate-500">
          Set up your first class so students can join and you can start planning lessons.
        </p>
      </CardHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="class-name" className="text-slate-900">Class name</Label>
          <Input
            id="class-name"
            value={className}
            onChange={(event) => onClassNameChange(event.target.value)}
            placeholder="e.g. X12 RPL 1"
            className="h-11 rounded-xl border-slate-200 bg-white text-slate-900"
            ref={inputRef}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="class-subject" className="text-slate-900">Subject</Label>
          <Input
            id="class-subject"
            value={classSubject}
            onChange={(event) => onClassSubjectChange(event.target.value)}
            placeholder="e.g. Matematika"
            className="h-11 rounded-xl border-slate-200 bg-white text-slate-900"
          />
        </div>
      </div>
    </Card>
  )
}

export default WelcomeWizard
