import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

function DashboardNotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200/70 bg-white/90 p-10 text-center shadow-inner">
      <h2 className="text-2xl font-semibold text-slate-900">Page not found</h2>
      <p className="text-sm text-slate-500">
        The section you&apos;re looking for doesn&apos;t exist. Try returning to your dashboard.
      </p>
      <Button className="rounded-full bg-[#2563eb] px-6" onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
    </div>
  )
}

export default DashboardNotFoundPage
