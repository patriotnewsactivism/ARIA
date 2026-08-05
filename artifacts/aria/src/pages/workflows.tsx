import { useListWorkflows, useToggleWorkflow } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Workflow as WorkflowIcon, Clock, ArrowRight, Play, Settings } from "lucide-react"

export default function Workflows() {
  const queryClient = useQueryClient()
  const { data: workflows, isLoading } = useListWorkflows()
  const toggleMutation = useToggleWorkflow()

  const handleToggle = (id: number) => {
    toggleMutation.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/workflows"] }) // fallback cache key logic
    })
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">Automated sequences triggered by events or schedules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : workflows?.map(workflow => (
          <Card key={workflow.id} className="border-l-4 border-l-primary hover:bg-secondary/10 transition-colors">
            <CardContent className="p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{workflow.name}</h3>
                  <Badge variant={workflow.enabled ? "default" : "secondary"}>
                    {workflow.enabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{workflow.description}</p>
                <div className="flex items-center gap-4 text-sm font-mono mt-4 text-primary/80">
                  <span className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                    <Settings className="w-3 h-3" /> {workflow.trigger}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-foreground">
                    <WorkflowIcon className="w-3 h-3" /> {workflow.steps.split(/[,\n]/).filter(Boolean).length} steps
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">Runs</p>
                  <p className="text-xl font-mono">{workflow.runCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">Last Run</p>
                  <p className="text-sm font-mono text-muted-foreground">
                    {workflow.lastRunAt ? new Date(workflow.lastRunAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={workflow.enabled} 
                    onCheckedChange={() => handleToggle(workflow.id)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
