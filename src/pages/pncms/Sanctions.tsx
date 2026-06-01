import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, PageHeader, useCadre } from '@/components/pncms/AppShell';
import { Btn, Badge, Section, Field, Input, Select } from '@/components/pncms/ui-kit';
import { Plus, AlertTriangle, Eye, Check, X, Search, FileText, History } from 'lucide-react';
import { useSanctions, usePersonnel, useCreateSanction, useUpdateSanction } from '@/hooks/use-api';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

const Sanctions = () => {
  const { cadre } = useCadre();

  // ✅ FIX: typeLabel MUST be declared before any function that uses it (was after — caused TDZ crash)
  const typeLabel = cadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime';

  const [open, setOpen] = useState(false);
  const [selectedSanction, setSelectedSanction] = useState<any>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const { data: sanctions = [], isLoading } = useSanctions();
  const { data: personnel = [] } = usePersonnel();
  const { mutate: createSanction } = useCreateSanction();
  const { mutate: updateSanction } = useUpdateSanction();  // ✅ FIX: now calls api.updateSanction (fixed in use-api.ts)

  const [form, setForm] = useState({
    svc: '',
    hours: '',
    reason: '',
    period: 'April 2026',
  });

  // ✅ Auto-fetch: find employee by exact service number match from loaded personnel list
  const selectedEmployee = useMemo(() => {
    const svc = form.svc.trim();
    if (!svc) return null;
    return (personnel as any[]).find((p) => p.serviceNo === svc) || null;
  }, [form.svc, personnel]);

  // ✅ FIX: handleSubmit now defined AFTER typeLabel — no more TDZ ReferenceError
  const handleSubmit = () => {
    const svc = form.svc.trim();
    if (!svc) {
      toast.error('Please enter a Service Number');
      return;
    }
    if (!selectedEmployee) {
      toast.error(`No employee found with service number "${svc}"`);
      return;
    }
    if (!form.hours || isNaN(parseFloat(form.hours)) || parseFloat(form.hours) <= 0) {
      toast.error('Please enter valid hours (must be > 0)');
      return;
    }

    setIsSubmitting(true);

    createSanction(
      {
        svc,
        hours: parseFloat(form.hours),
        reason: form.reason || `Authorized ${typeLabel} for ${form.period}`,
        period: form.period,
        status: 'Pending',
        date: format(new Date(), 'yyyy-MM-dd'),
        sanctionId: `SN-${Date.now()}`,
        action: typeLabel,                             // ✅ saves Late-Sitting vs Overtime
        rank: selectedEmployee?.rank?.name || '',      // ✅ saves rank at time of sanction
      },
      {
        onSuccess: () => {
          toast.success(`${typeLabel} sanction submitted for ${selectedEmployee?.name}`);
          setOpen(false);
          setForm({ svc: '', hours: '', reason: '', period: 'April 2026' });
          setIsSubmitting(false);
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Failed to submit request');
          setIsSubmitting(false);
        },
      }
    );
  };

  const handleUpdateStatus = (id: string, currentTimeline: string, newStatus: string) => {
    const timeline = JSON.parse(currentTimeline || '[]');
    const updatedTimeline = [
      ...timeline,
      { event: `Sanction ${newStatus}`, time: new Date().toISOString(), user: 'Admin Clerk' },
    ];
    updateSanction(
      { id, status: newStatus, timeline: JSON.stringify(updatedTimeline) },
      {
        onSuccess: () => toast.success(`Sanction ${newStatus}`),
        onError: (err: any) => toast.error(err?.message || `Failed to ${newStatus.toLowerCase()} sanction`),
      }
    );
  };

  const filteredSanctions = useMemo(
    () => (sanctions as any[]).filter((s) => s.employee?.cardType === cadre),
    [sanctions, cadre]
  );

  const pending = filteredSanctions.filter((s) => s.status === 'Pending').length;

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

      {/* ── Stats ─────────────────────────────────────────────── */}
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

      {/* ── Table ─────────────────────────────────────────────── */}
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
                <th>Rank</th>
                <th>Department</th>
                <th>Type</th>
                <th>Max Hours</th>
                <th>Valid For</th>
                <th>Submitted</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSanctions.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-muted-foreground italic">
                    {isLoading ? 'Synchronizing official authorizations...' : 'No sanctions found for this cadre.'}
                  </td>
                </tr>
              ) : (
                filteredSanctions.map((s: any) => (
                  <tr key={s.id} className="group hover:bg-muted/10 transition-colors">
                    <td className="font-mono text-xs font-semibold text-primary">{s.sanctionId}</td>
                    <td className="font-semibold">{s.employee?.name}</td>
                    <td className="text-muted-foreground text-xs">{s.rank || s.employee?.rank?.name || '—'}</td>
                    <td className="text-muted-foreground">{s.employee?.department?.name}</td>
                    <td>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-sm ${
                        (s.action || typeLabel) === 'Late-Sitting'
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {s.action || typeLabel}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-primary">{s.hours}</span>{' '}
                      <span className="label-mil">hrs</span>
                    </td>
                    <td>{s.period}</td>
                    <td className="font-mono text-xs">
                      {s.date || format(parseISO(s.createdAt), 'dd-MM-yy')}
                    </td>
                    <td>
                      <Badge variant={s.status.toLowerCase() as any}>{s.status}</Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setSelectedSanction(s); setTimelineOpen(true); }}
                          className="p-1.5 rounded-sm hover:bg-muted text-info"
                          title="View Timeline"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {s.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(s.id, s.timeline, 'Approved')}
                              className="p-1.5 rounded-sm hover:bg-success/10 text-success"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(s.id, s.timeline, 'Rejected')}
                              className="p-1.5 rounded-sm hover:bg-destructive/10 text-destructive"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── Quick Entry Modal ─────────────────────────────────── */}
      {open && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in zoom-in-95 duration-200">
          <div className="bg-card w-full max-w-2xl rounded-md shadow-elevated overflow-hidden border border-border">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div>
                <div className="label-mil text-accent">New Authorization Request</div>
                <h2 className="text-xl text-white mt-1 font-heading font-black italic uppercase tracking-tight">
                  {cadre} {typeLabel}
                </h2>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-1 bg-accent" />

            <div className="p-8 grid grid-cols-2 gap-6">
              {/* Service Number — user types here */}
              <Field label="Service Number" required>
                <Input
                  value={form.svc}
                  onChange={(e) => setForm({ ...form, svc: e.target.value })}
                  placeholder="Enter Service No (e.g. 100489)"
                />
              </Field>

              {/* Auto-fetched Name */}
              <Field label="Personnel Name">
                <Input
                  value={
                    selectedEmployee
                      ? selectedEmployee.name
                      : form.svc.trim().length > 0
                      ? 'Not found in records'
                      : 'Enter service number...'
                  }
                  disabled
                  className="bg-muted/50 font-bold text-primary"
                />
              </Field>

              {/* Auto-fetched Rank */}
              <Field label="Rank">
                <Input
                  value={selectedEmployee?.rank?.name || '—'}
                  disabled
                  className="bg-muted/50 font-semibold"
                />
              </Field>

              {/* Period */}
              <Field label="Authorization Month" required>
                <Select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}>
                  <option>April 2026</option>
                  <option>May 2026</option>
                  <option>June 2026</option>
                </Select>
              </Field>

              {/* Hours */}
              <Field label="Max Hours" required>
                <Input
                  type="number"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  placeholder="e.g. 40"
                  min="1"
                  max="60"
                />
              </Field>

              {/* Type — read-only, driven by cadre */}
              <Field label="Sanction Type">
                <Input value={typeLabel} disabled className="bg-muted/50 font-semibold" />
              </Field>

              {/* Justification */}
              <div className="col-span-2">
                <Field label="Operational Justification">
                  <textarea
                    rows={3}
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full p-3 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-accent"
                    placeholder="State reason for overtime/late-sitting..."
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-border bg-muted/40 px-6 py-4 flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setOpen(false)}>Cancel</Btn>
              <Btn variant="gold" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── Timeline Modal ─────────────────────────────────────── */}
      {timelineOpen && selectedSanction && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-lg rounded-md shadow-elevated overflow-hidden border border-border">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-accent/20 flex items-center justify-center">
                  <History className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="label-mil text-accent">Operational Timeline</div>
                  <h2 className="text-sm text-white font-bold uppercase tracking-widest">{selectedSanction.sanctionId}</h2>
                </div>
              </div>
              <button onClick={() => setTimelineOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-1 bg-accent" />
            <div className="p-8">
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-border/30">
                {JSON.parse(selectedSanction.timeline || '[]').map((step: any, idx: number) => (
                  <div key={idx} className="relative flex items-center gap-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-accent bg-card text-accent shadow shrink-0 z-10">
                      <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                    </div>
                    <div className="flex-1 p-3.5 rounded border border-border bg-muted/20">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-primary text-[0.7rem] uppercase tracking-wider">{step.event}</div>
                        <time className="font-mono text-[0.6rem] text-muted-foreground">
                          {format(parseISO(step.time), 'HH:mm dd MMM')}
                        </time>
                      </div>
                      <div className="text-[0.65rem] text-foreground/70">
                        Actioned by <span className="font-bold text-primary italic underline">{step.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border bg-muted/40 px-6 py-4 flex justify-end">
              <Btn variant="primary" size="sm" onClick={() => setTimelineOpen(false)}>Close Registry</Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Sanctions;
