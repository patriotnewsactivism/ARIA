import * as React from "react"
import { Link, useLocation } from "wouter"
import { cn } from "@/lib/utils"
import { 
  Bot, 
  MessageSquare, 
  CheckSquare, 
  TerminalSquare, 
  Blocks, 
  Database, 
  Settings,
  Activity,
  Workflow,
  Menu,
  X
} from "lucide-react"

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false)

  // Close the mobile drawer whenever the route changes
  React.useEffect(() => {
    setMobileNavOpen(false)
  }, [location])

  const navItems = [
    { href: "/", label: "Dashboard", icon: Activity },
    { href: "/chat", label: "Chat", icon: MessageSquare },
    { href: "/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/shell", label: "Shell", icon: TerminalSquare },
    { href: "/integrations", label: "Integrations", icon: Blocks },
    { href: "/memory", label: "Memory", icon: Database },
    { href: "/workflows", label: "Workflows", icon: Workflow },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground">
      {/* Mobile top bar (hidden on md+) */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 flex items-center gap-3 px-4 h-14 border-b border-border bg-sidebar">
        <button
          type="button"
          onClick={() => setMobileNavOpen((v) => !v)}
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
          className="w-9 h-9 -ml-1 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30 shrink-0">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <h1 className="font-bold text-base tracking-tight text-foreground truncate">ARIA</h1>
      </div>

      {/* Mobile backdrop, closes drawer on tap */}
      {mobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: fixed off-canvas drawer on mobile, static column on md+ */}
      <aside
        className={cn(
          "w-64 border-r border-border bg-sidebar flex flex-col shrink-0 overflow-y-auto",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-out",
          "md:static md:translate-x-0",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center glow-border border border-primary/30">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-foreground">ARIA</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest">AI Coworker</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group relative",
                isActive 
                  ? "bg-primary/10 text-primary glow-text" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full shadow-[0_0_8px_hsl(var(--primary))]" />
                )}
                <item.icon className={cn(
                  "w-5 h-5",
                  isActive ? "text-primary drop-shadow-[0_0_5px_hsl(var(--primary))]" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border border-border/50 text-xs">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] animate-pulse" />
            <span className="text-muted-foreground font-mono">System Online</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
