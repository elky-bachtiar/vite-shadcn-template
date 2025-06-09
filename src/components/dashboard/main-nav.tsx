import * as React from "react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        to="/"
        className="text-xl font-bold transition-colors hover:text-primary"
      >
        Shop2Give
      </Link>
      <Link
        to="/dashboard"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        Dashboard
      </Link>
      <Link
        to="/campaigns"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Campaigns
      </Link>
      <Link
        to="/donations"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Donations
      </Link>
      <Link
        to="/profile"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Profile
      </Link>
      <div className="ml-auto flex items-center">
        <ThemeToggle />
      </div>
    </nav>
  )
}
