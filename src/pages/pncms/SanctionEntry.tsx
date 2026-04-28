import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Field, Input, Select, Section } from "@/components/pncms/ui-kit";
import { Save, Plus, Trash2, FileCheck2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { personnel } from "@/data/mock";
import { useState } from "react";

const SanctionEntry = () => {
  const navigate = useNavigate();
  const [bulk, setBulk] = useState([
    { emp: "Muhammad Tariq Khan", hours: 40 },
    { emp: "Aisha Rehman", hours: 60 },
  ]);
  return (
    <AppShell>
      <PageHeader
        title="New Sanction Entry"
        subtitle="Month-1 Overtime Sanction Authorization"
        actions={
          <>
            <Btn variant="outline" onClick={() => navigate("/sanctions")}>Cancel</Btn>
            <Btn variant="primary"><Save className="w-4 h-4" /> Save Pending</Btn>
            <Btn variant="gold"><FileCheck2 className="w-4 h-4" /> Submit for Approval</Btn>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <Section title="Single Sanction">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Employee" required>
                <Select>{personnel.map(p=><option key={p.svc}>{p.name} · {p.svc}</option>)}</Select>
              </Field>
              <Field label="Department"><Input defaultValue="Administration" disabled /></Field>
              <Field label="Sanction Month" required><Select>{["April 2026","March 2026","February 2026"].map(m=><option key={m}>{m}</option>)}</Select></Field>
              <Field label="Year" required><Input defaultValue="2026" /></Field>
              <Field label="Hours Sanctioned" required><Input type="number" defaultValue="40" /></Field>
              <Field label="Status"><Select><option>Pending</option><option>Approved</option></Select></Field>
              <div className="col-span-2"><Field label="Remarks"><Input placeholder="Justification / Authority reference" /></Field></div>
            </div>
          </Section>

          <Section title="Bulk Sanction Entry" actions={<Btn variant="outline" className="h-8 py-0" onClick={()=>setBulk([...bulk,{emp:"",hours:0}])}><Plus className="w-3 h-3" /> Add Row</Btn>}>
            <table className="data-table">
              <thead><tr><th>#</th><th>Employee</th><th>Hours</th><th>Month</th><th></th></tr></thead>
              <tbody>
                {bulk.map((b,i)=>(
                  <tr key={i}>
                    <td className="font-mono">{String(i+1).padStart(2,"0")}</td>
                    <td><Select className="w-full" defaultValue={b.emp}>{personnel.map(p=><option key={p.svc} value={p.name}>{p.name}</option>)}</Select></td>
                    <td><Input type="number" defaultValue={b.hours} className="w-24" /></td>
                    <td><Select><option>April 2026</option></Select></td>
                    <td><button onClick={()=>setBulk(bulk.filter((_,x)=>x!==i))} className="text-destructive p-1.5 hover:bg-destructive/10 rounded-sm"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Authority Hierarchy">
            <ol className="space-y-3 text-xs">
              {[
                ["01","Initiator","Admin Clerk","done"],
                ["02","Verifier","Section Officer","active"],
                ["03","Approver","Director Civilian","pending"],
                ["04","Final Sanction","DG Personnel","pending"],
              ].map(([n,role,who,s])=>(
                <li key={n} className="flex items-start gap-3">
                  <span className={`w-7 h-7 rounded-sm flex items-center justify-center font-bold text-[0.7rem] ${s==="done"?"bg-success text-white":s==="active"?"bg-primary text-white":"bg-muted text-muted-foreground"}`}>{n}</span>
                  <div>
                    <div className="label-mil">{role}</div>
                    <div className="font-semibold text-primary">{who}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
          <Section title="Policy Reference">
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li>• Max 60 OT hours per employee per month</li>
              <li>• Sanction must precede actual work-log entry</li>
              <li>• Approver authority: Director (Civ) & above</li>
              <li>• Ref: PN/CIV/OT-2024 Circular 11</li>
            </ul>
          </Section>
        </div>
      </div>
    </AppShell>
  );
};
export default SanctionEntry;