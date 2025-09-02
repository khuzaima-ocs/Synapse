"use client"

import { Button } from "@/components/ui/button"
import { AgentCard } from "@/components/agent-card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Upload, Users } from "lucide-react"
import { ImportAgentModal } from "@/components/import-agent-modal"
import { EmptyState } from "@/components/empty-state"
import { useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { useData } from "@/lib/data-store"

// Data is loaded from the global store

export function AgentsGrid() {
  const [showImportModal, setShowImportModal] = useState(false)
  const [sortBy, setSortBy] = useState("latest")
  const [apiKeyFilter, setApiKeyFilter] = useState("all")
  const { agents, apiKeys } = useData()
  const router = useRouter()

  const filteredAgents = useMemo(() => {
    let items = agents
    if (apiKeyFilter !== "all") {
      const selectedApiKey = apiKeys.find((k) => k.provider === apiKeyFilter)
      items = items.filter((a) => a.apiKeyId && a.apiKeyId === selectedApiKey?.id)
    }
    if (sortBy === "name") {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name))
    }
    return items
  }, [agents, apiKeys, apiKeyFilter, sortBy])

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Action buttons and filters */}
        <div className="flex items-center justify-between mb-6">
          <div></div>

          <div className="flex items-center gap-4">
            <Select value={apiKeyFilter} onValueChange={setApiKeyFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by API key" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Filter by API key: All</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
              </SelectContent>
            </Select>

            <Button
              className="gap-2 bg-primary text-primary-foreground"
              onClick={() => setShowImportModal(true)}
            >
              <Plus className="w-4 h-4" />
              New Agent
            </Button>
          </div>
        </div>

        {/* Agents grid or empty state */}
        {filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No agents yet"
            description="Agents are central to the platform and can be created for different roles and tasks. Get started by creating your first agent."
            actionLabel="Create Your First Agent"
            onAction={() => setShowImportModal(true)}
          >
            <div className="flex flex-col items-center gap-3 mt-4">
              <div className="text-sm text-muted-foreground">
                or learn more about agents
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs">
                  View Documentation
                </Button>
                <Button variant="outline" size="sm" className="text-xs">
                  Watch Tutorial
                </Button>
              </div>
            </div>
          </EmptyState>
        )}
      </div>

      {/* ImportAgentModal component */}
      <ImportAgentModal open={showImportModal} onOpenChange={setShowImportModal} />
    </>
  )
}
