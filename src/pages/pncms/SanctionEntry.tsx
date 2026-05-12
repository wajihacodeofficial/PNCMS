import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Field, Input, Select, Section } from "@/components/pncms/ui-kit";
import { Save, Plus, Trash2, FileCheck2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePersonnel, useCreateSanction } from "@/hooks/use-api";
import { useState } from "react";
import { toast } from "sonner";

const SanctionEntry = () => {
  const navigate = useNavigate();
  const { data: personnel = [] } = usePersonnel();
  const { mutate: createSanction } = useCreateSanction();
  
  const [form, setForm] = useState({
    svc: "",
    hours: "40",
    month: "April 2026",
    reason: "",
    status: "Pending"
  });

  const selectedEmployee = personnel.find(p => p.serviceNo === form.svc);

  const handleSubmit = (isFinal: boolean) => {
    if (!form.svc || !form.hours || !selectedEmployee) {
      toast.error("Please select an employee and specify hours");
      return;
    }

    createSanction({
      svc: form.svc,
      hours: parseFloat(form.hours),
      period: form.month,
      reason: form.reason || `Official Sanction for ${form.month}`,
      status: isFinal ? "Approved" : "Pending",
      date: new Date().toISOString().split('T')[0],
      sanctionId: `SN-${Date.now()}`
    }, {
      onSuccess: () => {
        toast.success(isFinal ? "Sanction Approved & Recorded" : "Sanction Request Saved");
        navigate("/sanctions");
      }
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Authorization Entry"
        subtitle="Month-1 Overtime & Late-Sitting Sanction Register"
        actions={
          <>
            <Btn variant="outline" onClick={() => navigate("/sanctions")}>Cancel</Btn>
            <Btn variant="primary" onClick={() => handleSubmit(false)}><Save className="w-4 h-4 mr-2" /> Save Draft</Btn>
            <Btn variant="gold" onClick={() => handleSubmit(true)}><FileCheck2 className="w-4 h-4 mr-2" /> Submit & Authorize</Btn>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-8 mt-6">
        <div className="col-span-2">
          <Section title="Sanction Parameters">
            <div className="grid grid-cols-2 gap-6 p-2">
              <Field label="Service Number" required>
                <Input 
                  value={form.svc} 
                  onChange={(e) => setForm({...form, svc: e.target.value})}
                  placeholder="Enter Svc No (e.g. 100489)" 
                />
              </Field>
              <Field label="Personnel Name">
                <Input value={selectedEmployee?.name || "Search Result..."} disabled className="bg-muted/50 font-bold" />
              </Field>
              <Field label="Sanction Period" required>
                <Select value={form.month} onChange={(e) => setForm({...form, month: e.target.value})}>
                  <option>April 2026</option>
                  <option>May 2026</option>
                  <option>June 2026</option>
                </Select>
              </Field>
              <Field label="Hours Authorized" required>
                <Input 
                  type="number" 
                  value={form.hours} 
                  onChange={(e) => setForm({...form, hours: e.target.value})}
                />
              </Field>
              <div className="col-span-2">
                <Field label="Operational Justification">
                  <textarea 
                    rows={4}
                    value={form.reason}
                    onChange={(e) => setForm({...form, reason: e.target.value})}
                    placeholder="Enter official justification for extra hours..."
                    className="w-full p-3 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-accent"
                  />
                </Field>
              </div>
            </div>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Policy Guidelines">
            <div className="p-4 bg-muted/20 border border-border rounded-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-accent" /></div>
                <p className="text-[0.7rem] leading-relaxed">Maximum authorized hours per personnel cannot exceed <b>60 hours</b> per month.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5"><div className="w-1.5 h-1.5 rounded-full bg-primary" /></div>
                <p className="text-[0.7rem] leading-relaxed">Sanctions must be authorized in <b>Month 1</b> for work conducted in <b>Month 2</b>.</p>
              </div>
            </div>
          </Section>
          
          <Section title="Approval Workflow">
            <div className="space-y-3">
              {[
                { n: "01", r: "Initiator", u: "Admin Clerk", s: "active" },
                { n: "02", r: "Verifier", u: "Section Officer", s: "pending" },
                { n: "03", r: "Approver", u: "Director Civilian", s: "pending" }
              ].map(step => (
                <div key={step.n} className="flex items-center gap-4 p-3 bg-card border border-border rounded-sm">
                  <span className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold text-xs ${step.s === 'active' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>{step.n}</span>
                  <div>
                    <div className="label-mil text-[0.6rem]">{step.r}</div>
                    <div className="text-xs font-bold text-primary">{step.u}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </AppShell>
  );
};
export default SanctionEntry;