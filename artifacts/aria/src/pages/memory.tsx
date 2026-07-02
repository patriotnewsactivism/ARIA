import { useListMemory, useCreateMemoryEntry, useDeleteMemoryEntry, getListMemoryQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Database, Pin, Trash2, Plus } from "lucide-react"

export default function Memory() {
  const { data: memories, isLoading } = useListMemory()
  const deleteMutation = useDeleteMemoryEntry()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")

  const filteredMemories = memories?.filter(m => 
    m.key.toLowerCase().includes(search.toLowerCase()) || 
    m.value.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Memory Browser</h1>
          <p className="text-muted-foreground">Explore and manage ARIA's long-term knowledge base.</p>
        </div>
        <AddMemoryDialog />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search memories, facts, preferences..." 
          className="pl-9 bg-card"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)
        ) : filteredMemories.length > 0 ? (
          filteredMemories.map(memory => (
            <Card key={memory.id} className="group relative overflow-hidden">
              {memory.pinned && (
                <div className="absolute top-0 right-0 p-3">
                  <Pin className="w-4 h-4 text-primary fill-primary" />
                </div>
              )}
              <CardHeader className="pb-2 pr-10">
                <Badge variant="secondary" className="w-fit mb-2">{memory.category}</Badge>
                <CardTitle className="text-base font-mono truncate">{memory.key}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{memory.value}</p>
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate({ id: memory.id }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListMemoryQueryKey() })})}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-xl">
            <Database className="w-12 h-12 mb-4 text-border" />
            <p>No memory entries found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function AddMemoryDialog() {
  const [open, setOpen] = useState(false)
  const [key, setKey] = useState("")
  const [value, setValue] = useState("")
  const [category, setCategory] = useState("general")
  
  const createMutation = useCreateMemoryEntry()
  const queryClient = useQueryClient()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!key.trim() || !value.trim()) return
    
    createMutation.mutate({
      data: { key, value, category }
    }, {
      onSuccess: () => {
        setOpen(false)
        setKey("")
        setValue("")
        setCategory("general")
        queryClient.invalidateQueries({ queryKey: getListMemoryQueryKey() })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Fact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add to Memory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="key">Key / Topic</Label>
              <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="e.g. User.Preferences.Theme" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. general" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value / Content</Label>
              <Textarea 
                id="value" 
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
                placeholder="The fact to remember..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!key.trim() || !value.trim() || createMutation.isPending}>
              Save to Memory
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
