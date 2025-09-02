"use client"

import type React from "react"
import { useState } from "react"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Users, LinkIcon, Cloud } from "lucide-react"
import { useData } from "@/lib/api-data-store"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"

interface Tool {
  id: string
  name: string
  description: string
  icon: string
  agentCount?: number
  type: "api" | "collection" | "function"
  functionNames?: string[]
}

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  const { deleteTool } = useData()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    await deleteTool(tool.id)
  }

  return (
    <>
      <Link href={`/tools/${tool.id}/edit`} className="block h-full">
        <Card className="h-full w-full hover:shadow-md transition-shadow cursor-pointer group">
          <CardContent className="h-full flex flex-col">
            {/* Header with menu */}
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-foreground flex items-center justify-center text-background font-semibold">
                {tool.icon === "API" ? <div className="text-xs">API</div> : <LinkIcon className="w-5 h-5" />}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={handleMenuClick}>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={handleDelete}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          
            <div className="flex-1 flex flex-col justify-between min-h-0 overflow-hidden">
              <h3 className="font-medium text-foreground line-clamp-2 break-words mb-3">{tool.name}</h3>
              <div className="flex-1 flex items-start mb-3">
                <p className="text-sm text-muted-foreground line-clamp-3 break-words leading-relaxed">
                  {tool.description}
                </p>
              </div>
              
              {/* Function Names */}
              {tool.functionNames && tool.functionNames.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {tool.functionNames.map((functionName, index) => (
                      <div
                        key={index}
                        className={`
                          px-2 py-1 text-xs rounded border
                          border-yellow-200 bg-yellow-50/70 text-yellow-800
                          dark:border-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-200
                          backdrop-blur-sm bg-opacity-60
                          shadow-sm
                          transition
                        `}
                        style={{
                          boxShadow: '0 2px 8px 0 rgba(255, 221, 77, 0.08)',
                          marginBottom: '2px',
                        }}
                      >
                        {functionName}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Tool"
        description="Are you sure you want to delete this tool? This action cannot be undone and will remove all associated data."
        itemName={tool.name}
        itemType="tool"
      />
    </>
  )
}
