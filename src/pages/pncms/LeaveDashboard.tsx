import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { StatCard, Section, Btn, Badge } from "@/components/pncms/ui-kit";
import { Calendar, Clock, UserPlus, ListChecks, Flag, ShieldCheck, ClipboardList, PieChart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { format, isWithinInterval, parseISO } from "date-fns";

const LeaveDashboard = () => {
  const navigate = useNavigate();
  const [localLeave, setLocalLeave] = useState<any[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('pncms_leave_records') || '[]');
    setLocalLeave(stored);
  }, []);

  const today = new Date();
  
  const currentOnLeave = [
    { name: "Bilal Ahmed Siddiqui", type: "CASUAL", from: "20-Apr-26", days: 3 },
    { name: "Saima Nawaz", type: "EARNED", from: "18-Apr-26", days: 7 },
    { name: "Imran Hussain Shah", type: "RECREATIONAL", from: "22-Apr-26", days: 2 },
    { name: "Nazia Akhtar", type: "CASUAL", from: "25-Apr-26", days: 1 },
    ...localLeave
      .filter(l => l.status === 'Submitted' && isWithinInterval(today, { start: parseISO(l.from), end: parseISO(l.to) }))
      .map(l => ({ 
        name: l.name, 
        type: l.type === 'ML' ? 'MATERNITY' : l.type.toUpperCase(), 
        from: format(parseISO(l.from), 'dd-MMM-yy'), 
        days: l.days 
      }))
  ];

  const pendingCount = 6 + localLeave.filter(l => l.status === 'Draft').length;

  return (
    <AppShell>
      <PageHeader 
        title="Leave Command Centre" 
        subtitle="Civilian Leave Operations · Monthly Overview"
        actions={
          <div className="flex gap-3">
            <Btn variant="outline" onClick={() => navigate("/leave/ledger")}><ListChecks className="w-4 h-4" /> View Ledger</Btn>
            <Btn variant="gold" onClick={() => navigate("/leave/new")}><UserPlus className="w-4 h-4" /> New Leave Record</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Currently on Leave" value={currentOnLeave.length} sub="active absence" icon={<Calendar className="w-5 h-5"/>} accent="danger" />
        <StatCard label="Gazetted Holidays" value={14} sub="Year 2026" icon={<Flag className="w-5 h-5"/>} accent="success" />
        <StatCard label="Leave Given by Command" value={2} sub="special directives" icon={<ShieldCheck className="w-5 h-5"/>} accent="primary" />
        <StatCard label="Pending Applications" value={pendingCount} sub="awaiting verification" icon={<Clock className="w-5 h-5"/>} accent="warning" />
      </div>

      <Section title="Current On-Leave Personnel">
        <div className="overflow-hidden rounded-sm border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left border-b border-border">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">From</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {currentOnLeave.map((p, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-base">{p.name}</td>
                  <td className="px-6 py-4">
                    <Badge variant={p.type === "MATERNITY" ? "danger" : (p.type === "RECREATIONAL" || p.type === "EARNED") ? "success" : "info"} className="px-3 py-1 text-xs">
                      {p.type}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm text-muted-foreground">{p.from}</td>
                  <td className="px-6 py-4 text-right font-bold text-lg text-primary">{p.days}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </AppShell>
  );
};

export default LeaveDashboard;
