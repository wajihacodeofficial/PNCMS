import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, PageHeader, useCadre } from '@/components/pncms/AppShell';
import {
  Btn,
  Badge,
  Section,
  Field,
  Input,
  Select,
} from '@/components/pncms/ui-kit';
import { Plus, AlertTriangle, Eye, Check, X, Search, FileText } from 'lucide-react';
import { useSanctions, usePersonnel } from '@/hooks/use-api';
import { format, parseISO } from 'date-fns';

const Sanctions = () => {
  const { cadre } = useCadre();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: sanctions = [], isLoading } = useSanctions();
  const { data: personnel = [] } = usePersonnel();
  
  const filteredSanctions = useMemo(() => {
    return (sanctions as any[]).filter(s => s.employee?.cardType === cadre);
  }, [sanctions, cadre]);

  const pending = filteredSanctions.filter((s) => s.status === 'Pending').length;

  const typeLabel = cadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime';

  return (
    <AppShell>
      <PageHeader
        title={`${typeLabel} Sanctions`}
        subtitle={`${cadre} Cadre · Authorization Register (Month 1: Approval)`}
        actions={
          <>
            <Btn variant="outline" onClick={() => setOpen(true)}>Quick Entry</Btn>
            <Btn variant="gold" onClick={() => navigate('/sanctions/new')}>
              <Plus className="w-4 h-4" /> New {typeLabel} Sanction
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="panel p-5 border-l-4 border-l-primary">
          <div className="label-mil">Active Sanctions</div>
          <div className="text-3xl font-black text-primary mt-1">{filteredSanctions.length}</div>
        </div>
        <div className="panel p-5 border-l-4 border-l-warning">
          <div className="label-mil">Pending Approval</div>
          <div className="text-3xl font-black text-warning mt-1">{pending}</div>
        </div>
        <div className="panel p-5 border-l-4 border-l-accent bg-accent/5">
          <div className="flex items-center gap-2 text-accent font-bold uppercase text-[0.6rem] tracking-widest mb-1">
            <FileText className="w-3 h-3" /> Cycle Information
          </div>
          <p className="text-[0.65rem] text-foreground/70 leading-relaxed">
            Approved sanctions in <b>April</b> will authorize work in <b>May</b>, with payments disbursed in <b>June</b>.
          </p>
        </div>
      </div>

      {pending > 0 && (
        <div className="mb-5 panel border-l-4 border-l-warning flex items-start gap-3 p-4 bg-warning/5 animate-in slide-in-from-left duration-300">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <div className="heading-mil text-sm text-warning tracking-wider">Verification Required · {pending} Pending Requests</div>
            <p className="text-xs text-foreground/80 mt-1">
              Personnel cannot log extra hours in the subsequent month without an approved sanction record.
            </p>
          </div>
        </div>
      )}

      <Section
        title={`${typeLabel} Authorization Register`}
        actions={
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search by ID or Name…"
                className="h-9 pl-9 pr-3 w-64 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <Select className="h-9">
              <option>All Status</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Rejected</option>
            </Select>
          </div>
        }
      >
        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sanction ID</th>
                <th>Personnel</th>
                <th>Department</th>
                <th>Max Hours</th>
                <th>Valid For</th>
                <th>Submitted</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground italic">Fetching official authorizations...</td></tr>
              ) : filteredSanctions.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-muted-foreground italic">No sanctions found for this cadre.</td></tr>
              ) : filteredSanctions.map((s: any) => (
                <tr key={s.id} className="group hover:bg-muted/10 transition-colors">
                  <td className="font-mono text-xs font-semibold text-primary">{s.sanctionId}</td>
                  <td className="font-semibold">{s.employee?.name}</td>
                  <td className="text-muted-foreground">{s.employee?.department?.name}</td>
                  <td>
                    <span className="font-bold text-primary">{s.hours}</span>{' '}
                    <span className="label-mil">hrs</span>
                  </td>
                  <td>{s.period}</td>
                  <td className="font-mono text-xs">{s.date || format(parseISO(s.createdAt), 'dd-MM-yy')}</td>
                  <td><Badge variant={s.status.toLowerCase() as any}>{s.status}</Badge></td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-sm hover:bg-muted text-info"><Eye className="w-4 h-4" /></button>
                      {s.status === 'Pending' && (
                        <>
                          <button className="p-1.5 rounded-sm hover:bg-success/10 text-success"><Check className="w-4 h-4" /></button>
                          <button className="p-1.5 rounded-sm hover:bg-destructive/10 text-destructive"><X className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {open && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in zoom-in-95 duration-200">
          <div className="bg-card w-full max-w-2xl rounded-md shadow-elevated overflow-hidden border border-border">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div>
                <div className="label-mil text-accent">New Authorization Request</div>
                <h2 className="text-xl text-white mt-1 font-heading font-black italic uppercase tracking-tight">{cadre} {typeLabel}</h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="h-1 bg-accent" />
            <div className="p-8 grid grid-cols-2 gap-6">
              <Field label="Select Personnel" required>
                <Select>
                  <option value="">Select Eligible Staff...</option>
                  {(personnel as any[])
                    .filter(p => p.cardType === cadre)
                    .map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.serviceNo})</option>
                    ))
                  }
                </Select>
              </Field>
              <Field label="Department" required><Input defaultValue="Administration" disabled /></Field>
              <Field label="Max Authorized Hours" required><Input type="number" placeholder="e.g. 40" /></Field>
              <Field label="Authorization Month" required>
                <Select>
                  <option>April 2026</option>
                  <option>May 2026</option>
                </Select>
              </Field>
              <div className="col-span-2">
                <Field label="Operational Justification" required>
                  <textarea rows={3} className="w-full p-3 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-accent" placeholder="State reason for overtime..." />
                </Field>
              </div>
            </div>
            <div className="border-t border-border bg-muted/40 px-6 py-4 flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setOpen(false)}>Cancel Request</Btn>
              <Btn variant="gold">Authorize & Record</Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};
export default Sanctions;
