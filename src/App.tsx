import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/pncms/Login";
import Dashboard from "./pages/pncms/Dashboard";
import Personnel from "./pages/pncms/Personnel";
import Sanctions from "./pages/pncms/Sanctions";
import WorkLogs from "./pages/pncms/WorkLogs";
import Payments from "./pages/pncms/Payments";
import Leave from "./pages/pncms/Leave";
import Attendance from "./pages/pncms/Attendance";
import Reports from "./pages/pncms/Reports";
import Settings from "./pages/pncms/Settings";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/personnel" element={<Personnel />} />
          <Route path="/sanctions" element={<Sanctions />} />
          <Route path="/work-logs" element={<WorkLogs />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
