import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Field, Input, Select, Section } from "@/components/pncms/ui-kit";
import { Save, FileCheck2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { personnel } from "@/data/mock";

const LeaveEntry = () => {
  const navigate = useNavigate();
  return (
    <AppShell>
      <PageHeader
        title="New Leave Record"
        subtitle="Manual Leave Entry · Admin Clerk"
        actions={
          <>
            <Btn variant="outline" onClick={() => navigate("/leave")}>Cancel</Btn>
            <Btn variant="primary"><Save className="w-4 h-4" /> Save Draft</Btn>
            <Btn variant="gold"><FileCheck2 className="w-4 h-4" /> Record Leave</Btn>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-5">
        <Section title="Leave Particulars" className="col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Employee" required>
              <Select>{personnel.map(p=><option key={p.svc}>{p.name} · {p.svc}</option>)}</Select>
            </Field>
            <Field label="Cadre / Department"><Input defaultValue="Clerical · Administration" disabled /></Field>
            <Field label="Leave Type" required>
              <Select>
                <option>Casual Leave (CL)</option>
                <option>Earned / Recreation Leave (RL)</option>
                <option>Medical Leave (ML)</option>
                <option>Disability Leave (DL)</option>
                <option>Leave Without Pay (LWOP)</option>
                <option>Late-Sitting Facility (LFP)</option>
              </Select>
            </Field>
            <Field label="Application Date"><Input type="date" /></Field>
            <Field label="From Date" required><Input type="date" /></Field>
            <Field label="To Date" required><Input type="date" /></Field>
            <Field label="No. of Days" required><Input type="number" defaultValue="3" /></Field>
            <Field label="Reliever (if any)"><Input /></Field>
            <div className="col-span-2"><Field label="Remarks / Reason"><Input placeholder="Reason for leave" /></Field></div>
          </div>
        </Section>

        <Section title="Current Balance">
          <div className="space-y-2.5 text-sm">
            {[["CL",12,20],["RL",18,30],["ML",6,10],["DL",2,5],["LWOP",0,365],["LFP",4,12]].map(([k,v,m])=>(
              <div key={k as string} className="border border-border rounded-sm p-2.5 bg-muted/30">
                <div className="flex justify-between"><span className="label-mil">{k}</span><span className="font-mono font-bold text-primary">{v} / {m}</span></div>
                <div className="h-1.5 mt-1.5 bg-muted rounded-sm overflow-hidden"><div className="h-full bg-accent" style={{width:`${(v as number)/(m as number)*100}%`}} /></div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
};
export default LeaveEntry;