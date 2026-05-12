import { useState, useMemo } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import { Btn, Badge, Section, Input, Field } from '@/components/pncms/ui-kit';
import {
  Building2, HardHat, Printer,
  FileSpreadsheet, Calendar, Eye, X, ScrollText, ArrowLeft, Check, ShieldX
} from 'lucide-react';
import { useSanctions, useSettings, useAttendanceRange, useUpdateSanction } from '@/hooks/use-api';
import { exportToPDF, exportToExcel } from '@/lib/export';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_LABEL: Record<string, { label: string; variant: string }> = {
  P:  { label: 'Present',      variant: 'success' },
  A:  { label: 'Absent',       variant: 'danger'  },
  L:  { label: 'Late',         variant: 'warning' },
  CL: { label: 'Casual Leave', variant: 'info'    },
  RL: { label: 'Rest Leave',   variant: 'info'    },
  ML: { label: 'Medical Leave',variant: 'info'    },
};

const Payments = () => {
  const [selectedCadre, setSelectedCadre] = useState<'Ministerial' | 'Industrial' | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);

  const { data: settings = {} as any } = useSettings();
  const { data: sanctions = [] } = useSanctions();
  const { mutate: updateSanction } = useUpdateSanction();

  const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
  const endOfMonth   = format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 'yyyy-MM-dd');
  const { data: attendance = [] } = useAttendanceRange(startOfMonth, endOfMonth);

  const rates = useMemo(() => ({
    Ministerial: parseInt((settings as any).rate_ministerial || '380'),
    Industrial:  parseInt((settings as any).rate_industrial  || '420'),
  }), [settings]);

  const currentRoster = useMemo(() => {
    if (!selectedCadre) return [];
    return (sanctions as any[])
      .filter(s => s.employee?.cardType === selectedCadre && s.status === 'Approved')
      .map(s => {
        const empAttendance = (attendance as any[]).filter(a => a.serviceNo === s.serviceNo);
        const presentDays   = empAttendance.filter(a => ['P', 'L'].includes(a.status)).length;
        const totalDays     = 22;
        const maxHours      = s.hours || 0;
        const payable       = maxHours * Math.min(1, presentDays / totalDays);
        const rate          = rates[selectedCadre];
        return {
          ...s,
          name: s.employee?.name || 'Unknown',
          dept: s.employee?.department?.name || '—',
          gross: maxHours,
          leave: totalDays - presentDays,
          payable,
          rate,
          amount: Math.round(payable * rate),
          currentStatus: 'Payment Pending',
          daily: empAttendance.map(a => ({
            date: a.date,
            status: a.status,
            extraHrs: maxHours / totalDays,
            isExcluded: !['P', 'L'].includes(a.status),
          })),
        };
      });
  }, [selectedCadre, rates, sanctions, attendance]);

  const totalAmount = currentRoster.reduce((acc, r) => acc + r.amount, 0);

  const handleBatchPDF = () => {
    const label   = selectedCadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime';
    const headers = [['#', 'Employee', 'Cadre', 'Payable Hrs', 'Rate', 'Amount', 'Status']];
    const rows    = currentRoster.map((r, i) => [
      i + 1, r.name, selectedCadre, `${r.payable.toFixed(1)}h`, r.rate, r.amount.toLocaleString(), r.currentStatus,
    ]);
    rows.push(['', '', '', '', 'GRAND TOTAL', totalAmount.toLocaleString(), ''] as any);
    exportToPDF(`${label} Payment Bill`, headers, rows, `bill_${label.toLowerCase()}`);
    toast.success('PDF Bill Generated');
  };

  const handleBatchExcel = async () => {
    const label   = selectedCadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime';
    const headers = ['#', 'Svc No', 'Employee', 'Department', 'Payable Hrs', 'Rate/hr', 'Net Amount', 'Status'];
    const rows    = currentRoster.map((r, i) => [
      i + 1, r.employee?.serviceNo, r.name, r.dept, r.payable.toFixed(1), r.rate, r.amount, r.currentStatus,
    ]);
    await exportToExcel(`${label} Payments`, headers, rows, `payments_${label.toLowerCase()}`);
    toast.success('Excel Exported');
  };
  const handleProcessPayment = () => {
    if (!selectedPerson) return;
    
    const timeline = JSON.parse(selectedPerson.timeline || "[]");
    const updatedTimeline = [
      ...timeline,
      { event: "Payment Made", time: new Date().toISOString(), user: "Accounts Clerk" }
    ];

    updateSanction({
      id: selectedPerson.id,
      status: 'Paid',
      timeline: JSON.stringify(updatedTimeline)
    }, {
      onSuccess: () => {
        toast.success(`Payment processed for ${selectedPerson.name}`);
        setSelectedPerson(null);
      }
    });
  };

  if (!selectedCadre) {
    return (
      <AppShell>
        <PageHeader title="Allowance Disbursement Hub" subtitle="Consolidated Financial Processing & Payments" />
        <div className="flex items-center justify-center gap-10 py-20">
          <CadreCard type="Ministerial" icon={<Building2 className="w-10 h-10" />} label="Late-Sitting" rate={rates.Ministerial} onClick={() => setSelectedCadre('Ministerial')} />
          <CadreCard type="Industrial"  icon={<HardHat   className="w-10 h-10" />} label="Overtime"     rate={rates.Industrial}  onClick={() => setSelectedCadre('Industrial')}  />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setSelectedCadre(null)} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <PageHeader
          title={`${selectedCadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime'} Disbursement`}
          subtitle={`${selectedCadre} Cadre · Rate: Rs. ${rates[selectedCadre]}/hr`}
        />
      </div>

      <Section title="Final Disbursement Roster" actions={
        <div className="flex gap-2">
          <Btn variant="outline" onClick={handleBatchExcel}><FileSpreadsheet className="w-4 h-4 mr-2" /> Excel</Btn>
          <Btn variant="primary" onClick={handleBatchPDF}><Printer className="w-4 h-4 mr-2" /> Export PDF Bill</Btn>
        </div>
      }>
        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr><th>Svc No</th><th>Personnel</th><th>Payable Hrs</th><th>Net Amount</th><th>Status</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {currentRoster.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground italic">No approved sanctions found for this cadre.</td></tr>
              ) : currentRoster.map(r => (
                <tr key={r.id} className="hover:bg-muted/5 group">
                  <td className="font-mono text-xs font-bold text-primary">{r.employee?.serviceNo}</td>
                  <td><div className="font-bold">{r.name}</div><div className="text-[0.6rem] opacity-50 uppercase">{r.dept}</div></td>
                  <td className="font-mono font-black text-primary">{r.payable.toFixed(1)}h</td>
                  <td className="font-mono font-black text-accent">Rs. {r.amount.toLocaleString()}</td>
                  <td><Badge variant="warning">{r.currentStatus}</Badge></td>
                  <td className="text-right">
                    <button onClick={() => setSelectedPerson(r)} className="p-2 rounded-sm bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-primary text-white">
              <tr><td colSpan={5} className="px-5 py-4 text-right font-heading font-black italic uppercase text-accent">Total Disbursement</td><td className="px-5 py-4 text-right text-xl font-heading font-black text-accent italic">Rs. {totalAmount.toLocaleString()}</td></tr>
            </tfoot>
          </table>
        </div>
      </Section>

      {selectedPerson && (
        <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-5xl max-h-[90vh] rounded-md shadow-elevated border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-command px-8 py-5 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm bg-white/10 flex items-center justify-center border border-white/20"><ScrollText className="w-6 h-6 text-accent" /></div>
                <div>
                  <h3 className="text-xl font-heading font-black italic uppercase tracking-tight text-white">{selectedPerson.name}</h3>
                  <div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/60">{selectedPerson.employee?.serviceNo} · {selectedPerson.dept}</div>
                </div>
              </div>
              <button onClick={() => setSelectedPerson(null)} className="p-2 hover:bg-white/10 rounded-full transition-all text-white"><X className="w-7 h-7 text-white" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-muted/10">
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="panel p-5 border-l-4 border-l-primary bg-card shadow-sm"><div className="label-mil text-[0.6rem] mb-1 uppercase tracking-widest text-muted-foreground">Total Sanctioned Hours</div><div className="text-2xl font-black italic text-primary">{selectedPerson.gross.toFixed(1)}h</div></div>
                <div className="panel p-5 border-l-4 border-l-accent bg-card shadow-sm"><div className="label-mil text-[0.6rem] mb-1 uppercase tracking-widest text-muted-foreground">Days Present</div><div className="text-2xl font-black italic text-primary">{selectedPerson.daily.filter((d: any) => !d.isExcluded).length} Days</div></div>
                <div className="panel p-5 border-l-4 border-l-success bg-card shadow-sm"><div className="label-mil text-[0.6rem] mb-1 uppercase tracking-widest text-muted-foreground">Total Payment Due</div><div className="text-2xl font-black italic text-success">Rs. {selectedPerson.amount.toLocaleString()}</div></div>
              </div>
              <div className="panel bg-card border border-border overflow-hidden shadow-sm">
                <div className="bg-muted/30 px-6 py-3 border-b border-border flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-primary">
                  <Calendar className="w-4 h-4 text-accent" /> Daily Muster Roll
                </div>
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Muster Status</th><th className="text-right">Extra Hours</th><th className="text-right">Rate</th><th className="text-right">Day Payment</th><th className="text-right">Eligibility</th></tr></thead>
                  <tbody>
                    {selectedPerson.daily.map((d: any) => (
                      <tr key={d.date} className={d.isExcluded ? 'bg-destructive/5 opacity-60' : 'hover:bg-muted/5'}>
                        <td className="font-mono text-xs font-bold text-primary">{d.date}</td>
                        <td><Badge variant={STATUS_LABEL[d.status]?.variant as any} className="text-[0.6rem] font-bold">{STATUS_LABEL[d.status]?.label || d.status}</Badge></td>
                        <td className="text-right font-mono font-bold text-primary">{d.extraHrs.toFixed(1)}h</td>
                        <td className="text-right font-mono text-xs text-muted-foreground font-bold">Rs. {selectedPerson.rate}</td>
                        <td className="text-right font-mono font-black text-primary">Rs. {(d.extraHrs * selectedPerson.rate).toLocaleString()}</td>
                        <td className="text-right">{d.isExcluded ? <Badge variant="danger" className="text-[0.6rem] font-bold">EXCLUDED</Badge> : <Badge variant="success" className="text-[0.6rem] font-bold">INCLUDED</Badge>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="border-t border-border bg-muted/40 px-8 py-4 flex justify-end gap-3 shrink-0">
              <Btn variant="outline" onClick={() => setSelectedPerson(null)}>Close Statement</Btn>
              <Btn variant="gold" onClick={handleProcessPayment}>
                <Check className="w-4 h-4 mr-2" /> Process & Mark Paid
              </Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

const CadreCard = ({ type, icon, label, rate, onClick }: { type: string; icon: React.ReactNode; label: string; rate: number; onClick: () => void }) => (
  <button onClick={onClick} className="group relative w-80 p-10 bg-card border border-border rounded-md shadow-sm hover:shadow-elevated hover:border-primary transition-all duration-300 text-center flex flex-col items-center">
    <div className="stripe-top-gold absolute top-0 left-0" />
    <div className="w-20 h-20 rounded-full bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">{icon}</div>
    <h3 className="text-2xl font-heading font-black italic uppercase text-primary tracking-tight mb-2">{type}</h3>
    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-4">{label} Management</p>
    <div className="gold-rule mb-4" />
    <Badge variant="info">Fixed Rate: Rs. {rate}/hr</Badge>
  </button>
);

export default Payments;
