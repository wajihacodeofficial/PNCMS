import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { StatCard, Section, Btn, Badge } from "@/components/pncms/ui-kit";
import { Users, CheckCircle2, XCircle, Clock, Calendar, Save, ChevronDown } from "lucide-react";
import { useState } from "react";
import { personnel } from "@/data/mock";
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
  const [marks, setMarks] = useState<Record<string, Mark>>({
    "PN-CIV-1042":"P","PN-CIV-1043":"P","PN-CIV-1044":"L","PN-CIV-1045":"P","PN-CIV-1046":"A","PN-CIV-1047":"P","PN-CIV-1048":"A","PN-CIV-1049":"P"
  });
  
  const set = (k:string, v:Mark) => setMarks({...marks, [k]: v});
  
  const total = personnel.length;
  const present = Object.values(marks).filter(v=>v==="P").length;
  const absent = Object.values(marks).filter(v=>v==="A").length;
  const late = Object.values(marks).filter(v=>v==="L").length;
  const onLeave = Object.values(marks).filter(v=> v !== "" && v !== "P" && v !== "A" && v !== "L").length;

  return (
    <AppShell>
      <PageHeader
        title="Daily Muster Roll"
        subtitle="Attendance · Live Marking Terminal"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card border border-border rounded-sm px-3 h-10">
              <Calendar className="w-4 h-4 text-primary" />
              <input type="date" defaultValue="2026-04-28" className="bg-transparent text-sm font-semibold focus:outline-none" />
            </div>
            <Btn variant="gold"><Save className="w-4 h-4" /> Submit Muster</Btn>
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

      <Section title={`Muster Roll · ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"})}`}>
        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr><th>Service No</th><th>Name</th><th>Department</th><th>BPS</th><th>In Time</th><th>Status</th><th className="text-right">Quick Mark</th></tr>
            </thead>
            <tbody>
              {personnel.map((p) => {
                const m = marks[p.svc] || "";
                const isLeave = leaveTypes.some(lt => lt.code === m);
                
                return (
                  <tr key={p.svc}>
                    <td className="font-mono text-xs font-semibold text-primary">{p.svc}</td>
                    <td className="font-semibold">{p.name}</td>
                    <td className="text-muted-foreground">{p.dept}</td>
                    <td><Badge>{p.bps}</Badge></td>
                    <td className="font-mono text-xs">{m==="P"?"08:42":m==="L"?"09:24":"—"}</td>
                    <td>
                      {m==="P" && <Badge variant="success">Present</Badge>}
                      {m==="A" && <Badge variant="danger">Absent</Badge>}
                      {m==="L" && <Badge variant="warning">Late</Badge>}
                      {isLeave && <Badge variant="info">Leave ({m})</Badge>}
                      {m==="" && <Badge>Unmarked</Badge>}
                    </td>
                    <td className="text-right">
                      <div className="inline-flex rounded-sm overflow-hidden border border-border">
                        <button onClick={()=>set(p.svc,"P")} className={`px-3 py-1.5 text-[0.65rem] font-bold uppercase transition-colors ${m==="P"?"bg-success text-white":"hover:bg-success/10 text-success"}`}>P</button>
                        <button onClick={()=>set(p.svc,"A")} className={`px-3 py-1.5 text-[0.65rem] font-bold uppercase border-l border-border transition-colors ${m==="A"?"bg-destructive text-white":"hover:bg-destructive/10 text-destructive"}`}>A</button>
                        <button onClick={()=>set(p.svc,"L")} className={`px-3 py-1.5 text-[0.65rem] font-bold uppercase border-l border-border transition-colors ${m==="L"?"bg-warning text-white":"hover:bg-warning/10 text-warning"}`}>L</button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className={`px-2 py-1.5 text-[0.65rem] font-bold uppercase border-l border-border flex items-center gap-1 transition-colors ${isLeave?"bg-info text-white":"hover:bg-info/10 text-info"}`}>
                              {isLeave ? m : "Leave"} <ChevronDown className="w-3 h-3" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {leaveTypes.map((lt) => (
                              <DropdownMenuItem key={lt.code} onClick={() => set(p.svc, lt.code)} className="flex items-center justify-between">
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
            </tbody>
          </table>
        </div>
      </Section>
    </AppShell>
  );
};

export default Attendance;
