import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { StatCard, Section, Btn, Badge } from "@/components/pncms/ui-kit";
import { Users, CheckCircle2, XCircle, Clock, Calendar, Save, ChevronDown, Search, Filter, RotateCcw } from "lucide-react";
import { useState, useMemo } from "react";
import { personnel } from "@/data/mock";
import { toast } from "sonner";
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

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState("2026-04-28");
  const [search, setSearch] = useState("");
  
  // Multi-day attendance storage: Record<dateString, Record<serviceNo, Mark>>
  const [history, setHistory] = useState<Record<string, Record<string, Mark>>>({
    "2026-04-28": {
      "PN-CIV-1042":"P","PN-CIV-1043":"P","PN-CIV-1044":"L","PN-CIV-1045":"P",
      "PN-CIV-1046":"A","PN-CIV-1047":"P","PN-CIV-1048":"A","PN-CIV-1049":"P"
    },
    "2026-04-27": {
      "PN-CIV-1042":"P","PN-CIV-1043":"P","PN-CIV-1044":"P","PN-CIV-1045":"P",
      "PN-CIV-1046":"P","PN-CIV-1047":"P","PN-CIV-1048":"P","PN-CIV-1049":"P"
    }
  });
  
  // Get marks for the current selected date
  const currentMarks = history[selectedDate] || {};
  
  const setMark = (svc: string, mark: Mark) => {
    setHistory(prev => ({
      ...prev,
      [selectedDate]: {
        ...(prev[selectedDate] || {}),
        [svc]: mark
      }
    }));
  };
  
  const markAllPresent = () => {
    const newDayMarks = { ...currentMarks };
    personnel.forEach(p => {
      if (!newDayMarks[p.svc]) newDayMarks[p.svc] = "P";
    });
    setHistory(prev => ({ ...prev, [selectedDate]: newDayMarks }));
    toast.success(`All personnel marked Present for ${selectedDate}`);
  };

  const resetMarks = () => {
    setHistory(prev => ({ ...prev, [selectedDate]: {} }));
    toast.info(`Muster roll reset for ${selectedDate}`);
  };

  const handleSubmit = () => {
    toast.success(`Muster roll submitted and locked for ${selectedDate}`);
  };

  const filteredPersonnel = useMemo(() => {
    return personnel.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.svc.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const total = personnel.length;
  const present = Object.values(currentMarks).filter(v=>v==="P").length;
  const absent = Object.values(currentMarks).filter(v=>v==="A").length;
  const late = Object.values(currentMarks).filter(v=>v==="L").length;
  const onLeave = Object.values(currentMarks).filter(v=> v !== "" && v !== "P" && v !== "A" && v !== "L").length;

  return (
    <AppShell>
      <PageHeader
        title="Daily Muster Roll"
        subtitle="Attendance · Live Marking Terminal"
        actions={
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
            <Btn variant="gold" onClick={handleSubmit}><Save className="w-4 h-4" /> Submit Muster</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Personnel" value={total} sub="Roster strength" accent="primary" icon={<Users className="w-5 h-5"/>} />
        <StatCard label="Present" value={present} sub={`${Math.round(present/total*100)}%`} accent="success" icon={<CheckCircle2 className="w-5 h-5"/>} />
        <StatCard label="Absent" value={absent} sub={`${Math.round(absent/total*100)}%`} accent="danger" icon={<XCircle className="w-5 h-5"/>} />
        <StatCard label="Late" value={late} sub="Delayed entry" accent="warning" icon={<Clock className="w-5 h-5"/>} />
        <StatCard label="On Leave" value={onLeave} sub="Authorized absence" accent="info" icon={<Calendar className="w-5 h-5"/>} />
      </div>

      <Section 
        title={`Muster Roll · ${selectedDate}`}
        actions={
          <div className="flex gap-2">
            <Btn variant="outline" className="h-8 py-0 px-2" onClick={resetMarks}>
              <RotateCcw className="w-3 h-3" /> Reset
            </Btn>
            <Btn variant="gold" className="h-8 py-0 px-2" onClick={markAllPresent}>
              <CheckCircle2 className="w-3 h-3" /> Mark All Present
            </Btn>
          </div>
        }
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Search personnel by name or service number..." 
              className="w-full h-10 pl-10 pr-3 bg-muted/30 border border-border rounded-sm focus:outline-none focus:border-accent transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr><th>Service No</th><th>Name</th><th>Department</th><th>Status</th><th className="text-right">Quick Mark</th></tr>
            </thead>
            <tbody>
              {filteredPersonnel.map((p) => {
                const m = currentMarks[p.svc] || "";
                const isLeave = leaveTypes.some(lt => lt.code === m);
                
                return (
                  <tr key={p.svc} className="hover:bg-muted/20 transition-colors">
                    <td className="font-mono text-xs font-semibold text-primary">{p.svc}</td>
                    <td className="font-semibold">{p.name}</td>
                    <td className="text-muted-foreground text-xs">{p.dept}</td>
                    <td>
                      {m==="P" && <Badge variant="success">Present</Badge>}
                      {m==="A" && <Badge variant="danger">Absent</Badge>}
                      {m==="L" && <Badge variant="warning">Late</Badge>}
                      {isLeave && <Badge variant="info">Leave ({m})</Badge>}
                      {m==="" && <Badge className="animate-pulse bg-destructive/5 text-destructive border-destructive/20">Unmarked</Badge>}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex rounded-sm overflow-hidden border border-border shadow-sm">
                        <button 
                          onClick={()=>setMark(p.svc,"P")} 
                          className={`px-4 py-1.5 text-[0.65rem] font-bold uppercase transition-all duration-200 ${m==="P"?"bg-success text-white scale-105 shadow-inner":"hover:bg-success/10 text-success"}`}
                        >P</button>
                        <button 
                          onClick={()=>setMark(p.svc,"A")} 
                          className={`px-4 py-1.5 text-[0.65rem] font-bold uppercase border-l border-border transition-all duration-200 ${m==="A"?"bg-destructive text-white scale-105 shadow-inner":"hover:bg-destructive/10 text-destructive"}`}
                        >A</button>
                        <button 
                          onClick={()=>setMark(p.svc,"L")} 
                          className={`px-4 py-1.5 text-[0.65rem] font-bold uppercase border-l border-border transition-all duration-200 ${m==="L"?"bg-warning text-white scale-105 shadow-inner":"hover:bg-warning/10 text-warning"}`}
                        >L</button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={`px-3 py-1.5 text-[0.65rem] font-bold uppercase border-l border-border flex items-center gap-1 transition-all duration-200 ${isLeave?"bg-info text-white":"hover:bg-info/10 text-info"}`}>
                              {isLeave ? m : "Leave"} <ChevronDown className="w-3 h-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                            {leaveTypes.map((lt) => (
                              <DropdownMenuItem key={lt.code} onClick={() => setMark(p.svc, lt.code)} className="flex items-center justify-between cursor-pointer">
                                <span className="text-xs">{lt.label}</span>
                                <span className="text-[0.6rem] font-bold text-accent">{lt.code}</span>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredPersonnel.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-muted-foreground italic">
                    No personnel found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </AppShell>
  );
};

export default Attendance;
