import { useState, useMemo } from 'react';
import { AppShell, PageHeader, useCadre } from '@/components/pncms/AppShell';
import {
  Btn,
  Section,
  Field,
  Input,
  Select,
  Badge,
} from '@/components/pncms/ui-kit';
import {
  Calculator,
  Lock,
  AlertTriangle,
  X,
  ClipboardList,
  Clock,
  History,
  CheckCircle2
} from 'lucide-react';
import { sanctions, personnel } from '@/data/mock';

const WorkLogs = () => {
  const { cadre } = useCadre();
  const [confirm, setConfirm] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState('');

  const typeLabel = cadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime';
  
  // Filter personnel by cadre and check if they have an approved sanction from Month 1
  const eligiblePersonnel = useMemo(() => {
    return sanctions.filter(s => s.cadre === cadre && s.status === 'Approved');
  }, [cadre]);

  const currentSanction = eligiblePersonnel.find(s => s.svc === selectedPersonnel);

  const sanctioned = currentSanction?.hours || 0,
    logged = selectedPersonnel ? 56 : 0,
    leave = selectedPersonnel ? 4 : 0,
    payable = logged - leave;
  const rate = 420,
    total = payable * rate;

  return (
    <AppShell>
      <PageHeader
        title={`${typeLabel} Logging`}
        subtitle={`${cadre} Cadre · Performance Recording (Month 2: Work Execution)`}
      />

      <div className="grid grid-cols-12 gap-6">
        <Section title={`Active ${typeLabel} Log`} className="col-span-8">
          <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-border">
            <Field label="Personnel" required>
              <Select value={selectedPersonnel} onChange={(e) => setSelectedPersonnel(e.target.value)}>
                <option value="">Select Personnel with Approved Sanction...</option>
                {eligiblePersonnel.map(p => (
                  <option key={p.svc} value={p.svc}>{p.emp} ({p.svc})</option>
                ))}
              </Select>
            </Field>
            <Field label="Linked Sanction ID">
              <div className="h-10 px-3 bg-muted/30 border border-border rounded-sm flex items-center font-mono text-xs text-primary font-bold">
                {currentSanction?.id || 'No active sanction selected'}
              </div>
            </Field>
            <div className="bg-accent/5 p-4 rounded-sm border border-accent/20 col-span-2 flex items-center gap-4">
              <History className="w-5 h-5 text-accent" />
              <div className="text-[0.65rem] leading-relaxed">
                <span className="font-bold text-primary block uppercase mb-1">Authorization Context</span>
                This personnel was authorized for <b>{sanctioned} hours</b> in Month 1 (March). 
                Logging is active for Month 2 (April). Final payment will be calculated in Month 3 (May).
              </div>
            </div>
          </div>

          {!selectedPersonnel ? (
            <div className="py-20 text-center text-muted-foreground flex flex-col items-center gap-4">
              <ClipboardList className="w-12 h-12 opacity-20" />
              <p className="text-sm italic">Select a personnel from the dropdown above to manage their daily {typeLabel.toLowerCase()} entries.</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h4 className="heading-mil text-[0.65rem] text-primary tracking-widest uppercase">Daily Hour Allocation</h4>
                <Btn variant="outline" className="h-8 py-0 text-[0.6rem]">Add New Entry</Btn>
              </div>
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th><th>Day</th><th>From</th><th>To</th><th>Gross</th><th>Verified By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['02-Apr-2026', 'Thu', '17:00', '21:30', '4.5', 'Admin Clerk'],
                      ['05-Apr-2026', 'Sun', '09:00', '18:00', '8.0', 'DDO'],
                      ['09-Apr-2026', 'Thu', '17:00', '23:00', '6.0', 'Admin Clerk'],
                    ].map((r, i) => (
                      <tr key={i} className="hover:bg-muted/5 transition-colors">
                        {r.map((c, j) => <td key={j} className={j < 5 ? 'font-mono text-xs' : 'text-[0.65rem]'}>{c}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Section>

        <div className="col-span-4 space-y-6">
          <div className="panel overflow-hidden border border-border shadow-sm">
            <div className="bg-primary px-5 py-3 flex items-center gap-3">
              <Calculator className="w-4 h-4 text-accent" />
              <h3 className="text-white text-[0.65rem] font-bold uppercase tracking-widest">Allowance Calculation</h3>
            </div>
            <div className="p-6 space-y-4">
              <Row label="Sanctioned Limit" value={`${sanctioned} hrs`} />
              <Row label="Performance Logged" value={`${logged} hrs`} />
              <Row label="Leave Deduction" value={`− ${leave} hrs`} tone="warning" />
              <div className="border-t border-dashed border-border my-4" />
              <Row label="Net Payable" value={`${payable} hrs`} bold />
              <Row label="Allowance Rate" value={`Rs. ${rate} / hr`} />
              
              <div className="bg-primary/5 -mx-6 -mb-6 mt-6 p-6 border-t border-primary/10">
                <div className="flex items-center justify-between">
                  <span className="label-mil text-primary">Est. Payment</span>
                  <span className="text-3xl font-black text-primary italic leading-none">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel border-l-4 border-l-info p-5 flex gap-4 bg-info/5">
            <Clock className="w-6 h-6 text-info shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold text-info uppercase tracking-widest mb-1.5">Cycle Status</div>
              <Badge variant="open" className="mb-3">Log Open · Reconciliation In Progress</Badge>
              <p className="text-foreground/80 leading-relaxed italic">
                "Deductions are automatically applied based on the Daily Muster Roll to ensure no extra hours are paid for days spent on leave."
              </p>
            </div>
          </div>

          <Btn 
            variant="gold" 
            className="w-full h-14" 
            disabled={!selectedPersonnel}
            onClick={() => setConfirm(true)}
          >
            <Lock className="w-4 h-4" /> Finalize & Lock Log
          </Btn>
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-md flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="bg-card max-w-md w-full rounded-md shadow-elevated border border-border overflow-hidden">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between border-b border-white/10">
              <h2 className="text-lg text-white font-heading italic font-black uppercase tracking-tight">Confirm Performance Closure</h2>
              <button onClick={() => setConfirm(false)} className="text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <AlertTriangle className="w-8 h-8 text-warning shrink-0" />
                <p className="text-sm text-foreground leading-relaxed">
                  Finalizing this log will lock all entries for <b>{currentSanction?.emp}</b>. The system will calculate the final disbursement amount for Month 3 payment.
                </p>
              </div>
              <div className="bg-muted/40 rounded-sm p-4 text-[0.65rem] space-y-3 border border-border">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="label-mil">Personnel Svc No</span>
                  <span className="font-bold">{selectedPersonnel}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="label-mil">Validated Payable Hours</span>
                  <span className="font-bold text-primary">{payable} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="label-mil">Calculated Allowance</span>
                  <span className="font-black text-accent text-lg">Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 px-6 py-5 flex justify-end gap-3 border-t border-border">
              <Btn variant="outline" onClick={() => setConfirm(false)}>Resume Entry</Btn>
              <Btn variant="gold" onClick={() => setConfirm(false)}>
                <CheckCircle2 className="w-4 h-4" /> Finalize & Send
              </Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

const Row = ({ label, value, tone, bold }: { label: string; value: string; tone?: string; bold?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="label-mil">{label}</span>
    <span className={`font-mono text-sm ${bold ? 'font-black text-primary text-lg italic' : ''} ${tone === 'warning' ? 'text-warning font-bold' : 'text-foreground font-semibold'}`}>
      {value}
    </span>
  </div>
);

export default WorkLogs;
