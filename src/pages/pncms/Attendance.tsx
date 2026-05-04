import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { StatCard, Section, Btn, Badge, Field, Input, Select, CompactToggle } from "@/components/pncms/ui-kit";
import { Users, CheckCircle2, XCircle, Clock, Calendar, Save, ChevronDown, Search, Filter, RotateCcw, Download, FileSpreadsheet, ArrowUpDown, History, Eye, Lock, Unlock, X, ShieldAlert, AlertTriangle, FileBarChart2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { personnel } from "@/data/mock";
import { toast } from "sonner";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { logAction } from "@/lib/audit";
import * as Tabs from "@radix-ui/react-tabs";
import { format, parseISO, isWithinInterval, subDays } from "date-fns";
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
  
  const [submittedDates, setSubmittedDates] = useState<string[]>(() => {
    const saved = localStorage.getItem('pncms_submitted_dates');
    return saved ? JSON.parse(saved).sort() : ["2026-04-01", "2026-04-27"];
  });
  
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

  useEffect(() => {
    localStorage.setItem('pncms_submitted_dates', JSON.stringify(submittedDates));
  }, [submittedDates]);

  const sortedSubmittedDates = useMemo(() => [...submittedDates].sort(), [submittedDates]);
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

  const [reportRange, setReportRange] = useState({ 
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"), 
    end: "", 
    freq: "Monthly Muster Roll" 
  });

  const handleHistoricalReport = async (type: 'pdf' | 'excel') => {
    const effectiveEnd = reportRange.end || reportRange.start;
    toast.loading(`Generating ${reportRange.freq}...`);
    
    // Filter history dates within range
    const rangeDates = Object.keys(history).filter(d => 
      isWithinInterval(parseISO(d), { start: parseISO(reportRange.start), end: parseISO(effectiveEnd) })
    ).sort();

    if (rangeDates.length === 0) {
      toast.dismiss();
      toast.error("No muster records found for the selected range");
      return;
    }

    const headers = [["#", "Muster Date", "Strength", "Present", "Absent", "Leave/Others"]];
    const rows = rangeDates.map((date, i) => {
      const marks = Object.values(history[date]);
      const p = marks.filter(m => m === "P").length;
      const a = marks.filter(m => m === "A").length;
      return [i + 1, date, personnel.length, p, a, personnel.length - (p + a)];
    });

    try {
      if (type === 'pdf') {
        exportToPDF(
          `Muster History Report - ${reportRange.freq}`, 
          headers, 
          rows, 
          `muster_report_${reportRange.start}_to_${reportRange.end}`,
          { period: `${reportRange.start} to ${reportRange.end}`, dept: deptFilter, clerk: `${clerkName} · DIL-ADM-04` }
        );
      } else {
        await exportToExcel("Muster History", headers[0], rows, `muster_history_${reportRange.start}`);
      }
      toast.dismiss();
      toast.success("Report generated successfully");
    } catch (err) {
      toast.dismiss();
      toast.error("Report generation failed");
    }
  };


  const getMusterStats = (date: string) => {
    const dayMarks = history[date] || {};
    const marks = Object.values(dayMarks);
    const p = marks.filter(m => m === "P").length;
    const a = marks.filter(m => m === "A").length;
    return {
      strength: personnel.length,
      present: p,
      absent: a,
      others: personnel.length - (p + a)
    };
  };

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
            {activeTab === "daily" && (
              <Btn variant="gold" onClick={handleSubmitFinal}><Lock className="w-4 h-4" /> Lock Muster Roll</Btn>
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

        <Tabs.Content value="history" className="animate-in fade-in slide-in-from-right-2 space-y-6">
          <div className="grid grid-cols-4 gap-4">
             <StatCard label="Total Locked Rolls" value={submittedDates.length} sub="historical entries" icon={<Lock className="w-5 h-5"/>} accent="success" />
             <StatCard label="Avg. Daily Presence" value="98%" sub="past 30 days" icon={<Users className="w-5 h-5"/>} accent="primary" />
             <StatCard label="Absence Rate" value="2.1%" sub="cumulative" icon={<XCircle className="w-5 h-5"/>} accent="danger" />
             <StatCard label="Late Arrivals" value={12} sub="this month" icon={<Clock className="w-5 h-5"/>} accent="warning" />
          </div>

          <div className="grid grid-cols-12 gap-6">
            <Section title="Muster Report Engine" className="col-span-12 lg:col-span-4">
              <div className="space-y-4">
                <Field label="Report Frequency">
                  <Select className="w-full" value={reportRange.freq} onChange={e => setReportRange({...reportRange, freq: e.target.value})}>
                    <option>Daily Detailed Report</option>
                    <option>Weekly Summary</option>
                    <option>Monthly Muster Roll</option>
                    <option>Yearly Attendance Stats</option>
                    <option>Custom Range</option>
                  </Select>
                </Field>
                {reportRange.freq === "Custom Range" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start Date">
                      <Input type="date" value={reportRange.start} onChange={e => setReportRange({...reportRange, start: e.target.value})} />
                    </Field>
                    <Field label="End Date">
                      <Input type="date" value={reportRange.end} onChange={e => setReportRange({...reportRange, end: e.target.value})} />
                    </Field>
                  </div>
                ) : reportRange.freq === "Weekly Summary" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Select Month">
                      <Input 
                        type="month" 
                        value={reportRange.start.substring(0, 7)} 
                        onChange={e => setReportRange({...reportRange, start: `${e.target.value}-01`, end: ""})} 
                      />
                    </Field>
                    <Field label="Select Week">
                      <Select defaultValue="1">
                        <option value="1">Week 1 (01-07)</option>
                        <option value="2">Week 2 (08-14)</option>
                        <option value="3">Week 3 (15-21)</option>
                        <option value="4">Week 4 (22-28)</option>
                        <option value="5">Week 5 (29+)</option>
                      </Select>
                    </Field>
                  </div>
                ) : reportRange.freq === "Monthly Muster Roll" ? (
                  <Field label="Select Month">
                    <Input 
                      type="month" 
                      value={reportRange.start.substring(0, 7)} 
                      onChange={e => setReportRange({...reportRange, start: `${e.target.value}-01`, end: ""})} 
                    />
                  </Field>
                ) : reportRange.freq === "Yearly Attendance Stats" ? (
                  <Field label="Select Year">
                    <Select 
                      value={reportRange.start.substring(0, 4)} 
                      onChange={e => setReportRange({...reportRange, start: `${e.target.value}-01-01`, end: ""})}
                    >
                      {["2026", "2025", "2024"].map(y => <option key={y} value={y}>{y}</option>)}
                    </Select>
                  </Field>
                ) : (
                  <Field label="Select Date">
                    <Input 
                      type="date" 
                      value={reportRange.start} 
                      onChange={e => setReportRange({...reportRange, start: e.target.value, end: ""})} 
                    />
                  </Field>
                )}
                <Field label="Department Filter">
                  <Select className="w-full" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                    <option value="All">All Departments</option>
                    {Array.from(new Set(personnel.map(p => p.dept))).map(d => <option key={d}>{d}</option>)}
                  </Select>
                </Field>
                <div className="pt-4 space-y-2">
                  <Btn className="w-full" variant="primary" onClick={() => handleHistoricalReport('pdf')}>
                    <FileBarChart2 className="w-4 h-4 mr-2" /> Generate Report
                  </Btn>
                  <Btn className="w-full" variant="outline" onClick={() => handleHistoricalReport('excel')}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Export to Excel
                  </Btn>
                </div>
              </div>
            </Section>

            <Section title="Submitted & Locked Muster Rolls" className="col-span-12 lg:col-span-8">
              <div className="overflow-x-auto -m-5 mt-0">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Muster Date</th>
                      <th>Strength</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSubmittedDates.map((date, i) => {
                      const stats = getMusterStats(date);
                      return (
                        <tr key={i}>
                          <td className="font-bold text-primary font-mono">{format(parseISO(date), "dd-MMM-yyyy")}</td>
                          <td>{stats.strength}</td>
                          <td className="text-success font-bold">{stats.present}</td>
                          <td className="text-danger font-bold">{stats.absent}</td>
                          <td><Badge variant="success">LOCKED</Badge></td>
                          <td className="text-right">
                            <div className="flex justify-end gap-2">
                              <Btn variant="ghost" size="sm" onClick={() => { setSelectedDate(date); setActiveTab("daily"); }}>
                                <Eye className="w-4 h-4 mr-1" /> View
                              </Btn>
                              <Btn variant="outline" size="sm" onClick={() => {
                                const headers = [["#", "Svc No", "Name", "Rank", "Department", "Muster Status"]];
                                const dayHistory = history[date] || {};
                                const rows = personnel.map((p, j) => [
                                  j + 1, p.svc, p.name, p.rank, p.dept, STATUS_CONFIG[dayHistory[p.svc]]?.label || "UNMARKED"
                                ]);
                                exportToPDF(`Muster Roll - ${date}`, headers, rows, `muster_roll_${date}`, { period: date, dept: "All", clerk: clerkName });
                              }}>
                                <Download className="w-4 h-4 mr-1" /> PDF
                              </Btn>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </Tabs.Content>
      </Tabs.Root>

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
