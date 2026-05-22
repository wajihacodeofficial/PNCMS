import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/pncms/Login";
import Dashboard from "./pages/pncms/Dashboard";
import EmploymentRecords from "./pages/pncms/EmploymentRecords";
import OvertimeSystem from "./pages/pncms/OvertimeSystem";
import LeaveDashboard from "./pages/pncms/LeaveDashboard";
import LeaveEntry from "./pages/pncms/LeaveEntry";
import LeaveLedger from "./pages/pncms/LeaveLedger";
import Attendance from "./pages/pncms/Attendance";
import Reports from "./pages/pncms/Reports";
import Settings from "./pages/pncms/Settings";
import EmploymentRecordForm from "./pages/pncms/EmploymentRecordForm";
import EmploymentRecordProfile from "./pages/pncms/EmploymentRecordProfile";
import SanctionEntry from "./pages/pncms/SanctionEntry";
import ReportPreview from "./pages/pncms/ReportPreview";
import Backup from "./pages/pncms/Backup";

import Help from "./pages/pncms/Help";
import About from "./pages/pncms/About";
import Departments from "./pages/pncms/Departments";
import Ranks from "./pages/pncms/Ranks";
import Discipline from "./pages/pncms/Discipline";
import Payments from "./pages/pncms/Payments";
import NotFound from "./pages/NotFound.tsx";
import { useRealtimeSync } from "./hooks/use-api";

const RealtimeSyncManager = () => {
  useRealtimeSync();
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <RealtimeSyncManager />
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employment-records" element={<EmploymentRecords />} />
          <Route path="/employment-records/new" element={<EmploymentRecordForm />} />
          <Route path="/employment-records/edit/:id" element={<EmploymentRecordForm />} />
          <Route path="/employment-records/:id" element={<EmploymentRecordProfile />} />
          <Route path="/overtime" element={<OvertimeSystem />} />
          <Route path="/sanctions/new" element={<SanctionEntry />} />
          <Route path="/leave" element={<LeaveDashboard />} />
          <Route path="/leave/new" element={<LeaveEntry />} />
          <Route path="/leave/ledger" element={<LeaveLedger />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:slug" element={<ReportPreview />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/departments" element={<Departments />} />
          <Route path="/settings/ranks" element={<Ranks />} />
          <Route path="/discipline" element={<Discipline />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/backup" element={<Backup />} />

          <Route path="/help" element={<Help />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
