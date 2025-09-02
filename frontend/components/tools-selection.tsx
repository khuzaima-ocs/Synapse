"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { useData } from "@/lib/api-data-store"
import { 
  Wrench, 
  Code,
  Database,
  Globe
} from "lucide-react"
import type { Tool } from "@/lib/types"

interface ToolsSelectionProps {
  agentId: string
}

export function ToolsSelection({ agentId }: ToolsSelectionProps) {
  const { tools, agents, assignToolToAgent, unassignToolFromAgent } = useData()
  const [selectedTools, setSelectedTools] = useState<string[]>([])

  const agent = useMemo(() => agents.find(a => a.id === agentId), [agents, agentId])

  useEffect(() => {
    if (agent) {
      setSelectedTools(agent.tools || [])
    }
  }, [agent])

  const handleToolToggle = (toolId: string, checked: boolean) => {
    if (checked) {
      setSelectedTools(prev => [...prev, toolId])
      assignToolToAgent(toolId, agentId)
    } else {
      setSelectedTools(prev => prev.filter(id => id !== toolId))
      unassignToolFromAgent(toolId, agentId)
    }
  }

  const getToolIcon = (tool: Tool) => {
    if (tool.type === "function") return <Code className="w-4 h-4" />
    if (tool.type === "api") return <Globe className="w-4 h-4" />
    return <Database className="w-4 h-4" />
  }

  return (
    <div className="space-y-3 bg-gradient-to-br from-orange-50/20 to-amber-50/20 dark:from-orange-900/10 dark:to-amber-900/10 rounded-lg border border-orange-100/30 dark:border-orange-800/30">
      {/* Tools List */}
      {tools.length > 0 ? (
        <div className="space-y-2">
          {tools.map((tool) => {
            const isSelected = selectedTools.includes(tool.id)
            return (
              <Card 
                key={tool.id} 
                className={`transition-all hover:shadow-md cursor-pointer py-4 ${
                  isSelected 
                    ? 'ring-2 ring-orange-500 bg-orange-50/50' 
                    : 'bg-gray-50/70 hover:bg-gray-100/60 dark:bg-gray-900/20 dark:hover:bg-gray-800/40'
                }`}
                onClick={() => handleToolToggle(tool.id, !isSelected)}
              >
                <CardContent className="py-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-800/60 dark:to-amber-800/60 flex items-center justify-center shadow-sm">
                      {getToolIcon(tool)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{tool.name}</h3>
                      {tool.functionNames && tool.functionNames.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tool.functionNames.map((functionName, index) => (
                            <div
                              key={index}
                              className="px-2 py-1 text-xs rounded border border-orange-200 bg-orange-50/70 text-orange-800 dark:border-orange-700 dark:bg-orange-900/40 dark:text-orange-200 backdrop-blur-sm bg-opacity-60 shadow-sm transition"
                              style={{
                                boxShadow: '0 2px 8px 0 rgba(251, 146, 60, 0.15)',
                                marginBottom: '2px',
                              }}
                            >
                              {functionName}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Wrench}
          title="No tools available"
          description="No tools are currently available."
          actionLabel=""
          onAction={() => {}}
        />
      )}
    </div>
  )
}
