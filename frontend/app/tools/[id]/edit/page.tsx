import { use } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ToolConfigForm } from "@/components/tool-config-form"

export default function EditToolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  // Ensure DataProvider mounted so form can create on save even for 'new'
  
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <ToolConfigForm toolId={id} />
          </div>
        </main>
      </div>
    </div>
  )
}
