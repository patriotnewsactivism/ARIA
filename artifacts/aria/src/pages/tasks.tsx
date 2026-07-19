import { useEffect, useState } from "react"
import { useListTasks, useCreateTask, useUpdateTask, useDeleteTask, getListTasksQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Clock, PlayCircle, Plus, Trash2, XCircle, Network, LayoutGrid, ShieldAlert } from "lucide-react"

export default function Tasks() {
  const queryClient = useQueryClient()
  const { data: tasks, isLoading } = useListTasks()
  const [filter, setFilter] = useState<string>("all")

  const filteredTasks = tasks?.filter(t => filter === "all" || t.status === filter) || []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Board</h1>
          <p className="text-muted-foreground mt-1">Manage ARIA's task queue and monitor progress.</p>
        </div>
        <CreateTaskDialog />
      </div>

      <div className="flex items-center gap-2 pb-2 overflow-x-auto border-b border-border">
        <Button variant={filter === "all" ? "secondary" : "ghost"} onClick={() => setFilter("all")} className="rounded-full">All Tasks</Button>
        <Button variant={filter === "pending" ? "secondary" : "ghost"} onClick={() => setFilter("pending")} className="rounded-full">Pending</Button>
        <Button variant={filter === "in_progress" ? "secondary" : "ghost"} onClick={() => setFilter("in_progress")} className="rounded-full">In Progress</Button>
        <Button variant={filter === "completed" ? "secondary" : "ghost"} onClick={() => setFilter("completed")} className="rounded-full">Completed</Button>
        <Button variant={filter === "failed" ? "secondary" : "ghost"} onClick={() => setFilter("failed")} className="rounded-full">Failed</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 flex-1 content-start">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map(task => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl border-border">
            No tasks found. Create a new task to get ARIA started.
          </div>
        )}
      </div>

      <ApexProjectsPanel />
      <ApexSwarmPanel />
    </div>
  )
}

// Command Center: live health cards for every project in Apex's registry
// (proxied via /apex/projects). First visible piece of the mission-control
// vision -- per-project priority + autonomy level, at a glance, read-only
// for now (the autonomy dial itself is PATCH-able server-side already,
// UI control comes in a later pass).
function ApexProjectsPanel() {
  // Each entry is the status() rollup shape: { project, health, goals, tasks, agentsInvolved, lastActivityAt }
  const [rollups, setRollups] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/apex/projects/status`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        setRollups(Array.isArray(data?.projects) ? data.projects : [])
      })
      .catch(err => {
        if (!cancelled) setError(err?.message || "Failed to load Apex project status")
      })
    return () => { cancelled = true }
  }, [])

  const priorityRank: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 }
  const sorted = rollups
    ? [...rollups].sort((a, b) => (priorityRank[a.project.priority] ?? 9) - (priorityRank[b.project.priority] ?? 9))
    : null

  const healthColors: Record<string, string> = {
    healthy: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40",
    attention_needed: "bg-destructive/20 text-destructive border-destructive/50",
    stalled: "bg-primary/20 text-primary border-primary/50",
    unmanaged: "bg-muted text-muted-foreground border-border",
  }
  const healthLabels: Record<string, string> = {
    healthy: "Healthy",
    attention_needed: "Attention Needed",
    stalled: "Stalled",
    unmanaged: "Unmanaged",
  }

  const priorityColors: Record<string, string> = {
    critical: "bg-destructive/20 text-destructive border-destructive/50",
    high: "bg-primary/20 text-primary border-primary/50",
    normal: "bg-muted text-muted-foreground border-border",
    low: "bg-muted text-muted-foreground border-border",
  }

  const autonomyLabels: Record<string, string> = {
    manual: "Manual",
    assisted: "Assisted",
    supervisor: "Supervisor",
    full_autonomous: "Full Autonomous",
    experimental: "Experimental",
  }

  return (
    <div className="border-t border-border pt-6 mt-2">
      <div className="flex items-center gap-2 mb-4">
        <LayoutGrid className="w-4 h-4 text-primary" />
        <h2 className="text-xl font-semibold tracking-tight">Project Registry</h2>
        <Badge variant="outline" className="text-xs">live, read-only</Badge>
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : sorted === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No projects registered in Apex yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((r: any) => {
            const p = r.project
            return (
              <Card key={p.id} className="flex flex-col">
                <CardHeader className="p-4 pb-2 space-y-0">
                  <div className="flex justify-between items-start gap-2">
                    <Badge className={(priorityColors[p.priority] || priorityColors.normal) + " border shadow-none text-xs uppercase"}>
                      {p.priority}
                    </Badge>
                    {p.autonomyLevel === "full_autonomous" && <ShieldAlert className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                  <CardTitle className="text-base mt-2 leading-tight line-clamp-1">{p.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex-1 flex flex-col">
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.purpose}</p>
                  <Badge className={(healthColors[r.health] || healthColors.unmanaged) + " border shadow-none text-xs w-fit mb-3"}>
                    {healthLabels[r.health] || r.health}
                  </Badge>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{r.goals?.total ?? 0} goals</span>
                    <span>{r.tasks?.total ?? 0} tasks</span>
                    <span>{r.agentsInvolved?.length ?? 0} agents</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">{autonomyLabels[p.autonomyLevel] || p.autonomyLevel}</span>
                    <Badge variant="outline" className="text-xs">{p.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Read-only panel showing real tasks from Apex's live 13-agent swarm
// (proxied server-side via /apex/tasks so the admin bearer token never
// reaches the browser). First step of the Apex+ARIA merge surfacing real
// swarm activity inside ARIA's UI.
function ApexSwarmPanel() {
  const [apexTasks, setApexTasks] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.VITE_API_BASE_URL || ""}/apex/tasks?limit=20`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        setApexTasks(Array.isArray(data?.tasks) ? data.tasks : [])
      })
      .catch(err => {
        if (!cancelled) setError(err?.message || "Failed to load Apex tasks")
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="border-t border-border pt-6 mt-2">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-4 h-4 text-primary" />
        <h2 className="text-xl font-semibold tracking-tight">Apex Swarm Activity</h2>
        <Badge variant="outline" className="text-xs">live, read-only</Badge>
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : apexTasks === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : apexTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active tasks in the Apex swarm right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {apexTasks.map((t: any) => (
            <Card key={t.id} className="flex flex-col">
              <CardHeader className="p-4 pb-2 space-y-0">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="text-xs">{t.status}</Badge>
                  {t.assignedAgentId && <Badge variant="outline" className="text-xs">{t.assignedAgentId}</Badge>}
                </div>
                <CardTitle className="text-sm mt-2 leading-tight line-clamp-2">{t.title || t.description || `Task ${t.id}`}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function TaskCard({ task }: { task: any }) {
  const updateMutation = useUpdateTask()
  const deleteMutation = useDeleteTask()
  const queryClient = useQueryClient()

  const statusIcons: Record<string, any> = {
    pending: Clock,
    in_progress: PlayCircle,
    completed: CheckCircle2,
    failed: XCircle,
    cancelled: XCircle
  }
  
  const statusColors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground border-border",
    in_progress: "bg-primary/20 text-primary border-primary/50",
    completed: "bg-green-500/20 text-green-400 border-green-500/50",
    failed: "bg-destructive/20 text-destructive border-destructive/50",
    cancelled: "bg-muted text-muted-foreground border-border",
  }

  const Icon = statusIcons[task.status] || Clock

  const handleStatusChange = (newStatus: string) => {
    // using queryClient invalidate for simplicity since there are lists and we don't have task id query exact match in cache easily available
    updateMutation.mutate({ id: task.id, data: { status: newStatus as any } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() })
    })
  }

  return (
    <Card className="flex flex-col hover:border-border/80 transition-colors group">
      <CardHeader className="p-4 pb-2 space-y-0">
        <div className="flex justify-between items-start">
          <Badge className={statusColors[task.status] + " border shadow-none"}>
            <Icon className="w-3 h-3 mr-1" />
            {task.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-xs uppercase">{task.priority}</Badge>
        </div>
        <CardTitle className="text-base mt-3 leading-tight line-clamp-2">{task.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
          {task.description || "No description provided."}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
          <Select value={task.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[130px] h-8 text-xs bg-secondary/50 border-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              deleteMutation.mutate({ id: task.id }, {
                onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() })
              })
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateTaskDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  
  const createMutation = useCreateTask()
  const queryClient = useQueryClient()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    
    createMutation.mutate({
      data: {
        title,
        description,
        priority: priority as any
      }
    }, {
      onSuccess: () => {
        setOpen(false)
        setTitle("")
        setDescription("")
        setPriority("medium")
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Task to ARIA</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Fetch latest PRs from GitHub" autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Provide detailed instructions..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!title.trim() || createMutation.isPending}>
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
