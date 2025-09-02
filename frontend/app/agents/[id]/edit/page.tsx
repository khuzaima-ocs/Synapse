"use client"

import { useState, useEffect, use } from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { AgentConfigForm } from "@/components/agent-config-form"
import { AgentPreview } from "@/components/agent-preview"
import { useData } from "@/lib/data-store"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Eye, Settings, AlertCircle, Home, PanelLeftClose, PanelLeft } from "lucide-react"

export default function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(256)
  const [leftPanelWidth, setLeftPanelWidth] = useState(50) // percentage - equal space by default
  const [showMobilePreview, setShowMobilePreview] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [configPanelVisible, setConfigPanelVisible] = useState(true)
  const { agents } = useData()
  const agent = agents.find((a) => a.id === id)

  // Simulate loading state (in a real app, this would be from data fetching)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100) // Minimal delay to prevent flash
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Keyboard shortcut to toggle configuration panel (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b' && !isMobile) {
        e.preventDefault()
        setConfigPanelVisible(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobile])

  if (!agent && id !== "new") {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar isCollapsed={sidebarCollapsed} width={sidebarWidth} onWidthChange={setSidebarWidth} />
        <div className="flex-1 flex flex-col">
          <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <main className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center space-y-8">
              {/* Animated Error Icon */}
              <div className="relative">
                <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                  <AlertCircle className="w-12 h-12 text-destructive" />
                </div>
                <div className="absolute inset-0 w-24 h-24 border-2 border-destructive/20 rounded-full mx-auto animate-ping" />
              </div>
              
              {/* Error Content */}
              <div className="space-y-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Agent Not Found</h1>
                  <p className="text-lg text-muted-foreground">
                    We couldn't find the agent you're looking for.
                  </p>
                </div>
                
                <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border">
                  <p className="mb-2"><strong>What happened?</strong></p>
                  <p>The agent with ID "{id}" doesn't exist or may have been deleted.</p>
                </div>
              </div>

              {/* Action Buttons */}
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
                  onClick={() => window.location.href = '/'}
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        <Sidebar isCollapsed={sidebarCollapsed} width={sidebarWidth} onWidthChange={setSidebarWidth} />
        <div className="flex-1 flex flex-col">
          <Header sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        {/* Mobile Layout */}
        {isMobile ? (
          <main className="flex-1 flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {agent ? `Configure ${agent.name}` : "Create Agent"}
                </h1>
                <p className="text-sm text-muted-foreground">Design your AI assistant</p>
              </div>
              <Sheet open={showMobilePreview} onOpenChange={setShowMobilePreview}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md p-0">
                  <SheetHeader className="p-4 border-b">
                    <SheetTitle>Agent Preview</SheetTitle>
                  </SheetHeader>
                  <div className="h-[calc(100vh-80px)]">
                    <AgentPreview agentId={id} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <AgentConfigForm agentId={id} />
              </div>
            </div>
          </main>
        ) : (
          /* Desktop Layout */
          <main className="flex-1 flex relative overflow-hidden">
            {/* Configuration Panel - Collapsible */}
            <div
              className={`border-r border-border relative group flex flex-col bg-background  ${
                configPanelVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
              }`}
              style={{
                width: configPanelVisible ? `${Math.max(30, Math.min(70, leftPanelWidth))}%` : '0%',
                minWidth: configPanelVisible ? "450px" : "0px",
                position: configPanelVisible ? 'relative' : 'absolute',
                left: configPanelVisible ? '0' : '-100%',
                zIndex: configPanelVisible ? 'auto' : '-1',
              }}
            >
              {/* Resize Handle - Only show when panel is visible */}
              {configPanelVisible && (
                <div
                  className="absolute right-0 top-0 bottom-0 w-1.5 bg-transparent hover:bg-primary/20 cursor-col-resize opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 select-none"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    const startX = e.clientX
                    const containerWidth = e.currentTarget.parentElement?.parentElement?.offsetWidth || 1000
                    const startWidth = leftPanelWidth

                    const handleMouseMove = (e: MouseEvent) => {
                      e.preventDefault()
                      const deltaX = e.clientX - startX
                      const deltaPercent = (deltaX / containerWidth) * 100
                      const newWidth = Math.max(30, Math.min(70, startWidth + deltaPercent))
                      setLeftPanelWidth(newWidth)
                    }

                    const handleMouseUp = () => {
                      document.removeEventListener("mousemove", handleMouseMove)
                      document.removeEventListener("mouseup", handleMouseUp)
                      document.body.style.cursor = 'default'
                    }

                    document.body.style.cursor = 'col-resize'
                    document.addEventListener("mousemove", handleMouseMove)
                    document.addEventListener("mouseup", handleMouseUp)
                  }}
                />
              )}

              {/* Header */}
              <div className="p-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-foreground mb-1">
                      {agent ? `Configure ${agent.name}` : "Create Agent"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Design and customize your AI assistant
                    </p>
                  </div>
                </div>
              </div>

              
              <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                  <AgentConfigForm agentId={id} />
                </div>
              </div>
            </div>

            {/* Preview Panel - Full width when config panel is hidden */}
            <div className="flex-1 flex flex-col bg-muted/30 relative" style={{ 
              minWidth: configPanelVisible ? "400px" : "100%",
              width: configPanelVisible ? "auto" : "100%",
              marginLeft: configPanelVisible ? "0" : "0"
            }}>
              
              {/* Preview Header */}
              <div className="p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{
                borderBottom: configPanelVisible ? "1px solid hsl(var(--border))" : "none",
                padding: configPanelVisible ? "1rem" : "1rem 1rem 0 1rem"
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold">
                    {agent?.name || "AI Assistant"}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setConfigPanelVisible(!configPanelVisible)}
                      variant="outline"
                      size="sm"
                      className="gap-2 transition-all hover:scale-105"
                    >
                      {configPanelVisible ? (
                        <>
                          <PanelLeftClose className="w-4 h-4" />
                          <span className="hidden sm:inline flex items-center gap-1">
                            Hide Config
                            <span className="ml-1 text-xs bg-muted/90 p-1 rounded font-mono">⌘B</span>
                          </span>
                        </>
                      ) : (
                        <>
                          <PanelLeft className="w-4 h-4" />
                          <span className="hidden sm:inline flex items-center gap-1">
                            Show Config
                            <span className="ml-1 text-xs bg-muted/90 p-1 rounded font-mono">⌘B</span>
                          </span>
                        </>
                      )}
                    </Button>
              
                  </div>
                </div>
              </div>
              
              {/* Chat Interface */}
              <div className="flex-1 min-h-0 bg-background m-4 rounded-lg border shadow-sm overflow-hidden" style={{
                margin: configPanelVisible ? "1rem" : "0",
                borderRadius: configPanelVisible ? "0.5rem" : "0",
                border: configPanelVisible ? "1px solid hsl(var(--border))" : "none",
                boxShadow: configPanelVisible ? "0 1px 2px 0 rgb(0 0 0 / 0.05)" : "none"
              }}>
                <AgentPreview agentId={id} />
              </div>
            </div>
          </main>
        )}
        </div>
      </div>
    </TooltipProvider>
  )
}
