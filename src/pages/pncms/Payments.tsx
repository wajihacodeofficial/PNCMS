import { useState, useMemo, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import { Btn, Badge, Section, StatCard, Input, Field } from '@/components/pncms/ui-kit';
import {
  Building2, HardHat, Wallet, Printer,
  FileSpreadsheet, AlertTriangle, CheckCircle2,
  Calendar, Eye, X, ScrollText, ArrowLeft, FileDown, Check, Unlock, ShieldX
} from 'lucide-react';
import { sanctions, personnel, attendanceHistory } from '@/data/mock';
import { exportToPDF, exportToExcel } from '@/lib/export';
import { toast } from 'sonner';

/* ─── helpers ─────────────────────────────────────── */
const STATUS_LABEL: Record<string, { label: string; variant: string }> = {
  P:  { label: 'Present',     variant: 'success' },
  A:  { label: 'Absent',      variant: 'danger'  },
  L:  { label: 'Late',        variant: 'warning' },
  CL: { label: 'Casual Leave', variant: 'info' },
  RL: { label: 'Rest Leave',   variant: 'info' },
  ML: { label: 'Medical Leave',variant: 'info' },
};

const MOCK_DAILY_HOURS: Record<string, number> = {
  '2026-04-01': 2.5, '2026-04-02': 3.0, '2026-04-03': 0,
  '2026-04-04': 4.0, '2026-04-05': 2.5, '2026-04-10': 3.5,
  '2026-04-20': 0,
};

function buildDailyBreakdown(svc: string) {
  return Object.entries(attendanceHistory).map(([date, entries]) => {
    const status = (entries as Record<string, string>)[svc] ?? 'P';
    const isExcluded = !['P', 'L'].includes(status);
    const extraHrs = isExcluded ? 0 : (MOCK_DAILY_HOURS[date] ?? 0);
    return { date, status, extraHrs, isExcluded };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

const Payments = () => {
  const [selectedCadre, setSelectedCadre] = useState<'Ministerial' | 'Industrial' | null>(null);
  const [rates, setRates] = useState({ Ministerial: 380, Industrial: 420 });
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [clerkName, setClerkName] = useState("Wajiha Zehra");
  const [secretPassword, setSecretPassword] = useState("");

  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("pncms_payment_statuses");
    return saved ? JSON.parse(saved) : {};
  });

  const [unlockModal, setUnlockModal] = useState<{ id: string; targetStatus: string } | null>(null);

  useEffect(() => {
    localStorage.setItem("pncms_payment_statuses", JSON.stringify(paymentStatuses));
  }, [paymentStatuses]);

  useEffect(() => {
    const clk = localStorage.getItem("clerk_name");
    if (clk) setClerkName(clk);
  }, []);

  const currentRoster = useMemo(() => {
    if (!selectedCadre) return [];
    return sanctions
      .filter(s => s.cadre === selectedCadre && s.status === 'Approved')
      .map(s => {
        const p = personnel.find(pers => pers.svc === s.svc);
        const daily = buildDailyBreakdown(s.svc);
        const gross = daily.reduce((acc, d) => acc + d.extraHrs, 0);
        const leave = daily.filter(d => d.isExcluded).length;
        const payable = gross; 
        const rate = rates[selectedCadre];
        const status = paymentStatuses[s.id] || (payable > 0 ? "Payment Pending" : "N/A");

        return {
          ...s, name: p?.name || s.emp, rank: p?.rank || '—', dept: p?.dept || s.dept,
          gross, leave, payable, rate, amount: payable * rate,
          exceeds: gross > s.hours, daily, currentStatus: status
        };
      });
  }, [selectedCadre, rates, paymentStatuses]);

  const totalAmount = currentRoster.reduce((s, r) => s + r.amount, 0);

  const handleUpdateStatus = (id: string, newStatus: string) => {
    if (paymentStatuses[id] && paymentStatuses[id] !== "Payment Pending") {
      setUnlockModal({ id, targetStatus: newStatus });
      return;
    }
    setPaymentStatuses(prev => ({ ...prev, [id]: newStatus }));
    toast.success(`Payment status updated to ${newStatus}`);
  };

  const handleUnlockVerify = () => {
    const savedPass = localStorage.getItem("admin_password") || "12345qwert";
    if (secretPassword === savedPass) {
      if (unlockModal) {
        setPaymentStatuses(prev => ({ ...prev, [unlockModal.id]: unlockModal.targetStatus }));
        toast.success(`Security Verified. Status updated.`);
      }
      setUnlockModal(null);
      setSecretPassword("");
    } else {
      toast.error("Invalid Secret Password");
    }
  };

  const handleBatchPDF = () => {
    const label = selectedCadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime';
    const headers = [["#", "Employee", "Cadre", "Gross Hrs", "Payable", "Rate", "Amount", "Payment Status"]];
    const rows = currentRoster.map((r, i) => [
      i + 1, r.name, r.cadre, `${r.gross.toFixed(1)}h`, `${r.payable.toFixed(1)}h`, r.rate, r.amount.toLocaleString(), r.currentStatus
    ]);
    rows.push(['', '', '', '', '', 'GRAND TOTAL', totalAmount.toLocaleString(), '']);
    exportToPDF(`${label} Payment Bill`, headers, rows, `bill_${label.toLowerCase()}`, 
      { period: "April 2026", dept: "All Departments", clerk: `${clerkName} · DIL-ADM-04` },
      [{ label: "Total Disbursement", value: `Rs. ${totalAmount.toLocaleString()}` }]
    );
    toast.success("PDF Bill Generated");
  };

  const handleBatchExcel = async () => {
    const label = selectedCadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime';
    const headers = ["#", "Svc No", "Employee", "Department", "Cadre", "Gross Hrs", "Payable Hrs", "Rate/hr", "Net Amount", "Status"];
    const rows = currentRoster.map((r, i) => [
      i + 1, r.svc, r.name, r.dept, r.cadre, r.gross.toFixed(1), r.payable.toFixed(1), r.rate, r.amount, r.currentStatus
    ]);
    await exportToExcel(`${label} Payments`, headers, rows, `payments_${label.toLowerCase()}`);
    toast.success("Excel Roster Exported");
  };

  const handleIndividualExcel = async (p: any) => {
    const headers = ["Date", "Muster Status", "Extra Hours", "Hourly Rate", "Day Payment", "Eligibility"];
    const data = p.daily.map((d: any) => [
      d.date, STATUS_LABEL[d.status]?.label || d.status, d.extraHrs, p.rate,
      d.extraHrs * p.rate, d.isExcluded ? 'EXCLUDED' : 'INCLUDED'
    ]);
    await exportToExcel(`Attendance_Breakdown_${p.svc}`, headers, data, `individual_${p.svc}`);
    toast.success("Individual Excel Exported");
  };

  if (!selectedCadre) {
    return (
      <AppShell>
        <PageHeader title="Allowance Disbursement Hub" subtitle="Consolidated Financial Processing & Payments" />
        <div className="flex items-center justify-center gap-10 py-20">
          <CadreCard type="Ministerial" icon={<Building2 className="w-10 h-10" />} label="Late-Sitting" rate={rates.Ministerial} onClick={() => setSelectedCadre('Ministerial')} />
          <CadreCard type="Industrial" icon={<HardHat className="w-10 h-10" />} label="Overtime" rate={rates.Industrial} onClick={() => setSelectedCadre('Industrial')} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setSelectedCadre(null)} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
        <PageHeader title={`${selectedCadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime'} Disbursement`} subtitle={`Consolidated ${selectedCadre} Cadre Financial Roster · Rate: Rs. ${rates[selectedCadre]}/hr`} />
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
              <tr><th>Svc No</th><th>Personnel</th><th>Payable</th><th>Net Amount</th><th>Status</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {currentRoster.map(r => (
                <tr key={r.id} className="hover:bg-muted/5 group">
                  <td className="font-mono text-xs font-bold text-primary">{r.svc}</td>
                  <td><div className="font-bold">{r.name}</div><div className="text-[0.6rem] opacity-50 uppercase">{r.dept}</div></td>
                  <td className="font-mono font-black text-primary">{r.payable.toFixed(1)}h</td>
                  <td className="font-mono font-black text-accent">Rs. {r.amount.toLocaleString()}</td>
                  <td>
                    <Badge variant={r.currentStatus === 'Paid' ? 'success' : (r.currentStatus === 'N/A' ? 'info' : 'warning')}>
                      {r.currentStatus}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelectedPerson(r)} className="p-2 rounded-sm bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"><Eye className="w-4 h-4" /></button>
                      {r.currentStatus === 'Payment Pending' && (
                        <button onClick={() => handleUpdateStatus(r.id, 'Paid')} className="p-2 rounded-sm bg-success/10 text-success hover:bg-success hover:text-white transition-all shadow-sm" title="Mark as Paid"><Check className="w-4 h-4" /></button>
                      )}
                      {r.currentStatus === 'Paid' && (
                        <button onClick={() => handleUpdateStatus(r.id, 'Payment Pending')} className="p-2 rounded-sm bg-warning/10 text-warning hover:bg-warning hover:text-white transition-all shadow-sm" title="Unlock Status"><Unlock className="w-4 h-4" /></button>
                      )}
                    </div>
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

      {/* Security Modal */}
      {unlockModal && (
        <div className="fixed inset-0 z-[200] bg-primary/70 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-md rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
            <div className="bg-destructive px-6 py-4 flex justify-between items-center text-white text-white"><div className="flex items-center gap-2 text-white"><ShieldX className="w-5 h-5 text-white"/><h3 className="text-lg font-heading font-black italic uppercase text-white">Security Override</h3></div><button onClick={() => setUnlockModal(null)} className="text-white"><X className="w-5 h-5 text-white"/></button></div>
            <div className="p-8 space-y-6">
               <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-sm text-xs font-bold text-destructive uppercase italic leading-tight">Administrative Authorization Required.</div>
               <Field label="Secret Password"><Input type="password" value={secretPassword} onChange={(e) => setSecretPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlockVerify()}/></Field>
            </div>
            <div className="bg-muted/30 p-5 flex justify-end gap-3"><Btn variant="outline" onClick={() => setUnlockModal(null)}>Cancel</Btn><Btn variant="danger" onClick={handleUnlockVerify}>Authorize</Btn></div>
          </div>
        </div>
      )}

      {selectedPerson && (
        <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-md flex items-center justify-center p-8">
           <div className="bg-card w-full max-w-5xl max-h-[90vh] rounded-md shadow-elevated border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="bg-gradient-command px-8 py-5 flex items-center justify-between border-b border-white/10 shrink-0 text-white">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-sm bg-white/10 flex items-center justify-center border border-white/20"><ScrollText className="w-6 h-6 text-accent" /></div>
                    <div><h3 className="text-xl font-heading font-black italic uppercase tracking-tight text-white">{selectedPerson.name}</h3><div className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/60">{selectedPerson.svc} · {selectedPerson.dept}</div></div>
                 </div>
                 <div className="flex items-center gap-3">
                    <Btn variant="outline" className="text-white border-white/20 hover:bg-white/10" onClick={() => handleIndividualExcel(selectedPerson)}><FileSpreadsheet className="w-4 h-4 mr-2" /> Excel</Btn>
                    <button onClick={() => setSelectedPerson(null)} className="p-2 hover:bg-white/10 rounded-full transition-all text-white"><X className="w-7 h-7 text-white" /></button>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-muted/10">
                 <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="panel p-5 border-l-4 border-l-primary bg-card shadow-sm"><div className="label-mil text-[0.6rem] mb-1 uppercase tracking-widest text-muted-foreground">Total Extra Hours</div><div className="text-2xl font-black italic text-primary">{selectedPerson.gross.toFixed(1)}h</div></div>
                    <div className="panel p-5 border-l-4 border-l-accent bg-card shadow-sm"><div className="label-mil text-[0.6rem] mb-1 uppercase tracking-widest text-muted-foreground">Total Working Days</div><div className="text-2xl font-black italic text-primary">{selectedPerson.daily.filter((d: any) => !d.isExcluded).length} Days</div></div>
                    <div className="panel p-5 border-l-4 border-l-success bg-card shadow-sm"><div className="label-mil text-[0.6rem] mb-1 uppercase tracking-widest text-muted-foreground">Total Payment Due</div><div className="text-2xl font-black italic text-success">Rs. {selectedPerson.amount.toLocaleString()}</div></div>
                 </div>
                 <div className="panel bg-card border border-border overflow-hidden shadow-sm">
                    <div className="bg-muted/30 px-6 py-3 border-b border-border flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-widest text-primary"><Calendar className="w-4 h-4 text-accent" /> Daily Muster Roll & Extra Hours Log</div>
                    </div>
                    <table className="data-table">
                       <thead><tr><th>Date</th><th>Muster Status</th><th className="text-right">Extra Hours</th><th className="text-right">Hourly Rate</th><th className="text-right">Day Payment</th><th className="text-right">Eligibility</th></tr></thead>
                       <tbody>
                          {selectedPerson.daily.map((d: any) => (
                             <tr key={d.date} className={d.isExcluded ? 'bg-destructive/5 opacity-60' : 'hover:bg-muted/5'}>
                                <td className="font-mono text-xs font-bold text-primary">{d.date}</td>
                                <td><Badge variant={STATUS_LABEL[d.status]?.variant as any} className="text-[0.6rem] font-bold">{STATUS_LABEL[d.status]?.label}</Badge></td>
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
