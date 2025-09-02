"use client"

import { useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { CustomGPTChat } from "@/components/custom-gpt-chat"
import { useState } from "react"

export default function CustomGPTChatPage() {
  const params = useParams()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(256)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={sidebarCollapsed} width={sidebarWidth} onWidthChange={setSidebarWidth} />
      <div className="flex-1 flex flex-col">
        <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-hidden">
          <CustomGPTChat gptId={String(params?.id)} />
        </main>
      </div>
    </div>
  )
}
