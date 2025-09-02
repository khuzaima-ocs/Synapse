"use client"

import { useMemo, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Mic, Send, Copy, MoreVertical, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useData } from "@/lib/data-store"

interface CustomGPTPreviewProps {
  gptId: string
  formData?: {
    name: string
    description: string
    agentId: string
    themeColor: string
    inputPlaceholder: string
    conversationStarters: string[]
  }
}

export function CustomGPTPreview({ gptId, formData }: CustomGPTPreviewProps) {
  const { customGPTs, agents } = useData()
  
  const gpt = useMemo(() => customGPTs.find((g) => g.id === gptId), [customGPTs, gptId])
  const agent = useMemo(() => agents.find((a) => a.id === (formData?.agentId || gpt?.agentId)), [agents, formData?.agentId, gpt?.agentId])
  
  // Use formData for live preview or fall back to saved gpt data or defaults
  const previewData = formData || gpt || {
    name: "My Custom GPT",
    description: "A helpful AI assistant",
    themeColor: "#2065D1",
    inputPlaceholder: "What would you like to know?",
    conversationStarters: [],
    agentId: agents[0]?.id || ""
  }
  
  const previewAgent = agent || agents[0]

  // Mock messages for preview
  const mockMessages = [
    {
      id: "1",
      type: "agent" as const,
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
    },
    {
      id: "2", 
      type: "user" as const,
      content: "Can you help me analyze some data?",
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
    },
    {
      id: "3",
      type: "agent" as const, 
      content: "I'd be happy to help you analyze data! I can work with various data formats and provide insights. What kind of data analysis do you need?",
      timestamp: new Date(Date.now() - 30000), // 30 seconds ago
      toolUsed: "Data Analysis Tool"
    }
  ]

  if (!previewAgent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-2xl mb-2">🤖</div>
          <p className="text-muted-foreground">No agents available for preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ backgroundColor: `${previewData.themeColor}20` }}
          >
            🧩
          </div>
          <div>
            <h2 className="font-semibold">{previewData.name}</h2>
            <p className="text-sm text-muted-foreground">{previewData.description}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll">
        <div className="p-6 space-y-6 min-h-full">
          {mockMessages.map((msg, index) => (
            <div key={msg.id}>
              {msg.type === 'agent' ? (
                <div className="flex gap-4">
                  <Avatar className="w-10 h-10 flex-shrink-0 shadow-lg">
                    <AvatarImage src={previewAgent?.avatar || "/placeholder-user.png"} className="object-cover" />
                    <AvatarFallback 
                      className="text-white text-sm font-semibold"
                      style={{ backgroundColor: previewData.themeColor || "#2065D1" }}
                    >
                      {(previewAgent?.name || "A").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-[80%] space-y-2">
                    <div 
                      className="message-bubble border border-border/40 rounded-3xl rounded-tl-lg px-5 py-4 shadow-md backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(to bottom right, ${previewData.themeColor || "#2065D1"}03, ${previewData.themeColor || "#2065D1"}08, var(--card))`
                      }}
                    >
                      <p className="text-sm text-foreground leading-relaxed font-medium">
                        {msg.content}
                      </p>
                      
                      {msg.toolUsed && (
                        <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground bg-gradient-to-r from-emerald-50 to-emerald-50/50 dark:from-emerald-950/50 dark:to-emerald-950/30 backdrop-blur-sm rounded-xl px-4 py-3 border border-emerald-200/50 dark:border-emerald-800/50">
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm" />
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">Used {msg.toolUsed}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all ml-auto rounded-lg">
                            <Copy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground/80 ml-3 font-medium">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="max-w-[80%] space-y-2">
                    <div 
                      className="message-bubble text-white rounded-3xl rounded-tr-lg px-5 py-4 shadow-md"
                      style={{ backgroundColor: previewData.themeColor || "#2065D1" }}
                    >
                      <p className="text-sm leading-relaxed font-medium">
                        {msg.content}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground/80 mr-3 text-right font-medium">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Conversation Starters */}
      {previewData.conversationStarters && previewData.conversationStarters.length > 0 && (
        <div className="px-6 py-3 border-t border-border/30 bg-muted/20">
          <div className="flex flex-wrap gap-2">
            {previewData.conversationStarters.slice(0, 4).map((starter, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8 px-3 bg-background/80 hover:bg-background"
              >
                {starter}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div 
        className="relative p-6 border-t border-border/50 flex-shrink-0 backdrop-blur-sm"
        style={{
          background: `linear-gradient(to right, var(--background), var(--background), ${previewData.themeColor || "#2065D1"}05)`
        }}
      >
        <div 
          className="absolute inset-0 opacity-30" 
          style={{
            background: `linear-gradient(to right, ${previewData.themeColor || "#2065D1"}05, transparent, ${previewData.themeColor || "#2065D1"}05)`
          }}
        />
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <div 
              className="relative bg-gradient-to-r from-background to-muted/20 rounded-2xl border border-border/60 shadow-sm transition-all focus-within:shadow-md focus-within:border-opacity-80"
              style={{
                '--focus-border-color': `${previewData.themeColor || "#2065D1"}60`,
                '--focus-ring-color': `${previewData.themeColor || "#2065D1"}10`
              } as React.CSSProperties}
            >
              <Input
                placeholder={previewData.inputPlaceholder || "Ask me anything..."}
                className="border-0 bg-transparent rounded-2xl pl-4 pr-24 py-4 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none focus:bg-opacity-50"
                style={{
                  '--tw-ring-color': `${previewData.themeColor || "#2065D1"}10`,
                  '--focus-bg': `${previewData.themeColor || "#2065D1"}08`
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.target.style.backgroundColor = `${previewData.themeColor || "#2065D1"}08`
                  e.target.parentElement!.style.borderColor = `${previewData.themeColor || "#2065D1"}60`
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.parentElement!.style.borderColor = 'hsl(var(--border))'
                }}
                readOnly
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-muted/60 transition-all hover:scale-105"
                >
                  <Paperclip className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-muted/60 transition-all hover:scale-105"
                >
                  <Mic className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Button>
              </div>
            </div>
          </div>
          <Button 
            size="sm" 
            className="h-12 w-12 p-0 rounded-xl text-white shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: previewData.themeColor || "#2065D1",
              '--hover-bg': `${previewData.themeColor || "#2065D1"}90`
            } as React.CSSProperties}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
