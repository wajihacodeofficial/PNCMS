import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Field, Select } from "@/components/pncms/ui-kit";
import { FileText, Users, Wallet, ClipboardList, CalendarDays, BarChart3, ShieldCheck, FileSpreadsheet, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

const reports = [
  { slug:"personnel-master", icon: Users, title: "Personnel Master Report", desc: "Complete civilian staff register with service, cadre, BPS and posting." },
  { slug:"sanction-register", icon: ClipboardList, title: "Sanction Register Report", desc: "All sanction requests with approval trail and authority signatures." },
  { slug:"overtime-payment-bill", icon: Wallet, title: "Overtime Payment Bill", desc: "Department-wise overtime disbursement with subtotals and grand total." },
  { slug:"leave-account", icon: CalendarDays, title: "Leave Account Report", desc: "Casual, earned, sick and LFP balances per personnel for any period." },
  { slug:"attendance", icon: BarChart3, title: "Attendance Statement", desc: "Monthly muster roll summary with present/absent/late percentages." },
  { slug:"late-sitting", icon: ShieldCheck, title: "Late-Sitting Facility (LFP) Report", desc: "LFP credits earned and consumed by each civilian employee." },
  { slug:"department-summary", icon: BarChart3, title: "Department Summary Report", desc: "Aggregate strength, OT and leave figures per department." },
  { slug:"audit-trail", icon: FileText, title: "Audit & Activity Trail", desc: "System-wide audit log of every transaction with operator identity and time." },
];

const Reports = () => {
  const navigate = useNavigate();
  return (
  <AppShell>
    <PageHeader title="Reports Hub" subtitle="Authorized Export Centre · PDF & Excel Outputs" />

    <div className="grid grid-cols-2 gap-5">
      {reports.map((r) => (
        <article key={r.title} className="panel relative overflow-hidden">
          <div className="stripe-top-gold absolute top-0 left-0" />
          <div className="p-5 flex gap-5">
            <div className="w-14 h-14 rounded-sm bg-gradient-command text-accent flex items-center justify-center shrink-0">
              <r.icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="heading-mil text-base text-primary tracking-wider">{r.title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{r.desc}</p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <Field label="Month">
                  <Select className="h-9 text-xs">
                    {["April 2026","March 2026","February 2026","January 2026"].map(m=><option key={m}>{m}</option>)}
                  </Select>
                </Field>
                <Field label="Year">
                  <Select className="h-9 text-xs">
                    {["2026","2025","2024"].map(y=><option key={y}>{y}</option>)}
                  </Select>
                </Field>
              </div>

              <div className="flex gap-2 mt-4">
                <Btn variant="gold" className="flex-1" onClick={()=>navigate(`/reports/${r.slug}`)}><Eye className="w-4 h-4" /> Preview</Btn>
                <Btn variant="primary" className="flex-1"><FileText className="w-4 h-4" /> PDF</Btn>
                <Btn variant="outline" className="flex-1"><FileSpreadsheet className="w-4 h-4" /> Excel</Btn>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  </AppShell>
);};
export default Reports;
