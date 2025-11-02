import * as React from "react"

import { cn } from "@/lib/utils"

const Breadcrumb = ({ ...props }: React.ComponentProps<"nav">) => (
  <nav aria-label="breadcrumb" {...props} />
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn("flex flex-wrap items-center gap-1 text-sm text-slate-500", className)}
    {...props}
  />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("inline-flex items-center gap-1", className)} {...props} />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean
  }
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "cursor-pointer text-slate-400 underline-offset-4 transition hover:text-blue-500 hover:underline",
      className
    )}
    {...props}
  />
))
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} role="presentation" className={cn("inline-flex items-center", className)} {...props}>
    <span className="text-slate-300">›</span>
  </li>
))
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator }
