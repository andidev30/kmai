import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@school.edu"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label className="text-xs text-slate-400" htmlFor="remember">
                Remember me
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              className="h-auto px-0 text-blue-200 hover:text-blue-100"
            >
              Forgot password?
            </Button>
          </div>

          <Button className="w-full cursor-pointer rounded-full bg-blue-500 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.01] hover:bg-blue-400">
            Sign in
          </Button>
        </form>

        <div className="space-y-3 text-center text-sm text-slate-400">
          <p>
            Don&apos;t have an account?{" "}
            <Button
              asChild
              variant="link"
              className="h-auto px-0 text-blue-200 hover:text-blue-100"
            >
              <Link to="/register">Register</Link>
            </Button>
          </p>
          <Button
            asChild
            variant="link"
            className="h-auto justify-center px-0 text-xs text-slate-500 hover:text-slate-300"
          >
            <Link to="/">← Back to landing page</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
