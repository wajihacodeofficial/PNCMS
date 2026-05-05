import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { StatCard, Section, Btn, Badge, Input, Field } from "@/components/pncms/ui-kit";
import { Calendar, Clock, UserPlus, ListChecks, Flag, ShieldCheck, ClipboardList, PieChart, Users, Search, RotateCcw, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { exportToPDF } from "@/lib/export";
import { toast } from "sonner";

const LeaveDashboard = () => {
  const navigate = useNavigate();
  const [localLeave, setLocalLeave] = useState<any[]>([]);
  const [historySearch, setHistorySearch] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('pncms_leave_records') || '[]');
    setLocalLeave(stored);
  }, []);

  const historyResults = useMemo(() => {
    if (!historySearch) return [];
    return localLeave
      .filter(l => l.svc === historySearch || l.svc.includes(historySearch))
      .sort((a, b) => a.from.localeCompare(b.from));
  }, [historySearch, localLeave]);

  const today = new Date();
  
  const currentOnLeave = [
    { svc: "10441", name: "Bilal Ahmed Siddiqui", type: "CASUAL", from: "20-Apr-26", days: 3 },
    { svc: "10442", name: "Saima Nawaz", type: "EARNED", from: "18-Apr-26", days: 7 },
    { svc: "10443", name: "Imran Hussain Shah", type: "RECREATIONAL", from: "22-Apr-26", days: 2 },
    { svc: "10444", name: "Nazia Akhtar", type: "CASUAL", from: "25-Apr-26", days: 1 },
    ...localLeave
      .filter(l => l.status === 'Submitted' && isWithinInterval(today, { start: parseISO(l.from), end: parseISO(l.to) }))
      .map(l => ({ 
        svc: l.svc,
        name: l.name, 
        type: l.type === 'ML' ? 'MATERNITY' : l.type.toUpperCase(), 
        from: format(parseISO(l.from), 'dd-MMM-yy'), 
        days: l.days 
      }))
  ].sort((a, b) => a.svc.localeCompare(b.svc));

  const pendingCount = 6 + localLeave.filter(l => l.status === 'Draft').length;

  const handleExportCurrent = () => {
    const headers = [["Svc No", "Employee", "Type", "From", "Days"]];
    const rows = currentOnLeave.map(p => [p.svc, p.name, p.type, p.from, p.days]);
    exportToPDF("Currently On-Leave Personnel", headers, rows, "current_leaves", { 
      period: format(today, "dd MMM yyyy"),
      dept: "All Departments",
      clerk: "Admin Staff"
    });
    toast.success("Current Leave List Exported");
  };

  const handleExportHistory = () => {
    if (historyResults.length === 0) return;
    const headers = [["Type", "From", "To", "Days", "Status"]];
    const rows = historyResults.map(l => [l.type.toUpperCase(), l.from, l.to, l.days, l.status]);
    exportToPDF(`Leave History - SVC ${historySearch}`, headers, rows, `leave_history_${historySearch}`);
    toast.success("Personnel Leave History Exported");
  };

  return (
    <AppShell>
      <PageHeader 
        title="Leave Command Centre" 
        subtitle="Civilian Leave Operations · Monthly Overview"
        actions={
          <div className="flex gap-3">
            <Btn variant="outline" onClick={handleExportCurrent}><FileDown className="w-4 h-4" /> Export Active</Btn>
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

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Wider Search Panel */}
        <div className="col-span-8">
          <Section 
            title="Leave History Search"
            actions={
              <div className="flex items-center gap-2">
                {historyResults.length > 0 && (
                  <Btn variant="ghost" className="h-8 text-xs text-primary" onClick={handleExportHistory}>
                    <FileDown className="w-3.5 h-3.5 mr-1" /> Export History
                  </Btn>
                )}
                {historySearch && (
                  <button onClick={() => setHistorySearch("")} className="text-muted-foreground hover:text-primary transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            }
          >
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter Service Number to search through all records..." 
                  className="pl-10 w-full h-11 border-accent" 
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {historyResults.length > 0 ? (
                  historyResults.map((l, i) => (
                    <div key={i} className="p-4 bg-muted/20 border border-border rounded-sm space-y-2 group hover:border-accent/50 transition-all">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-primary uppercase">{l.type} LEAVE</div>
                          <div className="text-[0.6rem] text-muted-foreground font-mono">{l.from} to {l.to}</div>
                        </div>
                        <Badge variant={l.status === 'Submitted' ? 'success' : 'pending'}>{l.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <span className="text-xs font-black text-primary italic">{l.days} DAYS</span>
                        <span className="text-[0.6rem] text-muted-foreground uppercase">{format(parseISO(l.timestamp || new Date().toISOString()), 'dd MMM yyyy')}</span>
                      </div>
                    </div>
                  ))
                ) : historySearch ? (
                  <div className="col-span-2 text-center py-20 opacity-50">
                    <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-bold uppercase tracking-widest">No matching records found</p>
                    <p className="text-xs mt-1 text-muted-foreground">Ensure the service number is correct.</p>
                  </div>
                ) : (
                  <div className="col-span-2 text-center py-24 opacity-50 border-2 border-dashed border-border rounded-sm bg-muted/5">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm font-bold uppercase tracking-widest">Enter Service Number</p>
                    <p className="text-xs mt-1">To search and retrieve complete historical records</p>
                  </div>
                )}
              </div>
            </div>
          </Section>
        </div>

        {/* Right: Narrower Current List */}
        <div className="col-span-4">
          <Section title="Active On-Leave">
            <div className="overflow-hidden rounded-sm border border-border">
              <table className="w-full text-[0.75rem]">
                <thead className="bg-muted/50 text-left border-b border-border">
                  <tr>
                    <th className="px-3 py-3 font-bold uppercase tracking-wider">Svc</th>
                    <th className="px-3 py-3 font-bold uppercase tracking-wider">Employee</th>
                    <th className="px-3 py-3 font-bold uppercase tracking-wider text-right">Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {currentOnLeave.length > 0 ? currentOnLeave.map((p, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-3 font-mono font-bold text-accent">{p.svc}</td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-primary truncate max-w-[120px]">{p.name}</div>
                        <div className="text-[0.6rem] text-muted-foreground uppercase">{p.type}</div>
                      </td>
                      <td className="px-3 py-3 text-right font-bold text-primary">{p.days}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground italic">None active.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </div>
    </AppShell>
  );
};

export default LeaveDashboard;
