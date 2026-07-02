import { useGetAgent, useGetAgentStats, useListTasks, useListActions } from "@workspace/api-client-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, CheckCircle2, Clock, Terminal, Zap, MessageSquare } from "lucide-react"

export default function Dashboard() {
  const { data: agent, isLoading: agentLoading } = useGetAgent()
  const { data: stats, isLoading: statsLoading } = useGetAgentStats()
  const { data: actions, isLoading: actionsLoading } = useListActions({ limit: 5 })
  const { data: tasks, isLoading: tasksLoading } = useListTasks({ status: 'in_progress' })

  const isOnline = agent?.status === 'online' || agent?.status === 'idle' || agent?.status === 'busy'

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Header Profile */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">
              {agentLoading ? <Skeleton className="h-10 w-48" /> : agent?.name}
            </h1>
            {!agentLoading && (
              <Badge variant={isOnline ? "default" : "secondary"} className={isOnline ? "animate-pulse" : ""}>
                {agent?.status.toUpperCase()}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-lg">
            {agentLoading ? <Skeleton className="h-6 w-64" /> : agent?.persona}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono text-muted-foreground">UPTIME</p>
          <p className="text-2xl font-mono text-primary glow-text">
            {statsLoading ? <Skeleton className="h-8 w-24 inline-block" /> : `${stats?.uptimeHours}H`}
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Tasks Completed" value={stats?.tasksCompleted} icon={CheckCircle2} loading={statsLoading} />
        <StatCard title="Commands Executed" value={stats?.commandsExecuted} icon={Terminal} loading={statsLoading} />
        <StatCard title="Messages" value={stats?.messagesExchanged} icon={MessageSquare} loading={statsLoading} />
        <StatCard title="Active Workflows" value={stats?.workflowsActive} icon={Zap} loading={statsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Tasks */}
          <Card className="border-primary/20 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.1)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                In Progress
              </CardTitle>
              <CardDescription>Tasks ARIA is currently working on</CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map(task => (
                    <div key={task.id} className="p-4 rounded-md bg-secondary/30 border border-border flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{task.title}</h4>
                        {task.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>}
                      </div>
                      <Badge variant="outline" className="border-primary/50 text-primary">In Progress</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                  No active tasks. ARIA is idling.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expansions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              What's Next: Expansion Ideas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ExpansionCard title="Gmail Integration" prompt="Teach ARIA to draft and send emails via Gmail OAuth — connect Google Workspace and implement compose + send via the Gmail API" />
              <ExpansionCard title="Voice Mode" prompt="Add voice mode — let ARIA speak responses aloud using the OpenAI audio API and transcribe voice input with gpt-4o-mini-transcribe" />
              <ExpansionCard title="GitHub Copilot" prompt="Build a GitHub Copilot-style code review workflow — ARIA monitors PRs, reviews diffs, and posts comments via the GitHub OAuth integration" />
              <ExpansionCard title="Vector Memory" prompt="Give ARIA a long-term memory upgrade — implement vector embeddings with pgvector so she can semantically search past conversations and memory entries" />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-4 h-4 text-muted-foreground" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {actionsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : actions && actions.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {/* Flattening activity days into a list, or just using raw actions if it's an action array */}
                  {/* The API schema says ListActionsParams returns ActivityDay[] or Action[]? Wait, useListActions returns Action[] based on schemas, but getListActions says ActivityDay[] maybe? The schema says ActivityDay { date, actions: Action[] } but the hook might return Action[]. Let's assume it's Action[] because of typical patterns, but I'll use a type-safe check. */}
                  {/* Wait, api.schemas.ts says ActivityDay contains Actions. Let's assume useListActions returns ActivityDay[] based on standard pagination. Actually, let's just map it safely. */}
                  {Array.isArray(actions) && (actions as any[]).map((item, i) => {
                    const isActivityDay = 'actions' in item;
                    if (isActivityDay) {
                      return item.actions.map((action: any) => <ActionItem key={action.id} action={action} />)
                    }
                    return <ActionItem key={item.id} action={item} />
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">No recent activity</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, loading }: any) {
  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold font-mono">
              {loading ? <Skeleton className="h-8 w-16" /> : value || 0}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ActionItem({ action }: { action: any }) {
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      <div className="flex items-center justify-center w-6 h-6 rounded-full border border-primary/30 bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
        <div className="w-2 h-2 rounded-full bg-primary" />
      </div>
      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-md bg-secondary/20 border border-border/50 text-sm">
        <span className="font-medium text-foreground block">{action.type}</span>
        <span className="text-muted-foreground">{action.description}</span>
      </div>
    </div>
  )
}

function ExpansionCard({ title, prompt }: { title: string, prompt: string }) {
  return (
    <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-[0_0_15px_-5px_hsl(var(--primary)/0.2)] transition-all cursor-pointer group">
      <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">{prompt}</p>
    </div>
  )
}
