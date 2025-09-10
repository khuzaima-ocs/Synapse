"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Mic, Send, Copy, MoreVertical, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useData } from "@/lib/api-data-store"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import type { Message } from "@/lib/types"

export function CustomGPTChat({ gptId, isEmbedMode = false }: { gptId: string; isEmbedMode?: boolean }) {
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [messages, setMessages] = useState<Array<{
    id: string
    type: 'agent' | 'user'
    content: string
    timestamp: Date
    toolUsed?: string
  }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const previousMessagesLengthRef = useRef(0)
  const { customGPTs, agents } = useData()
  
  const gpt = useMemo(() => customGPTs.find((g) => g.id === gptId), [customGPTs, gptId])
  const agent = useMemo(() => agents.find((a) => a.id === gpt?.agentId), [agents, gpt?.agentId])

  // Convert API message to component message format
  const convertApiMessage = (apiMessage: Message) => ({
    id: apiMessage.id,
    type: apiMessage.role === 'assistant' ? 'agent' as const : 'user' as const,
    content: apiMessage.content,
    timestamp: new Date(apiMessage.created_at),
    toolUsed: apiMessage.tool_calls ? 'Tool' : undefined
  })

  // Format response with markdown support
  const formatResponse = (responseText: string) => {
    // Escape < and > to prevent XSS
    let safeText = responseText
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Convert markdown-style bold **text** → <strong>text</strong>
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Handle ordered lists (numbered: 1., 2., etc.)
    if (/\d+\.\s+/.test(safeText)) {
      safeText = safeText.replace(/(\d+)\.\s+(.*?)(?=\n|$)/g, "<li>$2</li>");
      safeText = safeText.replace(/(<li>[\s\S]*?<\/li>)/g, "<ol>$1</ol>");
    }

    // Handle unordered lists (- or * at start of line)
    if (/[-*]\s+/.test(safeText)) {
      safeText = safeText.replace(/[-*]\s+(.*?)(?=\n|$)/g, "<li>$1</li>");
      safeText = safeText.replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>");
    }

    // Convert plain newlines into <p>
    safeText = safeText
      .split(/\n+/)
      .map(line => line.trim() ? `<p>${line}</p>` : "")
      .join("");

    // Wrap in a styled card
    return safeText
  }

  // Fetch chat history when agent changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!agent || !gpt) return
      
      setIsLoadingHistory(true)
      try {
        // Use a default user ID for now - in a real app, this would come from authentication
        const userId = "khuzaima" // This should be dynamic based on logged-in user
        const chatHistory = await apiClient.getChatHistory(agent.id, userId, 50)
        
        if (chatHistory && chatHistory.length > 0) {
          // Convert and sort messages by timestamp
          const convertedMessages = chatHistory
            .map(convertApiMessage)
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          
          setMessages(convertedMessages)
          previousMessagesLengthRef.current = convertedMessages.length
        } else {
          // No chat history, show starter message
          const starterMessage = {
            id: '1',
            type: 'agent' as const,
            content: agent.starterMessage || "Hi! I'm your AI assistant. How can I help you today?",
            timestamp: new Date()
          }
          setMessages([starterMessage])
          previousMessagesLengthRef.current = 1
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error)
        // Fallback to starter message on error
        const starterMessage = {
          id: '1',
          type: 'agent' as const,
          content: agent.starterMessage || "Hi! I'm your AI assistant. How can I help you today?",
          timestamp: new Date()
        }
        setMessages([starterMessage])
        previousMessagesLengthRef.current = 1
      } finally {
        setIsLoadingHistory(false)
      }
    }

    fetchChatHistory()
  }, [agent, gpt])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        type: 'user' as const,
        content: message,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, newMessage])
      setMessage("")
      
      if (!agent) {
        console.error('Agent is undefined')
        return
      }

      // Send message to backend
      try {
        const agentResponse = await apiClient.sendMessage(agent.id, "khuzaima", newMessage.content)
        setMessages(prev => [...prev, {
          id: agentResponse.message_id,
          type: 'agent' as const,
          content: agentResponse.content,
          timestamp: new Date(agentResponse.created_at)
        }])
      } catch (error) {
        console.error('Failed to send message:', error)
      }
      
      // Simulate typing response
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
      }, 1500)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleConversationStarter = (starter: string) => {
    setMessage(starter)
    handleSendMessage()
  }

  // Check if a message is new (added after the last render)
  const isNewMessage = (index: number) => {
    return index >= previousMessagesLengthRef.current
  }

  // Update the ref after messages change
  useEffect(() => {
    previousMessagesLengthRef.current = messages.length
  }, [messages])

  if (!gpt || !agent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-2xl mb-2">🤖</div>
          <p className="text-muted-foreground">Custom GPT not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className={`flex items-center justify-between border-b bg-card ${isEmbedMode ? 'p-3' : 'p-4'}`}>
        <div className="flex items-center gap-3">
          <div 
            className={`rounded-lg flex items-center justify-center text-lg bg-black ${isEmbedMode ? 'w-8 h-8' : 'w-10 h-10'}`}
          >
            <img src={"/synapse-logo-light.png"} alt={gpt.name} className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h2 className={`font-semibold ${isEmbedMode ? 'text-sm' : ''}`}>{gpt.name}</h2>
            {!isEmbedMode && (
              <p className="text-sm text-muted-foreground">{gpt.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto chat-scroll">
        <div className={`space-y-6 min-h-full ${isEmbedMode ? 'p-4' : 'p-6'}`}>
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-2xl mb-2">⏳</div>
                <p className="text-muted-foreground">Loading chat history...</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div 
                  key={msg.id} 
                  className={isNewMessage(index) ? "animate-slide-in-from-bottom" : ""}
                  style={isNewMessage(index) ? { animationDelay: "0ms" } : {}}
                >
                  {msg.type === 'agent' ? (
                    <div className="flex gap-4">
                      <Avatar className="w-10 h-10 flex-shrink-0 shadow-lg">
                        <AvatarImage src={agent?.avatar || "/placeholder-user.png"} className="object-cover" />
                        <AvatarFallback 
                          className="text-white text-sm font-semibold"
                          style={{ backgroundColor: gpt?.themeColor || "#2065D1" }}
                        >
                          {(agent?.name || "A").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 max-w-[80%] space-y-2">
                        <div 
                          className="message-bubble border border-border/40 rounded-3xl rounded-tl-lg px-5 py-4 shadow-md backdrop-blur-sm"
                          style={{
                            background: `linear-gradient(to bottom right, ${gpt?.themeColor || "#2065D1"}03, ${gpt?.themeColor || "#2065D1"}08, var(--card))`
                          }}
                        >
                      {msg.type === 'agent' ? (
                        <div 
                          className="text-sm text-foreground leading-relaxed font-medium"
                          dangerouslySetInnerHTML={{ __html: formatResponse(msg.content) }}
                        />
                      ) : (
                        <p className="text-sm text-foreground leading-relaxed font-medium">
                          {msg.content}
                        </p>
                      )}
                          
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
                          style={{ backgroundColor: gpt?.themeColor || "#2065D1" }}
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
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-4 animate-slide-in-from-bottom">
                  <Avatar className="w-10 h-10 flex-shrink-0 shadow-lg">
                    <AvatarImage src={agent?.avatar || "/placeholder-user.png"} className="object-cover" />
                    <AvatarFallback 
                      className="text-white text-sm font-semibold"
                      style={{ backgroundColor: gpt?.themeColor || "#2065D1" }}
                    >
                      {(agent?.name || "A").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-[80%]">
                    <div 
                      className="message-bubble border border-border/40 rounded-3xl rounded-tl-lg px-5 py-4 shadow-md backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(to bottom right, ${gpt?.themeColor || "#2065D1"}03, ${gpt?.themeColor || "#2065D1"}08, var(--card))`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <div 
                            className="w-2.5 h-2.5 rounded-full animate-bounce" 
                            style={{ backgroundColor: gpt?.themeColor || "#2065D1", animationDelay: '0ms' }}
                          />
                          <div 
                            className="w-2.5 h-2.5 rounded-full animate-bounce" 
                            style={{ backgroundColor: gpt?.themeColor || "#2065D1", animationDelay: '200ms' }}
                          />
                          <div 
                            className="w-2.5 h-2.5 rounded-full animate-bounce" 
                            style={{ backgroundColor: gpt?.themeColor || "#2065D1", animationDelay: '400ms' }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground font-medium ml-1">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Conversation Starters */}
      {gpt.conversationStarters && gpt.conversationStarters.length > 0 && (
        <div className={`border-t border-border/30 bg-muted/20 ${isEmbedMode ? 'px-4 py-2' : 'px-6 py-3'}`}>
          <div className="flex flex-wrap gap-2">
            {gpt.conversationStarters.slice(0, 4).map((starter, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8 px-3 bg-background/80 hover:bg-background"
                onClick={() => handleConversationStarter(starter)}
              >
                {starter}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div 
        className={`relative border-t border-border/50 flex-shrink-0 backdrop-blur-sm ${isEmbedMode ? 'p-4' : 'p-6'}`}
        style={{
          background: `linear-gradient(to right, var(--background), var(--background), ${gpt?.themeColor || "#2065D1"}05)`
        }}
      >
        <div 
          className="absolute inset-0 opacity-30" 
          style={{
            background: `linear-gradient(to right, ${gpt?.themeColor || "#2065D1"}05, transparent, ${gpt?.themeColor || "#2065D1"}05)`
          }}
        />
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <div 
              className="relative bg-gradient-to-r from-background to-muted/20 rounded-2xl border border-border/60 shadow-sm transition-all focus-within:shadow-md focus-within:border-opacity-80"
              style={{
                '--focus-border-color': `${gpt?.themeColor || "#2065D1"}60`,
                '--focus-ring-color': `${gpt?.themeColor || "#2065D1"}10`
              } as React.CSSProperties}
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={gpt.inputPlaceholder || "Ask me anything..."}
                className="border-0 bg-transparent rounded-2xl pl-4 pr-24 py-4 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
                style={{
                  '--tw-ring-color': `${gpt?.themeColor || "#2065D1"}10`
                } as React.CSSProperties}
                onFocus={(e) => {
                  e.target.style.backgroundColor = `${gpt?.themeColor || "#2065D1"}08`
                  e.target.parentElement!.style.borderColor = `${gpt?.themeColor || "#2065D1"}60`
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.parentElement!.style.borderColor = 'hsl(var(--border))'
                }}
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
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="h-12 w-12 p-0 rounded-xl text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: gpt?.themeColor || "#2065D1",
              '--hover-bg': `${gpt?.themeColor || "#2065D1"}90`
            } as React.CSSProperties}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
