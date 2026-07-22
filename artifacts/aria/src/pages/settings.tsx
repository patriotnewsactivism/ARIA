import { useState, useEffect } from "react"
import { useGetAgent, useUpdateAgent } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function Settings() {
  const queryClient = useQueryClient()
  const { data: agent, isLoading } = useGetAgent()
  const updateMutation = useUpdateAgent()

  const [formData, setFormData] = useState({
    name: "",
    persona: "",
    systemPrompt: "",
    timezone: "",
    language: ""
  })

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || "",
        persona: agent.persona || "",
        systemPrompt: agent.systemPrompt || "",
        timezone: agent.timezone || "UTC",
        language: agent.language || "en"
      })
    }
  }, [agent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate({ data: formData }, {
      onSuccess: () => {
        toast.success("Settings saved successfully")
        queryClient.invalidateQueries({ queryKey: ["/api/agent"] })
      },
      onError: () => {
        toast.error("Failed to save settings")
      }
    })
  }

  if (isLoading) return <div className="p-8">Loading settings...</div>

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Agent Settings</h1>
        <p className="text-muted-foreground">Configure ARIA's identity, behavior, and preferences.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
            <CardDescription>Basic details about your coworker.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persona">Persona / Title</Label>
                <Input
                  id="persona"
                  value={formData.persona}
                  onChange={e => setFormData({ ...formData, persona: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemPrompt">Core Instructions (System Prompt)</Label>
              <Textarea
                id="systemPrompt"
                value={formData.systemPrompt}
                onChange={e => setFormData({ ...formData, systemPrompt: e.target.value })}
                className="min-h-[150px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">These instructions govern ARIA's primary behavior across all interactions.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Localization</CardTitle>
            <CardDescription>Regional settings for autonomous tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select value={formData.timezone} onValueChange={v => setFormData({ ...formData, timezone: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time (US)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (US)</SelectItem>
                    <SelectItem value="Europe/London">London (UK)</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo (Japan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={formData.language} onValueChange={v => setFormData({ ...formData, language: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending} className="gap-2 w-32">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </Button>
        </div>
      </form>
    </div>
  )
}
