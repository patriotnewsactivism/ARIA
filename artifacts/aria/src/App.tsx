import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { Shell } from './components/layout/shell';
import { Toaster } from './components/ui/toaster';

// Pages
import Dashboard from './pages/dashboard';
import Chat from './pages/chat';
import Tasks from './pages/tasks';
import ShellTerminal from './pages/shell';
import Integrations from './pages/integrations';
import Memory from './pages/memory';
import Workflows from './pages/workflows';
import Settings from './pages/settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function NotFound() {
  return (
    <div className="flex h-full w-full items-center justify-center flex-col space-y-4 text-muted-foreground">
      <h1 className="text-4xl font-bold font-mono text-primary">404</h1>
      <p>Module not found in ARIA's databanks.</p>
    </div>
  );
}

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/chat" component={Chat} />
        <Route path="/chat/:id" component={Chat} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/shell" component={ShellTerminal} />
        <Route path="/integrations" component={Integrations} />
        <Route path="/memory" component={Memory} />
        <Route path="/workflows" component={Workflows} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
