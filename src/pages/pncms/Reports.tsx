import { useState } from 'react';
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Field, Select } from "@/components/pncms/ui-kit";
import { FileText, Users, Wallet, ClipboardList, CalendarDays, BarChart3, ShieldCheck, FileSpreadsheet, Eye, Printer, Download } from "lucide-react";
import { usePersonnel, useSanctions, useAttendanceRange, useLogs, useSettings } from "@/hooks/use-api";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, parse } from 'date-fns';

const reportConfig = [
  { id: "personnel", icon: Users, title: "Personnel Master Report", desc: "Complete civilian staff register with rank, cadre, BPS and posting details." },
  { id: "sanctions", icon: ClipboardList, title: "Sanction Register Report", desc: "Consolidated list of all approved and pending overtime/late-sitting authorizations." },
  { id: "payments", icon: Wallet, title: "Payment Disbursement Bill", desc: "Department-wise financial roster with hours performed and net payable amounts." },
  { id: "attendance", icon: BarChart3, title: "Monthly Attendance Summary", desc: "Aggregate muster roll report for the selected month showing presence/absence trends." },
  { id: "leave", icon: CalendarDays, title: "Leave Register", desc: "Summary of casual, medical and recreational leaves consumed by personnel." },
  { id: "audit", icon: ShieldCheck, title: "System Audit Trail", desc: "Logs of all administrative actions, status changes and record modifications." },
];

const Reports = () => {
  const { data: settings = {} } = useSettings();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMMM yyyy'));
  
  const { data: personnel = [] } = usePersonnel();
  const { data: sanctions = [] } = useSanctions();
  const { data: logs = [] } = useLogs();
  
  const parsedDate = parse(selectedMonth, 'MMMM yyyy', new Date());
  const startStr = format(startOfMonth(parsedDate), 'yyyy-MM-dd');
  const endStr = format(endOfMonth(parsedDate), 'yyyy-MM-dd');
  const { data: attendance = [] } = useAttendanceRange(startStr, endStr);

  const getCommonMetadata = (dept = "All Departments") => ({
    period: selectedMonth,
    dept: dept,
    clerk: `${settings.clerk_name || 'Admin Clerk'} · PNCMS`
  });

  const handleExport = async (type: string, formatType: 'pdf' | 'excel') => {
    toast.loading(`Preparing ${type.toUpperCase()} ${formatType.toUpperCase()}...`);

    try {
      if (type === "personnel") {
        const headers = [["#", "Svc No", "Rank", "Name", "Department", "BPS", "Type"]];
        const rows = (personnel as any[]).map((p, i) => [i + 1, p.serviceNo, p.rank?.name, p.name, p.department?.name, p.bps, p.cardType]);
        
        if (formatType === 'pdf') {
          exportToPDF("Personnel Master Register", headers, rows, "personnel_master", getCommonMetadata());
        } else {
          await exportToExcel("Personnel", headers[0], rows, "personnel_master");
        }
      } 
      
      else if (type === "sanctions") {
        const headers = [["#", "SNC ID", "Employee", "Service No", "Limit", "Status", "Cadre"]];
        const rows = (sanctions as any[]).map((s: any, i: number) => [
          i + 1, s.sanctionId, s.employee?.name, s.employee?.serviceNo, `${s.hours}h`, s.status.toUpperCase(), s.employee?.cardType
        ]);
        
        if (formatType === 'pdf') {
          exportToPDF("Official Sanction Register", headers, rows, "sanction_register", getCommonMetadata());
        } else {
          await exportToExcel("Sanctions", headers[0], rows, "sanction_register");
        }
      }

      else if (type === "payments") {
        const headers = [["#", "Employee", "Svc No", "Department", "Payable", "Status", "Amount"]];
        const rows = (sanctions as any[]).filter((s: any) => s.status === 'Approved').map((s: any, i: number) => {
          const rate = s.employee?.cardType === 'Ministerial' ? 
            parseInt(settings.rate_ministerial || '380') : 
            parseInt(settings.rate_industrial || '420');
          return [
            i + 1, s.employee?.name, s.employee?.serviceNo, s.employee?.department?.name, 
            `${s.hours}h`, 'Approved', `Rs. ${(s.hours * rate).toLocaleString()}`
          ];
        });

        if (formatType === 'pdf') {
          exportToPDF("Disbursement Bill Summary", headers, rows, "payment_bill", getCommonMetadata());
        } else {
          await exportToExcel("Payments", headers[0], rows, "payment_bill");
        }
      }

      else if (type === "attendance") {
        const headers = [["#", "Date", "Total Strength", "Present", "Absent", "Leave"]];
        
        // Group attendance by date
        const grouped = (attendance as any[]).reduce((acc: any, curr: any) => {
          if (!acc[curr.date]) acc[curr.date] = [];
          acc[curr.date].push(curr.status);
          return acc;
        }, {});

        const rows = Object.entries(grouped).map(([date, marks]: [string, any], i) => {
          const p = marks.filter((v: string) => v === "P" || v === "L").length;
          const a = marks.filter((v: string) => v === "A").length;
          const total = personnel.length;
          return [i + 1, date, total, p, a, total - (p + a)];
        });

        if (formatType === 'pdf') {
          exportToPDF("Monthly Attendance Statement", headers, rows, "attendance_summary", getCommonMetadata());
        } else {
          await exportToExcel("Attendance", headers[0], rows, "attendance_summary");
        }
      }

      else if (type === "audit") {
        const headers = [["#", "Time", "User", "Action", "Entity", "Result"]];
        const rows = (logs as any[]).map((l, i) => [
          i + 1, format(new Date(l.time), 'dd-MMM-yy HH:mm'), l.user, l.action, l.entity, l.result
        ]);
        if (formatType === 'pdf') {
          exportToPDF("System Audit History", headers, rows, "audit_trail", getCommonMetadata());
        } else {
          await exportToExcel("AuditLog", headers[0], rows, "audit_trail");
        }
      }

      toast.dismiss();
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report exported successfully.`);
    } catch (err) {
      console.error(err);
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
              {["May 2026", "April 2026", "March 2026", "February 2026"].map(m=><option key={m}>{m}</option>)}
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
