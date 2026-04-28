import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, StatCard, Badge } from "@/components/pncms/ui-kit";
import { Plus, CalendarDays, UserCheck, Clock, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LeaveDashboard = () => {
  const navigate = useNavigate();
  return (
    <AppShell>
      <PageHeader
        title="Leave Command Centre"
        subtitle="Civilian Leave Operations · Monthly Overview"
        actions={
          <>
            <Btn variant="outline" onClick={() => navigate("/leave/ledger")}>View Ledger</Btn>
            <Btn variant="gold" onClick={() => navigate("/leave/new")}><Plus className="w-4 h-4" /> New Leave Record</Btn>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-5 mb-6">
        <StatCard label="Currently On Leave" value="14" sub="of 412 personnel" accent="warning" icon={<CalendarDays className="w-5 h-5" />} />
        <StatCard label="Pending Records" value="06" sub="awaiting verification" accent="info" icon={<Clock className="w-5 h-5" />} />
        <StatCard label="Leaves This Month" value="48" sub="Apr 2026" accent="primary" icon={<UserCheck className="w-5 h-5" />} />
        <StatCard label="LFP Eligible" value="32" sub="late-sitting credit due" accent="success" icon={<Award className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Section title="Current On-Leave Personnel">
          <table className="data-table">
            <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>Days</th></tr></thead>
            <tbody>
              {[
                ["Bilal Ahmed Siddiqui","Casual","20-Apr-26","3"],
                ["Saima Nawaz","Earned","18-Apr-26","7"],
                ["Imran Hussain Shah","Medical","22-Apr-26","2"],
                ["Nazia Akhtar","Casual","25-Apr-26","1"],
              ].map(r=>(
                <tr key={r[0]}><td className="font-semibold">{r[0]}</td><td><Badge variant="info">{r[1]}</Badge></td><td>{r[2]}</td><td className="font-mono">{r[3]}</td></tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Monthly Leave Distribution">
          <div className="space-y-3 text-sm">
            {[
              ["Casual Leave (CL)",18,"primary"],
              ["Earned Leave (EL)",12,"success"],
              ["Medical Leave (ML)",9,"warning"],
              ["Disability Leave (DL)",2,"destructive"],
              ["LWOP",4,"info"],
              ["LFP Credits",3,"info"],
            ].map(([label,val,c]: any)=>(
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5"><span className="font-semibold uppercase tracking-wider">{label}</span><span className="font-mono font-bold text-primary">{val}</span></div>
                <div className="h-2 bg-muted rounded-sm overflow-hidden">
                  <div className={`h-full bg-${c}`} style={{width: `${(val as number)*5}%`}} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
};
export default LeaveDashboard;