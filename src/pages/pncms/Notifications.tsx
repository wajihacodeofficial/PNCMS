import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Badge } from "@/components/pncms/ui-kit";
import { CheckCheck, AlertTriangle, Clock, Wallet, CalendarDays, FileWarning } from "lucide-react";

const groups = [
  { title:"Pending Approvals", icon: AlertTriangle, accent:"warning" as const, items:[
    {t:"Sanction SNC-2026-0142 awaiting Director approval", time:"12 min ago", tag:"Sanction"},
    {t:"Sanction SNC-2026-0138 pending Section Officer verification", time:"2 hr ago", tag:"Sanction"},
    {t:"Leave Application LV-2026-091 (Bilal A. Siddiqui) awaiting verification", time:"4 hr ago", tag:"Leave"},
  ]},
  { title:"Pending Payments", icon: Wallet, accent:"info" as const, items:[
    {t:"Payment batch APR-2026-C ready for disbursement (Rs. 84,200)", time:"Today 09:10", tag:"Payment"},
    {t:"3 employees awaiting overtime payment for Mar 2026", time:"Yesterday", tag:"Payment"},
  ]},
  { title:"Leave Conflicts", icon: CalendarDays, accent:"danger" as const, items:[
    {t:"Saima Nawaz exceeded EL allocation by 2 days", time:"1 hr ago", tag:"Leave"},
    {t:"Two staff in Logistics on simultaneous CL — coverage warning", time:"3 hr ago", tag:"Leave"},
  ]},
  { title:"System Alerts", icon: FileWarning, accent:"primary" as const, items:[
    {t:"Auto-backup completed successfully (248 MB)", time:"02:00", tag:"System"},
    {t:"Failed login attempt from 172.31.4.12 — review audit log", time:"Yesterday 16:11", tag:"Security"},
  ]},
];

const Notifications = () => (
  <AppShell>
    <PageHeader
      title="Notifications & Alerts"
      subtitle="Operational Events Requiring Attention"
      actions={<Btn variant="outline"><CheckCheck className="w-4 h-4" /> Mark All Read</Btn>}
    />
    <div className="grid grid-cols-2 gap-5">
      {groups.map(g=>(
        <Section key={g.title} title={`${g.title} · ${g.items.length}`}>
          <ul className="space-y-3">
            {g.items.map((it,i)=>(
              <li key={i} className="flex items-start gap-3 p-3 border border-border rounded-sm bg-muted/30 hover:bg-muted/60 transition">
                <div className={`w-9 h-9 rounded-sm flex items-center justify-center bg-${g.accent}/10 text-${g.accent} shrink-0`}>
                  <g.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary">{it.t}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="neutral">{it.tag}</Badge>
                    <span className="text-[0.65rem] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {it.time}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      ))}
    </div>
  </AppShell>
);
export default Notifications;