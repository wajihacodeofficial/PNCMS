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
import { useState, useMemo } from 'react';
import { usePersonnel, useLeaves, useCreateLeave, useCreateLog } from '@/hooks/use-api';
import { toast } from 'sonner';
import { format, differenceInDays, parseISO } from 'date-fns';

const Leave = () => {
  const { data: personnel = [], isLoading: isPersonnelLoading } = usePersonnel();
  const { data: leaves = [], isLoading: isLeavesLoading } = useLeaves();
  const { mutate: createLeave } = useCreateLeave();
  const { mutate: createLog } = useCreateLog();

  const [selectedPersonnelId, setSelectedPersonnelId] = useState('');
  const [leaveType, setLeaveType] = useState('CL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [authority, setAuthority] = useState('Cdr. Imtiaz Ali');

  const daysCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const diff = differenceInDays(end, start);
    return diff >= 0 ? diff + 1 : 0;
  }, [startDate, endDate]);

  const handleSave = () => {
    if (!selectedPersonnelId || !startDate || !endDate || daysCount <= 0) {
      toast.error("Please fill all required fields correctly");
      return;
    }

    const employee = personnel.find((p: any) => p.id === selectedPersonnelId);

    createLeave({
      employeeId: selectedPersonnelId,
      type: leaveType,
      startDate,
      endDate,
      days: daysCount,
      status: 'Approved', // Auto-approving for simplicity in this view
    }, {
      onSuccess: () => {
        createLog({
          user: localStorage.getItem("username") || "Admin",
          action: "CREATE",
          entity: `Leave: ${employee?.serviceNo} (${leaveType})`,
          result: "Success"
        });
        toast.success("Leave entry saved successfully");
        setStartDate('');
        setEndDate('');
        setReason('');
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to save leave entry");
      }
    });
  };

  const personnelBalances = useMemo(() => {
    // This is a simplified calculation of remaining balances.
    // In a real system, you'd have an entitlement table.
    // For now, we assume fixed entitlements and subtract used leaves.
    const entitlements = {
      CL: 20, // Casual Leave
      RL: 30, // Recreational
      SL: 15, // Sick
      LFP: 180 // Leave on Full Pay
    };

    return personnel.map((p: any) => {
      const pLeaves = leaves.filter((l: any) => l.employeeId === p.id);
      const used = {
        CL: pLeaves.filter((l: any) => l.type === 'CL').reduce((acc: number, l: any) => acc + l.days, 0),
        RL: pLeaves.filter((l: any) => l.type === 'RL').reduce((acc: number, l: any) => acc + l.days, 0),
        SL: pLeaves.filter((l: any) => l.type === 'SL').reduce((acc: number, l: any) => acc + l.days, 0),
        LFP: pLeaves.filter((l: any) => l.type === 'LFP').reduce((acc: number, l: any) => acc + l.days, 0),
      };

      return {
        id: p.id,
        name: p.name,
        serviceNo: p.serviceNo,
        casual: entitlements.CL - used.CL,
        earned: entitlements.RL - used.RL,
        sick: entitlements.SL - used.SL,
        lfp: entitlements.LFP - used.LFP,
      };
    });
  }, [personnel, leaves]);

  if (isPersonnelLoading || isLeavesLoading) return <div className="p-8 text-center">Loading Leave Data...</div>;

  return (
    <AppShell>
      <PageHeader
        title="Leave Account Command"
        subtitle="Casual · Earned · Sick · LFP Credits"
      />

      <div className="grid grid-cols-12 gap-5">
        <Section title="Leave Entry Form" className="col-span-5">
          <div className="space-y-4">
            <Field label="Personnel" required>
              <Select value={selectedPersonnelId} onChange={(e) => setSelectedPersonnelId(e.target.value)}>
                <option value="">Select Personnel...</option>
                {personnel.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.serviceNo})</option>
                ))}
              </Select>
            </Field>
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12">
                <Field label="Leave Type" required>
                  <RadioGroup
                    value={leaveType}
                    onChange={(val) => setLeaveType(val)}
                    options={[
                      { value: "CL", label: "Casual", icon: <Calendar className="w-4 h-4" /> },
                      { value: "RL", label: "Recreational", icon: <Clock className="w-4 h-4" /> },
                      { value: "LWOP", label: "LWOP", icon: <UserX className="w-4 h-4" /> },
                      { value: "SL", label: "Sick", icon: <HeartPulse className="w-4 h-4" /> },
                      { value: "LFP", label: "LFP", icon: <Wallet className="w-4 h-4" /> },
                    ]}
                  />
                </Field>
              </div>
              <Field label="Days" required>
                <Input type="number" value={daysCount} readOnly className="bg-muted/50" />
              </Field>
              <Field label="From" required>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </Field>
              <Field label="To" required>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </Field>
            </div>
            <Field label="Reason / Application Reference">
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-accent"
              />
            </Field>
            <Field label="Sanctioning Officer">
              <Select value={authority} onChange={(e) => setAuthority(e.target.value)}>
                <option>Cdr. Imtiaz Ali</option>
                <option>Cdr. Saif ur Rehman</option>
              </Select>
            </Field>
            <Btn variant="gold" className="w-full" onClick={handleSave}>
              <Save className="w-4 h-4" /> Save Leave Entry
            </Btn>
          </div>
        </Section>

        <Section title="Leave Balances · Realtime View" className="col-span-7">
          <div className="overflow-x-auto -m-5">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Personnel</th>
                  <th className="text-right">Casual</th>
                  <th className="text-right">Recre.</th>
                  <th className="text-right">Sick</th>
                  <th className="text-right">LFP</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {personnelBalances.map((b: any) => (
                  <tr key={b.id}>
                    <td>
                      <div className="font-semibold">{b.name}</div>
                      <div className="text-[0.6rem] text-muted-foreground font-mono">{b.serviceNo}</div>
                    </td>
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
                {personnelBalances.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-20 text-muted-foreground italic">
                      No personnel records found in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </AppShell>
  );
};

export default Leave;
