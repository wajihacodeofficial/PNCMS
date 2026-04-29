import { useState } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
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
} from 'lucide-react';

const WorkLogs = () => {
  const [confirm, setConfirm] = useState(false);
  const sanctioned = 60,
    logged = 56,
    leave = 4,
    payable = logged - leave;
  const rate = 420,
    total = payable * rate;
  return (
    <AppShell>
      <PageHeader
        title="Work Log Control Center"
        subtitle="Hours Reconciliation · Pre-Payment Stage"
      />

      <div className="grid grid-cols-12 gap-5">
        <Section title="Active Work Log" className="col-span-7">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <Field label="Personnel" required>
              <Select>
                <option>Aisha Rehman (-1043)</option>
                <option>Imran Hussain Shah</option>
              </Select>
            </Field>
            <Field label="Sanction Reference">
              <Input defaultValue="SNC-2026-0141" disabled />
            </Field>
            <Field label="Department">
              <Input defaultValue="Engineering Wing" disabled />
            </Field>
            <Field label="Period">
              <Input defaultValue="April 2026" disabled />
            </Field>
          </div>

          <div className="border-t border-border pt-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="heading-mil text-sm text-primary tracking-widest">
                Daily Hours Logged
              </h4>
              <Btn variant="outline" className="py-1.5 text-[0.65rem]">
                Add Entry
              </Btn>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Hours</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    '02-Apr-2026',
                    'Thu',
                    '17:00',
                    '21:30',
                    '4.5',
                    'Project Trident report',
                  ],
                  [
                    '05-Apr-2026',
                    'Sun',
                    '09:00',
                    '18:00',
                    '8.0',
                    'Sunday duty',
                  ],
                  ['09-Apr-2026', 'Thu', '17:00', '23:00', '6.0', 'Audit prep'],
                  [
                    '12-Apr-2026',
                    'Sun',
                    '09:00',
                    '18:00',
                    '8.0',
                    'Sunday duty',
                  ],
                  [
                    '18-Apr-2026',
                    'Sat',
                    '16:00',
                    '21:30',
                    '5.5',
                    'Maintenance docs',
                  ],
                ].map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j} className={j < 5 ? 'font-mono text-xs' : ''}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <div className="col-span-5 space-y-5">
          <div className="panel relative overflow-hidden">
            <div className="bg-gradient-command px-5 py-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-accent" />
              <h3 className="text-white text-sm tracking-widest">
                Calculation Preview
              </h3>
            </div>
            <div className="h-0.5 bg-accent" />
            <div className="p-5 space-y-3">
              <Row label="Sanctioned Hours" value={`${sanctioned} hrs`} />
              <Row label="Hours Logged" value={`${logged} hrs`} />
              <Row
                label="Leave Deduction"
                value={`− ${leave} hrs`}
                tone="warning"
              />
              <div className="border-t border-dashed border-border my-3" />
              <Row label="Payable Hours" value={`${payable} hrs`} bold />
              <Row label="Hourly Rate" value={`Rs. ${rate}`} />
              <div className="bg-primary text-primary-foreground -mx-5 -mb-5 mt-4 px-5 py-4 flex items-center justify-between">
                <span className="label-mil text-accent">Net Payable</span>
                <span className="text-3xl heading-mil text-accent">
                  Rs. {total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="panel border-l-4 border-l-info p-4 flex gap-3 bg-info/5">
            <ClipboardList className="w-5 h-5 text-info shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-semibold text-info mb-1 uppercase tracking-wider">
                Status
              </div>
              <Badge variant="open">Open · Awaiting Closure</Badge>
              <p className="mt-2 text-foreground/80">
                Once closed, this work log will be transmitted to Payment
                Processing Hub for disbursement under batch APR-2026-B.
              </p>
            </div>
          </div>

          <Btn
            variant="gold"
            className="w-full h-12"
            onClick={() => setConfirm(true)}
          >
            <Lock className="w-4 h-4" /> Close Work Log
          </Btn>
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-card max-w-md w-full rounded-md shadow-elevated overflow-hidden">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg text-white">Confirm Work Log Closure</h2>
              <button
                onClick={() => setConfirm(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-1 bg-accent" />
            <div className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-warning shrink-0" />
                <p className="text-sm text-foreground">
                  Closing this work log is irreversible. The system will lock
                  the entries and forward calculations to Finance Directorate.
                </p>
              </div>
              <div className="bg-muted/60 rounded-sm p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="label-mil">Personnel</span>
                  <span className="font-semibold">Aisha Rehman</span>
                </div>
                <div className="flex justify-between">
                  <span className="label-mil">Payable Hours</span>
                  <span className="font-semibold">{payable} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="label-mil">Net Payable</span>
                  <span className="font-bold text-accent">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-border bg-muted/40 px-6 py-4 flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setConfirm(false)}>
                Cancel
              </Btn>
              <Btn variant="gold" onClick={() => setConfirm(false)}>
                <Lock className="w-4 h-4" /> Confirm & Close
              </Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

const Row = ({
  label,
  value,
  tone,
  bold,
}: {
  label: string;
  value: string;
  tone?: string;
  bold?: boolean;
}) => (
  <div className="flex items-center justify-between">
    <span className="label-mil">{label}</span>
    <span
      className={`font-mono text-sm ${bold ? 'font-bold text-primary text-base' : ''} ${tone === 'warning' ? 'text-warning' : 'text-foreground'}`}
    >
      {value}
    </span>
  </div>
);

export default WorkLogs;
