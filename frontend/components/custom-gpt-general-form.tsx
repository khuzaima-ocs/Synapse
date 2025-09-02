"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, Settings, Plus, X } from "lucide-react"
import { useData } from "@/lib/api-data-store"

interface CustomGPTGeneralFormProps {
  formData: {
    name: string
    description: string
    agentId: string
    inputPlaceholder: string
    chatHistory: boolean
    conversationStarters: string[]
  }
  onChange: (field: string, value: any) => void
}

export function CustomGPTGeneralForm({ formData, onChange }: CustomGPTGeneralFormProps) {
  const { agents } = useData()

  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Basic Information Card */}
          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-background to-muted/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Basic Information</CardTitle>
                  <p className="text-sm text-muted-foreground">Define your Custom GPT's identity</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  Application Name
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Choose a memorable name for your Custom GPT</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={(e) => onChange("name", e.target.value)} 
                  className="h-11 text-base" 
                  placeholder="e.g., Customer Support Bot, Research Assistant..."
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-2">
                  Description
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Explain what your Custom GPT does and how it can help users</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  className="min-h-[100px] max-h-[200px] resize-y text-base"
                  rows={4}
                  placeholder="Describe your Custom GPT's capabilities and purpose..."
                />
              </div>

              {/* Input Placeholder */}
              <div className="space-y-2">
                <Label htmlFor="inputPlaceholder" className="text-sm font-medium">
                  Input Placeholder
                </Label>
                <Input
                  id="inputPlaceholder"
                  value={formData.inputPlaceholder}
                  onChange={(e) => onChange("inputPlaceholder", e.target.value)}
                  className="h-11 text-base"
                  placeholder="What would you like to know?"
                />
              </div>

              {/* Chat History Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">Chat History</Label>
                  <p className="text-xs text-muted-foreground">Allow users to save and view chat history</p>
                </div>
                <Switch 
                  checked={formData.chatHistory} 
                  onCheckedChange={(checked) => onChange("chatHistory", checked)} 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Agent Selection Card */}
          <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-background to-blue-50/30">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-12 translate-x-12" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Agent Configuration</CardTitle>
                  <p className="text-sm text-muted-foreground">Select the AI agent to power this GPT</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Agent Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Agent
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select the AI agent that will power this Custom GPT</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="flex items-center gap-3">
                  <Select value={formData.agentId} onValueChange={(value) => onChange("agentId", value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                              <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {agent.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Conversation Starters */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Conversation Starters</Label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const newStarter = `How can you help me?`
                      onChange("conversationStarters", [...formData.conversationStarters, newStarter])
                    }}
                    className="gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.conversationStarters.map((starter, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input 
                        value={starter} 
                        onChange={(e) => {
                          const newStarters = [...formData.conversationStarters]
                          newStarters[index] = e.target.value
                          onChange("conversationStarters", newStarters)
                        }}
                        className="flex-1" 
                        placeholder="Enter conversation starter..."
                      />
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          const newStarters = formData.conversationStarters.filter((_, i) => i !== index)
                          onChange("conversationStarters", newStarters)
                        }}
                        className="h-9 w-9 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {formData.conversationStarters.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No conversation starters added yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}
