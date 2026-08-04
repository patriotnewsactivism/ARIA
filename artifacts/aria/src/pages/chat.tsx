import { useState, useRef, useEffect } from "react"
import { useListConversations, useCreateConversation, useGetConversation, useDeleteConversation, useSendMessage } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { useLocation, useRoute } from "wouter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, MessageSquare, Trash2, Send, Bot, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Chat() {
  const [match, params] = useRoute("/chat/:id")
  const activeId = match && params?.id ? parseInt(params.id) : null
  const [, setLocation] = useLocation()

  const { data: conversations, isLoading: loadingConvos } = useListConversations()
  const createMutation = useCreateConversation()
  const deleteMutation = useDeleteConversation()

  const handleCreate = () => {
    createMutation.mutate({ data: { title: "New Conversation" } }, {
      onSuccess: (data) => {
        setLocation(`/chat/${data.id}`)
      }
    })
  }

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        if (activeId === id) setLocation("/chat")
        // Normally we'd invalidate here but we rely on simple refetch or ignoring
      }
    })
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r border-border bg-card/30 flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <Button onClick={handleCreate} className="w-full gap-2" disabled={createMutation.isPending}>
            {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loadingConvos ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)
            ) : conversations?.map(convo => (
              <div
                key={convo.id}
                onClick={() => setLocation(`/chat/${convo.id}`)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors group",
                  activeId === convo.id ? "bg-primary/10 text-primary border border-primary/30" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate font-medium">{convo.title || "Untitled"}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={(e) => handleDelete(convo.id, e)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        {activeId ? (
          <ActiveChat id={activeId} />
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground animate-in fade-in zoom-in-95">
            <Bot className="w-16 h-16 mb-4 text-primary/30" />
            <p className="text-lg">Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ActiveChat({ id }: { id: number }) {
  const queryClient = useQueryClient()
  const { data: conversation, isLoading } = useGetConversation(id)
  const [input, setInput] = useState("")
  const [streamingMessage, setStreamingMessage] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation?.messages, streamingMessage])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isStreaming) return

    const userMessage = input
    setInput("")
    setIsStreaming(true)
    setStreamingMessage("")

    try {
      // Manual SSE fetch — hits the real streaming AI endpoint, respecting the configured API base URL
      const apiBase = import.meta.env.VITE_API_BASE_URL || ""
      const res = await fetch(`${apiBase}/api/openai/conversations/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error");
        throw new Error(`AI request failed: ${res.status} ${errorText}`);
      }
      if (!res.body) throw new Error("No response body")
      
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter(line => line.trim().startsWith('data: '));
          
          for (const line of lines) {
            const dataStr = line.replace(/^data: /, '');
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.content) {
                setStreamingMessage(prev => prev + data.content);
              }
              if (data.done) {
                done = true;
              }
            } catch (err) {
              console.error("Failed to parse SSE data", err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err)
      setStreamingMessage("Sorry, something went wrong. Please try again.");
    } finally {
      setIsStreaming(false)
      // Trigger refetch to get the final assistant message persisted on the server
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", id] })
    }
  }

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="flex flex-col h-full absolute inset-0">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center px-6 shrink-0 bg-background/80 backdrop-blur z-10">
        <h2 className="font-semibold text-lg">{conversation?.title}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {conversation?.messages?.map(msg => (
            <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
          ))}
          {isStreaming && (
            <MessageBubble role="assistant" content={streamingMessage || "..."} />
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-background border-t border-border shrink-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center">
          <Input 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Message ARIA..."
            className="pr-12 bg-card border-border h-12 text-base"
            disabled={isStreaming}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="absolute right-1 w-10 h-10 rounded-md"
            disabled={!input.trim() || isStreaming}
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  )
}

function MessageBubble({ role, content }: { role: string, content: string }) {
  const isUser = role === 'user'
  
  return (
    <div className={cn("flex gap-4", isUser ? "flex-row-reverse" : "flex-row")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser ? "bg-secondary text-secondary-foreground" : "bg-primary/20 text-primary border border-primary/30 glow-border"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={cn(
        "px-4 py-3 rounded-lg max-w-[80%] text-sm leading-relaxed",
        isUser ? "bg-secondary text-secondary-foreground" : "bg-card border border-border"
      )}>
        {content}
      </div>
    </div>
  )
}
