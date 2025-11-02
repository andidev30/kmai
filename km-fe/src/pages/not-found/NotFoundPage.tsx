import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f9fafb] px-4 text-slate-900">
      <div className="flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl border border-slate-200/60 bg-white/95 p-10 text-center shadow-lg shadow-blue-500/10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-400">404</p>
        <h1 className="text-3xl font-semibold text-slate-900">Page not found</h1>
        <p className="text-sm text-slate-500">
          The page you are looking for might be removed or temporarily unavailable.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="h-11 rounded-full cursor-pointer border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-800"
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
          <Button
            className="h-11 rounded-full cursor-pointer bg-[#2563eb] text-white transition hover:bg-[#1d4ed8]"
            onClick={() => navigate("/")}
          >
            Back to home
          </Button>
        </div>
      </div>
    </main>
  )
}

export default NotFoundPage
