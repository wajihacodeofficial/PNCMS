import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { StatCard, Section, Btn, Badge, Field, Input, Select, CompactToggle } from "@/components/pncms/ui-kit";
import { Users, CheckCircle2, XCircle, Clock, Calendar, Save, ChevronDown, Search, Filter, RotateCcw, Download, FileSpreadsheet, ArrowUpDown, History, Eye, Lock, Unlock, X, ShieldAlert, AlertTriangle } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { personnel } from "@/data/mock";
import { toast } from "sonner";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { logAction } from "@/lib/audit";
import * as Tabs from "@radix-ui/react-tabs";
import { format, parseISO, isWithinInterval } from "date-fns";
import { useLocation } from "react-router-dom";

type Mark = "P" | "A" | "L" | "CL" | "ML" | "RL" | "LWOP" | "DL" | "LFP" | "";

const STATUS_CONFIG: Record<string, { label: string; variant: string; color: string }> = {
  P: { label: "Present", variant: "success", color: "text-success" },
  A: { label: "Absent", variant: "danger", color: "text-danger" },
  L: { label: "Late", variant: "warning", color: "text-warning" },
  CL: { label: "Casual Leave", variant: "info", color: "text-info" },
  RL: { label: "Recreational Leave", variant: "info", color: "text-info" },
  LWOP: { label: "Leave without pay", variant: "info", color: "text-info" },
  DL: { label: "Disability Leave", variant: "info", color: "text-info" },
  LFP: { label: "Leave on Full Pay", variant: "info", color: "text-info" },
};

