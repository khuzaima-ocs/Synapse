"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useData } from "@/lib/api-data-store"
import { useRouter } from "next/navigation"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"

interface Agent {
  id: string
  name: string
  description: string
  avatar: string
  tools: string[]
}

const toolColors = {
  database: "text-green-600",
  api: "text-blue-600",
  chat: "text-purple-600",
  support: "text-orange-600",
  analytics: "text-indigo-600",
}

export function AgentCard({ agent }: { agent: Agent }) {
  const { deleteAgent } = useData()
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    await deleteAgent(agent.id)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/agents/${agent.id}/edit`)
  }

  return (
    <>
      <Link href={`/agents/${agent.id}/edit`} className="block h-full">
        <Card className="relative group hover:shadow-md transition-shadow cursor-pointer w-full h-full">
          <CardContent className="p-6 h-full flex flex-col">
            {/* Three dots menu */}
            <div className="absolute top-4 right-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.preventDefault()}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleEdit}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Agent avatar */}
            <div className="flex justify-center mb-4 flex-shrink-0">
              <Avatar className="w-20 h-20">
                <AvatarImage src={agent.avatar || "/placeholder.svg"} alt={agent.name} />
                <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>

            {/* Agent info - Fixed height section */}
            <div className="text-center flex-1 flex flex-col justify-between">
              <h3 className="font-semibold text-lg mb-3 break-words px-2 leading-tight line-clamp-2">{agent.name}</h3>
              <div className="flex-1 flex items-start justify-center">
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 px-2 text-left max-w-full">
                  {agent.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Agent"
        description="Are you sure you want to delete this agent? This action cannot be undone and will remove all associated data."
        itemName={agent.name}
        itemType="agent"
      />
    </>
  )
}
