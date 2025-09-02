"use client"

import { cn } from "@/lib/utils"
import { Users, Wrench, MessageSquare, Blocks, Send, Puzzle, Code, BarChart3, Eye, GraduationCap } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  {
    title: "1. BUILD",
    items: [
      { name: "Agents", icon: Users, href: "/" },
      { name: "Tools", icon: Wrench, href: "/tools" },
    ],
  },
  {
    title: "2. DEPLOY",
    items: [
      { name: "Custom GPTs", icon: MessageSquare, href: "/custom-gpts" },
    ],
  },
]

interface SidebarProps {
  isCollapsed?: boolean
  width?: number
  onWidthChange?: (width: number) => void
}

export function Sidebar({ isCollapsed = false, width = 256, onWidthChange }: SidebarProps) {
  const pathname = usePathname()

  if (isCollapsed) {
    return null
  }

  return (
    <div
      className="bg-sidebar border-r border-sidebar-border relative group"
      style={{ width: `${width}px`, minWidth: "200px", maxWidth: "400px" }}
    >
      <div
        className="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-border cursor-col-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => {
          const startX = e.clientX
          const startWidth = width

          const handleMouseMove = (e: MouseEvent) => {
            const newWidth = Math.max(200, Math.min(400, startWidth + (e.clientX - startX)))
            onWidthChange?.(newWidth)
          }

          const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove)
            document.removeEventListener("mouseup", handleMouseUp)
          }

          document.addEventListener("mousemove", handleMouseMove)
          document.addEventListener("mouseup", handleMouseUp)
        }}
      />

      <div className="p-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
            <div
              className="w-6 h-6 bg-yellow-500 rounded-sm"
              style={{
                clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
              }}
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href === "/" && pathname.startsWith("/agents")) ||
                    (item.href === "/tools" && pathname.startsWith("/tools")) ||
                    (item.href === "/custom-gpts" && pathname.startsWith("/custom-gpts"))

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                          isActive
                            ? "bg-yellow-50 text-yellow-700 font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
