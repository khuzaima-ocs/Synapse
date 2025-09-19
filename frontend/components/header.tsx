"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronLeft, Moon, Sun, Menu, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"

interface HeaderProps {
  sidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export function Header({ sidebarCollapsed = false, onToggleSidebar }: HeaderProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeToggle = () => {
    // Use theme first, then resolvedTheme, with fallback to 'light'
    const currentTheme = theme || resolvedTheme || "dark"
    const newTheme = currentTheme === "light" ? "dark" : "light"
    console.log("[v0] Theme toggle clicked. Current:", currentTheme, "New:", newTheme)
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <header className="border-b border-border bg-background">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
              {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleThemeToggle}>
              <Sun className="w-4 h-4" />
            </Button>

            <Avatar className="w-8 h-8">
              <AvatarImage src="/User.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
    )
  }

  const currentTheme = theme || resolvedTheme || "light"

  return (
    <header className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
            {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleThemeToggle}>
            {currentTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="w-8 h-8 cursor-pointer">
                <AvatarImage src={user?.display_image || "/User.png"} />
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user?.name ? `Hi, ${user.name}!` : "What's up!"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-red-400 focus:text-white hover:text-white hover:bg-red-600/80 focus:bg-red-600/80 cursor-pointer flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2 text-current" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
