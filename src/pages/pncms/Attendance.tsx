import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { StatCard, Section, Btn, Badge, Field, Input } from "@/components/pncms/ui-kit";
import { Users, CheckCircle2, XCircle, Clock, Calendar, Save, ChevronDown, Search, Filter, RotateCcw, Download, FileSpreadsheet, ArrowUpDown, History, Eye, Lock, Unlock, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { personnel } from "@/data/mock";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import * as Tabs from "@radix-ui/react-tabs";
import { format, parseISO, isWithinInterval } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Mark = "P" | "A" | "L" | "CL" | "ML" | "RL" | "LWOP" | "DL" | "LFP" | "";

const leaveTypes = [
  { code: "CL", label: "Casual Leave" },
  { code: "ML", label: "Maternity Leave" },
  { code: "RL", label: "Recreational Leave" },
  { code: "LWOP", label: "Leave without pay" },
  { code: "DL", label: "Disability Leave" },
  { code: "LFP", label: "Leave on Full Pay" },
] as const;

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const Attendance = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedDate, setSelectedDate] = useState("2026-04-28");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  
  // History Filters
  const [selectedHistoryYear, setSelectedHistoryYear] = useState<string>("2026");
  const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<string>("April");

  // Lock Mechanism
  const [submittedDates, setSubmittedDates] = useState<string[]>(["2026-04-27", "2026-04-01"]);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [history, setHistory] = useState<Record<string, Record<string, Mark>>>(() => {
    const saved = localStorage.getItem('pncms_attendance_history');
    return saved ? JSON.parse(saved) : {
      "2026-04-28": {
        "10420":"P","10430":"P","10440":"L","10450":"P",
        "10460":"A","10470":"P","10480":"A","10490":"P"
      }
    };
  });

  useEffect(() => {
    localStorage.setItem('pncms_attendance_history', JSON.stringify(history));
  }, [history]);

  // Auto-marking logic for leave
  useEffect(() => {
    const leaveRecords = JSON.parse(localStorage.getItem('pncms_leave_records') || '[]');
    const currentDay = parseISO(selectedDate);
    
    setHistory(prev => {
      const newDayMarks = { ...(prev[selectedDate] || {}) };
      let changed = false;

      leaveRecords.forEach((record: any) => {
        if (record.status === 'Submitted') {
          const start = parseISO(record.from);
          const end = parseISO(record.to);
          if (isWithinInterval(currentDay, { start, end })) {
            if (newDayMarks[record.svc] !== record.type) {
              newDayMarks[record.svc] = record.type as Mark;
              changed = true;
            }
          }
        }
      });

      if (changed) {
        return { ...prev, [selectedDate]: newDayMarks };
      }
      return prev;
    });
  }, [selectedDate]);
  
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

  const handleUnlock = () => {
    if (unlockPassword === "1234567890") {
      setShowUnlockModal(false);
      setUnlockPassword("");
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      toast.success("Muster roll unlocked for editing");
    } else {
      toast.error("Incorrect secret password");
    }
  };

  const setMark = (svc: string, mark: Mark) => {
    checkLockAndAct(() => {
      setHistory(prev => ({
        ...prev,
        [selectedDate]: {
          ...(prev[selectedDate] || {}),
          [svc]: mark
        }
      }));
    });
  };
  
  const markAllPresent = () => {
    checkLockAndAct(() => {
      const newDayMarks: Record<string, Mark> = {};
      personnel.forEach(p => {
        newDayMarks[p.svc] = "P";
      });
      const leaveRecords = JSON.parse(localStorage.getItem('pncms_leave_records') || '[]');
      const currentDay = parseISO(selectedDate);
      leaveRecords.forEach((record: any) => {
        if (record.status === 'Submitted' && isWithinInterval(currentDay, { start: parseISO(record.from), end: parseISO(record.to) })) {
          newDayMarks[record.svc] = record.type as Mark;
        }
      });
      setHistory(prev => ({ ...prev, [selectedDate]: newDayMarks }));
      toast.success(`All personnel marked Present (excluding leave) for ${selectedDate}`);
    });
  };

  const resetMarks = () => {
    checkLockAndAct(() => {
      setHistory(prev => ({ ...prev, [selectedDate]: {} }));
      toast.info(`Muster roll reset for ${selectedDate}`);
    });
  };

  const handleSubmit = () => {
    if (!submittedDates.includes(selectedDate)) {
      setSubmittedDates([...submittedDates, selectedDate]);
      toast.success(`Muster roll submitted and locked for ${selectedDate}`);
    } else {
      toast.info("Muster roll is already submitted and locked.");
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Daily Muster Roll - ${selectedDate}`, 14, 22);
    autoTable(doc, {
      startY: 30,
      head: [['Service No', 'Name', 'Department', 'Status']],
      body: filteredPersonnel.map(p => {
        const m = currentMarks[p.svc] || "Unmarked";
        return [p.svc, p.name, p.dept, m === "P" ? "Present" : m === "A" ? "Absent" : m === "L" ? "Late" : m];
      }),
      headStyles: { fillStyle: 'F', fillColor: [24, 44, 71] }
    });
    doc.save(`Muster_Roll_${selectedDate}.pdf`);
  };

  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Muster - ${selectedDate}`);
    worksheet.columns = [
      { header: 'Service No', key: 'svc', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Department', key: 'dept', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
    ];
    filteredPersonnel.forEach(p => {
      const m = currentMarks[p.svc] || "Unmarked";
      worksheet.addRow({
        svc: p.svc,
        name: p.name,
        dept: p.dept,
        status: m === "P" ? "Present" : m === "A" ? "Absent" : m === "L" ? "Late" : m
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Muster_Roll_${selectedDate}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const departments = ["All", ...new Set(personnel.map(p => p.dept))];

  const filteredPersonnel = useMemo(() => {
    let result = personnel.filter(p => 
      (p.name.toLowerCase().includes(search.toLowerCase()) || p.svc.toLowerCase().includes(search.toLowerCase())) &&
      (deptFilter === "All" || p.dept === deptFilter)
    );
    result.sort((a: any, b: any) => {
      let valA, valB;
      if (sortField === "status") {
        valA = currentMarks[a.svc] || "";
        valB = currentMarks[b.svc] || "";
      } else {
        valA = a[sortField];
        valB = b[sortField];
      }
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
    return result;
  }, [search, deptFilter, sortField, currentMarks]);

  const historyStats = useMemo(() => {
    const allDates = Array.from(new Set([...Object.keys(history), ...submittedDates]));
    return allDates
      .map((date) => {
        const marks = history[date] || {};
        const vals = Object.values(marks);
        const dateObj = parseISO(date);
        const year = format(dateObj, "yyyy");
        const month = format(dateObj, "MMMM");
        const day = format(dateObj, "do EEEE");
        const displayDate = format(dateObj, "dd-MM-yyyy");
        return {
          date,
          displayDate,
          year,
          month,
          day,
          present: vals.filter(v => v === "P").length,
          absent: vals.filter(v => v === "A").length,
          onLeave: vals.filter(v => v !== "" && v !== "P" && v !== "A" && v !== "L").length,
          total: personnel.length,
          isLocked: submittedDates.includes(date)
        };
      })
      .filter(s => s.year === selectedHistoryYear && s.month === selectedHistoryMonth)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [history, selectedHistoryYear, selectedHistoryMonth, submittedDates]);

  const availableYears = useMemo(() => {
    const allDates = Array.from(new Set([...Object.keys(history), ...submittedDates]));
    return Array.from(new Set(allDates.map(d => format(parseISO(d), "yyyy")))).sort().reverse();
  }, [history, submittedDates]);

  const total = personnel.length;
  const present = Object.values(currentMarks).filter(v=>v==="P").length;
  const absent = Object.values(currentMarks).filter(v=>v==="A").length;
  const late = Object.values(currentMarks).filter(v=>v==="L").length;
  const onLeave = Object.values(currentMarks).filter(v=> v !== "" && v !== "P" && v !== "A" && v !== "L").length;

  return (
    <AppShell>
      <PageHeader
        title="Attendance Management"
        subtitle="Muster Roll & Historical Records"
        actions={
          activeTab === "daily" && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-card border border-border rounded-sm px-3 h-10 shadow-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm font-semibold focus:outline-none" 
                />
              </div>
              <Btn variant="outline" onClick={exportExcel}><FileSpreadsheet className="w-4 h-4" /> Excel</Btn>
              <Btn variant="outline" onClick={exportPDF}><Download className="w-4 h-4" /> PDF</Btn>
              <Btn variant={isLocked ? "success" : "gold"} onClick={handleSubmit}>
                {isLocked ? <Lock className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {isLocked ? "Submitted" : "Submit"}
              </Btn>
            </div>
          )
        }
      />

      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <Tabs.List className="flex gap-4 border-b border-border pb-px">
          <Tabs.Trigger value="daily" className="px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-primary transition-all flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Daily Muster Roll
          </Tabs.Trigger>
          <Tabs.Trigger value="history" className="px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-primary transition-all flex items-center gap-2">
            <History className="w-4 h-4" /> Attendance History
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="daily" className="animate-in fade-in slide-in-from-left-2 space-y-6">
          <div className="grid grid-cols-5 gap-4">
            <StatCard label="Total Personnel" value={total} sub="Roster strength" accent="primary" icon={<Users className="w-5 h-5"/>} />
            <StatCard label="Present" value={present} sub={`${Math.round(present/total*100)}%`} accent="success" icon={<CheckCircle2 className="w-5 h-5"/>} />
            <StatCard label="Absent" value={absent} sub={`${Math.round(absent/total*100)}%`} accent="danger" icon={<XCircle className="w-5 h-5"/>} />
            <StatCard label="Late" value={late} sub="Delayed entry" accent="warning" icon={<Clock className="w-5 h-5"/>} />
            <StatCard label="On Leave" value={onLeave} sub="Authorized absence" accent="info" icon={<Calendar className="w-5 h-5"/>} />
          </div>

          <Section 
            title={
              <div className="flex items-center gap-3">
                Daily Roster · {selectedDate}
                {isLocked && <Badge variant="success" className="ml-2 animate-in fade-in"><Lock className="w-3 h-3 mr-1" /> Locked</Badge>}
              </div>
            }
            actions={
              <div className="flex gap-2">
                <Btn variant="outline" className="h-8 py-0 px-2 text-[0.65rem]" onClick={resetMarks}>
                  <RotateCcw className="w-3 h-3" /> Reset
                </Btn>
                <Btn variant="gold" className="h-8 py-0 px-2 text-[0.65rem]" onClick={markAllPresent}>
                  <CheckCircle2 className="w-3 h-3" /> Mark All Present
                </Btn>
              </div>
            }
          >
            <div className="mb-5 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input placeholder="Search by name or service number..." className="w-full h-10 pl-10 pr-3 bg-muted/30 border border-border rounded-sm focus:outline-none focus:border-accent transition-colors" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select className="h-10 px-3 bg-muted/30 border border-border rounded-sm text-sm focus:outline-none" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto -m-5">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Service No</th>
                    <th>Name</th>
                    <th className="cursor-pointer hover:bg-primary/90" onClick={() => setSortField("dept")}><div className="flex items-center gap-2">Department <ArrowUpDown className="w-3 h-3" /></div></th>
                    <th className="cursor-pointer hover:bg-primary/90" onClick={() => setSortField("status")}><div className="flex items-center gap-2">Status <ArrowUpDown className="w-3 h-3" /></div></th>
                    <th className="text-right">Quick Mark</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonnel.map((p) => {
                    const m = currentMarks[p.svc] || "";
                    const isLeave = leaveTypes.some(lt => lt.code === m);
                    return (
                      <tr key={p.svc}>
                        <td className="font-mono text-xs font-semibold text-primary">{p.svc}</td>
                        <td className="font-semibold">{p.name}</td>
                        <td className="text-muted-foreground text-xs">{p.dept}</td>
                        <td>
                          {m==="P" && <Badge variant="success">Present</Badge>}
                          {m==="A" && <Badge variant="danger">Absent</Badge>}
                          {m==="L" && <Badge variant="warning">Late</Badge>}
                          {isLeave && <Badge variant="info">Leave ({m})</Badge>}
                          {m==="" && <Badge className="animate-pulse bg-destructive/5 text-destructive border-destructive/20 text-[0.6rem]">Unmarked</Badge>}
                        </td>
                        <td className="text-right">
                          <div className="inline-flex rounded-sm overflow-hidden border border-border shadow-sm">
                            <button onClick={()=>setMark(p.svc,"P")} className={`px-4 py-1.5 text-[0.65rem] font-bold ${m==="P"?"bg-success text-white":"hover:bg-success/10 text-success"}`}>P</button>
                            <button onClick={()=>setMark(p.svc,"A")} className={`px-4 py-1.5 text-[0.65rem] font-bold border-l border-border ${m==="A"?"bg-destructive text-white":"hover:bg-destructive/10 text-destructive"}`}>A</button>
                            <button onClick={()=>setMark(p.svc,"L")} className={`px-4 py-1.5 text-[0.65rem] font-bold border-l border-border ${m==="L"?"bg-warning text-white":"hover:bg-warning/10 text-warning"}`}>L</button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className={`px-3 py-1.5 text-[0.65rem] font-bold border-l border-border flex items-center gap-1 ${isLeave?"bg-info text-white":"hover:bg-info/10 text-info"}`}>
                                  {isLeave ? m : "Leave"} <ChevronDown className="w-3 h-3" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                                {leaveTypes.map((lt) => (
                                  <DropdownMenuItem key={lt.code} onClick={() => setMark(p.svc, lt.code)} className="cursor-pointer text-xs">{lt.label} ({lt.code})</DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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
          <Section title="Historical Muster Records">
            <div className="mb-6 flex gap-4">
              <div className="flex-1 max-w-48">
                <span className="label-mil text-[0.6rem] block mb-1.5 text-muted-foreground">Select Year</span>
                <select className="w-full h-10 px-3 bg-muted/30 border border-border rounded-sm text-sm font-bold text-primary focus:outline-none focus:border-accent" value={selectedHistoryYear} onChange={(e) => setSelectedHistoryYear(e.target.value)}>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="flex-1 max-w-48">
                <span className="label-mil text-[0.6rem] block mb-1.5 text-muted-foreground">Select Month</span>
                <select className="w-full h-10 px-3 bg-muted/30 border border-border rounded-sm text-sm font-bold text-primary focus:outline-none focus:border-accent" value={selectedHistoryMonth} onChange={(e) => setSelectedHistoryMonth(e.target.value)}>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto -m-5">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date / Day</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>On Leave</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {historyStats.map((s) => (
                    <tr key={s.date}>
                      <td>
                        <div className="font-bold text-primary">{s.displayDate}</div>
                        <div className="text-[0.65rem] text-muted-foreground uppercase font-mono">{s.day}</div>
                      </td>
                      <td className="font-mono text-success font-bold">{s.present}</td>
                      <td className="font-mono text-destructive font-bold">{s.absent}</td>
                      <td className="font-mono text-info font-bold">{s.onLeave}</td>
                      <td>
                        {s.isLocked ? <Badge variant="success"><Lock className="w-3 h-3 mr-1" /> Locked</Badge> : <Badge variant="warning">Draft</Badge>}
                      </td>
                      <td className="text-right">
                        <Btn variant="outline" className="h-8 py-0 px-3 text-[0.65rem]" onClick={() => { setSelectedDate(s.date); setActiveTab("daily"); }}>
                          <Eye className="w-3 h-3 mr-1" /> View Muster
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </Tabs.Content>
      </Tabs.Root>

      {showUnlockModal && (
        <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-md shadow-elevated border border-border flex flex-col overflow-hidden">
            <div className="bg-destructive/10 px-6 py-4 flex items-center justify-between border-b border-destructive/20">
              <div className="flex items-center gap-3 text-destructive">
                <Lock className="w-5 h-5" />
                <h3 className="text-lg font-heading font-bold">Secure Verification Required</h3>
              </div>
              <button onClick={() => setShowUnlockModal(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                This muster roll has been <strong>submitted and locked</strong>. To modify any details, please enter the secret administrator password.
              </p>
              <Field label="Administrator Password">
                <Input 
                  type="password" 
                  placeholder="Enter 10-digit secret key"
                  value={unlockPassword} 
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                />
              </Field>
            </div>
            <div className="bg-muted/30 p-4 border-t border-border flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setShowUnlockModal(false)}>Cancel</Btn>
              <Btn variant="gold" onClick={handleUnlock}>Verify & Unlock</Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Attendance;
