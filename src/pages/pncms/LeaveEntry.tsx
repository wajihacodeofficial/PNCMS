import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import {
  Btn,
  Field,
  Input,
  Select,
  Section,
  RadioGroup,
} from '@/components/pncms/ui-kit';
import {
  Save,
  FileCheck2,
  AlertCircle,
  Calendar,
  Clock,
  HeartPulse,
  UserX,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePersonnel, useCreateLeave, useCreateLog } from '@/hooks/use-api';
import { toast } from 'sonner';

const LeaveEntry = () => {
  const navigate = useNavigate();
  const { data: personnel = [] } = usePersonnel();
  const { mutate: createLeave } = useCreateLeave();
  const { mutate: createLog } = useCreateLog();

  const [selectedSvc, setSelectedSvc] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [leaveType, setLeaveType] = useState('CL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (selectedSvc) {
      const person = (personnel as any[]).find(
        (p) => p.serviceNo === selectedSvc
      );
      setSelectedPerson(person || null);
    } else {
      setSelectedPerson(null);
    }
  }, [selectedSvc, personnel]);

  const balances: Record<
    string,
    { used: number; max: number | null; label: string }
  > = {
    CL: { used: 12, max: 20, label: 'Casual Leave' },
    LFP: { used: 12, max: 12, label: 'Leave on Full Pay' },
    RL: { used: 0, max: null, label: 'Recreational Leave' },
    LWOP: { used: 0, max: null, label: 'Leave Without Pay' },
    DL: { used: 0, max: null, label: 'Disability Leave' },
  };

  const isMale = selectedPerson?.gender === 'Male';
  const isMLSelected = leaveType === 'ML';
  const isGenderRestricted = isMLSelected && isMale;

  const calculatedDays = (() => {
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays > 0 ? diffDays : 0;
    }
    return 0;
  })();

  const currentBalance = balances[leaveType] || {
    used: 0,
    max: null,
    label: 'Leave',
  };
  const hasLimit = currentBalance.max !== null;
  const remaining = hasLimit
    ? (currentBalance.max as number) - currentBalance.used
    : 9999;
  const isOverLimit = hasLimit && calculatedDays > remaining;
  const isBalanceEmpty = hasLimit && remaining <= 0;

  const handleRecordLeave = (status: 'Pending' | 'Approved') => {
    if (!selectedPerson) {
      toast.error('Please select a valid personnel using Service Number');
      return;
    }
    if (isGenderRestricted) {
      toast.error(
        'Maternity Leave (ML) is only applicable to female personnel'
      );
      return;
    }
    if (!fromDate || !toDate) {
      toast.error('Please specify leave dates');
      return;
    }
    if (isOverLimit) {
      toast.error(
        `Cannot record leave: Exceeds available ${currentBalance.label} balance`
      );
      return;
    }

    createLeave(
      {
        employeeId: selectedPerson?.id,
        svc: selectedSvc,
        startDate: fromDate,
        endDate: toDate,
        type: leaveType,
        days: calculatedDays,
        status: status,
      },
      {
        onSuccess: () => {
          createLog({
            user: localStorage.getItem('username') || 'Admin',
            action: 'CREATE',
            entity: `Leave: ${selectedPerson.serviceNo} - ${leaveType} (${calculatedDays} days)`,
            result: 'Success',
          });
          toast.success(
            `Leave successfully ${status === 'Approved' ? 'recorded' : 'drafted'}`
          );
          navigate('/leave');
        },
        onError: (err: any) => {
          toast.error(err.message || 'Failed to record leave');
        },
      }
    );
  };

  return (
    <AppShell>
      <PageHeader
        title="New Leave Record"
        subtitle="Manual Leave Entry · Admin Clerk"
        actions={
          <>
            <Btn variant="outline" onClick={() => navigate('/leave')}>
              Cancel
            </Btn>
            <Btn
              variant="primary"
              onClick={() => handleRecordLeave('Pending')}
              disabled={isOverLimit || isGenderRestricted}
            >
              <Save className="w-4 h-4" /> Save Draft
            </Btn>
            <Btn
              variant="gold"
              onClick={() => handleRecordLeave('Approved')}
              disabled={isOverLimit || isGenderRestricted}
            >
              <FileCheck2 className="w-4 h-4" /> Record Leave
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-5">
        <Section title="Leave Particulars" className="col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Service Number" required>
              <div className="relative">
                <Input
                  value={selectedSvc}
                  onChange={(e) => setSelectedSvc(e.target.value)}
                  placeholder="Enter Service No. (e.g. 1042)"
                  className="pr-10"
                />
                {selectedPerson && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle className="w-4 h-4 text-success" />
                  </div>
                )}
              </div>
            </Field>
            <Field label="Personnel Name">
              <Input
                value={selectedPerson?.name || 'No Personnel Selected'}
                disabled
                className="bg-muted/50 font-bold text-primary"
              />
            </Field>
            <Field label="Department">
              <Input
                value={selectedPerson?.department?.name || '—'}
                disabled
                className="bg-muted/50"
              />
            </Field>
            <Field label="Rank">
              <Input
                value={selectedPerson?.rank?.name || '—'}
                disabled
                className="bg-muted/50"
              />
            </Field>

            <div className="col-span-2">
              <Field label="Leave Type Selection" required>
                <RadioGroup
                  value={leaveType}
                  onChange={setLeaveType}
                  options={[
                    {
                      value: 'CL',
                      label: 'Casual Leave',
                      desc: 'Short term routine leave',
                      icon: <Calendar className="w-4 h-4" />,
                    },
                    {
                      value: 'RL',
                      label: 'Recreational Leave',
                      desc: 'Authority Wish / Annual',
                      icon: <Clock className="w-4 h-4" />,
                    },
                    {
                      value: 'LWOP',
                      label: 'Leave Without Pay',
                      desc: 'Unpaid absence / Extraordinary',
                      icon: <UserX className="w-4 h-4" />,
                    },
                    {
                      value: 'DL',
                      label: 'Disability Leave',
                      desc: 'Medical / Injury related',
                      icon: <HeartPulse className="w-4 h-4" />,
                    },
                    {
                      value: 'LFP',
                      label: 'Leave on Full Pay',
                      desc: 'For regular staff only',
                      icon: <Wallet className="w-4 h-4" />,
                    },
                  ]}
                />
              </Field>
            </div>
            <Field label="Application Date">
              <Input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </Field>
            <Field label="From Date" required>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Field>
            <Field label="To Date" required>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Field>
            <Field label="No. of Days" required>
              <Input
                type="number"
                value={calculatedDays}
                readOnly
                className={`font-bold ${isOverLimit ? 'text-destructive bg-destructive/10 border-destructive' : 'bg-muted/30'}`}
              />
            </Field>
            <Field label="Reliever (if any)">
              <Input />
            </Field>
            <div className="col-span-2">
              <Field label="Remarks">
                <Input
                  placeholder="Reason for leave"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </Field>
            </div>
          </div>

          {isGenderRestricted && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-destructive">
                  Gender Restriction
                </h4>
                <p className="text-xs text-destructive/80 mt-1">
                  Maternity Leave (ML) can only be applied for female personnel.{' '}
                  {selectedPerson?.name} is registered as Male.
                </p>
              </div>
            </div>
          )}

          {!isGenderRestricted && (isOverLimit || isBalanceEmpty) && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-destructive">
                  Leave Balance Exceeded
                </h4>
                <p className="text-xs text-destructive/80 mt-1">
                  {isBalanceEmpty
                    ? `No remaining ${currentBalance.label}.`
                    : `Requested ${calculatedDays} days exceed the remaining ${remaining} days.`}
                </p>
              </div>
            </div>
          )}
        </Section>

        <Section title="Current Balance Status">
          <div className="space-y-2.5 text-sm">
            {Object.entries(balances).map(([k, { used, max, label }]) => (
              <div
                key={k}
                className={`border rounded-sm p-2.5 ${k === leaveType ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="label-mil">{k}</span>
                  <span
                    className={`font-mono font-bold ${max !== null && max - used <= 0 ? 'text-destructive' : 'text-primary'}`}
                  >
                    {max !== null ? `${max - used} / ${max}` : 'DISCRETIONARY'}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-sm overflow-hidden">
                  <div
                    className={`h-full ${max !== null && max - used <= 0 ? 'bg-destructive' : k === leaveType ? 'bg-primary' : 'bg-accent'}`}
                    style={{
                      width:
                        max !== null
                          ? `${((max - used) / max) * 100}%`
                          : '100%',
                    }}
                  />
                </div>
                <div className="text-[0.6rem] mt-1.5 text-muted-foreground uppercase tracking-wider">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
};
export default LeaveEntry;
