import { useState } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Badge, Section, Field, Input, Select } from "@/components/pncms/ui-kit";
import { Plus, ShieldAlert, FileText, User, Gavel, Search, Trash2, Pencil } from "lucide-react";

interface DisciplineRecord {
  id: string;
  svc: string;
  name: string;
  offense: string;
  action: string;
  date: string;
  ref: string;
  status: "Closed" | "Ongoing" | "Appealed";
}

const Discipline = () => {
  const [isAdding, setIsAdding] = useState(false);
  
  // Mock records
  const records: DisciplineRecord[] = [
    { id: "1", svc: "PN-CIV-1048", name: "Asad Mehmood Qureshi", offense: "Unauthorized Absence", action: "Suspension", date: "15-Apr-2026", ref: "NHQ/DIS/2026/89", status: "Ongoing" },
    { id: "2", svc: "PN-CIV-1044", name: "Bilal Ahmed Siddiqui", offense: "Late Attendance", action: "Written Warning", date: "10-Apr-2026", ref: "NHQ/DIS/2026/42", status: "Closed" },
    { id: "3", svc: "PN-CIV-1042", name: "Muhammad Tariq Khan", offense: "Misconduct", action: "Fine (Rs. 2000)", date: "02-Apr-2026", ref: "NHQ/DIS/2026/12", status: "Closed" },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Disciplinary Actions"
        subtitle="Manage Conduct · Warnings · Personnel Proceedings"
        actions={
          <Btn variant="danger" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4" /> Log Disciplinary Action</Btn>
        }
      />

      <Section title="Discipline Log · Active & Past Proceedings">
        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service No</th>
                <th>Employee</th>
                <th>Offense Type</th>
                <th>Action Taken</th>
                <th>Date</th>
                <th>Reference</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="font-mono text-xs text-primary font-semibold">{r.svc}</td>
                  <td className="font-semibold">{r.name}</td>
                  <td className="text-xs">{r.offense}</td>
                  <td>
                    <Badge variant={r.action.includes("Suspension") ? "danger" : "warning"}>
                      {r.action}
                    </Badge>
                  </td>
                  <td className="text-xs">{r.date}</td>
                  <td className="font-mono text-[0.65rem] text-muted-foreground">{r.ref}</td>
                  <td>
                    <Badge variant={r.status === "Closed" ? "success" : r.status === "Ongoing" ? "warning" : "info"}>
                      {r.status}
                    </Badge>
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

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in zoom-in-95 duration-200">
          <div className="bg-card w-full max-w-2xl rounded-md shadow-elevated overflow-hidden border border-border">
            <div className="bg-destructive px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-lg font-heading font-bold uppercase tracking-wider">Log Disciplinary Proceeding</h3>
              </div>
              <button onClick={() => setIsAdding(false)} className="text-white/70 hover:text-white"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Service No" required><Input placeholder="e.g. PN-CIV-1048" /></Field>
                <Field label="Employee Name" required><Input /></Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Offense Type" required>
                  <Select>
                    <option>Unauthorized Absence</option>
                    <option>Late Attendance</option>
                    <option>Misconduct</option>
                    <option>Insubordination</option>
                    <option>Professional Negligence</option>
                  </Select>
                </Field>
                <Field label="Action Taken" required>
                  <Select>
                    <option>Verbal Warning</option>
                    <option>Written Warning</option>
                    <option>Fine (Deduction)</option>
                    <option>Suspension</option>
                    <option>Termination</option>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Effective Date" required><Input type="date" /></Field>
                <Field label="Letter Reference No" required><Input placeholder="e.g. NHQ/DIS/2026/..." /></Field>
              </div>

              <Field label="Remarks / Summary"><Input placeholder="Detail description of the incident" /></Field>
            </div>
            <div className="bg-muted/30 p-4 border-t border-border flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setIsAdding(false)}>Cancel</Btn>
              <Btn variant="danger"><Gavel className="w-4 h-4" /> Commit Record</Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Discipline;
