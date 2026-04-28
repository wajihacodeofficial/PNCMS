import { useState, useMemo } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Badge, Section, Field, Input, Select } from "@/components/pncms/ui-kit";
import { Plus, ShieldAlert, Gavel, Search, Trash2, Pencil, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

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

const INITIAL_RECORDS: DisciplineRecord[] = [
  { id: "1", svc: "PN-CIV-1048", name: "Asad Mehmood Qureshi", offense: "Unauthorized Absence", action: "Suspension", date: "2026-04-15", ref: "NHQ/DIS/2026/89", status: "Ongoing" },
  { id: "2", svc: "PN-CIV-1044", name: "Bilal Ahmed Siddiqui", offense: "Late Attendance", action: "Written Warning", date: "2026-04-10", ref: "NHQ/DIS/2026/42", status: "Closed" },
  { id: "3", svc: "PN-CIV-1042", name: "Muhammad Tariq Khan", offense: "Misconduct", action: "Fine (Rs. 2000)", date: "2026-04-02", ref: "NHQ/DIS/2026/12", status: "Closed" },
];

const Discipline = () => {
  const [records, setRecords] = useState<DisciplineRecord[]>(INITIAL_RECORDS);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  
  // Form State
  const [form, setForm] = useState<Partial<DisciplineRecord>>({
    svc: "", name: "", offense: "Unauthorized Absence", action: "Written Warning", date: "", ref: "", status: "Ongoing"
  });

  const handleSave = () => {
    if (!form.svc || !form.name || !form.date || !form.ref) {
      toast.error("Required fields missing", { description: "Please fill in all mandatory service details." });
      return;
    }

    const newRecord: DisciplineRecord = {
      id: Math.random().toString(36).substr(2, 9),
      svc: form.svc!,
      name: form.name!,
      offense: form.offense!,
      action: form.action!,
      date: form.date!,
      ref: form.ref!,
      status: form.status as any || "Ongoing"
    };

    setRecords([newRecord, ...records]);
    setIsAdding(false);
    setForm({ svc: "", name: "", offense: "Unauthorized Absence", action: "Written Warning", date: "", ref: "", status: "Ongoing" });
    toast.success("Disciplinary action logged", { description: `Record created for ${form.name}` });
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
    toast.info("Record removed from log");
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase()) || 
      r.svc.toLowerCase().includes(search.toLowerCase()) ||
      r.ref.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, records]);

  return (
    <AppShell>
      <PageHeader
        title="Disciplinary Actions"
        subtitle="Manage Conduct · Warnings · Personnel Proceedings"
        actions={
          <Btn variant="danger" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4" /> Log Proceeding</Btn>
        }
      />

      <Section title={`Discipline Log · ${filteredRecords.length} Active & Past Proceedings`}>
        <div className="mb-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            placeholder="Search by name, service number or letter reference..." 
            className="w-full h-11 pl-10 pr-3 bg-muted/20 border border-border rounded-sm focus:outline-none focus:border-accent transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                  <td className="font-mono text-xs text-primary font-semibold">{r.svc}</td>
                  <td className="font-semibold">{r.name}</td>
                  <td className="text-xs">{r.offense}</td>
                  <td>
                    <Badge variant={r.action.includes("Suspension") || r.action.includes("Termination") ? "danger" : "warning"}>
                      {r.action}
                    </Badge>
                  </td>
                  <td className="text-xs font-mono">{r.date}</td>
                  <td className="font-mono text-[0.65rem] text-muted-foreground">{r.ref}</td>
                  <td>
                    <Badge variant={r.status === "Closed" ? "success" : r.status === "Ongoing" ? "warning" : "info"}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1 opacity-60 hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-sm hover:bg-primary/10 text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteRecord(r.id)} className="p-1.5 rounded-sm hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-muted-foreground italic">
                    No disciplinary records found.
                  </td>
                </tr>
              )}
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
              <button onClick={() => setIsAdding(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Service No" required>
                  <Input 
                    placeholder="e.g. PN-CIV-1048" 
                    value={form.svc} 
                    onChange={e => setForm({...form, svc: e.target.value})} 
                  />
                </Field>
                <Field label="Employee Name" required>
                  <Input 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Offense Type" required>
                  <Select value={form.offense} onChange={e => setForm({...form, offense: e.target.value})}>
                    <option>Unauthorized Absence</option>
                    <option>Late Attendance</option>
                    <option>Misconduct</option>
                    <option>Insubordination</option>
                    <option>Professional Negligence</option>
                  </Select>
                </Field>
                <Field label="Action Taken" required>
                  <Select value={form.action} onChange={e => setForm({...form, action: e.target.value})}>
                    <option>Verbal Warning</option>
                    <option>Written Warning</option>
                    <option>Fine (Deduction)</option>
                    <option>Suspension</option>
                    <option>Termination</option>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Effective Date" required>
                  <Input 
                    type="date" 
                    value={form.date} 
                    onChange={e => setForm({...form, date: e.target.value})} 
                  />
                </Field>
                <Field label="Letter Reference No" required>
                  <Input 
                    placeholder="e.g. NHQ/DIS/2026/..." 
                    value={form.ref} 
                    onChange={e => setForm({...form, ref: e.target.value})} 
                  />
                </Field>
              </div>

              <Field label="Status">
                <Select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                  <option>Ongoing</option>
                  <option>Closed</option>
                  <option>Appealed</option>
                </Select>
              </Field>
            </div>
            <div className="bg-muted/30 p-4 border-t border-border flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setIsAdding(false)}>Cancel</Btn>
              <Btn variant="danger" onClick={handleSave}><Gavel className="w-4 h-4" /> Commit Record</Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Discipline;
