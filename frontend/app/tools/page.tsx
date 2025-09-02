"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ToolsGrid } from "@/components/tools-grid"

export default function ToolsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(256)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={sidebarCollapsed} width={sidebarWidth} onWidthChange={setSidebarWidth} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-auto">
          <ToolsGrid />
        </main>
      </div>
    </div>
  )
}
