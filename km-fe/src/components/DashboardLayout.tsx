import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Fragment } from "react"
import { Outlet, useMatches, useNavigate } from "react-router-dom"

type Crumb = {
  label: string
  to?: string
}

type MatchWithHandle = ReturnType<typeof useMatches>[number] & {
  handle?: {
    crumb?: Crumb | ((match: ReturnType<typeof useMatches>[number]) => Crumb)
  }
}

function DashboardLayout() {
  const navigate = useNavigate()
  const matches = useMatches() as MatchWithHandle[]

  const crumbs: Crumb[] = matches
    .filter((match) => match.handle && match.handle.crumb)
    .map((match) => {
      const { crumb } = match.handle ?? {}
      if (typeof crumb === "function") {
        return crumb(match)
      }
      return crumb as Crumb
    })

  const userName = "Andi"

  return (
    <div className="min-h-screen bg-[#f9fafb] px-4 py-6 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6">
        <header className="sticky top-0 z-50 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
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

        {crumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1
                const isLink = Boolean(crumb.to && !isLast)

                return (
                  <Fragment key={`${crumb.label}-${index}`}>
                    <BreadcrumbItem className="text-sm">
                      {isLink ? (
                        <BreadcrumbLink
                          onClick={(event) => {
                            event.preventDefault()
                            navigate(crumb.to as string)
                          }}
                          href={crumb.to}
                          className="text-slate-400 transition hover:text-blue-500"
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      ) : (
                        <span className="text-slate-500">{crumb.label}</span>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        <main className="flex-1 pb-12">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
