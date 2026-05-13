import { useState, useMemo, useEffect, useRef } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import { Btn, Badge, Section, Field, Input, Select } from '@/components/pncms/ui-kit';
import {
  Plus, ShieldAlert, Gavel, Search, Trash2, X, Eye, FileText, Printer, MessageSquare, Edit3, CheckCircle, Clock, History, Send, Lock, Unlock, ShieldX, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { useDisciplinaryActions, useUpsertDisciplinaryAction, useCreateLog, usePersonnel } from '@/hooks/use-api';
import { logAction } from '@/lib/audit';
import * as ExcelJS from 'exceljs';

interface Correspondence {
  date: string;
  ref: string;
  subject: string;
  type: string;
}

interface DisciplineRecord {
  id: string;
  caseId: string;
  type: string;
  offense: string;
  action: string;
  date: string;
  status: string;
  remarks: string;
  reference: string;
  details: string;
  authority: string;
  employee: {
    serviceNo: string;
    name: string;
  };
}

const Discipline = () => {
  const { data: records = [], isLoading } = useDisciplinaryActions();
  const { data: personnel = [] } = usePersonnel();
  const { mutate: upsertAction } = useUpsertDisciplinaryAction();
  const { mutate: createLog } = useCreateLog();


  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [newCorr, setNewCorr] = useState({ date: '', ref: '', subject: '', type: 'Letter' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Security Modal
  const [unlockModal, setUnlockModal] = useState<{ type: 'edit' | 'reopen', record?: any } | null>(null);
  const [unlockUsername, setUnlockUsername] = useState("");
  const [secretPassword, setSecretPassword] = useState("");

  const [form, setForm] = useState<any>({
    svc: '', name: '', offense: 'Unauthorized Absence', action: 'Written Warning',
    date: '', ref: '', status: 'Ongoing', details: '', remarks: '', authority: 'Cdr. Imtiaz Ali',
    type: 'Regular Proceeding'
  });

  // Auto-fill personnel name from SVC number
  useEffect(() => {
    if (form.svc && form.svc.length >= 3) {
      const match = (personnel as any[]).find(p => p.serviceNo === form.svc);
      if (match && match.name !== form.name) {
        setForm(prev => ({ ...prev, name: match.name }));
      }
    }
  }, [form.svc, personnel]);


  const handleSave = () => {
    upsertAction({
      id: editingId,
      svc: form.svc,
      offense: form.offense,
      action: form.action,
      date: form.date,
      reference: form.ref,
      caseId: form.ref,
      type: form.type || 'Regular Proceeding',
      status: form.status,
      details: form.details,
      remarks: form.remarks,
      authority: form.authority
    }, {
      onSuccess: () => {
        createLog({
          user: localStorage.getItem("username") || "Admin",
          action: editingId ? "UPDATE" : "CREATE",
          entity: `Discipline: ${form.svc} - ${form.offense}`,
          result: "Success"
        });
        toast.success(editingId ? "Case updated successfully" : "Proceeding logged successfully");
        closeModal();
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to save record");
      }
    });
  };

  const closeModal = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({ svc: '', name: '', offense: 'Unauthorized Absence', action: 'Written Warning', date: '', ref: '', status: 'Ongoing', details: '', remarks: '', authority: 'Cdr. Imtiaz Ali' });
  };

  const handleEditAttempt = (r: any) => {
    if (r.status === 'Closed') {
      setUnlockModal({ type: 'edit', record: r });
    } else {
      setForm({
        ...r,
        svc: r.employee?.serviceNo,
        name: r.employee?.name,
        ref: r.caseId || r.reference
      });
      setEditingId(r.id);
      setIsAdding(true);
    }
  };

  const handleUnlockVerify = () => {
    const savedPass = localStorage.getItem("secret_password") || "998877";
    if (unlockUsername === 'Administrator' && secretPassword === savedPass) {
      if (unlockModal?.type === 'edit' && unlockModal.record) {
        setForm({
          ...unlockModal.record,
          svc: unlockModal.record.employee?.serviceNo,
          name: unlockModal.record.employee?.name,
          ref: unlockModal.record.caseId || unlockModal.record.reference
        });
        setEditingId(unlockModal.record.id);
        setIsAdding(true);
      }
      setUnlockModal(null);
      setUnlockUsername("");
      setSecretPassword("");
    } else {
      logAction("OVERRIDE", `Discipline Security Failure`, "Failed");
      toast.error("Authorization Failed: Invalid Admin Credentials");
    }
  };

  const filteredRecords = useMemo(() => {
    return (records as any[])
      .filter(r => 
        r.employee?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.employee?.serviceNo?.toLowerCase().includes(search.toLowerCase()) ||
        r.caseId?.toLowerCase().includes(search.toLowerCase()) ||
        r.reference?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }, [search, records]);

  return (
    <AppShell>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".xlsx,.xls" 
        onChange={() => {}} 
      />
      <PageHeader title="Disciplinary Actions" subtitle="Manage Conduct · Warnings · Personnel Proceedings"
        actions={
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Import Data
            </Btn>
            <Btn variant="danger" onClick={() => setIsAdding(true)}>
              <Plus className="w-4 h-4 mr-2" /> Log Proceeding
            </Btn>
          </div>
        }
      />

      <Section title={`Discipline Log · ${isLoading ? '...' : filteredRecords.length} Records`}>
        <div className="mb-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input placeholder="Search records..." className="w-full h-11 pl-10 pr-3 bg-muted/20 border border-border rounded-sm focus:outline-none focus:border-accent" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="overflow-x-auto -m-5 min-h-[300px]">
          <table className="data-table">
            <thead>
              <tr><th>Svc No</th><th>Employee</th><th>Offense</th><th>Action</th><th>Date</th><th>Status</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-20 text-muted-foreground italic">{isLoading ? 'Synchronizing records...' : 'No disciplinary records found matching search.'}</td></tr>
              ) : filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-primary/5 cursor-pointer group" onClick={() => setSelectedCase(r)}>
                  <td className="font-mono text-xs text-primary font-bold">{r.employee?.serviceNo}</td>
                  <td className="font-semibold">{r.employee?.name}</td>
                  <td className="text-xs">{r.offense}</td>
                  <td><Badge variant={r.action?.includes('Suspension') ? 'danger' : 'warning'}>{r.action}</Badge></td>
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
                <h3 className="text-lg font-heading font-bold uppercase italic">Case File: {selectedCase.caseId || selectedCase.reference}</h3>
                <Badge variant={selectedCase.status === 'Closed' ? 'success' : 'warning'} className="ml-4">{selectedCase.status?.toUpperCase()}</Badge>
              </div>
              <button onClick={() => setSelectedCase(null)}><X className="w-6 h-6 text-white" /></button>
            </div>
            
            <div className="flex-1 overflow-hidden flex">
               <div className="w-1/3 border-r border-border bg-muted/10 p-6 space-y-6 overflow-y-auto">
                  <div className="panel p-4 bg-card shadow-sm border-l-4 border-primary">
                     <label className="label-mil text-primary opacity-60 block mb-1">Subject Personnel</label>
                     <div className="text-lg font-black italic">{selectedCase.employee?.name}</div>
                     <div className="text-xs font-mono text-muted-foreground">{selectedCase.employee?.serviceNo}</div>
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
               </div>
            </div>

            <div className="bg-muted/30 p-5 border-t border-border flex justify-between items-center">
              <div className="flex gap-2">
                  <Btn variant="outline" onClick={() => setSelectedCase(null)}>Dismiss View</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Override Modal */}
      {unlockModal && (
        <div className="fixed inset-0 z-[200] bg-primary/70 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-card w-full max-md rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
            <div className="bg-destructive px-6 py-4 flex justify-between items-center text-white">
               <div className="flex items-center gap-2 text-white"><ShieldX className="w-5 h-5 text-white"/><h3 className="text-lg font-heading font-black italic uppercase text-white">Security Override</h3></div>
               <button onClick={() => setUnlockModal(null)} className="text-white"><X className="w-5 h-5 text-white"/></button>
            </div>
            <div className="p-8 space-y-6">
               <Field label="Admin Username"><Input placeholder="Username" value={unlockUsername} onChange={(e) => setUnlockUsername(e.target.value)} /></Field>
               <Field label="System Password"><Input type="password" placeholder="••••••••" value={secretPassword} onChange={(e) => setSecretPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlockVerify()} /></Field>
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
                <Field label="Offense"><Select value={form.offense} onChange={e => setForm({...form, offense: e.target.value})}><option>Unauthorized Absence</option><option>Misconduct</option><option>Professional Negligence</option><option>Insubordination</option><option>Theft/Damage to Property</option><option>Breach of Security</option><option>Tardiness</option><option>Moral Turpitude</option></Select></Field>
                <Field label="Action"><Select value={form.action} onChange={e => setForm({...form, action: e.target.value})}><option>Verbal Warning</option><option>Written Warning</option><option>Explanation Call</option><option>Show Cause Notice</option><option>Censure</option><option>Fine</option><option>Suspension</option><option>Demotion</option><option>Termination</option></Select></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date" required><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></Field>
                <Field label="Reference No" required><Input value={form.ref} onChange={e => setForm({...form, ref: e.target.value})} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category/Type"><Input value={form.type} onChange={e => setForm({...form, type: e.target.value})} placeholder="e.g. Regular Proceeding" /></Field>
                <Field label="Current Status"><Select value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option>Ongoing</option><option>Closed</option><option>Under Review</option></Select></Field>
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
