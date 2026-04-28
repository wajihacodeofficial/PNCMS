import { useState } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Badge, Section, Field, Input, Select } from "@/components/pncms/ui-kit";
import { Plus, Building2, MapPin, Users, Shield, Pencil, Trash2 } from "lucide-react";

const Departments = () => {
  const [isAdding, setIsAdding] = useState(false);

  // Mock departments
  const depts = [
    { id: "1", name: "Administration", location: "NHQ Block A", navcom: "NAVCOM-S", hod: "Cdr. Imtiaz Ali", hodRank: "Commander", born: 45, sanctioned: 50 },
    { id: "2", name: "Engineering Wing", location: "Naval Dockyard", navcom: "NAVCOM-N", hod: "Lt Cdr. Sarfaraz", hodRank: "Lt Commander", born: 120, sanctioned: 150 },
    { id: "3", name: "Logistics Command", location: "Karsaz", navcom: "NAVCOM-E", hod: "Capt. Mansoor", hodRank: "Captain", born: 85, sanctioned: 100 },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Department Management"
        subtitle="Manage Establishments · Units · Strength Control"
        actions={
          <Btn variant="gold" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4" /> Add Department</Btn>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <Section title="Active Departments · Establishment Strength">
          <div className="overflow-x-auto -m-5">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Location</th>
                  <th>NAVCOM</th>
                  <th>HOD / OIC</th>
                  <th>Born Strength</th>
                  <th>Sanctioned</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {depts.map((d) => (
                  <tr key={d.id}>
                    <td className="font-bold text-primary">{d.name}</td>
                    <td>
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin className="w-3 h-3 text-accent" />
                        {d.location}
                      </div>
                    </td>
                    <td><Badge variant="neutral">{d.navcom}</Badge></td>
                    <td>
                      <div className="text-xs">
                        <p className="font-semibold">{d.hod}</p>
                        <p className="text-muted-foreground text-[0.6rem] uppercase">{d.hodRank}</p>
                      </div>
                    </td>
                    <td className="font-mono text-sm">{d.born}</td>
                    <td className="font-mono text-sm">{d.sanctioned}</td>
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
          <div className="bg-card w-full max-w-2xl rounded-md shadow-elevated overflow-hidden border border-border">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg text-white font-heading font-bold">Register New Department</h3>
              <button onClick={() => setIsAdding(false)} className="text-white/70 hover:text-white"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Department Name" required><Input placeholder="e.g. Finance Directorate" /></Field>
                <Field label="Location" required><Input placeholder="e.g. NHQ Block B" /></Field>
                <Field label="Navcom" required>
                  <Select>
                    <option>NAVCOM-S</option>
                    <option>NAVCOM-N</option>
                    <option>NAVCOM-E</option>
                    <option>NAVCOM-W</option>
                  </Select>
                </Field>
                <Field label="Establishment Code"><Input placeholder="e.g. EST-202" /></Field>
              </div>

              <div className="gold-rule" />
              
              <div className="grid grid-cols-2 gap-4">
                <Field label="HOD / OIC Name" required><Input /></Field>
                <Field label="HOD Rank" required><Input /></Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Born Strength (Current)" required><Input type="number" /></Field>
                <Field label="Approved Sanction Strength" required><Input type="number" /></Field>
              </div>
            </div>
            <div className="bg-muted/30 p-4 border-t border-border flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setIsAdding(false)}>Cancel</Btn>
              <Btn variant="gold">Save Department</Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Departments;
