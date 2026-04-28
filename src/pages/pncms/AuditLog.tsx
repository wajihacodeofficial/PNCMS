import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Badge } from "@/components/pncms/ui-kit";
import { Download, Filter, Search } from "lucide-react";

const logs = [
  { time:"28-Apr 09:42:11", user:"Admin Clerk", role:"L3", action:"CREATE", entity:"Sanction SNC-2026-0142", ip:"10.4.21.18", result:"Success" },
  { time:"28-Apr 09:18:54", user:"Admin Clerk", role:"L3", action:"UPDATE", entity:"WorkLog WL-AR-042", ip:"10.4.21.18", result:"Success" },
  { time:"28-Apr 08:55:02", user:"Admin Clerk", role:"L3", action:"DISBURSE", entity:"Payment Batch APR-2026-B", ip:"10.4.21.18", result:"Success" },
  { time:"28-Apr 08:30:00", user:"Admin Clerk", role:"L3", action:"OPEN", entity:"Muster Roll 28-Apr-2026", ip:"10.4.21.18", result:"Success" },
  { time:"28-Apr 08:12:17", user:"Section Off.", role:"L4", action:"APPROVE", entity:"Sanction SNC-2026-0141", ip:"10.4.21.04", result:"Success" },
  { time:"27-Apr 17:55:09", user:"Admin Clerk", role:"L3", action:"DELETE", entity:"Draft Leave LV-DR-019", ip:"10.4.21.18", result:"Success" },
  { time:"27-Apr 16:11:42", user:"Unknown", role:"-", action:"LOGIN", entity:"Auth Gateway", ip:"172.31.4.12", result:"Failed" },
  { time:"27-Apr 14:02:38", user:"Director Civ.", role:"L5", action:"APPROVE", entity:"Sanction Batch APR-2", ip:"10.4.21.01", result:"Success" },
];

const AuditLog = () => (
  <AppShell>
    <PageHeader
      title="Audit Trail Register"
      subtitle="Tamper-Evident System Activity Log · Restricted"
      actions={<><Btn variant="outline"><Filter className="w-4 h-4" /> Filter</Btn><Btn variant="gold"><Download className="w-4 h-4" /> Export Log</Btn></>}
    />
    <Section title="Activity Records · Last 24 Hours" actions={
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input placeholder="Search user, action, entity…" className="h-9 pl-9 pr-3 w-80 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-accent" />
      </div>
    }>
      <div className="overflow-x-auto -m-5">
        <table className="data-table">
          <thead><tr><th>Time</th><th>User</th><th>Auth</th><th>Action</th><th>Affected Record</th><th>IP / Terminal</th><th>Result</th></tr></thead>
          <tbody>
            {logs.map((l,i)=>(
              <tr key={i}>
                <td className="font-mono text-xs">{l.time}</td>
                <td className="font-semibold">{l.user}</td>
                <td><Badge variant="neutral">{l.role}</Badge></td>
                <td><Badge variant={l.action==="DELETE"?"danger":l.action==="DISBURSE"||l.action==="APPROVE"?"success":"info"}>{l.action}</Badge></td>
                <td className="text-muted-foreground">{l.entity}</td>
                <td className="font-mono text-xs">{l.ip}</td>
                <td>{l.result==="Success"?<Badge variant="success">Success</Badge>:<Badge variant="danger">Failed</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  </AppShell>
);
export default AuditLog;