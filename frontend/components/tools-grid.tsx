"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Wrench } from "lucide-react"
import { ToolCard } from "./tool-card"
import { EmptyState } from "@/components/empty-state"
import { useRouter } from "next/navigation"
import { useData } from "@/lib/api-data-store"
import { ApiStatus } from "@/components/api-status"

// Data is loaded from store

export function ToolsGrid() {
  const [sortBy, setSortBy] = useState("latest")
  const { tools, loading, errors, refreshTools } = useData()
  const router = useRouter()

  console.log(tools)

  const sorted = useMemo(() => {
    if (sortBy === "name") return [...tools].sort((a, b) => a.name.localeCompare(b.name))
    if (sortBy === "agents") return [...tools].sort((a, b) => (b.agentCount || 0) - (a.agentCount || 0))
    return tools
  }, [tools, sortBy])

  return (
    <div className="p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Tools</h1>
          <p className="text-muted-foreground mt-1">
            Tools are specific actions that your agents can take. For example, updating lead info or fetching data from
            a database.
          </p>
        </div>
        <Button
          className="bg-foreground text-background hover:bg-foreground/90"
          onClick={() => {
            router.push(`/tools/new/edit`)
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Tool
        </Button>
      </div>

      {/* Controls - only show if we have tools */}
      {sorted.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort By: Latest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Sort By: Latest</SelectItem>
              <SelectItem value="name">Sort By: Name</SelectItem>
              <SelectItem value="agents">Sort By: Agent Count</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* API Status */}
      <ApiStatus 
        loading={loading.tools} 
        error={errors.tools} 
        onRetry={refreshTools}
        className="mb-4"
      />

      {/* Tools Grid or empty state */}
      {!loading.tools && !errors.tools && (
        <>
          {sorted.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
              {sorted.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Wrench}
              title="No tools yet"
              description="Tools are specific actions that your agents can take, like updating lead info or fetching data from a database. Build your first tool to get started."
              actionLabel="Create Your First Tool"
              onAction={() => router.push('/tools/new/edit')}
            >
              <div className="flex flex-col items-center gap-3 mt-4">
                <div className="text-sm text-muted-foreground">
                  Need inspiration? Check out these examples:
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                    🔍 Web Search
                  </div>
                  <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                    📧 Send Email
                  </div>
                  <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                    🗄️ Database Query
                  </div>
                  <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                    📊 Generate Report
                  </div>
                </div>
              </div>
            </EmptyState>
          )}
        </>
      )}
    </div>
  )
}
