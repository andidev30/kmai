import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Outlet, useNavigate } from "react-router-dom"

function DashboardLayout() {
  const navigate = useNavigate()

  const userName = "Andi"

  return (
    <div className="min-h-screen bg-[#f9fafb] px-4 py-6 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6">
        <header className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-5 py-3 shadow-sm">
          <button
            type="button"
            className="text-left text-xl font-semibold text-slate-900"
            onClick={() => navigate("/dashboard")}
          >
            KM.ai Classroom
          </button>
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
              <DropdownMenuItem className="text-red-500 hover:bg-red-50" onClick={() => navigate("/login")}>
                Logout
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