const Attendance = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedDate, setSelectedDate] = useState("2026-04-28");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [clerkName, setClerkName] = useState("Wajiha Zehra");
  
  const [submittedDates, setSubmittedDates] = useState<string[]>(["2026-04-27", "2026-04-01"]);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockUsername, setUnlockUsername] = useState("");
  const [unlockPassword, setUnlockPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [history, setHistory] = useState<Record<string, Record<string, Mark>>>(() => {
    const saved = localStorage.getItem('pncms_attendance_history');
    return saved ? JSON.parse(saved) : {
      "2026-04-28": { "10420":"P","10430":"P","10440":"CL","10450":"P","10460":"A","10470":"L" }
    };
  });

  useEffect(() => {
    const clk = localStorage.getItem("clerk_name");
    if (clk) setClerkName(clk);
  }, []);

  useEffect(() => {
    localStorage.setItem('pncms_attendance_history', JSON.stringify(history));
  }, [history]);

  const currentMarks = history[selectedDate] || {};
  const isLocked = submittedDates.includes(selectedDate);

  const checkLockAndAct = (action: () => void) => {
    if (isLocked) {
      setPendingAction(() => action);
      setShowUnlockModal(true);
    } else {
      action();
    }
  };

  const handleUnlockSubmit = () => {
    const savedPass = localStorage.getItem("secret_password") || "998877";
    if (unlockUsername === 'Administrator' && unlockPassword === savedPass) {
      toast.success("Administrative Authority Verified.");
      setShowUnlockModal(false);
      setUnlockUsername("");
      setUnlockPassword("");
      if (pendingAction) {
        logAction("OVERRIDE", "Muster Roll Security Bypass", "Success");
        pendingAction();
        setPendingAction(null);
      }
    } else {
      toast.error("Authorization Failed: Invalid Admin Credentials");
    }
  };

  const markAttendance = (svc: string, mark: Mark) => {
    checkLockAndAct(() => {
      setHistory(prev => ({
        ...prev,
        [selectedDate]: { ...(prev[selectedDate] || {}), [svc]: mark }
      }));
    });
  };

  const handleSubmitFinal = () => {
    checkLockAndAct(() => {
      setSubmittedDates(prev => [...prev, selectedDate]);
      logAction("LOCK", `Muster Roll: ${selectedDate}`, "Success");
      toast.success("Muster Roll Locked");
    });
  };

  const filteredList = useMemo(() => {
    return personnel
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.svc.includes(search);
        const matchesDept = deptFilter === "All" || p.dept === deptFilter;
        return matchesSearch && matchesDept;
      })
      .sort((a, b) => {
        if (sortField === "name") return a.name.localeCompare(b.name);
        if (sortField === "svc") return a.svc.localeCompare(b.svc);
        return 0;
      });
  }, [search, sortField, deptFilter]);

  const handlePDF = () => {
    const headers = [["#", "Svc No", "Name", "Rank", "Department", "Muster Status"]];
    const rows = filteredList.map((p, i) => [
      i + 1, p.svc, p.name, p.rank, p.dept, STATUS_CONFIG[currentMarks[p.svc]]?.label || "UNMARKED"
    ]);

    exportToPDF(
      `Daily Muster Roll - ${selectedDate}`, headers, rows, 
      `muster_roll_${selectedDate}`,
      { period: format(parseISO(selectedDate), "MMMM yyyy"), dept: deptFilter, clerk: `${clerkName} · DIL-ADM-04` }
    );
    toast.success("Official Muster Roll PDF Generated");
  };

  return (
    <AppShell>
      <PageHeader title="Muster Roll Control" subtitle="Daily Attendance Reporting & Verification"
        actions={
          <div className="flex gap-2">
            <Btn variant="outline" onClick={handlePDF}><Download className="w-4 h-4" /> Export PDF</Btn>
            <Btn variant="gold" onClick={handleSubmitFinal}><Lock className="w-4 h-4" /> Lock Muster Roll</Btn>
          </div>
        }
      />

      <Section 
        title={`Active Muster Roll · ${format(parseISO(selectedDate), "dd MMMM yyyy")}`}
        actions={
          <div className="flex items-center gap-2 border-l border-border pl-3">
             <span className="text-[0.6rem] font-bold text-muted-foreground uppercase">Muster Date</span>
             <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-9 px-3 bg-muted/30 border border-border rounded-sm text-xs font-bold focus:outline-none focus:border-accent" />
          </div>
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-1 min-w-[300px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input placeholder="Search personnel..." className="w-full h-10 pl-10 pr-3 bg-muted/20 border border-border rounded-sm focus:outline-none focus:border-accent text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select className="w-48" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
               <option value="All">All Departments</option>
               {Array.from(new Set(personnel.map(p => p.dept))).map(d => <option key={d}>{d}</option>)}
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr><th>Svc No</th><th>Name</th><th>Rank</th><th>Department</th><th>Muster Status</th><th className="text-right">Action</th></tr>
            </thead>
            <tbody>
              {filteredList.map(p => {
                const mark = currentMarks[p.svc] || "";
                return (
                  <tr key={p.svc}>
                    <td className="font-mono text-xs font-bold text-primary">{p.svc}</td>
                    <td className="font-semibold text-primary">{p.name}</td>
                    <td className="text-muted-foreground text-xs">{p.rank}</td>
                    <td className="text-xs font-bold uppercase text-muted-foreground/60">{p.dept}</td>
                    <td>
                      {mark ? (
                        <Badge variant={STATUS_CONFIG[mark]?.variant as any}>{STATUS_CONFIG[mark]?.label}</Badge>
                      ) : (
                        <span className="text-[0.6rem] font-bold text-muted-foreground italic">Pending...</span>
                      )}
                    </td>
                    <td className="text-right flex justify-end">
                       <CompactToggle
                         value={mark}
                         onChange={(val) => markAttendance(p.svc, val as Mark)}
                         options={[
                           { value: "P", label: "Present", variant: "success" },
                           { value: "A", label: "Absent", variant: "danger" },
                           { value: "L", label: "Late", variant: "warning" },
                           { value: "CL", label: "Casual Leave", variant: "info" },
                           { value: "RL", label: "Recreational Leave", variant: "info" },
                           { value: "ML", label: "Maternity Leave", variant: "info" },
                           { value: "LWOP", label: "Leave without pay", variant: "info" },
                           { value: "DL", label: "Disability Leave", variant: "info" },
                           { value: "LFP", label: "Leave on Full Pay", variant: "info" },
                         ]}
                       />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {showUnlockModal && (
        <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-md rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
            <div className="bg-destructive px-6 py-4 flex items-center justify-between text-white"><div className="flex items-center gap-3"><ShieldAlert className="w-5 h-5" /><h3 className="text-lg font-heading font-bold uppercase tracking-wider text-white">Security Override</h3></div><button onClick={() => { setShowUnlockModal(false); setPendingAction(null); }} className="text-white/70 hover:text-white"><X className="w-5 h-5"/></button></div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-sm text-xs text-destructive leading-relaxed font-bold uppercase">Critical Task: Administrative Authorization Required.</div>
              <div className="space-y-4">
                <Field label="Admin Username" required><Input placeholder="Username" value={unlockUsername} onChange={(e) => setUnlockUsername(e.target.value)} /></Field>
                <Field label="System Password" required><Input type="password" placeholder="••••••••" value={unlockPassword} onChange={(e) => setUnlockPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlockSubmit()} /></Field>
              </div>
            </div>
            <div className="bg-muted/30 p-4 border-t border-border flex justify-end gap-3"><Btn variant="outline" onClick={() => { setShowUnlockModal(false); setPendingAction(null); }}>Abort</Btn><Btn variant="danger" onClick={handleUnlockSubmit}><Unlock className="w-4 h-4" /> Verify & Unlock</Btn></div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Attendance;
