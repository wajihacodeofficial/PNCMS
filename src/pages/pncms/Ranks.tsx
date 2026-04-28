import { useState } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Field, Input } from "@/components/pncms/ui-kit";
import { Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";

const Ranks = () => {
  const [isAdding, setIsAdding] = useState(false);

  // Mock ranks
  const ranks = [
    { id: "1", name: "Assistant", level: "L1" },
    { id: "2", name: "UDC", level: "L2" },
    { id: "3", name: "LDC", level: "L2" },
    { id: "4", name: "Stenographer", level: "L1" },
    { id: "5", name: "Driver", level: "L3" },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Rank System Management"
        subtitle="Define & Configure Personnel Hierarchy"
        actions={
          <Btn variant="gold" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4" /> Create Rank</Btn>
        }
      />

      <div className="max-w-3xl">
        <Section title="System Ranks · Industrial & Ministerial">
          <div className="overflow-x-auto -m-5">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank Title</th>
                  <th>Authority Level</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ranks.map((r) => (
                  <tr key={r.id}>
                    <td className="font-bold text-primary">{r.name}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                        <span className="text-xs font-mono">{r.level}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 rounded-sm hover:bg-muted text-primary"><Pencil className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-sm hover:bg-muted text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-md shadow-elevated overflow-hidden border border-border">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg text-white font-heading font-bold">New Rank Definition</h3>
              <button onClick={() => setIsAdding(false)} className="text-white/70 hover:text-white"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Rank Title" required><Input placeholder="e.g. Senior Clerk" /></Field>
              <Field label="Authority Level" required>
                <Input placeholder="e.g. L2" />
              </Field>
              <p className="text-[0.65rem] text-muted-foreground italic">
                Authority levels determine access to specific modules like Overtime Approval or Leave Sanctioning.
              </p>
            </div>
            <div className="bg-muted/30 p-4 border-t border-border flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setIsAdding(false)}>Cancel</Btn>
              <Btn variant="gold">Create Rank</Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Ranks;
