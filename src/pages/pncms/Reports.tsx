import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Field, Select } from "@/components/pncms/ui-kit";
import { FileText, Users, Wallet, ClipboardList, CalendarDays, BarChart3, ShieldCheck, FileSpreadsheet } from "lucide-react";

const reports = [
  { icon: Users, title: "Personnel Master Report", desc: "Complete civilian staff register with service, cadre, BPS and posting." },
  { icon: ClipboardList, title: "Sanction Register Report", desc: "All sanction requests with approval trail and authority signatures." },
  { icon: Wallet, title: "Overtime Payment Bill", desc: "Department-wise overtime disbursement with subtotals and grand total." },
  { icon: CalendarDays, title: "Leave Account Report", desc: "Casual, earned, sick and LFP balances per personnel for any period." },
  { icon: BarChart3, title: "Attendance Statement", desc: "Monthly muster roll summary with present/absent/late percentages." },
  { icon: ShieldCheck, title: "Late-Sitting Facility (LFP) Report", desc: "LFP credits earned and consumed by each civilian employee." },
  { icon: FileText, title: "Audit & Activity Trail", desc: "System-wide audit log of every transaction with operator identity and time." },
];

const Reports = () => (
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
                <Btn variant="primary" className="flex-1"><FileText className="w-4 h-4" /> Export PDF</Btn>
                <Btn variant="outline" className="flex-1"><FileSpreadsheet className="w-4 h-4" /> Export Excel</Btn>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  </AppShell>
);
export default Reports;
