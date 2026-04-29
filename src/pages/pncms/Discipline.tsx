import { useState, useMemo } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import {
  Btn,
  Badge,
  Section,
  Field,
  Input,
  Select,
} from '@/components/pncms/ui-kit';
import {
  Plus,
  ShieldAlert,
  Gavel,
  Search,
  Trash2,
  X,
  Eye,
  FileText,
  Calendar,
  User,
  Hash,
  Activity,
  Printer,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

interface DisciplineRecord {
  id: string;
  svc: string;
  name: string;
  offense: string;
  action: string;
  date: string;
  ref: string;
  status: 'Closed' | 'Ongoing' | 'Appealed';
  details: string;
  remarks: string;
  authority: string;
}

const INITIAL_RECORDS: DisciplineRecord[] = [
  {
    id: '1',
    svc: '10480',
    name: 'Asad Mehmood Qureshi',
    offense: 'Unauthorized Absence',
    action: 'Suspension',
    date: '2026-04-15',
    ref: 'NHQ/DIS/2026/89',
    status: 'Ongoing',
    details: 'Individual found absent during muster call.',
    remarks: 'Awaiting formal explanation letter from individual.',
    authority: 'Cdr. Imtiaz Ali'
  },
  {
    id: '2',
    svc: '10440',
    name: 'Bilal Ahmed Siddiqui',
    offense: 'Late Attendance',
    action: 'Written Warning',
    date: '2026-04-10',
    ref: 'NHQ/DIS/2026/42',
    status: 'Closed',
    details: 'Consistent late arrival record.',
    remarks: 'Individual warned. Improvement noted in last 3 days.',
    authority: 'Lt. Cdr. Farooq'
  },
];

const Discipline = () => {
  const [records, setRecords] = useState<DisciplineRecord[]>(INITIAL_RECORDS);
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCase, setSelectedCase] = useState<DisciplineRecord | null>(null);

  const [form, setForm] = useState<Partial<DisciplineRecord>>({
    svc: '',
    name: '',
    offense: 'Unauthorized Absence',
    action: 'Written Warning',
    date: '',
    ref: '',
    status: 'Ongoing',
    details: '',
    remarks: '',
    authority: 'Cdr. Imtiaz Ali'
  });

  const handleSave = () => {
    if (!form.svc || !form.name || !form.date || !form.ref) {
      toast.error('Required fields missing');
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
      status: (form.status as any) || 'Ongoing',
      details: form.details || '',
      remarks: form.remarks || '',
      authority: form.authority || 'Commanding Officer'
    };

    setRecords([newRecord, ...records]);
    setIsAdding(false);
    toast.success('Disciplinary action logged');
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
    toast.info('Record removed from log');
  };

  const filteredRecords = useMemo(() => {
    return records.filter(
      (r) =>
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
          <Btn variant="danger" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" /> Log Proceeding
          </Btn>
        }
      />

      <Section title={`Discipline Log · ${filteredRecords.length} Records`}>
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
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-primary/5 cursor-pointer transition-colors group" onClick={() => setSelectedCase(r)}>
                  <td className="font-mono text-xs text-primary font-bold">{r.svc}</td>
                  <td className="font-semibold">{r.name}</td>
                  <td className="text-xs">{r.offense}</td>
                  <td><Badge variant={r.action.includes('Suspension') ? 'danger' : 'warning'}>{r.action}</Badge></td>
                  <td className="text-xs font-mono">{r.date}</td>
                  <td><Badge variant={r.status === 'Closed' ? 'success' : 'warning'}>{r.status}</Badge></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1.5 rounded-sm hover:bg-primary/10 text-primary" onClick={() => setSelectedCase(r)}><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-sm hover:bg-destructive/10 text-destructive" onClick={() => deleteRecord(r.id)}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-3xl rounded-md shadow-elevated border border-border flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="bg-primary px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white">
                <FileText className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-heading font-bold uppercase tracking-wider">Case Detail: {selectedCase.ref}</h3>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-8 grid grid-cols-3 gap-8 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-sm border border-border">
                  <label className="label-mil text-primary opacity-60 mb-2 block">Personnel</label>
                  <div className="font-bold text-lg">{selectedCase.name}</div>
                  <div className="font-mono text-xs mt-1 text-muted-foreground">{selectedCase.svc}</div>
                </div>
                <div className="bg-muted/30 p-4 rounded-sm border border-border">
                  <label className="label-mil text-primary opacity-60 mb-2 block">Log Information</label>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between"><span>Date:</span><span className="font-bold">{selectedCase.date}</span></div>
                    <div className="flex justify-between"><span>Status:</span><Badge variant={selectedCase.status === 'Closed' ? 'success' : 'warning'}>{selectedCase.status}</Badge></div>
                    <div className="flex justify-between"><span>Authority:</span><span className="font-bold">{selectedCase.authority}</span></div>
                  </div>
                </div>
              </div>

              <div className="col-span-2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-destructive/5 p-4 rounded-sm border border-destructive/20">
                    <label className="label-mil text-destructive mb-1 block">Offense</label>
                    <div className="font-bold">{selectedCase.offense}</div>
                  </div>
                  <div className="bg-warning/5 p-4 rounded-sm border border-warning/20">
                    <label className="label-mil text-warning mb-1 block">Action Taken</label>
                    <div className="font-bold">{selectedCase.action}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-mil text-primary opacity-60 block">Case Findings / Narrative</label>
                  <div className="bg-muted/30 p-4 rounded-sm border border-border text-sm leading-relaxed min-h-[100px]">
                    {selectedCase.details || 'No narrative details provided.'}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label-mil text-primary opacity-60 block flex items-center gap-2"><MessageSquare className="w-3 h-3" /> Office Remarks</label>
                  <div className="bg-accent/5 p-4 rounded-sm border border-accent/20 text-sm italic text-primary/80">
                    {selectedCase.remarks || 'No specific remarks recorded.'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 p-5 border-t border-border flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setSelectedCase(null)}>Close View</Btn>
              <Btn variant="gold"><Printer className="w-4 h-4" /> Print Case Sheet</Btn>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-3xl rounded-md shadow-elevated overflow-hidden border border-border animate-in zoom-in-95">
            <div className="bg-destructive px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-lg font-heading font-bold uppercase tracking-wider">Log Disciplinary Proceeding</h3>
              </div>
              <button onClick={() => setIsAdding(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Service No" required><Input placeholder="e.g. 10480" value={form.svc} onChange={(e) => setForm({ ...form, svc: e.target.value })} /></Field>
                <Field label="Employee Name" required><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Offense Type" required>
                  <Select value={form.offense} onChange={(e) => setForm({ ...form, offense: e.target.value })}>
                    <option>Unauthorized Absence</option>
                    <option>Late Attendance</option>
                    <option>Misconduct</option>
                    <option>Professional Negligence</option>
                  </Select>
                </Field>
                <Field label="Action Taken" required>
                  <Select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}>
                    <option>Written Warning</option>
                    <option>Fine (Deduction)</option>
                    <option>Suspension</option>
                    <option>Termination</option>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Effective Date" required><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
                <Field label="Letter Reference No" required><Input placeholder="NHQ/DIS/2026/..." value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value })} /></Field>
              </div>
              <Field label="Detailed Narrative"><textarea className="w-full p-3 bg-card border border-border rounded-sm text-sm min-h-[80px] focus:outline-none focus:border-accent" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Describe the incident and findings..." /></Field>
              <Field label="Office Remarks"><textarea className="w-full p-3 bg-accent/5 border border-accent/20 rounded-sm text-sm min-h-[60px] focus:outline-none focus:border-accent" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Internal notes or followup requirements..." /></Field>
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
