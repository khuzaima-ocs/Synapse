"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Upload, ChevronLeft, ChevronRight, Edit, Minus, Info, Bot, Zap, Settings, Palette, Brain, MessageCircle, Sliders, Upload as UploadIcon, User, FileText, Wrench, Smartphone } from "lucide-react"
import { useData } from "@/lib/api-data-store"
import { useRouter, useSearchParams } from "next/navigation"
import { ToolsSelection } from "./tools-selection"
import { WhatsAppIntegrationsManager } from "./whatsapp-integrations-manager"

interface AgentConfigFormProps {
  agentId: string
}

export function AgentConfigForm({ agentId }: AgentConfigFormProps) {
  const { agents, updateAgent, addAgent } = useData()
  const searchParams = useSearchParams()
  const router = useRouter()
  const agent = useMemo(() => agents.find((a) => a.id === agentId), [agents, agentId])
  const [temperature, setTemperature] = useState([1])
  const [maxTokens, setMaxTokens] = useState([1024])
  const [jsonResponse, setJsonResponse] = useState(false)
  const [agentUrl, setAgentUrl] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [roleInstructions, setRoleInstructions] = useState("")
  const [starterMessage, setStarterMessage] = useState("")
  const [model, setModel] = useState("gpt-4o")

  useEffect(() => {
    if (!agent) return
    setName(agent.name)
    setDescription(agent.description)
    setAgentUrl(agent.agentUrl || "")
    setRoleInstructions(agent.roleInstructions || "")
    setStarterMessage(agent.starterMessage || "")
    setTemperature([agent.temperature ?? 1])
    setMaxTokens([agent.maxTokens ?? 1024])
    setJsonResponse(agent.jsonResponse ?? false)
    setModel(agent.model || "gpt-4o")
  }, [agent])

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 mb-6 sm:mb-8 h-auto">
            <TabsTrigger value="basic" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-3">
              <User className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Basic</span>
            </TabsTrigger>
            <TabsTrigger value="behavior" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-3">
              <Brain className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Behavior</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-3">
              <Sliders className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Advanced</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-3">
              <Wrench className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Tools</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 px-3">
              <Smartphone className="w-4 h-4" />
              <span className="text-xs sm:text-sm">Widgets</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6 mt-6">
            {/* Agent Identity Card */}
            <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-background to-muted/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Agent Identity</CardTitle>
                    <p className="text-sm text-muted-foreground">Define your agent's personality and purpose</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="w-16 h-16 border-2 border-primary/20">
                      <AvatarImage src={agent?.avatar || "/placeholder-user.png"} />
                      <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                        {name ? name.charAt(0).toUpperCase() : "A"}
                      </AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      <UploadIcon className="w-3 h-3" />
                      Upload
                    </Button>
                  </div>
                  <div className="flex-1 space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                        Agent Name
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Choose a memorable name for your AI assistant</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="h-11 text-base" 
                        placeholder="e.g., Research Assistant, Content Creator..."
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
                            <p>Explain what your agent does and how it can help users</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[100px] max-h-[200px] resize-y text-base"
                        rows={4}
                        placeholder="Describe your agent's capabilities, expertise, and how it can assist users..."
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {description.length}/500 characters
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6 mt-6">
            {/* Instructions Card */}
            <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-background to-blue-50/50">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-12 translate-x-12" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Behavior & Instructions</CardTitle>
                    <p className="text-sm text-muted-foreground">Define how your agent should behave and respond</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Role Instructions */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    System Instructions
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Detailed instructions that define your agent's role, personality, and response style</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="relative">
                    <Textarea
                      value={roleInstructions}
                      onChange={(e) => setRoleInstructions(e.target.value)}
                      className="min-h-[200px] max-h-[400px] resize-y w-full text-base pl-4 pr-4 pt-4 pb-8"
                      rows={8}
                      placeholder="You are a helpful AI assistant that specializes in...\n\nYour personality is professional yet friendly. You should:\n- Always be helpful and accurate\n- Ask clarifying questions when needed\n- Provide step-by-step explanations\n- Maintain a conversational tone"
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      <span>{roleInstructions.length} characters</span>
                    </div>
                  </div>
                </div>

                {/* Starter Message */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    Starter Message
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The first message your agent will send when starting a new conversation</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="relative">
                    <Textarea
                      value={starterMessage}
                      onChange={(e) => setStarterMessage(e.target.value)}
                      className="min-h-[100px] max-h-[200px] resize-y w-full text-base pl-4 pr-4 pt-4 pb-8"
                      rows={4}
                      placeholder="Hi! I'm your AI assistant. How can I help you today?"
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <MessageCircle className="w-3 h-3" />
                      <span>{starterMessage.length} characters</span>
                    </div>
                  </div>
                </div>

                {/* Model Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    AI Model
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose the AI model that powers your agent</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="w-full h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4o">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">GPT-4o</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="gpt-4">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">GPT-4</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="gpt-3.5-turbo">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">GPT-3.5 Turbo</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 mt-6">
            {/* Advanced Settings Card */}
            <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-background to-purple-50/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full -translate-y-16 translate-x-16" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Sliders className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Advanced Configuration</CardTitle>
                    <p className="text-sm text-muted-foreground">Fine-tune your agent's behavior parameters</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Temperature */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Creativity (Temperature)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Controls randomness: 0 = focused and deterministic, 2 = creative and varied</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {temperature[0]}
                    </Badge>
                  </div>
                  <div className="px-1">
                    <Slider 
                      value={temperature} 
                      onValueChange={setTemperature} 
                      max={2} 
                      min={0} 
                      step={0.1} 
                      className="w-full" 
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>Focused</span>
                      <span>Balanced</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>

                {/* Max Tokens */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium">Response Length (Tokens)</Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Maximum length of responses. Higher values allow longer responses but use more tokens.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="text-right">
                      
                      <div className="text-xs text-muted-foreground"><span className="text-sm font-mono">{maxTokens[0].toLocaleString()}</span> / 128,000</div>
                    </div>
                  </div>
                  <div className="px-1">
                    <Slider 
                      value={maxTokens} 
                      onValueChange={setMaxTokens} 
                      max={128000} 
                      min={100} 
                      step={100} 
                      className="w-full" 
                    />
                  </div>
                </div>

                {/* JSON Response Toggle */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">JSON Response Format</Label>
                    <p className="text-xs text-muted-foreground">Force responses in structured JSON format</p>
                  </div>
                  <Switch checked={jsonResponse} onCheckedChange={setJsonResponse} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6 mt-6">
            {/* Tools Card */}
            <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-background to-blue-50/30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-12 translate-x-12" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">Tools & Integrations</CardTitle>
                      <Badge variant="secondary" className="bg-orange-100 text-orange-500 text-xs">
                        {agent?.tools?.length || 0} tools
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Select tools to extend your agent's capabilities</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ToolsSelection agentId={agentId} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6 mt-6">
            {/* WhatsApp Integrations Card */}
            <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-background to-green-50/30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -translate-y-12 translate-x-12" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">WhatsApp Integrations</CardTitle>
                    <p className="text-sm text-muted-foreground">Connect this agent to WhatsApp for customer interactions</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <WhatsAppIntegrationsManager agentId={agentId} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons - Fixed at bottom */}
        <div className="sticky bottom-0 pt-6 pb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/")} className="gap-2 order-2 sm:order-1">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="flex gap-3 order-1 sm:order-2">
              <Button variant="outline" onClick={() => router.push("/")} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (agent) {
                    updateAgent(agent.id, {
                      name,
                      description,
                      agentUrl,
                      roleInstructions,
                      starterMessage,
                      model,
                      temperature: temperature[0],
                      maxTokens: maxTokens[0],
                      jsonResponse,
                    })
                  } else {
                    const apiKeyId = searchParams?.get("apiKeyId") || undefined
                    const newId = addAgent({
                      name,
                      description,
                      agentUrl,
                      roleInstructions,
                      starterMessage,
                      model,
                      temperature: temperature[0],
                      maxTokens: maxTokens[0],
                      jsonResponse,
                      apiKeyId,
                    })
                    router.replace(`/agents/${newId}/edit`)
                  }

                  router.push(`/`)
                }}
                className="gap-2 flex-1 sm:flex-none sm:min-w-[120px]"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">{agent ? "Update Agent" : "Create Agent"}</span>
                <span className="sm:hidden">{agent ? "Update" : "Create"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
