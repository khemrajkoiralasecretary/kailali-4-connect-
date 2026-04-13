import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { CitizenAuthProvider } from "@/lib/citizenAuth";
import { setAdminTokenGetter } from "@workspace/api-client-react";
import Layout from "@/components/Layout";

import Dashboard from "@/pages/Dashboard";
import Complaints from "@/pages/Complaints";
import ComplaintNew from "@/pages/ComplaintNew";
import ComplaintDetail from "@/pages/ComplaintDetail";
import Ideas from "@/pages/Ideas";
import IdeaNew from "@/pages/IdeaNew";
import News from "@/pages/News";
import NewsNew from "@/pages/NewsNew";
import Directory from "@/pages/Directory";
import Team from "@/pages/Team";
import Admin from "@/pages/Admin";
import About from "@/pages/About";
import CitizenDashboard from "@/pages/CitizenDashboard";
import TeamApply from "@/pages/TeamApply";
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
        <Route path="/directory" component={Directory} />
        <Route path="/team" component={Team} />
        <Route path="/about" component={About} />
        <Route path="/citizen" component={CitizenDashboard} />
        <Route path="/team/apply" component={TeamApply} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

setAdminTokenGetter(() => sessionStorage.getItem("k4-admin-token"));

function ThemeInit() {
  useEffect(() => {
    const saved = localStorage.getItem("k4-theme");
    if (saved && saved !== "red") {
      document.documentElement.classList.add(`theme-${saved}`);
    }
  }, []);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInit />
      <CitizenAuthProvider>
      <I18nProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </I18nProvider>
      </CitizenAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
