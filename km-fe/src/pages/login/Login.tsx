import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md space-y-10 rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-[0_40px_120px_-30px_rgba(59,130,246,0.45)] backdrop-blur">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-200">
            <span className="text-lg font-semibold">KM</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-400">Sign in to continue creating unforgettable lessons.</p>
          </div>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@school.edu"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border border-white/20 bg-slate-900/60" />
              Remember me
            </label>
            <button type="button" className="text-blue-200 hover:text-blue-100">
              Forgot password?
            </button>
          </div>

          <Button className="w-full cursor-pointer rounded-full bg-blue-500 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.01] hover:bg-blue-400">
            Sign in
          </Button>
        </form>

        <div className="space-y-3 text-center text-sm text-slate-400">
          <p>
            Don&apos;t have an account?{" "}
            <button type="button" className="font-medium text-blue-200 hover:text-blue-100">
              Talk to sales
            </button>
          </p>
          <Link to="/" className="inline-flex items-center justify-center text-xs font-medium text-slate-500 hover:text-slate-300">
            ← Back to landing page
          </Link>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
