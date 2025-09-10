"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Mic, Send, Copy, Sparkles, MessageSquare } from "lucide-react"
import { useData } from "@/lib/api-data-store"
import { apiClient } from "@/lib/api-client"
import type { Message } from "@/lib/types"

export function AgentPreview({ agentId }: { agentId?: string }) {
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
  const { agents } = useData()
  const agent = useMemo(() => agents.find((a) => a.id === agentId), [agents, agentId])

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

    // Convert numbered lists (1. , 2. , etc.)
    safeText = safeText.replace(/(\d+)\.\s+(.*?)(?=\n|$)/g, "<li>$2</li>");
    if (safeText.includes("<li>")) {
      safeText = "<ol>" + safeText + "</ol>";
    }

    // Convert unordered lists (- , * )
    safeText = safeText.replace(/[-*]\s+(.*?)(?=\n|$)/g, "<li>$1</li>");
    if (safeText.includes("<li>") && !safeText.includes("<ol>")) {
      safeText = "<ul>" + safeText + "</ul>";
    }

    // Convert newlines into paragraphs if not inside <li>
    safeText = safeText.replace(/([^\n<>]+)\n/g, "<p>$1</p>");

    return safeText;
  }

  // Fetch chat history when agent changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!agent) return
      
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
  }, [agent])

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

  // Check if a message is new (added after the last render)
  const isNewMessage = (index: number) => {
    return index >= previousMessagesLengthRef.current
  }

  // Update the ref after messages change
  useEffect(() => {
    previousMessagesLengthRef.current = messages.length
  }, [messages])

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex-1 overflow-y-auto chat-scroll">
        <div className="p-6 space-y-6 min-h-full">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-2xl mb-2">⏳</div>
                <p className="text-muted-foreground">Loading chat history...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              {messages.map((msg, index) => (
            <div 
              key={msg.id} 
              className={isNewMessage(index) ? "animate-slide-in-from-bottom" : ""}
              style={isNewMessage(index) ? { animationDelay: "0ms" } : {}}
            >
              {msg.type === 'agent' ? (
                <div className="flex gap-4">
                  <Avatar className="w-10 h-10 flex-shrink-0 shadow-lg ring-2 ring-primary/10">
                    <AvatarImage src={agent?.avatar || "/placeholder-user.png"} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground text-sm font-semibold animate-gradient">
                      {(agent?.name || "A").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 max-w-[80%] space-y-2">
                    <div className="message-bubble bg-gradient-to-br from-card via-card to-muted/20 border border-border/40 rounded-3xl rounded-tl-lg px-5 py-4 shadow-md backdrop-blur-sm">
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
                      
                      {/* Tool Usage Indicator - Enhanced */}
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
                    <div className="message-bubble bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground rounded-3xl rounded-tr-lg px-5 py-4 shadow-md">
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
              <Avatar className="w-10 h-10 flex-shrink-0 shadow-lg ring-2 ring-primary/10 animate-pulse-ring">
                <AvatarImage src={agent?.avatar || "/placeholder-user.png"} className="object-cover" />
                <AvatarFallback className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground text-sm font-semibold animate-gradient">
                  {(agent?.name || "A").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 max-w-[80%]">
                <div className="message-bubble bg-gradient-to-br from-card via-card to-muted/20 border border-border/40 rounded-3xl rounded-tl-lg px-5 py-4 shadow-md backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-primary to-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-primary to-primary/80 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-primary to-primary/80 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium ml-1">AI is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Chat Input - Enhanced Footer */}
      <div className="relative p-6 border-t border-border/50 flex-shrink-0 bg-gradient-to-r from-background via-background to-muted/5 backdrop-blur-sm" style={{
        borderTop: "1px solid hsl(var(--border) / 0.5)"
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-30" />
        <div className="relative flex items-end gap-3">
          <div className="flex-1 relative">
            <div className="relative bg-gradient-to-r from-background to-muted/20 rounded-2xl border border-border/60 shadow-sm transition-all focus-within:shadow-md focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="border-0 bg-transparent rounded-2xl pl-4 pr-24 py-4 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
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
            className="h-12 w-12 p-0 rounded-xl bg-gradient-to-br from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
