import { useState, useMemo, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import { Btn, Badge, Section, Field, Input, Select } from '@/components/pncms/ui-kit';
import {
  Plus, ShieldAlert, Gavel, Search, Trash2, X, Eye, FileText, Printer, MessageSquare, Edit3, CheckCircle, Clock, History, Send, Lock, Unlock, ShieldX
} from 'lucide-react';
import { toast } from 'sonner';
import { disciplinaryActions as INITIAL_DATA } from '@/data/mock';
import { logAction } from '@/lib/audit';

interface Correspondence {
  date: string;
  ref: string;
  subject: string;
}

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
  history?: Correspondence[];
}

const Discipline = () => {
  const [records, setRecords] = useState<DisciplineRecord[]>(() => {
    const saved = localStorage.getItem('pncms_discipline_records');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCase, setSelectedCase] = useState<DisciplineRecord | null>(null);
  const [newCorr, setNewCorr] = useState({ date: '', ref: '', subject: '' });
  
  // Security Modal
  const [unlockModal, setUnlockModal] = useState<{ type: 'edit' | 'reopen', record?: DisciplineRecord } | null>(null);
  const [unlockUsername, setUnlockUsername] = useState("");
  const [secretPassword, setSecretPassword] = useState("");

  const [form, setForm] = useState<Partial<DisciplineRecord>>({
    svc: '', name: '', offense: 'Unauthorized Absence', action: 'Written Warning',
    date: '', ref: '', status: 'Ongoing', details: '', remarks: '', authority: 'Cdr. Imtiaz Ali'
  });

  useEffect(() => {
    localStorage.setItem('pncms_discipline_records', JSON.stringify(records));
  }, [records]);

  const handleSave = () => {
    if (!form.svc || !form.name || !form.date || !form.ref) {
      toast.error('Required fields missing');
      return;
    }

    if (editingId) {
      setRecords(records.map(r => r.id === editingId ? { ...r, ...form } as DisciplineRecord : r));
      toast.success('Record updated successfully');
    } else {
      const newRecord: DisciplineRecord = {
        id: Math.random().toString(36).substr(2, 9),
        svc: form.svc!, name: form.name!, offense: form.offense!,
        action: form.action!, date: form.date!, ref: form.ref!,
        status: (form.status as any) || 'Ongoing',
        details: form.details || '', remarks: form.remarks || '',
        authority: form.authority || 'Commanding Officer',
        history: []
      };
      setRecords([newRecord, ...records]);
      logAction("CREATE", `Discipline Case: ${newRecord.ref}`, "Success");
      toast.success("Disciplinary action logged");
    }
    closeModal();
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({ svc: '', name: '', offense: 'Unauthorized Absence', action: 'Written Warning', date: '', ref: '', status: 'Ongoing', details: '', remarks: '', authority: 'Cdr. Imtiaz Ali' });
  };

  const handleEditAttempt = (r: DisciplineRecord) => {
    if (r.status === 'Closed') {
      setUnlockModal({ type: 'edit', record: r });
    } else {
      setForm(r);
      setEditingId(r.id);
      setIsAdding(true);
    }
  };

  const handleUnlockVerify = () => {
    const savedPass = localStorage.getItem("secret_password") || "998877";
    if (unlockUsername === 'Administrator' && secretPassword === savedPass) {
      if (unlockModal?.type === 'edit' && unlockModal.record) {
        setForm(unlockModal.record);
        setEditingId(unlockModal.record.id);
        setIsAdding(true);
      } else if (unlockModal?.type === 'reopen' && selectedCase) {
        const updated: DisciplineRecord = { ...selectedCase, status: 'Ongoing' };
        setRecords(records.map(r => r.id === selectedCase.id ? updated : r));
        setSelectedCase(updated);
        logAction("REOPEN", `Case File: ${selectedCase.ref}`, "Success");
        toast.success("Case reopened for further proceedings.");
      }
      setUnlockModal(null);
      setUnlockUsername("");
      setSecretPassword("");
    } else {
      logAction("OVERRIDE", `Discipline Security Failure`, "Failed");
      toast.error("Authorization Failed: Invalid Admin Credentials");
    }
  };

  const addCorrespondence = () => {
    if (!newCorr.date || !newCorr.ref || !newCorr.subject) {
      toast.error('Fill correspondence details');
      return;
    }
    if (selectedCase) {
      const updated = { ...selectedCase, history: [...(selectedCase.history || []), newCorr] };
      setRecords(records.map(r => r.id === selectedCase.id ? updated : r));
      setSelectedCase(updated);
      setNewCorr({ date: '', ref: '', subject: '' });
      toast.success('Correspondence added to case file');
    }
  };

  const closeCase = () => {
    if (selectedCase) {
      const updated: DisciplineRecord = { ...selectedCase, status: 'Closed' };
      setRecords(records.map(r => r.id === selectedCase.id ? updated : r));
      setSelectedCase(updated);
      toast.success('Case marked as CLOSED');
    }
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
      <PageHeader title="Disciplinary Actions" subtitle="Manage Conduct · Warnings · Personnel Proceedings"
        actions={<Btn variant="danger" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4" /> Log Proceeding</Btn>}
      />

      <Section title={`Discipline Log · ${filteredRecords.length} Records`}>
        <div className="mb-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input placeholder="Search records..." className="w-full h-11 pl-10 pr-3 bg-muted/20 border border-border rounded-sm focus:outline-none focus:border-accent" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr><th>Svc No</th><th>Employee</th><th>Offense</th><th>Action</th><th>Date</th><th>Status</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-primary/5 cursor-pointer group" onClick={() => setSelectedCase(r)}>
                  <td className="font-mono text-xs text-primary font-bold">{r.svc}</td>
                  <td className="font-semibold">{r.name}</td>
                  <td className="text-xs">{r.offense}</td>
                  <td><Badge variant={r.action.includes('Suspension') ? 'danger' : 'warning'}>{r.action}</Badge></td>
                  <td className="text-xs font-mono">{r.date}</td>
                  <td><Badge variant={r.status === 'Closed' ? 'success' : 'warning'}>{r.status}</Badge></td>
                  <td className="text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 rounded-sm hover:bg-primary/10 text-primary" onClick={() => setSelectedCase(r)}><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-sm hover:bg-primary/10 text-primary" onClick={() => handleEditAttempt(r)}><Edit3 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Case Detail Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-5xl h-[90vh] rounded-md shadow-elevated border border-border flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="bg-primary px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-heading font-bold uppercase italic">Case File: {selectedCase.ref}</h3>
                <Badge variant={selectedCase.status === 'Closed' ? 'success' : 'warning'} className="ml-4">{selectedCase.status.toUpperCase()}</Badge>
              </div>
              <button onClick={() => setSelectedCase(null)}><X className="w-6 h-6 text-white" /></button>
            </div>
            
            <div className="flex-1 overflow-hidden flex">
               <div className="w-1/3 border-r border-border bg-muted/10 p-6 space-y-6 overflow-y-auto">
                  <div className="panel p-4 bg-card shadow-sm border-l-4 border-primary">
                     <label className="label-mil text-primary opacity-60 block mb-1">Subject Personnel</label>
                     <div className="text-lg font-black italic">{selectedCase.name}</div>
                     <div className="text-xs font-mono text-muted-foreground">{selectedCase.svc}</div>
                  </div>
                  <div className="space-y-4">
                     <h4 className="label-mil text-primary flex items-center gap-2 font-black italic uppercase text-[0.65rem] tracking-widest"><History className="w-3.5 h-3.5 text-accent" /> Further Correspondence Log</h4>
                     <div className="space-y-3">
                        {(selectedCase.history || []).map((c, i) => (
                           <div key={i} className="text-xs p-3 bg-card border border-border rounded-sm shadow-sm animate-in slide-in-from-left-2">
                              <div className="flex justify-between font-mono text-[0.6rem] text-accent font-bold mb-1"><span>{c.date}</span><span>{c.ref}</span></div>
                              <div className="font-bold text-primary leading-tight uppercase">{c.subject}</div>
                           </div>
                        ))}
                     </div>
                     {selectedCase.status !== 'Closed' ? (
                        <div className="p-4 bg-accent/5 border border-accent/20 rounded-sm space-y-3 mt-4">
                           <div className="text-[0.6rem] font-bold text-accent uppercase mb-1">Log New Correspondence</div>
                           <input type="date" className="w-full text-[0.7rem] p-2 bg-card border border-border rounded-sm focus:border-accent outline-none" value={newCorr.date} onChange={e => setNewCorr({...newCorr, date: e.target.value})} />
                           <input placeholder="Letter Ref No..." className="w-full text-[0.7rem] p-2 bg-card border border-border rounded-sm focus:border-accent outline-none" value={newCorr.ref} onChange={e => setNewCorr({...newCorr, ref: e.target.value})} />
                           <textarea placeholder="Subject/Detail of letter..." className="w-full text-[0.7rem] p-2 bg-card border border-border rounded-sm min-h-[60px] focus:border-accent outline-none" value={newCorr.subject} onChange={e => setNewCorr({...newCorr, subject: e.target.value})} />
                           <Btn variant="gold" className="w-full h-8 text-xs font-bold" onClick={addCorrespondence}><Send className="w-3.5 h-3.5 mr-2" /> Log Correspondence</Btn>
                        </div>
                     ) : (
                        <div className="p-4 bg-success/5 border border-success/20 rounded-sm text-center">
                           <div className="text-[0.6rem] font-bold text-success uppercase">File Closed</div>
                           <div className="text-[0.55rem] text-muted-foreground mt-1">Further correspondence log is disabled.</div>
                        </div>
                     )}
                  </div>
               </div>
               <div className="flex-1 p-8 space-y-8 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-sm shadow-sm">
                       <label className="label-mil text-destructive block mb-1">Initial Offense</label>
                       <div className="font-black italic text-primary">{selectedCase.offense}</div>
                    </div>
                    <div className="p-4 bg-warning/5 border border-warning/20 rounded-sm shadow-sm">
                       <label className="label-mil text-warning block mb-1">Initial Action Taken</label>
                       <div className="font-black italic text-primary">{selectedCase.action}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                     <label className="label-mil text-primary opacity-60 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Detailed Narrative & Findings</label>
                     <div className="p-6 bg-card border border-border rounded-sm text-sm leading-relaxed shadow-inner min-h-[150px] text-justify whitespace-pre-wrap">{selectedCase.details}</div>
                  </div>
                  <div className="space-y-3">
                     <label className="label-mil text-primary opacity-60 flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5" /> Office Remarks</label>
                     <div className="p-4 bg-accent/5 border border-accent/20 rounded-sm text-sm italic text-primary/80 whitespace-pre-wrap">{selectedCase.remarks || "No remarks logged."}</div>
                  </div>
               </div>
            </div>

            <div className="bg-muted/30 p-5 border-t border-border flex justify-between items-center">
              <div className="flex gap-2">
                 {selectedCase.status !== 'Closed' ? (
                    <Btn variant="success" onClick={closeCase}><CheckCircle className="w-4 h-4 mr-2" /> Close Case File</Btn>
                 ) : (
                    <Btn variant="outline" onClick={() => setUnlockModal({ type: 'reopen' })}><Unlock className="w-4 h-4 mr-2" /> Reopen for Correspondence</Btn>
                 )}
              </div>
              <div className="flex gap-2">
                 <Btn variant="outline" onClick={() => setSelectedCase(null)}>Dismiss View</Btn>
                 <Btn variant="gold"><Printer className="w-4 h-4 mr-2" /> Export Case History</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Override Modal */}
      {unlockModal && (
        <div className="fixed inset-0 z-[200] bg-primary/70 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-md rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
            <div className="bg-destructive px-6 py-4 flex justify-between items-center text-white">
               <div className="flex items-center gap-2 text-white"><ShieldX className="w-5 h-5 text-white"/><h3 className="text-lg font-heading font-black italic uppercase text-white">Security Override</h3></div>
               <button onClick={() => setUnlockModal(null)} className="text-white"><X className="w-5 h-5 text-white"/></button>
            </div>
            <div className="p-8 space-y-6">
               <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-sm text-xs font-bold text-destructive uppercase italic leading-tight">
                  Critical Task: Administrative Authorization Required.
               </div>
               <div className="space-y-4">
                 <Field label="Admin Username"><Input placeholder="Username" value={unlockUsername} onChange={(e) => setUnlockUsername(e.target.value)} /></Field>
                 <Field label="System Password"><Input type="password" placeholder="••••••••" value={secretPassword} onChange={(e) => setSecretPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlockVerify()} /></Field>
               </div>
            </div>
            <div className="bg-muted/30 p-5 flex justify-end gap-3"><Btn variant="outline" onClick={() => setUnlockModal(null)}>Cancel</Btn><Btn variant="danger" onClick={handleUnlockVerify}>Authorize</Btn></div>
          </div>
        </div>
      )}

      {/* Form Modal (Add/Edit) */}
      {isAdding && (
        <div className="fixed inset-0 z-[150] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-3xl rounded-md shadow-elevated border border-border animate-in zoom-in-95">
            <div className="bg-destructive px-6 py-4 flex items-center justify-between text-white"><h3 className="font-heading font-bold uppercase tracking-wider">{editingId ? 'Edit' : 'Log'} Proceeding</h3><button onClick={closeModal}><X className="w-5 h-5"/></button></div>
            <div className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Svc No" required><Input value={form.svc} onChange={e => setForm({...form, svc: e.target.value})} /></Field>
                <Field label="Name" required><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Offense"><Select value={form.offense} onChange={e => setForm({...form, offense: e.target.value})}><option>Unauthorized Absence</option><option>Misconduct</option><option>Professional Negligence</option><option>Insubordination</option></Select></Field>
                <Field label="Action"><Select value={form.action} onChange={e => setForm({...form, action: e.target.value})}><option>Written Warning</option><option>Suspension</option><option>Fine</option><option>Termination</option></Select></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date" required><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></Field>
                <Field label="Reference No" required><Input value={form.ref} onChange={e => setForm({...form, ref: e.target.value})} /></Field>
              </div>
              <Field label="Findings/Narrative"><textarea className="w-full p-3 bg-card border border-border rounded-sm text-sm min-h-[100px] outline-none focus:border-accent" value={form.details} onChange={e => setForm({...form, details: e.target.value})} /></Field>
              <Field label="Remarks"><textarea className="w-full p-3 bg-accent/5 border border-accent/20 rounded-sm text-sm min-h-[60px] outline-none focus:border-accent" value={form.remarks} onChange={e => setForm({...form, remarks: e.target.value})} /></Field>
            </div>
            <div className="bg-muted/30 p-5 flex justify-end gap-3"><Btn variant="outline" onClick={closeModal}>Cancel</Btn><Btn variant="danger" onClick={handleSave}><Gavel className="w-4 h-4 mr-2" /> {editingId ? 'Update Record' : 'Commit Record'}</Btn></div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Discipline;
