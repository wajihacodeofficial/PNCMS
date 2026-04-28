import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Field, Input, Badge } from "@/components/pncms/ui-kit";
import { Save, AlertTriangle, ShieldCheck, Shield, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const audit = [
  { time: "28-Apr-2026 09:42:11", user: "ADM-CLERK-04", action: "Submitted sanction SNC-2026-0142", target: "Muhammad Tariq Khan", ip: "10.14.22.41" },
  { time: "28-Apr-2026 09:18:04", user: "ADM-CLERK-04", action: "Closed work log", target: "Aisha Rehman", ip: "10.14.22.41" },
  { time: "28-Apr-2026 08:55:33", user: "FIN-OFC-02", action: "Disbursed payment batch APR-2026-B", target: "—", ip: "10.14.30.12" },
  { time: "28-Apr-2026 08:30:09", user: "ADM-CLERK-04", action: "Opened daily muster roll", target: "—", ip: "10.14.22.41" },
  { time: "27-Apr-2026 16:12:57", user: "ADM-CLERK-04", action: "Updated overtime hourly rate", target: "Rate: 380 → 420", ip: "10.14.22.41" },
];

const Settings = () => {
  const navigate = useNavigate();
  return (
  <AppShell>
    <PageHeader
      title="System Settings & Control"
      subtitle="Operational Parameters · Audit Trail"
      actions={<Btn variant="gold"><Save className="w-4 h-4" /> Save Configuration</Btn>}
    />

    <div className="grid grid-cols-12 gap-5">
      <Section title="System Parameters" className="col-span-7">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Overtime Hourly Rate (Rs.)" required><Input type="number" defaultValue={420} /></Field>
          <Field label="Working Hours Per Day" required><Input type="number" defaultValue={8} /></Field>
          <Field label="Working Days Per Week"><Input type="number" defaultValue={5} /></Field>
          <Field label="LFP Credit Threshold (hrs)"><Input type="number" defaultValue={2} /></Field>
          <Field label="Late Arrival Cutoff"><Input type="time" defaultValue="09:00" /></Field>
          <Field label="Financial Year Start"><Input type="date" defaultValue="2026-07-01" /></Field>
          <Field label="Approving Authority Default"><Input defaultValue="Cdr. Imtiaz Ali" /></Field>
          <Field label="Currency"><Input defaultValue="PKR" disabled /></Field>
        </div>
      </Section>

      <div className="col-span-5 space-y-5">
        <div className="panel border-l-4 border-l-warning p-5 bg-warning/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="heading-mil text-sm text-warning tracking-wider">Authority Notice</h4>
              <p className="text-xs text-foreground/80 mt-2 leading-relaxed">
                Modifying core financial parameters affects all open work logs and pending payment batches. Configuration changes are recorded in the audit trail and require Authority Level L4 confirmation.
              </p>
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-success" />
            <h4 className="heading-mil text-sm text-primary tracking-wider">Security Posture</h4>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="label-mil">Encryption</span><Badge variant="success">AES-256 Active</Badge></div>
            <div className="flex justify-between"><span className="label-mil">Session Lock</span><Badge variant="success">10 min idle</Badge></div>
            <div className="flex justify-between"><span className="label-mil">Backup Cycle</span><Badge variant="info">Daily 02:00</Badge></div>
            <div className="flex justify-between"><span className="label-mil">Last Backup</span><span className="font-mono text-[0.7rem]">28-Apr-2026 02:00</span></div>
          </div>
        </div>

        <div className="panel p-5 border-t-4 border-t-gold">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gold" />
            <h4 className="heading-mil text-sm text-primary tracking-wider">Administrative Controls</h4>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Btn variant="outline" className="justify-start h-10" onClick={() => navigate("/settings/departments")}>
              <Building2 className="w-4 h-4 mr-2" /> Manage Departments
            </Btn>
            <Btn variant="outline" className="justify-start h-10" onClick={() => navigate("/settings/ranks")}>
              <ShieldCheck className="w-4 h-4 mr-2" /> Manage Rank System
            </Btn>
          </div>
        </div>
      </div>
    </div>

    <Section title="Audit Trail · Last 50 Operations" className="mt-6">
      <div className="overflow-x-auto -m-5">
        <table className="data-table">
          <thead><tr><th>Timestamp</th><th>Operator</th><th>Action</th><th>Target</th><th>IP Address</th></tr></thead>
          <tbody>
            {audit.map((a,i)=>(
              <tr key={i}>
                <td className="font-mono text-xs">{a.time}</td>
                <td><Badge variant="info">{a.user}</Badge></td>
                <td>{a.action}</td>
                <td className="text-muted-foreground">{a.target}</td>
                <td className="font-mono text-xs">{a.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  </AppShell>
  );
};
export default Settings;
