"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { CustomGPTGeneralForm } from "@/components/custom-gpt-general-form"
import { CustomGPTAppearanceForm } from "@/components/custom-gpt-appearance-form"
import { CustomGPTPreview } from "@/components/custom-gpt-preview"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Palette, Eye, Share } from "lucide-react"
import { useData } from "@/lib/data-store"
import { useRouter } from "next/navigation"

export default function NewCustomGPTPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [activeTab, setActiveTab] = useState("general")
  const { addCustomGPT } = useData()
  const router = useRouter()
  
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

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    addCustomGPT(formData as any)
    router.push("/custom-gpts")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isCollapsed={sidebarCollapsed} width={sidebarWidth} onWidthChange={setSidebarWidth} />
      
      <div className="flex-1 flex flex-col">
        <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold">Create Custom GPT</h1>
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
                <CustomGPTPreview gptId="new" formData={formData} />
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
              Create Custom GPT
            </Button>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
