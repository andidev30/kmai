import "./Landing.css"

import { Button } from "@/components/ui/button"
import { ArrowRight, Brain, CheckCircle, PlayCircle, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

const quickWins = [
  {
    title: "Lesson blueprints in minutes",
    description: "Generate standards-ready plans that stay aligned with district goals.",
    icon: Brain,
  },
  {
    title: "Feedback-ready exams",
    description: "Auto-generate rubrics and scoring guides so grading stays consistent.",
    icon: CheckCircle,
  },
]

function LandingPage() {
  return (
    <main className="landing relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="landing__bg pointer-events-none absolute inset-0">
        <div className="gradient-orb gradient-orb--xl float-slow absolute -top-32 left-1/2 -translate-x-1/2 opacity-70"></div>
        <div className="gradient-orb float-slow float-delayed absolute top-12 right-20 h-64 w-64 opacity-60"></div>
        <div className="pulse-soft absolute inset-x-0 bottom-0 h-56 bg-[radial-gradient(ellipse_at_bottom,rgba(59,130,246,0.35),transparent_75%)]"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="landing__content relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-10 lg:px-8">
        <header className="landing__header flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">KM.ai</p>
              <p className="text-xs text-slate-400">Teaching Intelligence Hub</p>
            </div>
          </div>
          <Button
            asChild
            className="hidden cursor-pointer rounded-full border border-blue-500/40 bg-blue-500/10 px-5 text-blue-100 transition hover:bg-blue-500/20 hover:text-white md:inline-flex"
            variant="outline"
          >
            <Link to="/login">Sign in</Link>
          </Button>
        </header>

        <section className="landing__hero flex flex-1 flex-col gap-12 items-center justify-center py-10 px-4 lg:flex-row lg:items-center lg:gap-20">
          <div className="space-y-8 w-full max-w-3xl text-center lg:text-left mx-auto">
            <span className="badge-shimmer inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-100 backdrop-blur">
              <Sparkles className="h-4 w-4 text-blue-300" />
              Built for high-impact classrooms
            </span>
            <h1 className="animate-fade-in-up text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              Plan smarter, teach bolder, and keep every student engaged.
            </h1>
            <p className="animate-fade-in-up max-w-xl text-lg text-slate-300">
              KM.ai pairs AI insights with your expertise so every lesson feels tailored, intentional, and ready for tomorrow.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:scale-[1.02] hover:bg-blue-400"
              >
                <Link className="flex items-center gap-2" to="/register">
                  <span>Try it</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/15 hover:text-white"
                variant="outline"
              >
                <PlayCircle className="h-4 w-4" />
                Watch demo
              </Button>
            </div>
          </div>
          <div className="glass-panel relative flex w-full max-w-sm flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 p-8 text-left">
            <div className="absolute -top-20 right-0 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl"></div>
            <div className="space-y-4">
              {quickWins.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="glass-panel rounded-3xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                    </div>
                    <p className="mt-3 text-xs text-slate-300">{item.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

        </section>
      </div>
    </main>
  )
}

export default LandingPage
