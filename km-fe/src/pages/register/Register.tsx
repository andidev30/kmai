import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type FormEvent, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const isFormValid = useMemo(() => {
    return (
      fullName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.trim().length >= 0 &&
      confirmPassword.trim().length >= 0 &&
      password === confirmPassword
    )
  }, [fullName, email, password, confirmPassword])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isFormValid) return
    navigate("/welcome")
  }

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

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Taylor Morgan"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registerEmail">Work email</Label>
            <Input
              id="registerEmail"
              type="email"
              autoComplete="email"
              placeholder="you@school.edu"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="registerPassword">Password</Label>
              <Input
                id="registerPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full bg-blue-500 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.01] hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            disabled={!isFormValid}
          >
            Create account
          </Button>
        </form>

        <div className="space-y-3 text-center text-sm text-slate-400">
          <p>
            By continuing you agree to our {""}
            <Button
              type="button"
              variant="link"
              className="h-auto px-0 text-blue-200 hover:text-blue-100"
            >
              Terms
            </Button>{" "}
            and {""}
            <Button
              type="button"
              variant="link"
              className="h-auto px-0 text-blue-200 hover:text-blue-100"
            >
              Privacy Policy
            </Button>
            .
          </p>
          <p>
            Already have an account?{" "}
            <Button
              asChild
              variant="link"
              className="h-auto px-0 font-medium text-blue-200 hover:text-blue-100"
            >
              <Link to="/login">Sign in</Link>
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

export default RegisterPage
