"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, Info, Settings, Palette, Plus, X } from "lucide-react"
import { useData } from "@/lib/api-data-store"
import { useRouter } from "next/navigation"

interface CustomGPTConfigFormProps {
  gptId: string
}

export function CustomGPTConfigForm({ gptId }: CustomGPTConfigFormProps) {
  const { customGPTs, updateCustomGPT, addCustomGPT, agents } = useData()
  const router = useRouter()
  const gpt = useMemo(() => customGPTs.find((g) => g.id === gptId), [customGPTs, gptId])
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    agentId: "",
    themeColor: "#2065D1",
    inputPlaceholder: "What would you like to know?",
    chatHistory: true,
    conversationStarters: [] as string[],
  })

  const colorOptions = [
    "#2065D1", // Blue
    "#7C3AED", // Purple  
    "#059669", // Emerald
    "#DC2626", // Red
    "#EA580C", // Orange
    "#CA8A04", // Yellow
    "#0891B2", // Cyan
    "#BE185D", // Pink
  ]

  useEffect(() => {
    if (!gpt && gptId !== "new") return
    if (gpt) {
      setFormData({
        id: gpt.id,
        name: gpt.name,
        description: gpt.description,
        agentId: gpt.agentId || "",
        themeColor: gpt.themeColor || "#2065D1",
        inputPlaceholder: gpt.inputPlaceholder || "What would you like to know?",
        chatHistory: gpt.chatHistory ?? true,
        conversationStarters: gpt.conversationStarters || [],
      })
    }
  }, [gpt, gptId])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (gpt && gptId !== "new") {
      updateCustomGPT(gpt.id, formData)
    } else {
      addCustomGPT(formData as any)
    }
    router.push("/custom-gpts")
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-auto">
            <TabsTrigger value="general" className="flex items-center gap-2 py-2 px-3">
              <Settings className="w-4 h-4" />
              <span className="text-sm">Configure</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2 py-2 px-3">
              <Palette className="w-4 h-4" />
              <span className="text-sm">Appearance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-6">
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
                    <p className="text-sm text-muted-foreground">Define your Custom GPT's identity and purpose</p>
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
                    onChange={(e) => handleInputChange("name", e.target.value)} 
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
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="min-h-[100px] max-h-[200px] resize-y text-base"
                    rows={4}
                    placeholder="Describe your Custom GPT's capabilities and purpose..."
                  />
                </div>

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
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={agents.find((a) => a.id === formData.agentId)?.avatar || "/placeholder.svg"} />
                      <AvatarFallback>AG</AvatarFallback>
                    </Avatar>
                    <Select value={formData.agentId} onValueChange={(value) => handleInputChange("agentId", value)}>
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

                {/* Input Placeholder */}
                <div className="space-y-2">
                  <Label htmlFor="inputPlaceholder" className="text-sm font-medium">
                    Input Placeholder
                  </Label>
                  <Input
                    id="inputPlaceholder"
                    value={formData.inputPlaceholder}
                    onChange={(e) => handleInputChange("inputPlaceholder", e.target.value)}
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
                    onCheckedChange={(checked) => handleInputChange("chatHistory", checked)} 
                  />
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
                        handleInputChange("conversationStarters", [...formData.conversationStarters, newStarter])
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
                            handleInputChange("conversationStarters", newStarters)
                          }}
                          className="flex-1" 
                          placeholder="Enter conversation starter..."
                        />
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            const newStarters = formData.conversationStarters.filter((_, i) => i !== index)
                            handleInputChange("conversationStarters", newStarters)
                          }}
                          className="h-9 w-9 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 mt-6">
            {/* Appearance Card */}
            <Card className="relative overflow-hidden border-0 shadow-md bg-gradient-to-br from-background to-purple-50/30">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -translate-y-12 translate-x-12" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Appearance & Theme</CardTitle>
                    <p className="text-sm text-muted-foreground">Customize the visual appearance of your Custom GPT</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Color */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    Theme Color
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select the primary color for your Custom GPT interface</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className="space-y-4">
                    {/* Current Color Display */}
                    <div className="flex items-center gap-3 p-4 border rounded-lg">
                      <div
                        className="w-12 h-12 rounded-xl border-2 border-white shadow-sm"
                        style={{ backgroundColor: formData.themeColor }}
                      />
                      <div>
                        <p className="text-sm font-medium">Current Color</p>
                        <p className="text-xs text-muted-foreground font-mono">{formData.themeColor}</p>
                      </div>
                    </div>
                    
                    {/* Color Options */}
                    <div className="grid grid-cols-4 gap-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          className={`w-12 h-12 rounded-xl border-2 shadow-sm hover:scale-110 transition-all duration-200 ${
                            formData.themeColor === color 
                              ? "border-foreground ring-2 ring-offset-2 ring-foreground/20" 
                              : "border-white hover:border-muted-foreground"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleInputChange("themeColor", color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="sticky bottom-0 pt-6 pb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/custom-gpts")} className="gap-2 order-2 sm:order-1">
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Custom GPTs</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div className="flex gap-3 order-1 sm:order-2">
              <Button variant="outline" onClick={() => router.push("/custom-gpts")} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="gap-2 flex-1 sm:flex-none sm:min-w-[120px]"
                disabled={!formData.name || !formData.agentId}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">{gpt && gptId !== "new" ? "Update Custom GPT" : "Create Custom GPT"}</span>
                <span className="sm:hidden">{gpt && gptId !== "new" ? "Update" : "Create"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
