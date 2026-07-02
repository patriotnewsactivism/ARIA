import { useListIntegrations, useConnectIntegration, useDisconnectIntegration, useUpdateIntegration, getListIntegrationsQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { ExternalLink, CheckCircle2, AlertTriangle, Link2Off, Link2 } from "lucide-react"

export default function Integrations() {
  const queryClient = useQueryClient()
  const { data: integrations, isLoading } = useListIntegrations()
  const connectMutation = useConnectIntegration()
  const disconnectMutation = useDisconnectIntegration()
  const updateMutation = useUpdateIntegration()

  const handleConnect = (id: number) => {
    connectMutation.mutate({ id }, {
      onSuccess: (res) => {
        if (res.authUrl) {
          window.location.href = res.authUrl // Redirect to OAuth
        } else {
          queryClient.invalidateQueries({ queryKey: getListIntegrationsQueryKey() })
        }
      }
    })
  }

  const handleDisconnect = (id: number) => {
    disconnectMutation.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListIntegrationsQueryKey() })
    })
  }

  const toggleEnabled = (id: number, enabled: boolean) => {
    updateMutation.mutate({ id, data: { enabled } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListIntegrationsQueryKey() })
    })
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Integrations Hub</h1>
        <p className="text-muted-foreground">Connect ARIA to your favorite tools and platforms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)
        ) : integrations?.map(integration => (
          <Card key={integration.id} className="relative overflow-hidden group">
            {integration.status === 'connected' && (
              <div className="absolute top-0 right-0 p-4">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]"></div>
              </div>
            )}
            
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center mb-4 border border-border">
                {/* Fallback icon since we might not have actual image assets */}
                <span className="text-xl font-bold">{integration.name.charAt(0)}</span>
              </div>
              <CardTitle className="flex items-center gap-2">
                {integration.name}
                {integration.status === 'connected' && (
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">Connected</Badge>
                )}
              </CardTitle>
              <CardDescription className="h-10 line-clamp-2">{integration.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="pb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground capitalize">{integration.category}</span>
                {integration.status === 'connected' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Enabled</span>
                    <Switch 
                      checked={integration.enabled} 
                      onCheckedChange={(c) => toggleEnabled(integration.id, c)}
                    />
                  </div>
                ) : (
                  <span className="text-muted-foreground opacity-50">Not configured</span>
                )}
              </div>
            </CardContent>

            <CardFooter className="border-t border-border pt-4 bg-secondary/10">
              {integration.status === 'connected' ? (
                <Button 
                  variant="outline" 
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                  onClick={() => handleDisconnect(integration.id)}
                  disabled={disconnectMutation.isPending}
                >
                  <Link2Off className="w-4 h-4 mr-2" /> Disconnect
                </Button>
              ) : (
                <Button 
                  className="w-full"
                  onClick={() => handleConnect(integration.id)}
                  disabled={connectMutation.isPending}
                >
                  <Link2 className="w-4 h-4 mr-2" /> Connect
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
