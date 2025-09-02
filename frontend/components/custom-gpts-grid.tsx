"use client"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, MoreVertical, Eye, Code, Edit, Trash2, Share2, Bot } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/empty-state"
import { useData } from "@/lib/api-data-store"
import { ApiStatus } from "@/components/api-status"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"

// Data is loaded from store

export function CustomGPTsGrid() {
  const router = useRouter()
  const { customGPTs, deleteCustomGPT, agents, loading, errors, refreshCustomGPTs } = useData()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [gptToDelete, setGptToDelete] = useState<{ id: string; name: string } | null>(null)
  
  const rows = useMemo(() => {
    return customGPTs.map((g) => {
      const agent = agents.find((a) => a.id === g.agentId)
      return {
        ...g,
        agentName: agent?.name || "",
        agentAvatar: agent?.avatar || "/placeholder-user.png",
      }
    })
  }, [customGPTs, agents])

  const handleNewCustomGPT = () => {
    router.push(`/custom-gpts/new/configure`)
  }

  const handleEditGPT = (gpt: { id: string }) => {
    router.push(`/custom-gpts/${gpt.id}/configure`)
  }

  const handleDeleteGPT = (gpt: { id: string; name: string }) => {
    setGptToDelete(gpt)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (gptToDelete) {
      await deleteCustomGPT(gptToDelete.id)
      setGptToDelete(null)
    }
  }

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Custom GPTs</h1>
          <p className="text-muted-foreground mt-1">
            White labeled standalone web applications with chat history and multiple agents.
          </p>
        </div>
        <Button onClick={handleNewCustomGPT} className="bg-foreground text-background hover:bg-foreground/90">
          <Plus className="w-4 h-4 mr-2" />
          New Custom GPT
        </Button>
      </div>

      {/* API Status */}
      <ApiStatus 
        loading={loading.customGPTs} 
        error={errors.customGPTs} 
        onRetry={refreshCustomGPTs}
        className="mb-4"
      />

      {/* Custom GPTs table or empty state */}
      {!loading.customGPTs && !errors.customGPTs && (
        <>
          {rows.length > 0 ? (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Chats</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((gpt) => (
                <TableRow key={gpt.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center text-lg">
                        {gpt.icon || "🧩"}
                      </div>
                      <div>
                        <div 
                          className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors"
                          onClick={() => router.push(`/custom-gpts/${gpt.id}/chat`)}
                        >
                          {gpt.name}
                        </div>
                        <div className="text-sm text-muted-foreground">{gpt.description.slice(0, 100)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{(gpt.chats || 0).toLocaleString()}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={gpt.agentAvatar || "/placeholder.svg"} />
                        <AvatarFallback>{(gpt.agentName || "A")[0]}</AvatarFallback>
                      </Avatar>
                                              <span 
                          className="text-sm text-blue-600 hover:underline cursor-pointer"
                          onClick={() => router.push(`/custom-gpts/${gpt.id}/chat`)}
                        >
                          {gpt.agentName}
                        </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{gpt.createdDate || ""}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/custom-gpts/${gpt.id}/chat`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Code className="w-4 h-4 mr-2" />
                            Embed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditGPT(gpt)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteGPT(gpt)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              {rows.length === 1 ? "1 Custom GPT" : `1-${Math.min(5, rows.length)} of ${rows.length}`}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <select className="text-sm border rounded px-2 py-1">
                <option>5</option>
                <option>10</option>
                <option>20</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Bot}
          title="No Custom GPTs yet"
          description="Create white-labeled standalone web applications with chat history and multiple agents. Build your first Custom GPT to provide tailored AI experiences."
          actionLabel="Create Your First Custom GPT"
          onAction={handleNewCustomGPT}
        >
          <div className="flex flex-col items-center gap-4 mt-4">
            <div className="text-sm text-muted-foreground">
              Perfect for:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-lg">🎯</span>
                <span className="text-sm">Customer Support Bot</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-lg">📚</span>
                <span className="text-sm">Knowledge Base Assistant</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-lg">💼</span>
                <span className="text-sm">Sales Assistant</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-lg">🔍</span>
                <span className="text-sm">Research Helper</span>
              </div>
            </div>
          </div>
        </EmptyState>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setGptToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Custom GPT"
        description="Are you sure you want to delete this Custom GPT? This action cannot be undone and will remove all associated data including chat history."
        itemName={gptToDelete?.name || ""}
        itemType="custom GPT"
      />
    </div>
  )
}
