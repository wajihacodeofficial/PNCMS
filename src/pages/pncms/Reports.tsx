import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Field, Select } from "@/components/pncms/ui-kit";
import { FileText, Users, Wallet, ClipboardList, CalendarDays, BarChart3, ShieldCheck, FileSpreadsheet, Eye, Printer, Download } from "lucide-react";
import { personnel } from "@/data/mock";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { toast } from "sonner";

const reportConfig = [
  { id: "personnel", icon: Users, title: "Personnel Master Report", desc: "Complete civilian staff register with rank, cadre, BPS and posting details." },
  { id: "sanctions", icon: ClipboardList, title: "Sanction Register Report", desc: "Consolidated list of all approved and pending overtime/late-sitting authorizations." },
  { id: "payments", icon: Wallet, title: "Payment Disbursement Bill", desc: "Department-wise financial roster with hours performed and net payable amounts." },
  { id: "attendance", icon: BarChart3, title: "Monthly Attendance Summary", desc: "Aggregate muster roll report for the selected month showing presence/absence trends." },
  { id: "leave", icon: CalendarDays, title: "Leave Register", desc: "Summary of casual, medical and recreational leaves consumed by personnel." },
  { id: "audit", icon: ShieldCheck, title: "System Audit Trail", desc: "Logs of all administrative actions, status changes and record modifications." },
];

const Reports = () => {
  const [clerkName, setClerkName] = useState("Wajiha Zehra");
  const [selectedMonth, setSelectedMonth] = useState("April 2026");

  useEffect(() => {
    const clk = localStorage.getItem("clerk_name");
    if (clk) setClerkName(clk);
  }, []);

  const getCommonMetadata = (dept = "All Departments") => ({
    period: selectedMonth,
    dept: dept,
    clerk: `${clerkName} · DIL-ADM-04`
  });

  const handleExport = async (type: string, format: 'pdf' | 'excel') => {
    toast.loading(`Preparing ${type.toUpperCase()} ${format.toUpperCase()}...`);

    try {
      if (type === "personnel") {
        const headers = [["#", "Svc No", "Rank", "Name", "Department", "BPS", "Type"]];
        const rows = personnel.map((p, i) => [i + 1, p.svc, p.rank, p.name, p.dept, p.bps, p.cardType]);
        
        if (format === 'pdf') {
          exportToPDF("Personnel Master Register", headers, rows, "personnel_master", getCommonMetadata());
        } else {
          await exportToExcel("Personnel", headers[0], rows, "personnel_master");
        }
      } 
      
      else if (type === "sanctions") {
        const saved = localStorage.getItem("pncms_sanctions");
        const sanctions = saved ? JSON.parse(saved) : [];
        const headers = [["#", "SNC ID", "Employee", "Service No", "Limit", "Status", "Cadre"]];
        const rows = sanctions.map((s: any, i: number) => [i + 1, s.id, s.emp, s.svc, `${s.hours}h`, s.status.toUpperCase(), s.cadre]);
        
        if (format === 'pdf') {
          exportToPDF("Official Sanction Register", headers, rows, "sanction_register", getCommonMetadata());
        } else {
          await exportToExcel("Sanctions", headers[0], rows, "sanction_register");
        }
      }

      else if (type === "payments") {
        const savedStatuses = localStorage.getItem("pncms_payment_statuses");
        const statuses = savedStatuses ? JSON.parse(savedStatuses) : {};
        const savedSanctions = localStorage.getItem("pncms_sanctions");
        const sanctions = savedSanctions ? JSON.parse(savedSanctions) : [];
        
        const headers = [["#", "Employee", "Svc No", "Department", "Payable", "Status", "Amount"]];
        const rows = sanctions.filter((s: any) => s.status === 'Approved').map((s: any, i: number) => {
          const p = personnel.find(pers => pers.svc === s.svc);
          const status = statuses[s.id] || "Payment Pending";
          return [i + 1, p?.name || s.emp, s.svc, p?.dept || s.dept, `${s.hours}h`, status, `Rs. ${(s.hours * 400).toLocaleString()}`];
        });

        if (format === 'pdf') {
          exportToPDF("Disbursement Bill Summary", headers, rows, "payment_bill", getCommonMetadata());
        } else {
          await exportToExcel("Payments", headers[0], rows, "payment_bill");
        }
      }

      else if (type === "attendance") {
        const savedHistory = localStorage.getItem('pncms_attendance_history');
        const history = savedHistory ? JSON.parse(savedHistory) : {};
        const dates = Object.keys(history);
        
        const headers = [["#", "Date", "Total Strength", "Present", "Absent", "Leave"]];
        const rows = dates.map((date, i) => {
          const marks = Object.values(history[date]);
          const p = marks.filter(v => v === "P").length;
          const a = marks.filter(v => v === "A").length;
          return [i + 1, date, personnel.length, p, a, personnel.length - (p + a)];
        });

        if (format === 'pdf') {
          exportToPDF("Monthly Attendance Statement", headers, rows, "attendance_summary", getCommonMetadata());
        } else {
          await exportToExcel("Attendance", headers[0], rows, "attendance_summary");
        }
      }

      toast.dismiss();
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report exported successfully.`);
    } catch (err) {
      toast.dismiss();
      toast.error("Export failed. Please check system logs.");
    }
  };

  return (
    <AppShell>
      <PageHeader title="Reports Hub" subtitle="Authorized Export Centre · Certified PDF & Excel Formats" />

      <div className="mb-10 grid grid-cols-12 gap-5 items-end">
        <div className="col-span-3">
          <Field label="Reporting Period">
            <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="h-11 font-bold">
              {["April 2026","March 2026","February 2026","January 2026"].map(m=><option key={m}>{m}</option>)}
            </Select>
          </Field>
        </div>
        <div className="col-span-9">
          <div className="p-4 bg-primary/5 border-l-4 border-l-accent rounded-sm flex items-center gap-4">
             <ShieldCheck className="w-6 h-6 text-accent shrink-0" />
             <div className="text-xs text-foreground/70 italic font-medium leading-relaxed">
               All reports are generated in the Restricted Civil Management format. Any modification to exported PDF bills is prohibited under PN Security Regulations.
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {reportConfig.map((r) => (
          <article key={r.id} className="panel relative overflow-hidden group hover:shadow-elevated transition-all duration-300">
            <div className="stripe-top-gold absolute top-0 left-0" />
            <div className="p-6 flex gap-6">
              <div className="w-16 h-16 rounded-sm bg-gradient-command text-accent flex items-center justify-center shrink-0 shadow-md">
                <r.icon className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-heading font-black italic uppercase tracking-tight text-primary mb-1">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">{r.desc}</p>
                
                <div className="flex gap-3">
                  <Btn variant="primary" className="flex-1 h-10 shadow-sm" onClick={() => handleExport(r.id, 'pdf')}>
                    <Printer className="w-4 h-4 mr-2" /> Export PDF
                  </Btn>
                  <Btn variant="outline" className="flex-1 h-10 shadow-sm" onClick={() => handleExport(r.id, 'excel')}>
                    <FileSpreadsheet className="w-4 h-4 mr-2" /> Save Excel
                  </Btn>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
};

export default Reports;
