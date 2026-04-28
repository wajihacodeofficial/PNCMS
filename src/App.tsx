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
import EmployeeForm from "./pages/pncms/EmployeeForm";
import EmployeeProfile from "./pages/pncms/EmployeeProfile";
import SanctionEntry from "./pages/pncms/SanctionEntry";
import LeaveDashboard from "./pages/pncms/LeaveDashboard";
import LeaveEntry from "./pages/pncms/LeaveEntry";
import LeaveLedger from "./pages/pncms/LeaveLedger";
import ReportPreview from "./pages/pncms/ReportPreview";
import Backup from "./pages/pncms/Backup";
import AuditLog from "./pages/pncms/AuditLog";
import Notifications from "./pages/pncms/Notifications";
import Help from "./pages/pncms/Help";
import About from "./pages/pncms/About";
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
          <Route path="/personnel/new" element={<EmployeeForm />} />
          <Route path="/personnel/edit/:id" element={<EmployeeForm />} />
          <Route path="/personnel/:id" element={<EmployeeProfile />} />
          <Route path="/sanctions" element={<Sanctions />} />
          <Route path="/sanctions/new" element={<SanctionEntry />} />
          <Route path="/work-logs" element={<WorkLogs />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/leave" element={<LeaveDashboard />} />
          <Route path="/leave/balances" element={<Leave />} />
          <Route path="/leave/new" element={<LeaveEntry />} />
          <Route path="/leave/ledger" element={<LeaveLedger />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:slug" element={<ReportPreview />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/backup" element={<Backup />} />
          <Route path="/audit" element={<AuditLog />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
