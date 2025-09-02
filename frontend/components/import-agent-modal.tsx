"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AddApiKeyModal } from "@/components/add-api-key-modal"
import { useData } from "@/lib/data-store"
import { useRouter } from "next/navigation"
import { Bot, Key, Plus, Sparkles, ArrowRight, Zap } from "lucide-react"

interface ImportAgentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportAgentModal({ open, onOpenChange }: ImportAgentModalProps) {
  const [showAddApiKey, setShowAddApiKey] = useState(false)
  const [selectedKeyId, setSelectedKeyId] = useState<string | undefined>(undefined)
  const { apiKeys } = useData()
  const router = useRouter()

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[580px] p-0 gap-0">
          {/* Header with gradient background */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 to-primary/10 border-b">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-foreground mb-1">
                  Create Your AI Agent
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Transform your ideas into intelligent automation
                </p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="px-6 py-6 space-y-6">
            {/* API Key Selection Card */}
            <div className="bg-card border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Key className="w-4 h-4 text-primary" />
                <label className="text-sm font-medium text-foreground">API Key Configuration</label>
              </div>
              
              {apiKeys.length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                    <Key className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-foreground">No API Keys Found</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      You'll need to add an OpenAI API key to create your first agent
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowAddApiKey(true)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Your First API Key
                  </Button>
                </div>
              ) : (
                // API Keys Available
                <div className="space-y-3">
                  <Select value={selectedKeyId} onValueChange={setSelectedKeyId}>
                    <SelectTrigger className="h-12 bg-background">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Choose your OpenAI API key" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {apiKeys.map((k) => (
                        <SelectItem key={k.id} value={k.id} className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="font-medium">{k.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({k.provider === 'azure-openai' ? 'Azure' : 'OpenAI'})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="w-3 h-3" />
                      <span>Need a different key?</span>
                    </div>
                    <button
                      onClick={() => setShowAddApiKey(true)}
                      className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
                    >
                      Add another key
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Features Preview */}
            {apiKeys.length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  What you can do with your agent:
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Custom instructions & personality
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Connect with external tools
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Adjustable AI parameters
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Export & share capabilities
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-muted/20 border-t flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-6 gap-2"
              disabled={!selectedKeyId}
              onClick={() => {
                onOpenChange(false)
                router.push(`/agents/new/edit?apiKeyId=${selectedKeyId}`)
              }}
            >
              Create Agent
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddApiKeyModal open={showAddApiKey} onOpenChange={setShowAddApiKey} />
    </>
  )
}
