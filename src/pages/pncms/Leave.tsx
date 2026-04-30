import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import {
  Btn,
  Section,
  Field,
  Input,
  Select,
  Badge,
  RadioGroup,
} from '@/components/pncms/ui-kit';
import { Save, Calendar, Clock, HeartPulse, UserX, Wallet } from 'lucide-react';

const balances = [
  { name: 'Muhammad Tariq Khan', casual: 8, earned: 22, sick: 10, lfp: 6 },
  { name: 'Aisha Rehman', casual: 4, earned: 30, sick: 12, lfp: 14 },
  { name: 'Fatima Zahra', casual: 10, earned: 18, sick: 9, lfp: 0 },
  { name: 'Imran Hussain Shah', casual: 6, earned: 25, sick: 11, lfp: 3 },
  { name: 'Bilal Ahmed Siddiqui', casual: 2, earned: 14, sick: 8, lfp: 0 },
  { name: 'Saima Nawaz', casual: 9, earned: 20, sick: 10, lfp: 7 },
];

const Leave = () => (
  <AppShell>
    <PageHeader
      title="Leave Account Command"
      subtitle="Casual · Earned · Sick · LFP Credits"
    />

    <div className="grid grid-cols-12 gap-5">
      <Section title="Leave Entry Form" className="col-span-5">
        <div className="space-y-4">
          <Field label="Personnel" required>
            <Select>
              <option>Muhammad Tariq Khan (-1042)</option>
              <option>Aisha Rehman (-1043)</option>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
          <div className="col-span-12">
            <Field label="Leave Type" required>
              <RadioGroup
                value="CL"
                onChange={() => {}}
                options={[
                  { value: "CL", label: "Casual Leave", icon: <Calendar className="w-4 h-4" /> },
                  { value: "RL", label: "Recreational Leave", icon: <Clock className="w-4 h-4" /> },
                  { value: "LWOP", label: "Leave Without Pay", icon: <UserX className="w-4 h-4" /> },
                  { value: "DL", label: "Disability Leave", icon: <HeartPulse className="w-4 h-4" /> },
                  { value: "LFP", label: "Leave on Full Pay", icon: <Wallet className="w-4 h-4" /> },
                ]}
              />
            </Field>
          </div>
            <Field label="Days" required>
              <Input type="number" defaultValue={3} />
            </Field>
            <Field label="From" required>
              <Input type="date" />
            </Field>
            <Field label="To" required>
              <Input type="date" />
            </Field>
          </div>
          <Field label="Reason / Application Reference">
            <textarea
              rows={3}
              className="w-full p-3 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-accent"
            />
          </Field>
          <Field label="Sanctioning Officer">
            <Select>
              <option>Cdr. Imtiaz Ali</option>
              <option>Cdr. Saif ur Rehman</option>
            </Select>
          </Field>
          <Btn variant="gold" className="w-full">
            <Save className="w-4 h-4" /> Save Leave Entry
          </Btn>
        </div>

        <div className="mt-7 pt-5 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-accent" />
            <h4 className="heading-mil text-sm text-primary tracking-widest">
              Monthly Attendance / LFP Credit Entry
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Month">
              <Select>
                <option>April 2026</option>
              </Select>
            </Field>
            <Field label="Working Days">
              <Input type="number" defaultValue={26} />
            </Field>
            <Field label="Days Present">
              <Input type="number" defaultValue={25} />
            </Field>
            <Field label="LFP Hours Earned">
              <Input type="number" defaultValue={14} />
            </Field>
          </div>
          <Btn variant="primary" className="w-full mt-4">
            Post LFP Credit
          </Btn>
        </div>
      </Section>

      <Section title="Leave Balances · Spreadsheet View" className="col-span-7">
        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Personnel</th>
                <th className="text-right">Casual</th>
                <th className="text-right">Earned</th>
                <th className="text-right">Sick</th>
                <th className="text-right">LFP (hrs)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => (
                <tr key={b.name}>
                  <td className="font-semibold">{b.name}</td>
                  <td className="text-right font-mono">{b.casual}</td>
                  <td className="text-right font-mono">{b.earned}</td>
                  <td className="text-right font-mono">{b.sick}</td>
                  <td className="text-right font-mono font-bold text-accent">
                    {b.lfp}
                  </td>
                  <td>
                    {b.casual < 3 ? (
                      <Badge variant="warning">Low Balance</Badge>
                    ) : (
                      <Badge variant="success">Healthy</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/60">
              <tr className="border-t-2 border-primary">
                <td className="px-4 py-3 label-mil">
                  Cycle Totals · April 2026
                </td>
                <td className="text-right font-bold px-4 py-3">
                  {balances.reduce((s, b) => s + b.casual, 0)}
                </td>
                <td className="text-right font-bold px-4 py-3">
                  {balances.reduce((s, b) => s + b.earned, 0)}
                </td>
                <td className="text-right font-bold px-4 py-3">
                  {balances.reduce((s, b) => s + b.sick, 0)}
                </td>
                <td className="text-right font-bold px-4 py-3 text-accent">
                  {balances.reduce((s, b) => s + b.lfp, 0)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>
    </div>
  </AppShell>
);
export default Leave;
