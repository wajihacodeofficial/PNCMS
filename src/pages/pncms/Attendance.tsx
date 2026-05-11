import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { StatCard, Section, Btn, Badge, Field, Input, Select, CompactToggle } from "@/components/pncms/ui-kit";
import { Users, CheckCircle2, XCircle, Clock, Calendar, Save, ChevronDown, Search, Filter, RotateCcw, Download, FileSpreadsheet, ArrowUpDown, History, Eye, Lock, Unlock, X, ShieldAlert, AlertTriangle, FileBarChart2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { logAction } from "@/lib/audit";
import * as Tabs from "@radix-ui/react-tabs";
import { format, parseISO, isWithinInterval, subDays } from "date-fns";
import { usePersonnel, useAttendance, useDepartments, useMusterLock, useLockMuster, useUnlockMuster } from "@/hooks/use-api";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [clerkName, setClerkName] = useState("Wajiha Zehra");
  
  const { data: personnel = [], isLoading: isPersonnelLoading } = usePersonnel();
  const { data: attendance = [], isLoading: isAttendanceLoading } = useAttendance(selectedDate);

  const { data: lock } = useMusterLock(selectedDate);
  const { mutate: lockMuster } = useLockMuster();
  const { mutate: unlockMuster } = useUnlockMuster();

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overridePassword, setOverridePassword] = useState("");
  const [pendingUpdate, setPendingUpdate] = useState<{empId: string, status: string} | null>(null);
  const [isLocking, setIsLocking] = useState(false);

  useEffect(() => {
    const clk = localStorage.getItem("clerk_name");
    if (clk) setClerkName(clk);
  }, []);

  const currentMarks = useMemo(() => {
    const marks: Record<string, string> = {};
    (attendance as any[]).forEach(a => {
      marks[a.employeeId] = a.status;
    });
    return marks;
  }, [attendance]);

  const markAttendance = async (employeeId: string, status: string) => {
    if (lock) {
      setPendingUpdate({ empId: employeeId, status });
      setShowOverrideModal(true);
      return;
    }

    try {
      await api.updateAttendance(selectedDate, employeeId, status);
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedDate] });
      toast.success("Attendance updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update attendance");
    }
  };

  const handleOverride = async () => {
    if (!pendingUpdate) return;
    try {
      await api.updateAttendance(selectedDate, pendingUpdate.empId, pendingUpdate.status, overridePassword);
      queryClient.invalidateQueries({ queryKey: ['attendance', selectedDate] });
      toast.success("Attendance updated with override");
      setShowOverrideModal(false);
      setOverridePassword("");
      setPendingUpdate(null);
    } catch (error: any) {
      toast.error(error.message || "Invalid secret password");
    }
  };

  const handleLock = () => {
    lockMuster({ date: selectedDate, lockedBy: clerkName }, {
      onSuccess: () => {
        toast.success(`Muster Roll for ${selectedDate} has been locked.`);
        api.createLog({
          user: clerkName,
          action: "LOCK",
          entity: `Muster Roll: ${selectedDate}`,
          result: "Success"
        });
      }
    });
  };

  const handleUnlock = () => {
    unlockMuster({ date: selectedDate, password: overridePassword }, {
      onSuccess: () => {
        toast.success(`Muster Roll for ${selectedDate} has been unlocked.`);
        setShowOverrideModal(false);
        setOverridePassword("");
        api.createLog({
          user: clerkName,
          action: "UNLOCK",
          entity: `Muster Roll: ${selectedDate}`,
          result: "Success"
        });
      },
      onError: (err: any) => {
        toast.error(err.message || "Invalid secret password");
      }
    });
  };

  const filteredList = useMemo(() => {
    return (personnel as any[])
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.serviceNo.includes(search);
        const matchesDept = deptFilter === "All" || p.department?.name === deptFilter;
        return matchesSearch && matchesDept;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [personnel, search, deptFilter]);

  if (isPersonnelLoading || isAttendanceLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <AppShell>
      <PageHeader title="Muster Roll Control" subtitle="Daily Attendance Reporting & Verification"
        actions={
          <div className="flex gap-2">
            <Btn variant="outline"><Download className="w-4 h-4" /> Export PDF</Btn>
            {activeTab === "daily" && (
              lock ? (
                <Btn variant="gold" onClick={() => setShowOverrideModal(true)} className="bg-destructive hover:bg-destructive/90 text-white border-none">
                  <Unlock className="w-4 h-4" /> Unlock Muster Roll
                </Btn>
              ) : (
                <Btn variant="gold" onClick={handleLock}>
                  <Lock className="w-4 h-4" /> Lock Muster Roll
                </Btn>
              )
            )}
          </div>
        }
      />

      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Tabs.List className="flex gap-1 border-b border-border mb-6">
          <Tabs.Trigger value="daily" className="px-6 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-primary hover:text-primary transition-all flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Daily Entry
          </Tabs.Trigger>
          <Tabs.Trigger value="history" className="px-6 py-3 text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-primary hover:text-primary transition-all flex items-center gap-2">
            <History className="w-4 h-4" /> Muster History
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="daily" className="animate-in fade-in slide-in-from-left-2">
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
              </div>
            </div>

            <div className="overflow-x-auto -m-5">
              <table className="data-table">
                <thead>
                  <tr><th>Svc No</th><th>Name</th><th>Rank</th><th>Department</th><th>Muster Status</th><th className="text-right">Action</th></tr>
                </thead>
                <tbody>
                  {filteredList.map(p => {
                    const mark = currentMarks[p.id] || "";
                    return (
                      <tr key={p.id}>
                        <td className="font-mono text-xs font-bold text-primary">{p.serviceNo}</td>
                        <td className="font-semibold text-primary">{p.name}</td>
                        <td className="text-muted-foreground text-xs">{p.rank?.name}</td>
                        <td className="text-xs font-bold uppercase text-muted-foreground/60">{p.department?.name}</td>
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
                             onChange={(val) => markAttendance(p.id, val as Mark)}
                             options={[
                               { value: "P", label: "Present", variant: "success" },
                               { value: "A", label: "Absent", variant: "danger" },
                               { value: "L", label: "Late", variant: "warning" },
                               { value: "CL", label: "Casual Leave", variant: "info" },
                               { value: "RL", label: "Recreational Leave", variant: "info" },
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
        </Tabs.Content>

        <Tabs.Content value="history" className="animate-in fade-in slide-in-from-right-2">
          <Section title="Muster History Log">
             <div className="py-20 text-center text-muted-foreground italic">
               <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
               Muster history is maintained through the Audit Trail and Sanction registers.
             </div>
          </Section>
        </Tabs.Content>
      </Tabs.Root>

      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="bg-card max-w-md w-full rounded-md shadow-elevated border border-border overflow-hidden">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between border-b border-white/10">
              <h2 className="text-lg text-white font-heading italic font-black uppercase tracking-tight">Security Verification</h2>
              <button onClick={() => { setShowOverrideModal(false); setPendingUpdate(null); setOverridePassword(""); }} className="text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-4 border border-accent/20">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-primary mb-2">Restricted Action</h3>
              <p className="text-sm text-muted-foreground mb-6">
                This muster roll is <b>LOCKED</b>. Enter the administrative secret password to {pendingUpdate ? 'perform this update' : 'unlock this date'}.
              </p>
              <Input
                type="password"
                placeholder="Enter Secret Password"
                className="text-center h-12 text-lg tracking-[0.3em]"
                value={overridePassword}
                onChange={(e) => setOverridePassword(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    pendingUpdate ? handleOverride() : handleUnlock();
                  }
                }}
              />
              <div className="mt-8 flex gap-3">
                <Btn variant="outline" className="flex-1" onClick={() => { setShowOverrideModal(false); setPendingUpdate(null); setOverridePassword(""); }}>Cancel</Btn>
                <Btn variant="gold" className="flex-1" onClick={pendingUpdate ? handleOverride : handleUnlock}>Verify & Proceed</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Attendance;
