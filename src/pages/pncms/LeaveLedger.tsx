import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Section, Btn, Badge } from "@/components/pncms/ui-kit";
import { FileDown, FileSpreadsheet, Search, Filter, Printer, Zap, XCircle, ArrowUpRight } from "lucide-react";
import { personnel } from "@/data/mock";
import { useState, useMemo } from "react";
import { format, parseISO, subMonths } from "date-fns";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { toast } from "sonner";

const LeaveLedger = () => {
  const [selectedMonth, setSelectedMonth] = useState("April 2026");
  
  const attendanceHistory = useMemo(() => {
    const saved = localStorage.getItem('pncms_attendance_history');
    return saved ? JSON.parse(saved) : {};
  }, []);

  const ledgerData = useMemo(() => {
    const currentMonthDate = parseISO(`01 ${selectedMonth}`);
    const prevMonthDate = subMonths(currentMonthDate, 1);
    const prevMonthStr = format(prevMonthDate, "MMMM yyyy");

    return personnel.map((p, i) => {
      // 1. Calculate Previous Balance (Mocking historical accumulation)
      // For demo, we assume a base of 4 and add if they had 16+ in prev months (simulated)
      let prevBalance = 4 + (i % 3) * 4; 
      
      // 2. Calculate Current Month Performance
      let presentDays = 0;
      let hasAbsence = false;

      Object.entries(attendanceHistory).forEach(([date, marks]: [string, any]) => {
        const dateObj = parseISO(date);
        const monthYear = format(dateObj, "MMMM yyyy");
        if (monthYear === selectedMonth) {
          const mark = marks[p.svc];
          if (mark === "P") {
            presentDays++;
          } else if (mark === "A") {
            hasAbsence = true;
          }
        }
      });

      // LFP Strict Logic
      const isEligible = presentDays >= 16 && !hasAbsence;
      const lfpCredit = isEligible ? 4 : 0;
      const newBalance = prevBalance + lfpCredit;

      return {
        ...p,
        prevBalance,
        presentDays,
        hasAbsence,
        lfpCredit,
        isEligible,
        newBalance
      };
    });
  }, [attendanceHistory, selectedMonth]);

  const handlePDF = () => {
    const headers = [["Personnel", "Svc No", "CL", "RL", "DL", "LWOP", "Att. Days", "LFP Balance"]];
    const rows = ledgerData.map((p, i) => [
      p.name, p.svc, `${12 - (i % 5)}/20`, `${8 - (i % 6)}/15`, `${5 - (i % 3)}/5`, i % 2, p.presentDays, p.newBalance
    ]);
    exportToPDF(`Leave Ledger - ${selectedMonth}`, headers, rows, `leave_ledger_${selectedMonth.replace(' ', '_')}`, 
      { period: selectedMonth, dept: "All Departments", clerk: "Wajiha Zehra · DIL-ADM-04" }
    );
    toast.success("Leave Ledger PDF Generated");
  };

  const handleExcel = async () => {
    const headers = ["Name", "Service No", "CL Used", "RL Used", "DL Used", "LWOP", "Present Days", "LFP Balance"];
    const rows = ledgerData.map((p, i) => [
      p.name, p.svc, 12 - (i % 5), 8 - (i % 6), 5 - (i % 3), i % 2, p.presentDays, p.newBalance
    ]);
    await exportToExcel(`Leave Ledger ${selectedMonth}`, headers, rows, `leave_ledger_${selectedMonth.replace(' ', '_')}`);
    toast.success("Leave Ledger Excel Exported");
  };

  return (
    <AppShell>
      <PageHeader 
        title="Leave Ledger" 
        subtitle="Annual Leave Accounting & Accruals"
        actions={
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print Ledger</Btn>
            <Btn variant="outline" onClick={handleExcel}><FileSpreadsheet className="w-4 h-4" /> Export Excel</Btn>
            <Btn variant="primary" onClick={handlePDF}><FileDown className="w-4 h-4" /> Download PDF</Btn>
          </div>
        }
      />

      <Section title={`Consolidated Leave Account · ${selectedMonth}`}>
        <div className="mb-5 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input placeholder="Search personnel..." className="w-full h-10 pl-10 pr-3 bg-muted/30 border border-border rounded-sm focus:outline-none focus:border-accent" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-muted-foreground uppercase">Select Period</span>
            <select 
              className="h-10 px-3 bg-muted/30 border border-border rounded-sm text-sm focus:outline-none font-bold"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option>April 2026</option>
              <option>March 2026</option>
              <option>February 2026</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Personnel Details</th>
                <th>CL (Casual)</th>
                <th>RL (Rec.)</th>
                <th>DL (Dis.)</th>
                <th>LWOP</th>
                <th>Att. Days</th>
                <th>LFP Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledgerData.map((p, i) => (
                <tr key={p.svc} className={p.isEligible ? "bg-success/5" : ""}>
                  <td>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-[0.65rem] text-muted-foreground font-mono">{p.svc} · {p.gender}</div>
                  </td>
                  <td className="font-mono">{12 - (i % 5)} / 20</td>
                  <td className="font-mono">{8 - (i % 6)} / 15</td>
                  <td className="font-mono">{5 - (i % 3)} / 5</td>
                  <td className="font-mono">{i % 2}</td>
                  <td className="font-mono font-bold text-primary">{p.presentDays} days</td>
                  <td>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">Prev: {p.prevBalance}</span>
                        {p.isEligible ? (
                          <div className="flex items-center gap-1 text-success animate-in slide-in-from-left-2">
                            <ArrowUpRight className="w-3 h-3" />
                            <span className="text-[0.7rem] font-bold">+4 Credits</span>
                          </div>
                        ) : (
                          <span className="text-[0.6rem] text-muted-foreground italic opacity-50">No change</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-sm text-xs font-bold border ${p.isEligible ? "bg-success/10 border-success text-success" : "bg-muted/50 border-border text-primary"}`}>
                          New Balance: {p.newBalance} / 12
                        </div>
                        {p.hasAbsence && (
                          <Badge variant="danger" className="text-[0.55rem] px-1 h-4">ABSENT</Badge>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </AppShell>
  );
};

export default LeaveLedger;
