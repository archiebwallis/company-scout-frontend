import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import NewRun from "./pages/NewRun";
import ScoringConfigs from "./pages/ScoringConfigs";
import ConfigEditor from "./pages/ConfigEditor";
import RunDetail from "./pages/RunDetail";
import CompanyDetail from "./pages/CompanyDetail";
import Visualization from "./pages/Visualization";
import Runs from "./pages/Runs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/runs" element={<Runs />} />
            <Route path="/runs/new" element={<NewRun />} />
            <Route path="/runs/:id" element={<RunDetail />} />
            <Route path="/runs/:id/companies/:companyId" element={<CompanyDetail />} />
            <Route path="/runs/:id/visualize" element={<Visualization />} />
            <Route path="/configs" element={<ScoringConfigs />} />
            <Route path="/configs/new" element={<ConfigEditor />} />
            <Route path="/configs/:id" element={<ConfigEditor />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
