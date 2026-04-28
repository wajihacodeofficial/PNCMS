import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import {
  Btn,
  Badge,
  Section,
  Field,
  Input,
  Select,
} from '@/components/pncms/ui-kit';
import { Plus, AlertTriangle, Eye, Check, X, Search } from 'lucide-react';
import { sanctions } from '@/data/mock';

const Sanctions = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const pending = sanctions.filter((s) => s.status === 'Pending').length;
  return (
    <AppShell>
      <PageHeader
        title="Sanction Management"
        subtitle="Overtime Sanction Authorization Register"
        actions={
          <>
            <Btn variant="outline" onClick={() => setOpen(true)}>
              Quick Entry
            </Btn>
            <Btn variant="gold" onClick={() => navigate('/sanctions/new')}>
              <Plus className="w-4 h-4" /> New Sanction
            </Btn>
          </>
        }
      />

      {pending > 0 && (
        <div className="mb-5 panel border-l-4 border-l-warning flex items-start gap-3 p-4 bg-warning/5">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <div className="heading-mil text-sm text-warning tracking-wider">
              Work Log Blocked · {pending} Pending Sanctions
            </div>
            <p className="text-xs text-foreground/80 mt-1">
              Work logs cannot be opened for personnel with un-approved sanction
              requests. Please escalate to the approving authority for
              clearance.
            </p>
          </div>
        </div>
      )}

      <Section
        title="Sanction Requests Register"
        actions={
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search sanction ID…"
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
                <th>Hours</th>
                <th>Period</th>
                <th>Submitted</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sanctions.map((s) => (
                <tr key={s.id}>
                  <td className="font-mono text-xs font-semibold text-primary">
                    {s.id}
                  </td>
                  <td className="font-semibold">{s.emp}</td>
                  <td className="text-muted-foreground">{s.dept}</td>
                  <td>
                    <span className="font-bold text-primary">{s.hours}</span>{' '}
                    <span className="label-mil">hrs</span>
                  </td>
                  <td>{s.period}</td>
                  <td className="font-mono text-xs">{s.date}</td>
                  <td>
                    <Badge variant={s.status.toLowerCase() as any}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 rounded-sm hover:bg-muted text-info">
                        <Eye className="w-4 h-4" />
                      </button>
                      {s.status === 'Pending' && (
                        <>
                          <button className="p-1.5 rounded-sm hover:bg-success/10 text-success">
                            <Check className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 rounded-sm hover:bg-destructive/10 text-destructive">
                            <X className="w-4 h-4" />
                          </button>
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
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in">
          <div className="bg-card w-full max-w-2xl rounded-md shadow-elevated overflow-hidden">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between">
              <div>
                <div className="label-mil text-accent">
                  New Sanction Request
                </div>
                <h2 className="text-xl text-white mt-1">
                  Overtime Sanction Authorization
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-1 bg-accent" />
            <div className="p-6 grid grid-cols-2 gap-4">
              <Field label="Personnel" required>
                <Select>
                  <option>Muhammad Tariq Khan (PN-CIV-1042)</option>
                  <option>Aisha Rehman (PN-CIV-1043)</option>
                </Select>
              </Field>
              <Field label="Department" required>
                <Input defaultValue="Administration" disabled />
              </Field>
              <Field label="Sanctioned Hours" required>
                <Input type="number" defaultValue={40} />
              </Field>
              <Field label="Period" required>
                <Select>
                  <option>April 2026</option>
                  <option>May 2026</option>
                </Select>
              </Field>
              <div className="col-span-2">
                <Field label="Justification / Remarks" required>
                  <textarea
                    rows={4}
                    className="w-full p-3 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-accent"
                    placeholder="State operational reason for overtime requirement…"
                  />
                </Field>
              </div>
              <Field label="Approving Authority" required>
                <Select>
                  <option>Cdr. Imtiaz Ali</option>
                  <option>Cdr. Saif ur Rehman</option>
                </Select>
              </Field>
              <Field label="Reference Memo No.">
                <Input placeholder="DIL/ADM/0421" />
              </Field>
            </div>
            <div className="border-t border-border bg-muted/40 px-6 py-4 flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Btn>
              <Btn variant="gold">Submit for Approval</Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};
export default Sanctions;
