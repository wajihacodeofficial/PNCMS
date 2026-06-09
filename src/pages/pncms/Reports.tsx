import { useState } from 'react';
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Field, Select } from "@/components/pncms/ui-kit";
import { FileText, Users, Wallet, ClipboardList, CalendarDays, BarChart3, FileSpreadsheet, Eye, Printer, Download, ShieldCheck } from "lucide-react";
import { usePersonnel, useSanctions, useAttendanceRange, useLogs, useSettings, useLeaves } from "@/hooks/use-api";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, parse } from 'date-fns';

const reportConfig = [
  { id: "personnel", icon: Users, title: "Personnel Master Report", desc: "Complete civilian staff register with rank, cadre, BPS and posting details." },
  { id: "sanctions", icon: ClipboardList, title: "Sanction Register Report", desc: "Consolidated list of all approved and pending overtime/late-sitting authorizations." },
  { id: "attendance", icon: BarChart3, title: "Monthly Attendance Summary", desc: "Aggregate muster roll report for the selected month showing presence/absence trends." },
  { id: "leave", icon: CalendarDays, title: "Leave Register", desc: "Summary of casual, medical and recreational leaves consumed by personnel." },
  { id: "latesitting-payment", icon: Wallet, title: "Late Sitting Payment Report", desc: "Monthly payment summary for Ministerial (Late Sitting) staff." },
  { id: "overtime-payment", icon: Wallet, title: "Overtime Payment Report", desc: "Monthly payment summary for Industrial (Overtime) staff." },
  { id: "overtime-sanction-requests", icon: ClipboardList, title: "Overtime Sanction Requests", desc: "Pending overtime sanction requests for the selected month." },
  { id: "latesitting-requests", icon: ClipboardList, title: "Late Sitting Requests", desc: "Pending late sitting sanction requests for the selected month." }
];

const Reports = () => {
  const { data: settings = {} } = useSettings();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMMM yyyy'));
  
  const { data: personnel = [] } = usePersonnel();
  const { data: sanctions = [] } = useSanctions();
  const { data: leaves = [] } = useLeaves();
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

    const isSameMonth = (dateStr?: string) => {
      if (!dateStr) return false;
      try {
        const d = new Date(dateStr);
        return format(d, 'MMMM yyyy') === selectedMonth;
      } catch {
        return false;
      }
    };

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
        const rows = (sanctions as any[])
          .filter((s: any) => isSameMonth(s.date))
          .map((s: any, i: number) => [
            i + 1, s.sanctionId, s.employee?.name, s.employee?.serviceNo, `${s.limit ?? s.hours}h`, s.status.toUpperCase(), s.employee?.cardType
          ]);
        
        if (formatType === 'pdf') {
          exportToPDF("Official Sanction Register", headers, rows, "sanction_register", getCommonMetadata());
        } else {
          await exportToExcel("Sanctions", headers[0], rows, "sanction_register");
        }
      }

      // New report: Late Sitting Payment (Ministerial)
      else if (type === "latesitting-payment") {
        const headers = [["#", "Employee", "Svc No", "Department", "Payable Hours", "Amount"]];
        const rows = (sanctions as any[])
          .filter((s: any) => s.employee?.cardType === 'Ministerial' && (s.status === 'Approved' || s.status === 'Paid') && isSameMonth(s.date))
          .map((s: any, i: number) => {
            const rate = parseInt(settings.rate_ministerial || '380');
            const payable = s.limit ?? s.hours;
            return [
              i + 1,
              s.employee?.name,
              s.employee?.serviceNo,
              s.employee?.department?.name,
              `${payable}h`,
              `Rs. ${(payable * rate).toLocaleString()}`
            ];
          });
        if (formatType === 'pdf') {
          exportToPDF("Late Sitting Payment Report", headers, rows, "latesitting_payment", getCommonMetadata());
        } else {
          await exportToExcel("Late Sitting Payment", headers[0], rows, "latesitting_payment");
        }
      }
      // New report: Overtime Payment (Industrial)
      else if (type === "overtime-payment") {
        const headers = [["#", "Employee", "Svc No", "Department", "Payable Hours", "Amount"]];
        const rows = (sanctions as any[])
          .filter((s: any) => s.employee?.cardType === 'Industrial' && (s.status === 'Approved' || s.status === 'Paid') && isSameMonth(s.date))
          .map((s: any, i: number) => {
            const rate = parseInt(settings.rate_industrial || '420');
            const payable = s.limit ?? s.hours;
            return [
              i + 1,
              s.employee?.name,
              s.employee?.serviceNo,
              s.employee?.department?.name,
              `${payable}h`,
              `Rs. ${(payable * rate).toLocaleString()}`
            ];
          });
        if (formatType === 'pdf') {
          exportToPDF("Overtime Payment Report", headers, rows, "overtime_payment", getCommonMetadata());
        } else {
          await exportToExcel("Overtime Payment", headers[0], rows, "overtime_payment");
        }
      }
      // New report: Overtime Sanction Requests (pending)
      else if (type === "overtime-sanction-requests") {
        const headers = [["#", "SNC ID", "Employee", "Svc No", "Requested Hours", "Status"]];
        const rows = (sanctions as any[])
          .filter((s: any) => s.employee?.cardType === 'Industrial' && s.status === 'Pending' && isSameMonth(s.date))
          .map((s: any, i: number) => [
            i + 1,
            s.sanctionId,
            s.employee?.name,
            s.employee?.serviceNo,
            `${s.hours ?? s.limit}h`,
            s.status
          ]);
        if (formatType === 'pdf') {
          exportToPDF("Overtime Sanction Requests", headers, rows, "overtime_requests", getCommonMetadata());
        } else {
          await exportToExcel("Overtime Requests", headers[0], rows, "overtime_requests");
        }
      }
      // New report: Late Sitting Requests (pending)
      else if (type === "latesitting-requests") {
        const headers = [["#", "SNC ID", "Employee", "Svc No", "Requested Hours", "Status"]];
        const rows = (sanctions as any[])
          .filter((s: any) => s.employee?.cardType === 'Ministerial' && s.status === 'Pending' && isSameMonth(s.date))
          .map((s: any, i: number) => [
            i + 1,
            s.sanctionId,
            s.employee?.name,
            s.employee?.serviceNo,
            `${s.hours ?? s.limit}h`,
            s.status
          ]);
        if (formatType === 'pdf') {
          exportToPDF("Late Sitting Requests", headers, rows, "latesitting_requests", getCommonMetadata());
        } else {
          await exportToExcel("Late Sitting Requests", headers[0], rows, "latesitting_requests");
        }
      }
      // Existing attendance report
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

      else if (type === "leave") {
        const headers = [["#", "Service No", "Employee", "Type", "Start Date", "End Date", "Days", "Status"]];
        const rows = (leaves as any[])
          .filter((l: any) => isSameMonth(l.startDate))
          .map((l: any, i: number) => [
            i + 1, l.employee?.serviceNo, l.employee?.name, l.type, l.startDate, l.endDate, `${l.days} days`, l.status
          ]);

        if (formatType === 'pdf') {
          exportToPDF("Leave Register Report", headers, rows, "leave_register", getCommonMetadata());
        } else {
          await exportToExcel("Leaves", headers[0], rows, "leave_register");
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
