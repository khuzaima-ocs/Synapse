"use client"

import { useState, useEffect, use, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { CustomGPTGeneralForm } from "@/components/custom-gpt-general-form"
import { CustomGPTAppearanceForm } from "@/components/custom-gpt-appearance-form"
import { CustomGPTPreview } from "@/components/custom-gpt-preview"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Palette, Eye, Share, AlertCircle, Home } from "lucide-react"
import { useData } from "@/lib/api-data-store"
import { useRouter } from "next/navigation"

export default function ConfigureCustomGPTPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [activeTab, setActiveTab] = useState("general")
  const { customGPTs, updateCustomGPT } = useData()
  const router = useRouter()
  const gpt = useMemo(() => customGPTs.find((g) => g.id === id), [customGPTs, id])
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    agentId: "",
    themeColor: "#2065D1",
    inputPlaceholder: "What would you like to know?",
    chatHistory: true,
    conversationStarters: [] as string[],
    customBackground: false,
    chatPersistence: "Never Forget",
  })

  useEffect(() => {
    if (!gpt) return
    setFormData({
      id: gpt.id,
      name: gpt.name,
      description: gpt.description,
      agentId: gpt.agentId || "",
      themeColor: gpt.themeColor || "#2065D1",
      inputPlaceholder: gpt.inputPlaceholder || "What would you like to know?",
      chatHistory: gpt.chatHistory ?? true,
      conversationStarters: gpt.conversationStarters || [],
      customBackground: gpt.customBackground ?? false,
      chatPersistence: gpt.chatPersistence || "Never Forget",
    })
  }, [gpt])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (gpt) {
      updateCustomGPT(gpt.id, formData)
    }
    router.push("/custom-gpts")
  }

  if (!gpt) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar isCollapsed={sidebarCollapsed} width={sidebarWidth} onWidthChange={setSidebarWidth} />
        <div className="flex-1 flex flex-col">
          <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center space-y-8">
              <div className="relative">
                <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <AlertCircle className="w-12 h-12 text-destructive" />
                </div>
                <div className="absolute inset-0 w-24 h-24 border-2 border-destructive/20 rounded-full mx-auto animate-ping" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Custom GPT Not Found</h1>
                  <p className="text-lg text-muted-foreground">
                    We couldn't find the Custom GPT you're looking for.
                  </p>
                </div>
                
                <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border">
                  <p className="mb-2"><strong>What happened?</strong></p>
                  <p>The Custom GPT with ID "{id}" doesn't exist or may have been deleted.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => window.history.back()}
                  className="gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Go Back
                </Button>
                <Button 
                  onClick={() => router.push('/custom-gpts')}
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to Custom GPTs
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={sidebarCollapsed} width={sidebarWidth} onWidthChange={setSidebarWidth} />
      
      <div className="flex-1 flex flex-col">
        <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold">Configure {formData.name || "Custom GPT"}</h1>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-6">
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-12">
              <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                <Settings className="w-4 h-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                <Palette className="w-4 h-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-auto">
            <TabsContent value="general" className="p-6 space-y-6">
              <CustomGPTGeneralForm formData={formData} onChange={handleInputChange} />
            </TabsContent>
            
            <TabsContent value="appearance" className="p-6 space-y-6">
              <CustomGPTAppearanceForm formData={formData} onChange={handleInputChange} />
            </TabsContent>
            
            <TabsContent value="preview" className="p-6">
              <div className="h-[600px] border rounded-lg overflow-hidden">
                <CustomGPTPreview gptId={id} formData={formData} />
              </div>
            </TabsContent>
          </div>
          
          {/* Footer Actions */}
          <div className="border-t px-6 py-4 flex items-center justify-end gap-3">
            <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50 bg-transparent">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/custom-gpts")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name || !formData.agentId}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              Save Changes
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  )
}