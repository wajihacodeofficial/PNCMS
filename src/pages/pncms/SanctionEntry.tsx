import { AppShell, PageHeader, useCadre } from '@/components/pncms/AppShell';
import { Btn, Field, Input, Select, Section } from '@/components/pncms/ui-kit';
import { Save, FileCheck2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePersonnel, useCreateSanction } from '@/hooks/use-api';
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const SanctionEntry = () => {
  const navigate = useNavigate();
  const { cadre } = useCadre();

  // ✅ FIX: declare typeLabel first — used inside handleSubmit below
  const typeLabel = cadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime';

  const { data: personnel = [] } = usePersonnel();
  const { mutate: createSanction, isPending } = useCreateSanction();

  const [form, setForm] = useState({
    svc: '',
    hours: '40',
    month: 'April 2026',
    reason: '',
  });

  // ✅ Auto-fetch: find employee by service number from already-loaded personnel list
  const selectedEmployee = useMemo(() => {
    const svc = form.svc.trim();
    if (!svc) return null;
    return (personnel as any[]).find((p) => p.serviceNo === svc) || null;
  }, [form.svc, personnel]);

  const handleSubmit = (isFinal: boolean) => {
    const svc = form.svc.trim();
    if (!svc) {
      toast.error('Please enter a Service Number');
      return;
    }
    if (!selectedEmployee) {
      toast.error(`No employee found with service number "${svc}"`);
      return;
    }
    if (!form.hours || parseFloat(form.hours) <= 0) {
      toast.error('Please specify valid hours');
      return;
    }

    createSanction(
      {
        svc,
        hours: parseFloat(form.hours),
        period: form.month,
        reason: form.reason || `Official ${typeLabel} Sanction for ${form.month}`,
        status: isFinal ? 'Approved' : 'Pending',
        date: format(new Date(), 'yyyy-MM-dd'),
        sanctionId: `SN-${Date.now()}`,
        action: typeLabel,                            // ✅ Late-Sitting or Overtime
        rank: selectedEmployee?.rank?.name || '',     // ✅ rank saved at time of sanction
      },
      {
        onSuccess: () => {
          const rankName = selectedEmployee?.rank?.name ? `${selectedEmployee.rank.name} ` : '';
          toast.success(
            `${typeLabel} Sanction for ${rankName}${selectedEmployee?.name} ${
              isFinal ? 'Approved & Recorded' : 'Saved as Draft'
            }`
          );
          navigate('/sanctions');
        },
        onError: (err: any) => {
          toast.error(err?.message || 'Failed to save sanction');
        },
      }
    );
  };

  return (
    <AppShell>
      <PageHeader
        title="Authorization Entry"
        subtitle={`Month-1 ${typeLabel} Sanction Register · ${cadre} Cadre`}
        actions={
          <>
            <Btn variant="outline" onClick={() => navigate('/sanctions')}>Cancel</Btn>
            <Btn variant="primary" onClick={() => handleSubmit(false)} disabled={isPending}>
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Btn>
            <Btn variant="gold" onClick={() => handleSubmit(true)} disabled={isPending}>
              <FileCheck2 className="w-4 h-4 mr-2" />
              {isPending ? 'Submitting...' : 'Submit & Authorize'}
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-8 mt-6">
        <div className="col-span-2">
          <Section title="Sanction Parameters">
            <div className="grid grid-cols-2 gap-6 p-2">

              {/* Service Number — user input */}
              <Field label="Service Number" required>
                <Input
                  value={form.svc}
                  onChange={(e) => setForm({ ...form, svc: e.target.value })}
                  placeholder="Enter Svc No (e.g. 100489)"
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

              {/* Sanction Type — read-only, derived from cadre */}
              <Field label="Sanction Type">
                <Input value={typeLabel} disabled className="bg-muted/50 font-semibold" />
              </Field>

              {/* Period */}
              <Field label="Sanction Period" required>
                <Select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
                  <option>April 2026</option>
                  <option>May 2026</option>
                  <option>June 2026</option>
                </Select>
              </Field>

              {/* Hours */}
              <Field label="Hours Authorized" required>
                <Input
                  type="number"
                  value={form.hours}
                  onChange={(e) => setForm({ ...form, hours: e.target.value })}
                  min="1"
                  max="60"
                />
              </Field>

              {/* Justification */}
              <div className="col-span-2">
                <Field label="Operational Justification">
                  <textarea
                    rows={4}
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Enter official justification for extra hours..."
                    className="w-full p-3 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-accent"
                  />
                </Field>
              </div>
            </div>
          </Section>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          <Section title="Policy Guidelines">
            <div className="p-4 bg-muted/20 border border-border rounded-sm space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                </div>
                <p className="text-[0.7rem] leading-relaxed">
                  Maximum authorized hours per personnel cannot exceed <b>60 hours</b> per month.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <p className="text-[0.7rem] leading-relaxed">
                  Sanctions must be authorized in <b>Month 1</b> for work conducted in <b>Month 2</b>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                </div>
                <p className="text-[0.7rem] leading-relaxed">
                  <b>{typeLabel}</b> applies to <b>{cadre}</b> cadre personnel only.
                </p>
              </div>
            </div>
          </Section>

          <Section title="Approval Workflow">
            <div className="space-y-3">
              {[
                { n: '01', r: 'Initiator', u: 'Admin Clerk', s: 'active' },
                { n: '02', r: 'Verifier', u: 'Section Officer', s: 'pending' },
                { n: '03', r: 'Approver', u: 'Director Civilian', s: 'pending' },
              ].map((step) => (
                <div key={step.n} className="flex items-center gap-4 p-3 bg-card border border-border rounded-sm">
                  <span
                    className={`w-8 h-8 rounded-sm flex items-center justify-center font-bold text-xs ${
                      step.s === 'active' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.n}
                  </span>
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
