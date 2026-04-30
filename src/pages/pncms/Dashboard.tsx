import { useNavigate } from "react-router-dom";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { StatCard, Section, Btn } from "@/components/pncms/ui-kit";
import { Users, ClipboardList, Wallet, CalendarDays, Plus, FileBarChart2, UserPlus, Clock, Gavel } from "lucide-react";
import { activity } from "@/data/mock";
import { exportToPDF } from "@/lib/export";
import { useState, useEffect } from "react";
import { isWithinInterval, parseISO } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const navigate = useNavigate();
  const [onLeaveCount, setOnLeaveCount] = useState(4);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('pncms_leave_records') || '[]');
    const today = new Date();
    const active = stored.filter((l: any) => 
      l.status === 'Submitted' && 
      isWithinInterval(today, { start: parseISO(l.from), end: parseISO(l.to) })
    ).length;
    setOnLeaveCount(4 + active);
  }, []);
  
  const handleExportPDF = () => {
    const headers = [["Metric", "Value", "Subtitle"]];
    const data = [
      ["Total Personnel", "412", "Active across 11 directorates"],
      ["Currently on Leave", onLeaveCount.toString(), "Personnel away today"],
      ["Open Work Logs", "27", "In current cycle"],
      ["Pending Payments", "Rs. 1.84M", "9 batches awaiting release"],
    ];
    exportToPDF("PNCMS Operational Brief", headers, data, "pncms_brief");
  };

  const handleViewLog = (log: any) => {
    switch (log.tag) {
      case 'LEAVE':
        navigate('/leave');
        break;
      case 'SANCTION':
        navigate('/sanctions');
        break;
      case 'WORK LOG':
        navigate('/work-logs');
        break;
      case 'ATTENDANCE':
        // For attendance, we try to extract the date or use the log's context
        // In our mock, "Daily muster roll opened" usually refers to today's date
        navigate('/attendance', { state: { date: '2026-04-28' } });
        break;
      case 'PAYMENT':
        navigate('/payments');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Command Dashboard"
        subtitle="Civilian Management System · Operational Overview"
        actions={
          <div className="flex gap-3">
            <Btn variant="outline" onClick={handleExportPDF}><FileBarChart2 className="w-4 h-4" /> Export Brief</Btn>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Btn variant="gold"><Plus className="w-4 h-4" /> Quick Entry</Btn>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background-alt border-border w-52">
                <DropdownMenuItem onClick={() => navigate("/employment-records/new")} className="gap-2 cursor-pointer font-bold"><UserPlus className="w-4 h-4 text-accent" /> Enroll Personnel</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/attendance")} className="gap-2 cursor-pointer font-bold"><Clock className="w-4 h-4 text-accent" /> Mark Attendance</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/leave/new")} className="gap-2 cursor-pointer font-bold"><CalendarDays className="w-4 h-4 text-accent" /> Record Leave</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/discipline")} className="gap-2 cursor-pointer font-bold"><Gavel className="w-4 h-4 text-accent" /> Log Discipline</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

    <div className="grid grid-cols-4 gap-5">
      <StatCard 
        label="Total Personnel" 
        value="412" 
        sub="Directorate Strength" 
        icon={<Users className="w-5 h-5" />} 
        accent="primary" 
        onClick={() => navigate("/employment-records")}
      />
      <StatCard 
        label="Currently on Leave" 
        value={onLeaveCount} 
        sub="Absent today" 
        icon={<CalendarDays className="w-5 h-5" />} 
        accent="danger" 
        onClick={() => navigate("/leave")}
      />
      <StatCard 
        label="Open Work Logs" 
        value="27" 
        sub="Active Overtime" 
        icon={<ClipboardList className="w-5 h-5" />} 
        accent="info" 
        onClick={() => navigate("/work-logs")}
      />
      <StatCard 
        label="Pending Payments" 
        value="Rs. 1.8M" 
        sub="Unpaid Batches" 
        icon={<Wallet className="w-5 h-5" />} 
        accent="gold" 
        onClick={() => navigate("/payments")}
      />
    </div>

    <div className="grid grid-cols-12 gap-6 mt-6">
      <Section title="Recent Operational Activity" className="col-span-8">
        <div className="space-y-4">
          {activity.map((a, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-sm hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <div>
                  <p className="text-sm font-semibold text-primary leading-tight">{a.text}</p>
                  <p className="text-[0.65rem] text-muted-foreground mt-1 uppercase font-bold tracking-wider">{a.tag} · {a.time}</p>
                </div>
              </div>
              <Btn variant="ghost" className="h-8 px-2 text-[0.6rem]" onClick={() => handleViewLog(a)}>View Log</Btn>
            </div>
          ))}
        </div>
      </Section>

      <div className="col-span-4 space-y-6">
        <Section title="Operational Readiness">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-[0.65rem] font-bold mb-1.5 uppercase"><span>Attendance Sync</span><span className="text-success">100%</span></div>
              <div className="h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-success w-full" /></div>
            </div>
            <div>
              <div className="flex justify-between text-[0.65rem] font-bold mb-1.5 uppercase"><span>Leave Verification</span><span className="text-warning">84%</span></div>
              <div className="h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-warning w-[84%]" /></div>
            </div>
            <div>
              <div className="flex justify-between text-[0.65rem] font-bold mb-1.5 uppercase"><span>Overtime Audit</span><span className="text-info">92%</span></div>
              <div className="h-1 bg-muted rounded-full overflow-hidden"><div className="h-full bg-info w-[92%]" /></div>
            </div>
          </div>
        </Section>

        <div className="panel p-5 border-l-4 border-accent bg-accent/5">
          <h4 className="text-xs font-bold text-accent uppercase tracking-widest mb-2">Command Alert</h4>
          <p className="text-xs text-foreground/80 leading-relaxed">
            Muster roll for 29-Apr-2026 is currently open. 42 personnel remaining to be marked.
          </p>
        </div>
      </div>
    </div>
    </AppShell>
  );
};
export default Dashboard;
