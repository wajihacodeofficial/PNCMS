import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { StatCard, Section, Btn, Badge, Input, Field } from "@/components/pncms/ui-kit";
import { Calendar, Clock, UserPlus, ListChecks, Flag, ShieldCheck, ClipboardList, PieChart, Users, Search, RotateCcw, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { format, isWithinInterval, parseISO } from "date-fns";
import { exportToPDF } from "@/lib/export";
import { toast } from "sonner";
import { useLeaves } from "@/hooks/use-api";

const LeaveDashboard = () => {
  const navigate = useNavigate();
  const { data: leaves = [], isLoading } = useLeaves();
  const [historySearch, setHistorySearch] = useState("");

  const today = new Date();

  const currentOnLeave = useMemo(() => {
    return (leaves as any[])
      .filter(l => l.status === 'Approved' && isWithinInterval(today, {
        start: parseISO(l.startDate),
        end: parseISO(l.endDate)
      }))
      .map(l => ({
        svc: l.employee?.serviceNo || 'N/A',
        name: l.employee?.name || 'Unknown',
        type: l.type.toUpperCase(),
        from: format(parseISO(l.startDate), 'dd-MMM-yy'),
        days: l.days
      }))
      .sort((a, b) => a.svc.localeCompare(b.svc));
  }, [leaves]);

  const historyResults = useMemo(() => {
    if (!historySearch) return [];
    return (leaves as any[])
      .filter(l => l.employee?.serviceNo === historySearch || l.employee?.serviceNo?.includes(historySearch))
      .map(l => ({
        type: l.type,
        from: format(parseISO(l.startDate), 'dd-MMM-yy'),
        to: format(parseISO(l.endDate), 'dd-MMM-yy'),
        days: l.days,
        status: l.status,
        timestamp: l.createdAt
      }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [historySearch, leaves]);

  const pendingCount = (leaves as any[]).filter(l => l.status === 'Submitted' || l.status === 'Pending').length;

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

      <div className="grid grid-cols-12 gap-6">
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
                        <Badge variant={l.status === 'Approved' ? 'success' : 'pending'}>{l.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <span className="text-xs font-black text-primary italic">{l.days} DAYS</span>
                        <span className="text-[0.6rem] text-muted-foreground uppercase">{format(parseISO(l.timestamp), 'dd MMM yyyy')}</span>
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
