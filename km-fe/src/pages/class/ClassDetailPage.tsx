import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BookOpen, ClipboardList, Users } from "lucide-react"
import { type ComponentType, type SVGProps, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"


function ClassDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const classInfo = useMemo(
    () => ({
      id: id ?? "class-1",
      name: "X12 RPL 1",
      subject: "Matematika",
    }),
    [id]
  )

  return (
    <main className="min-h-screen bg-[#f9fafb] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Header onLogout={() => navigate("/login")} onProfile={() => navigate("/profile")} />

        <section className="space-y-4">
          <Breadcrumb aria-label="Breadcrumb">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate("/dashboard")}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate("/dashboard")}>Classes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-slate-500 hover:text-slate-500">
                  {classInfo.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <Card className="bg-white/95 shadow-lg shadow-blue-500/5">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-slate-900">
                Class — {classInfo.name}
              </CardTitle>
              <p className="text-sm text-slate-500">{classInfo.name} — {classInfo.subject}</p>
            </CardHeader>
          </Card>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Access</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAccessCard
              icon={BookOpen}
              label="Materials"
              onClick={() => navigate(`/class/${classInfo.id}/materials`)}
            />
            <QuickAccessCard
              icon={Users}
              label="Students"
              onClick={() => navigate(`/class/${classInfo.id}/students`)}
            />
            <QuickAccessCard
              icon={ClipboardList}
              label="Exams"
              onClick={() => navigate(`/class/${classInfo.id}/exams`)}
            />
          </div>
        </section>
      </div>
    </main>
  )
}

type HeaderProps = {
  onLogout: () => void
  onProfile: () => void
}

function Header({ onLogout, onProfile }: HeaderProps) {
  const userName = "Andi"
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
      <h1 className="text-xl font-semibold text-slate-900">Classroom Hub</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex cursor-pointer items-center gap-3 rounded-full border border-transparent bg-white px-3 py-1.5 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{userName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">{userName}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 rounded-2xl">
          <DropdownMenuLabel className="text-xs uppercase tracking-wide text-slate-400">
            Account
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={onProfile}>Profile</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500 hover:bg-red-50" onClick={onLogout}>
            Logout
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}


type QuickAccessCardProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  label: string
  onClick: () => void
}

function QuickAccessCard({ icon: Icon, label, onClick }: QuickAccessCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white/95 p-6 text-center shadow-lg shadow-blue-500/5 transition hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onClick()
        }
      }}
    >
      <Icon className="h-8 w-8 text-blue-500" />
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </Card>
  )
}

export default ClassDetailPage
