import { useState, useRef, useEffect } from "react"
import { useListShellSessions, useCreateShellSession, useGetShellSession, useDeleteShellSession, useExecuteCommand, getListShellSessionsQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { TerminalSquare, Plus, Trash2, Loader2, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Shell() {
  const queryClient = useQueryClient()
  const { data: sessions, isLoading: sessionsLoading } = useListShellSessions()
  const createMutation = useCreateShellSession()
  const deleteMutation = useDeleteShellSession()
  const [activeId, setActiveId] = useState<number | null>(null)

  useEffect(() => {
    if (!activeId && sessions && sessions.length > 0) {
      setActiveId(sessions[0].id)
    }
  }, [sessions, activeId])

  const handleCreate = () => {
    createMutation.mutate({ data: { name: `Session ${sessions ? sessions.length + 1 : 1}` } }, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListShellSessionsQueryKey() })
        setActiveId(data.id)
      }
    })
  }

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListShellSessionsQueryKey() })
        if (activeId === id) setActiveId(null)
      }
    })
  }

  return (
    <div className="flex h-full overflow-hidden bg-[#0D1117]">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-sm tracking-widest text-muted-foreground uppercase">Terminals</h2>
          <Button size="icon" variant="ghost" onClick={handleCreate} disabled={createMutation.isPending} className="h-8 w-8">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessions?.map(session => (
              <div
                key={session.id}
                onClick={() => setActiveId(session.id)}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors group",
                  activeId === session.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <TerminalSquare className="w-4 h-4 shrink-0" />
                  <span className="text-sm truncate font-mono">{session.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={(e) => handleDelete(session.id, e)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Terminal Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0E14] text-[#C9D1D9] font-mono relative">
        {activeId ? (
          <ActiveTerminal id={activeId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            No active session
          </div>
        )}
      </div>
    </div>
  )
}

function ActiveTerminal({ id }: { id: number }) {
  const { data: session, isLoading, refetch } = useGetShellSession(id, { query: { enabled: !!id } })
  const executeMutation = useExecuteCommand()
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [session?.commands, executeMutation.isPending])

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || executeMutation.isPending) return

    const cmd = input
    setInput("")

    executeMutation.mutate({ id, data: { command: cmd } }, {
      onSuccess: () => {
        refetch()
      }
    })
  }

  if (isLoading) return <div className="p-4">Connecting...</div>

  return (
    <div className="flex flex-col h-full absolute inset-0">
      <div className="h-10 border-b border-border/50 bg-[#161B22] flex items-center px-4 shrink-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{session?.name}</span>
          <span>—</span>
          <span>{session?.workingDir}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        <div className="text-xs text-muted-foreground mb-4">ARIA Shell v1.0.0. Connected to {session?.workingDir}</div>
        
        {session?.commands?.map((cmd, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-start gap-2 text-primary">
              <ChevronRight className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="break-all">{cmd.command}</span>
            </div>
            {cmd.output && (
              <pre className="text-sm text-[#8B949E] pl-6 whitespace-pre-wrap break-all overflow-x-hidden font-mono">
                {cmd.output}
              </pre>
            )}
            {cmd.exitCode !== 0 && cmd.exitCode !== null && (
              <div className="text-destructive pl-6 text-sm">Process exited with code {cmd.exitCode}</div>
            )}
          </div>
        ))}

        {executeMutation.isPending && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
            <span>Executing...</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#0A0E14] shrink-0 border-t border-border/50">
        <form onSubmit={handleExecute} className="flex items-center gap-2">
          <ChevronRight className="w-5 h-5 text-primary shrink-0" />
          <input 
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[#C9D1D9] font-mono text-sm placeholder:text-muted-foreground"
            placeholder="Enter command..."
            disabled={executeMutation.isPending}
            autoFocus
          />
        </form>
      </div>
    </div>
  )
}
