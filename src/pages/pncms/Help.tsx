import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section } from "@/components/pncms/ui-kit";
import { Search, BookOpen, PlayCircle, LifeBuoy, Phone, Mail } from "lucide-react";
import { useState } from "react";

const topics = [
  { c:"Getting Started", items:["First Login & Two-Factor","Dashboard Walk-through","Navigation Basics","Keyboard Shortcuts"] },
  { c:"Personnel", items:["Add a New Employee","Edit / Update Records","Bulk Import via CSV","Print Personnel Profile"] },
  { c:"Overtime & Sanctions", items:["Create a Sanction","Bulk Sanction Entry","Approval Workflow","Work Log vs Sanctioned Hours"] },
  { c:"Payments", items:["Hourly Rate Configuration","Generating Payment Batch","Paid-with-Salary Flag","Disbursement Audit Trail"] },
  { c:"Leave", items:["Leave Types Overview","Recording a Leave","Auto Credit & LFP","Year-End Carry-Forward"] },
  { c:"Reports", items:["Choosing a Report","Exporting to PDF/Excel","Printing","Authorized Distribution"] },
];

const Help = () => {
  const [q,setQ] = useState("");
  return (
    <AppShell>
      <PageHeader title="Help & User Manual" subtitle="PNCMS Operational Handbook · v1.0" />

      <div className="panel p-7 mb-6 bg-gradient-command text-white">
        <h2 className="text-2xl">How can we help, Admin Clerk?</h2>
        <p className="text-sm text-white/70 mt-1">Search the manual, browse topics, or contact technical support.</p>
        <div className="mt-5 relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search help articles…" className="w-full h-12 pl-12 pr-4 rounded-sm bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-accent" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-6">
        {[[BookOpen,"User Manual","Complete PDF handbook"],[PlayCircle,"Video Tutorials","12 narrated walkthroughs"],[LifeBuoy,"Raise a Ticket","CV-Solutions support desk"]].map(([Icon,t,d]: any)=>(
          <article key={t} className="panel p-5 flex items-center gap-4 hover:shadow-elevated transition cursor-pointer">
            <div className="w-12 h-12 rounded-sm bg-primary text-accent flex items-center justify-center"><Icon className="w-5 h-5" /></div>
            <div><h3 className="heading-mil text-base text-primary">{t}</h3><p className="text-xs text-muted-foreground">{d}</p></div>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {topics.map(t=>(
          <Section key={t.c} title={t.c}>
            <ul className="text-sm space-y-2">
              {t.items.map(i=><li key={i} className="flex items-start gap-2 text-primary hover:text-accent cursor-pointer"><span className="text-muted-foreground">›</span>{i}</li>)}
            </ul>
          </Section>
        ))}
      </div>

      <Section title="Contact Support" className="mt-5">
        <div className="grid grid-cols-3 gap-5 text-sm">
          <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary" /><div><div className="label-mil">Helpdesk</div><div className="font-semibold">+92-21-9920-1234 ext. 4421</div></div></div>
          <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary" /><div><div className="label-mil">Email</div><div className="font-semibold">support@codevertex.pk</div></div></div>
          <div><Btn variant="gold" className="w-full">Open New Ticket</Btn></div>
        </div>
      </Section>
    </AppShell>
  );
};
export default Help;