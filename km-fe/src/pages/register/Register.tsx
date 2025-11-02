import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-lg space-y-10 rounded-3xl border border-white/10 bg-slate-950/60 p-8 shadow-[0_40px_120px_-30px_rgba(59,130,246,0.45)] backdrop-blur">
        <div className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-200">
            <span className="text-lg font-semibold">KM</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
            <p className="text-sm text-slate-400">Start your free workspace in under a minute.</p>
          </div>
        </div>

        <form className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Taylor Morgan"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="registerEmail">
              Work email
            </label>
            <input
              id="registerEmail"
              type="email"
              autoComplete="email"
              placeholder="you@school.edu"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="registerPassword">
                Password
              </label>
              <input
                id="registerPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="confirmPassword">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
              />
            </div>
          </div>

          <Button className="w-full cursor-pointer rounded-full bg-blue-500 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.01] hover:bg-blue-400">
            Create account
          </Button>
        </form>

        <div className="space-y-3 text-center text-sm text-slate-400">
          <p>
            By continuing you agree to our {""}
            <button type="button" className="font-medium text-blue-200 hover:text-blue-100">
              Terms
            </button>{" "}
            and {""}
            <button type="button" className="font-medium text-blue-200 hover:text-blue-100">
              Privacy Policy
            </button>
            .
          </p>
          <p>
            Already have an account?{" "}
            <Link className="font-medium text-blue-200 hover:text-blue-100" to="/login">
              Sign in
            </Link>
          </p>
          <Link to="/" className="inline-flex items-center justify-center text-xs font-medium text-slate-500 hover:text-slate-300">
            ← Back to landing page
          </Link>
        </div>
      </div>
    </main>
  )
}

export default RegisterPage
