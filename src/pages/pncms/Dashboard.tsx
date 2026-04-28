import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { StatCard, Section, Btn, Badge } from "@/components/pncms/ui-kit";
import { Users, FileWarning, ClipboardList, Wallet, CalendarDays, TrendingUp, Plus, FileBarChart2, UserPlus, FileDown } from "lucide-react";
import { activity } from "@/data/mock";
import { exportToPDF, exportToExcel } from "@/lib/export";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const chart = [
  { m: "Nov", v: 60 }, { m: "Dec", v: 72 }, { m: "Jan", v: 55 },
  { m: "Feb", v: 84 }, { m: "Mar", v: 78 }, { m: "Apr", v: 92 },
];
const max = Math.max(...chart.map(c => c.v));

const Dashboard = () => {
  const handleExportPDF = () => {
    const headers = [["Metric", "Value", "Subtitle"]];
    const data = [
      ["Total Personnel", "412", "Active across 11 directorates"],
      ["Pending Sanctions", "14", "Awaiting CO approval"],
      ["Open Work Logs", "27", "In current cycle"],
      ["Pending Payments", "Rs. 1.84M", "9 batches awaiting release"],
    ];
    exportToPDF("PNCMS Operational Brief", headers, data, "pncms_brief");
  };

  const handleExportExcel = () => {
    const headers = ["Metric", "Value", "Subtitle"];
    const data = [
      ["Total Personnel", "412", "Active across 11 directorates"],
      ["Pending Sanctions", "14", "Awaiting CO approval"],
      ["Open Work Logs", "27", "In current cycle"],
      ["Pending Payments", "Rs. 1.84M", "9 batches awaiting release"],
    ];
    exportToExcel("Dashboard Stats", headers, data, "pncms_brief");
  };

  return (
    <AppShell>
      <PageHeader
        title="Civilian Management Command Dashboard"
        subtitle="Operational Overview · April 2026"
        actions={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Btn variant="outline"><FileBarChart2 className="w-4 h-4" /> Export Brief</Btn>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background-alt border-border">
                <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer">
                  <FileDown className="w-4 h-4" /> Export PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel} className="gap-2 cursor-pointer">
                  <FileDown className="w-4 h-4" /> Export Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Btn variant="gold"><Plus className="w-4 h-4" /> New Action</Btn>
          </>
        }
      />

    <div className="grid grid-cols-3 gap-5">
      <StatCard label="Total Personnel" value="412" sub="Active across 11 directorates" icon={<Users className="w-5 h-5" />} accent="primary" />
      <StatCard label="Pending Sanctions" value="14" sub="Awaiting CO approval" icon={<FileWarning className="w-5 h-5" />} accent="warning" />
      <StatCard label="Open Work Logs" value="27" sub="In current cycle" icon={<ClipboardList className="w-5 h-5" />} accent="info" />
      <StatCard label="Pending Payments" value="Rs. 1.84M" sub="9 batches awaiting release" icon={<Wallet className="w-5 h-5" />} accent="gold" />
      <StatCard label="Leave Entries (Apr)" value="68" sub="Casual · Earned · Sick" icon={<CalendarDays className="w-5 h-5" />} accent="success" />
      <StatCard label="LFP Credits (Apr)" value="142 hrs" sub="Late-sitting facility" icon={<TrendingUp className="w-5 h-5" />} accent="danger" />
    </div>

    <div className="grid grid-cols-3 gap-5 mt-6">
      <Section title="Monthly Overtime Payment Overview" className="col-span-2">
        <div className="flex items-end gap-4 h-56 px-2">
          {chart.map(({ m, v }) => (
            <div key={m} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs font-semibold text-primary">Rs. {v}K</div>
              <div className="w-full bg-muted rounded-sm relative" style={{ height: "100%" }}>
                <div
                  className="absolute bottom-0 left-0 right-0 bg-gradient-command rounded-sm border-t-2 border-accent"
                  style={{ height: `${(v / max) * 100}%` }}
                />
              </div>
              <div className="label-mil text-[0.65rem]">{m}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
          <span className="label-mil">Last 6 months · Rs. in thousands</span>
          <span className="text-success font-semibold">▲ 18% vs prior period</span>
        </div>
      </Section>

      <Section title="Recent Activity">
        <ol className="space-y-4">
          {activity.map((a, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="w-2 h-2 rounded-full bg-accent" />
                {i < activity.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="label-mil text-[0.6rem] text-accent">{a.tag}</span>
                  <span className="text-[0.65rem] text-muted-foreground">{a.time}</span>
                </div>
                <p className="text-xs text-foreground leading-snug">{a.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>
    </div>

    <Section title="Quick Actions" className="mt-6">
      <div className="grid grid-cols-4 gap-3">
        <Btn variant="outline" className="h-14 justify-start"><UserPlus className="w-4 h-4" /> Enroll Personnel</Btn>
        <Btn variant="outline" className="h-14 justify-start"><FileWarning className="w-4 h-4" /> New Sanction</Btn>
        <Btn variant="outline" className="h-14 justify-start"><ClipboardList className="w-4 h-4" /> Open Work Log</Btn>
        <Btn variant="outline" className="h-14 justify-start"><Wallet className="w-4 h-4" /> Process Payment</Btn>
      </div>
    </Section>
    </AppShell>
  );
};
export default Dashboard;
