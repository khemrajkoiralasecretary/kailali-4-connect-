import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Complaints from "@/pages/Complaints";
import ComplaintNew from "@/pages/ComplaintNew";
import ComplaintDetail from "@/pages/ComplaintDetail";
import Ideas from "@/pages/Ideas";
import IdeaNew from "@/pages/IdeaNew";
import News from "@/pages/News";
import NewsNew from "@/pages/NewsNew";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/complaints/new" component={ComplaintNew} />
        <Route path="/complaints/:id" component={ComplaintDetail} />
        <Route path="/complaints" component={Complaints} />
        <Route path="/ideas/new" component={IdeaNew} />
        <Route path="/ideas" component={Ideas} />
        <Route path="/news/new" component={NewsNew} />
        <Route path="/news" component={News} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
