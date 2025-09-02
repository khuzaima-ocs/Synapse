"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AgentsGrid } from "@/components/agents-grid"

export default function AgentsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(256)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={sidebarCollapsed} width={sidebarWidth} onWidthChange={setSidebarWidth} />
      <div className="flex-1 flex flex-col">
        <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-foreground mb-2">Agents</h1>
              <p className="text-muted-foreground">
                Agents are central to the platform and can be created for different roles and tasks.
              </p>
            </div>
            <AgentsGrid />
          </div>
        </main>
      </div>
    </div>
  )
}
