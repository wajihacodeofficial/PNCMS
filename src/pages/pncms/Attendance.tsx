import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { StatCard, Section, Btn, Badge, Field, Input, Select, CompactToggle } from "@/components/pncms/ui-kit";
import { Users, CheckCircle2, XCircle, Clock, Calendar, Save, ChevronDown, Search, Filter, RotateCcw, Download, FileSpreadsheet, ArrowUpDown, History, Eye, Lock, Unlock, X, ShieldAlert, AlertTriangle, FileBarChart2, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { logAction } from "@/lib/audit";
import * as Tabs from "@radix-ui/react-tabs";
import { format, parseISO, isWithinInterval, subDays } from "date-fns";
import { usePersonnel, useAttendance, useDepartments, useMusterLock, useLockMuster, useUnlockMuster, useAllMusterLocks, useDeleteMuster, useBatchUpdateAttendance } from "@/hooks/use-api";
import { api } from "@/lib/api";

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
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [clerkName, setClerkName] = useState("Wajiha Zehra");
  
  const { data: personnel = [], isLoading: isPersonnelLoading, error: personnelError } = usePersonnel();
  const { data: attendance = [], isLoading: isAttendanceLoading, error: attendanceError, refetch: refetchAttendance } = useAttendance(selectedDate);

  const { data: lock } = useMusterLock(selectedDate);
  const { data: allLocks = [] } = useAllMusterLocks();
  const { mutate: lockMuster } = useLockMuster();
  const { mutate: unlockMuster } = useUnlockMuster();
  const { mutate: deleteMuster } = useDeleteMuster();
  const { mutate: batchUpdate } = useBatchUpdateAttendance();

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideUsername, setOverrideUsername] = useState("");
  const [overridePassword, setOverridePassword] = useState("");
  const [modalAction, setModalAction] = useState<"override" | "unlock" | "delete" | "mark-all" | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<{empId: string, status: string} | null>(null);
  const [targetDateForDelete, setTargetDateForDelete] = useState<string>("");
  const [isLocking, setIsLocking] = useState(false);
  // Optimistic local marks — applied instantly on click, cleared when server data re-arrives
  const [localMarks, setLocalMarks] = useState<Record<string, string>>({});

  // Reset local optimistic marks when date changes or attendance reloads
  useEffect(() => {
    setLocalMarks({});
  }, [selectedDate, attendance]);

  const filteredHistory = useMemo(() => {
    if (!Array.isArray(allLocks)) return [];
    return allLocks
      .filter(l => {
        if (!historySearch) return true;
        const formattedDate = safeFormat(l.date, "dd MMMM yyyy").toLowerCase();
        return formattedDate.includes(historySearch.toLowerCase()) || l.date.includes(historySearch);
      })
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [allLocks, historySearch]);

  useEffect(() => {
    const clk = localStorage.getItem("clerk_name");
    if (clk) setClerkName(clk);
  }, []);

  const currentMarks = useMemo(() => {
    const marks: Record<string, string> = {};
    if (!Array.isArray(attendance)) return marks;
    attendance.forEach(a => {
      if (a.serviceNo) marks[a.serviceNo] = a.status;
    });
    // Overlay optimistic local marks on top of server data
    return { ...marks, ...localMarks };
  }, [attendance, localMarks]);

  const markAttendance = async (serviceNo: string, status: string) => {
    if (lock) {
      setPendingUpdate({ empId: serviceNo, status });
      setModalAction("override");
      setShowOverrideModal(true);
      return;
    }

    // Apply optimistic update immediately so UI doesn't lag
    setLocalMarks(prev => ({ ...prev, [serviceNo]: status }));

    try {
      await api.updateAttendance(selectedDate, serviceNo, status);
      // Refetch from DB to confirm
      refetchAttendance();
      toast.success("Attendance updated");
    } catch (error: any) {
      // Revert optimistic update on failure
      setLocalMarks(prev => { const n = { ...prev }; delete n[serviceNo]; return n; });
      toast.error(error.message || "Failed to update attendance");
    }
  };

  const handleOverride = async () => {
    if (!pendingUpdate) return;
    // Apply optimistic update immediately
    setLocalMarks(prev => ({ ...prev, [pendingUpdate.empId]: pendingUpdate.status }));
    try {
      await api.updateAttendance(selectedDate, pendingUpdate.empId, pendingUpdate.status, overrideUsername, overridePassword);
      refetchAttendance();
      toast.success("Attendance updated with override");
      closeModal();
    } catch (error: any) {
      // Revert on failure
      setLocalMarks(prev => { const n = { ...prev }; delete n[pendingUpdate.empId]; return n; });
      toast.error(error.message || "Invalid credentials");
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

  const handleUnlockClick = () => {
    setModalAction("unlock");
    setShowOverrideModal(true);
  };

  const handleUnlock = () => {
    unlockMuster({ date: selectedDate, username: overrideUsername, password: overridePassword }, {
      onSuccess: () => {
        toast.success(`Muster Roll for ${selectedDate} has been unlocked.`);
        closeModal();
        api.createLog({
          user: clerkName,
          action: "UNLOCK",
          entity: `Muster Roll: ${selectedDate}`,
          result: "Success"
        });
      },
      onError: (err: any) => {
        toast.error(err.message || "Invalid credentials");
      }
    });
  };

  const handleMarkAllPresent = () => {
    if (lock) {
      setModalAction("mark-all");
      setShowOverrideModal(true);
      return;
    }
    executeMarkAllPresent();
  };

  const executeMarkAllPresent = (username?: string, password?: string) => {
    const updates = filteredList.map(p => ({ serviceNo: p.serviceNo, status: "P" }));
    // Apply optimistic update for all visible personnel
    const optimistic: Record<string, string> = {};
    filteredList.forEach(p => { optimistic[p.serviceNo] = "P"; });
    setLocalMarks(prev => ({ ...prev, ...optimistic }));
    batchUpdate({ date: selectedDate, updates, username, password }, {
      onSuccess: () => {
        refetchAttendance();
        toast.success("All visible personnel marked present");
        closeModal();
      },
      onError: (err: any) => {
        // Revert optimistic marks on failure
        setLocalMarks(prev => {
          const n = { ...prev };
          filteredList.forEach(p => delete n[p.serviceNo]);
          return n;
        });
        toast.error(err.message || "Failed to update attendance");
      }
    });
  };

  const handleDeleteMusterClick = (date: string) => {
    setTargetDateForDelete(date);
    setModalAction("delete");
    setShowOverrideModal(true);
  };

  const executeDeleteMuster = () => {
    deleteMuster({ date: targetDateForDelete, username: overrideUsername, password: overridePassword }, {
      onSuccess: () => {
        toast.success(`Muster Roll for ${targetDateForDelete} has been completely deleted.`);
        closeModal();
      },
      onError: (err: any) => {
        toast.error(err.message || "Invalid credentials");
      }
    });
  };

  const closeModal = () => {
    setShowOverrideModal(false);
    setOverrideUsername("");
    setOverridePassword("");
    setPendingUpdate(null);
    setModalAction(null);
    setTargetDateForDelete("");
  };

  const handleModalSubmit = () => {
    if (modalAction === "override") handleOverride();
    else if (modalAction === "unlock") handleUnlock();
    else if (modalAction === "delete") executeDeleteMuster();
    else if (modalAction === "mark-all") executeMarkAllPresent(overridePassword);
  };

  const filteredList = useMemo(() => {
    if (!Array.isArray(personnel)) return [];
    return personnel
      .filter(p => {
        const matchesSearch = (p.name || "").toLowerCase().includes(search.toLowerCase()) || (p.serviceNo || "").includes(search);
        const matchesDept = deptFilter === "All" || p.department?.name === deptFilter;
        return matchesSearch && matchesDept;
      })
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  }, [personnel, search, deptFilter]);

  const safeFormat = (dateStr: string, fmt: string) => {
    try {
      if (!dateStr) return "—";
      return format(parseISO(dateStr), fmt);
    } catch (e) {
      console.error("Date formatting error:", e);
      return "Invalid Date";
    }
  };

  const exportHistoricalMuster = async (date: string) => {
    try {
      toast.info("Generating PDF...");
      const historicalAttendance = await api.getAttendance(date);
      const marksMap: Record<string, string> = {};
      historicalAttendance.forEach((a: any) => {
        marksMap[a.serviceNo] = a.status;
      });

      const rows = filteredList.map(p => [
        p.serviceNo,
        p.name,
        marksMap[p.serviceNo] || "Pending"
      ]);

      exportToPDF(`Muster Roll - ${date}`, [["Svc No", "Name", "Status"]], rows, `muster_${date}`);
    } catch (err) {
      toast.error("Failed to generate PDF");
    }
  };

  const isLoadingData = isPersonnelLoading || isAttendanceLoading;

  if (personnelError || attendanceError) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4 text-destructive">
        <ShieldAlert className="w-12 h-12" />
        <h3 className="text-lg font-bold">Data Access Failure</h3>
        <p className="label-mil">{(personnelError as any)?.message || (attendanceError as any)?.message || "Internal system error"}</p>
        <Btn variant="outline" onClick={() => window.location.reload()}><RotateCcw className="w-4 h-4" /> Try Reconnecting</Btn>
      </div>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Muster Roll Control" subtitle="Daily Attendance Reporting & Verification"
        actions={
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => exportToPDF("Muster Roll", [["Svc No", "Name", "Status"]], filteredList.map(p=>[p.serviceNo, p.name, currentMarks[p.serviceNo]||"Pending"]), "muster_roll")}>
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Btn>
            {activeTab === "daily" && (
              lock ? (
                <Btn variant="gold" onClick={handleUnlockClick} className="bg-destructive hover:bg-destructive/90 text-white border-none">
                  <Unlock className="w-4 h-4 mr-2" /> Unlock Muster Roll
                </Btn>
              ) : (
                <Btn variant="gold" onClick={handleLock}>
                  <Lock className="w-4 h-4 mr-2" /> Lock Muster Roll
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

        <Tabs.Content value="daily" className="animate-in fade-in slide-in-from-left-2 outline-none">
          <Section 
            title={`Active Muster Roll · ${isLoadingData ? "..." : safeFormat(selectedDate, "dd MMMM yyyy")}`}
            actions={
              <div className="flex items-center gap-2 border-l border-border pl-3">
                 <span className="text-[0.6rem] font-bold text-muted-foreground uppercase">Muster Date</span>
                 <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="h-9 px-3 bg-muted/30 border border-border rounded-sm text-xs font-bold focus:outline-none focus:border-accent" />
              </div>
            }
          >
            {personnel.length === 0 ? (
              <div className="p-20 text-center flex flex-col items-center gap-4 text-muted-foreground">
                <Users className="w-12 h-12 opacity-20" />
                <h3 className="text-sm font-bold uppercase tracking-widest">{isLoadingData ? "Synchronizing Records..." : "No Personnel Records"}</h3>
                <p className="text-xs">{isLoadingData ? "Please wait while the system establishes a secure connection." : "Add civilian staff in the Employment Record panel first."}</p>
                {!isLoadingData && <Btn variant="outline" onClick={() => window.location.reload()}><RotateCcw className="w-4 h-4" /> Refresh System</Btn>}
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input placeholder="Search personnel..." className="w-full h-10 pl-10 pr-3 bg-muted/20 border border-border rounded-sm focus:outline-none focus:border-accent text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Btn variant="outline" onClick={handleMarkAllPresent}>
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Mark All Present
                    </Btn>
                  </div>
                </div>

                <div className="overflow-x-auto -m-5">
                  <table className="data-table">
                    <thead>
                      <tr><th>Svc No</th><th>Name</th><th>Rank</th><th>Department</th><th>Muster Status</th><th className="text-right">Action</th></tr>
                    </thead>
                    <tbody>
                      {filteredList.map((p, idx) => {
                        if (!p || !p.serviceNo) return null;
                        const mark = currentMarks[p.serviceNo] || "";
                        const personnelName = p.name || "Unknown Personnel";
                        const rankName = p.rank?.name || "—";
                        const deptName = p.department?.name || "—";

                        return (
                          <tr key={p.serviceNo || idx}>
                            <td className="font-mono text-xs font-bold text-primary">{p.serviceNo}</td>
                            <td className="font-semibold text-primary">{personnelName}</td>
                            <td className="text-muted-foreground text-xs">{rankName}</td>
                            <td className="text-xs font-bold uppercase text-muted-foreground/60">{deptName}</td>
                            <td>
                              {mark && STATUS_CONFIG[mark] ? (
                                <Badge variant={STATUS_CONFIG[mark].variant as any}>{STATUS_CONFIG[mark].label}</Badge>
                              ) : mark ? (
                                <Badge variant="info">{mark}</Badge>
                              ) : (
                                <span className="text-[0.6rem] font-bold text-muted-foreground italic">Pending...</span>
                              )}
                            </td>
                            <td className="text-right flex justify-end">
                               <CompactToggle
                                 value={mark}
                                 onChange={(val) => markAttendance(p.serviceNo, val as Mark)}
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
              </>
            )}
          </Section>
        </Tabs.Content>

        <Tabs.Content value="history" className="animate-in fade-in slide-in-from-right-2 outline-none">
          <Section title="Muster History Log" actions={
            <div className="text-[0.6rem] font-bold text-muted-foreground uppercase flex items-center gap-2">
              <ShieldAlert className="w-3 h-3" /> Verified Records Only
            </div>
          }>
             <div className="mb-5 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
               <input placeholder="Search history by date (e.g. 12 May 2026)..." className="w-full h-11 pl-10 pr-3 bg-muted/20 border border-border rounded-sm focus:outline-none focus:border-accent text-sm" value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} />
             </div>

             <div className="overflow-x-auto -m-5">
               <table className="data-table">
                 <thead>
                   <tr>
                     <th>Muster Date</th>
                     <th>Locked By</th>
                     <th>Verification Time</th>
                     <th>Status</th>
                     <th className="text-right">Action</th>
                   </tr>
                 </thead>
                 <tbody>
                   {filteredHistory.length === 0 ? (
                     <tr>
                       <td colSpan={5} className="text-center py-20 text-muted-foreground italic">
                         {historySearch ? "No history records match your search." : "No locked muster records found."}
                       </td>
                     </tr>
                   ) : filteredHistory.map((l: any) => (
                     <tr key={l.id || l.date} className="hover:bg-primary/5 transition-colors group">
                       <td className="font-mono text-sm font-bold text-primary">
                         {safeFormat(l.date, "dd MMMM yyyy")}
                       </td>
                       <td className="font-semibold">{l.lockedBy || "Admin"}</td>
                       <td className="text-xs text-muted-foreground">
                         {l.lockedAt ? new Date(l.lockedAt).toLocaleString('en-PK', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : "—"}
                       </td>
                       <td>
                         <Badge variant="success">Verified & Locked</Badge>
                       </td>
                       <td className="text-right">
                         <div className="flex justify-end gap-2">
                           <Btn 
                             variant="outline" 
                             className="h-8 text-[0.6rem] uppercase tracking-wider"
                             onClick={() => {
                               setSelectedDate(l.date);
                               setActiveTab("daily");
                             }}
                           >
                             <Eye className="w-3.5 h-3.5 mr-1.5" /> View Roll
                           </Btn>
                            <Btn 
                              variant="outline" 
                              className="h-8 text-[0.6rem] uppercase tracking-wider"
                              onClick={() => exportHistoricalMuster(l.date)}
                            >
                              <Download className="w-3.5 h-3.5 mr-1.5" /> Export
                            </Btn>
                           <Btn 
                             variant="outline" 
                             className="h-8 text-[0.6rem] uppercase tracking-wider text-danger hover:text-danger hover:bg-danger/10"
                             onClick={() => handleDeleteMusterClick(l.date)}
                           >
                             <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                           </Btn>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </Section>
        </Tabs.Content>
      </Tabs.Root>

      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="bg-card max-w-md w-full rounded-md shadow-elevated border border-border overflow-hidden">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between border-b border-white/10">
              <h2 className="text-lg text-white font-heading italic font-black uppercase tracking-tight">Security Verification</h2>
              <button onClick={closeModal} className="text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-2 border border-accent/20">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-primary">Restricted Action</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {modalAction === "delete" 
                    ? `This action will permanently delete the muster roll and all attendance records for ${targetDateForDelete}.` 
                    : `This muster roll is LOCKED. Admin credentials are required.`}
                </p>
              </div>
              <Field label="Admin Username">
                <Input 
                  placeholder="Username" 
                  value={overrideUsername} 
                  onChange={(e) => setOverrideUsername(e.target.value)} 
                />
              </Field>
              <Field label="System Password">
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  value={overridePassword} 
                  onChange={(e) => setOverridePassword(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleModalSubmit()}
                />
              </Field>
            </div>
            <div className="bg-muted/30 p-5 flex justify-end gap-3 border-t border-border">
              <Btn variant="outline" onClick={closeModal}>Abort</Btn>
              <Btn variant="danger" onClick={handleModalSubmit}>
                {modalAction === "delete" ? "Delete Muster" : "Verify & Proceed"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Attendance;
