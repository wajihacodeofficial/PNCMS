import { useState, useMemo, useEffect } from 'react';
import { AppShell, PageHeader, useCadre } from '@/components/pncms/AppShell';
import {
  Btn,
  Badge,
  Section,
  Field,
  Input,
  Select,
  StatCard
} from '@/components/pncms/ui-kit';
import { 
  Plus, AlertTriangle, Eye, Check, X, Search, FileText, 
  Calculator, Lock, ClipboardList, Clock, History, 
  CheckCircle2, Wallet, Landmark, TrendingUp, Filter,
  FileDown, FileSpreadsheet, Building2, HardHat, ArrowLeft,
  ShieldX, CalendarX, Info, Edit3, Unlock, Table, Printer,
  ScrollText, ShieldCheck
} from 'lucide-react';
import { sanctions as initialSanctions, personnel } from '@/data/mock';
import * as Tabs from "@radix-ui/react-tabs";
import { toast } from 'sonner';
import { exportToPDF, exportToExcel } from "@/lib/export";

const OvertimeSystem = () => {
  const { cadre, setCadre } = useCadre();
  const [selectedCadre, setSelectedCadre] = useState<'Ministerial' | 'Industrial' | null>(null);
  const [activeTab, setActiveTab] = useState("sanctions");
  const [isAddingSanction, setIsAddingSanction] = useState(false);
  
  // Data Persistence
  const [localSanctions, setLocalSanctions] = useState(() => {
    const saved = localStorage.getItem("pncms_sanctions");
    return saved ? JSON.parse(saved) : initialSanctions;
  });

  const [clerkName, setClerkName] = useState("Wajiha Zehra");

  // Form State
  const [formSvc, setFormSvc] = useState("");
  const [formHours, setFormHours] = useState("");
  const [formJustification, setFormJustification] = useState("");

  // Search/Filter
  const [selectedPersonnel, setSelectedPersonnel] = useState('');

  // Dynamic Rates from Settings
  const [rates, setRates] = useState({ Ministerial: 380, Industrial: 420 });

  useEffect(() => {
    localStorage.setItem("pncms_sanctions", JSON.stringify(localSanctions));
  }, [localSanctions]);

  useEffect(() => {
    const min = localStorage.getItem("rate_ministerial");
    const ind = localStorage.getItem("rate_industrial");
    const clk = localStorage.getItem("clerk_name");
    if (clk) setClerkName(clk);
    if (min || ind) {
      setRates({
        Ministerial: parseInt(min || "380"),
        Industrial: parseInt(ind || "420")
      });
    }
  }, []);

  // Security
  const [unlockModal, setUnlockModal] = useState<{ id: string; targetStatus: 'Approved' | 'Rejected' | 'Pending' } | null>(null);
  const [secretPassword, setSecretPassword] = useState("");

  const handleCadreSelect = (c: 'Ministerial' | 'Industrial') => {
    setSelectedCadre(c);
    setCadre(c);
  };

  const handleSubmitSanction = () => {
    if (!formSvc || !formHours) {
      toast.error("Please fill all required fields");
      return;
    }
    const p = personnel.find(pers => pers.svc === formSvc);
    const newSanction = {
      id: `SNC-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      svc: formSvc,
      emp: p?.name || "Unknown",
      dept: p?.dept || "Unknown",
      hours: parseInt(formHours),
      period: "Apr 2026",
      status: "Pending" as const,
      cadre: selectedCadre
    };
    setLocalSanctions([newSanction, ...localSanctions]);
    setIsAddingSanction(false);
    setFormSvc("");
    setFormHours("");
    setFormJustification("");
    toast.success("Sanction application submitted to register");
  };

  const updateSanctionStatus = (id: string, status: 'Approved' | 'Rejected' | 'Pending') => {
    const current = localSanctions.find((s: any) => s.id === id);
    if (current && (current.status === 'Approved' || current.status === 'Rejected') && status !== current.status) {
      setUnlockModal({ id, targetStatus: status });
      return;
    }
    setLocalSanctions((prev: any) => prev.map((s: any) => s.id === id ? { ...s, status } : s));
    toast.success(`Sanction ${id} marked as ${status}`);
  };

  const handleUnlockVerify = () => {
    const savedPass = localStorage.getItem("admin_password") || "12345qwert";
    if (secretPassword === savedPass) {
      if (unlockModal) {
        setLocalSanctions((prev: any) => prev.map((s: any) => s.id === unlockModal.id ? { ...s, status: unlockModal.targetStatus } : s));
        toast.success(`Identity Verified. Status updated.`);
      }
      setUnlockModal(null);
      setSecretPassword("");
    } else {
      toast.error("Incorrect Secret Password");
    }
  };

  const typeLabel = selectedCadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime';
  const hourlyRate = selectedCadre ? rates[selectedCadre] : 0;
  const filteredSanctions = localSanctions.filter((s: any) => s.cadre === selectedCadre);
  const approvedSanctions = filteredSanctions.filter((s: any) => s.status === 'Approved');

  // Roster Logic
  const rosterData = useMemo(() => {
    return approvedSanctions.map((s: any) => {
      const p = personnel.find(pers => pers.svc === s.svc);
      const gross = 56, leave = 4, payable = gross - leave;
      return {
        ...s,
        name: p?.name || s.emp,
        rank: p?.rank || 'Unknown',
        dept: p?.dept || s.dept,
        gross, leave, payable,
        amount: payable * hourlyRate,
        exceeds: gross > s.hours
      };
    });
  }, [approvedSanctions, selectedCadre, hourlyRate]);

  const totalRosterDisbursement = rosterData.reduce((sum, item) => sum + item.amount, 0);

  /* ─── Export Logic ──────────────────────────────── */
  const handleExportRosterPDF = () => {
    const headers = [["#", "Employee", "Cadre", "Gross Hrs", "Payable", "Rate", "Amount", "Status"]];
    const rows = rosterData.map((r, i) => [
      i + 1, r.name, r.cadre, `${r.gross}h`, `${r.payable}h`, r.rate || hourlyRate, r.amount.toLocaleString(), r.status.toUpperCase()
    ]);
    rows.push(['', '', '', '', '', 'GRAND TOTAL', totalRosterDisbursement.toLocaleString(), '']);
    exportToPDF(
      `${typeLabel} Disbursement Bill`, headers, rows,
      `pncms_${typeLabel.toLowerCase()}_bill`,
      { period: "April 2026", dept: "All Departments", clerk: `${clerkName} · DIL-ADM-04` },
      [
        { label: "Total Payable", value: `Rs. ${totalRosterDisbursement.toLocaleString()}` },
        { label: "Personnel Count", value: `${rosterData.length} Staff` },
        { label: "Hourly Rate", value: `Rs. ${hourlyRate}/hr` }
      ]
    );
    toast.success("Official Roster Bill PDF Generated");
  };

  const handleExportRosterExcel = async () => {
    const headers = ["#", "Employee", "Svc No", "Dept", "Cadre", "Sanctioned Hrs", "Gross Hrs", "Leave Days", "Payable Hrs", "Hourly Rate", "Net Amount"];
    const rows = rosterData.map((r, i) => [
      i + 1, r.name, r.svc, r.dept, r.cadre, r.hours, r.gross, r.leave, r.payable, hourlyRate, r.amount
    ]);
    await exportToExcel(`${typeLabel} Roster`, headers, rows, `pncms_${typeLabel.toLowerCase()}_roster`);
    toast.success("Roster Excel Exported");
  };

  const handleExportSanctionsExcel = async () => {
    const headers = ["Sanction ID", "Employee", "Svc No", "Dept", "Cadre", "Limit (hrs)", "Status"];
    const rows = filteredSanctions.map((s: any) => [
      s.id, s.emp, s.svc, s.dept, selectedCadre, s.hours, s.status
    ]);
    await exportToExcel(`${typeLabel} Sanctions`, headers, rows, `pncms_${typeLabel.toLowerCase()}_sanctions`);
    toast.success("Sanctions Excel Exported");
  };

  const handlePrintLetter = (s: any) => {
    const headers = [["Field", "Details"]];
    const data = [
      ["Employee Name", s.emp],
      ["Service No", s.svc],
      ["Department", s.dept],
      ["Authorization ID", s.id],
      ["Sanctioned Hours", `${s.hours} Hours`],
      ["Payable Rate", `Rs. ${hourlyRate}/hr`],
      ["Status", "OFFICIALLY AUTHORIZED"]
    ];

    exportToPDF(
      `Sanction Authorization Letter`, 
      headers, 
      data, 
      `authorization_${s.svc}`,
      { period: "April 2026", dept: s.dept, clerk: `${clerkName} · DIL-ADM-04` },
      [{ label: "Sanction Limit", value: `${s.hours} Hours` }]
    );
    toast.success("Authorization Letter Generated");
  };

  if (!selectedCadre) {
    return (
      <AppShell>
        <PageHeader title="Allowance Control Center" subtitle="Authorization & Disbursement Management Hub" />
        <div className="flex items-center justify-center gap-10 py-20">
          <CadreCard type="Ministerial" icon={<Building2 className="w-10 h-10" />} label="Late-Sitting" rate={rates.Ministerial} onClick={() => handleCadreSelect('Ministerial')} />
          <CadreCard type="Industrial" icon={<HardHat className="w-10 h-10" />} label="Overtime" rate={rates.Industrial} onClick={() => handleCadreSelect('Industrial')} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setSelectedCadre(null)} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
        <PageHeader title={`${typeLabel} Control System`} subtitle={`${selectedCadre} Cadre · Fixed Rate: Rs. ${hourlyRate}/hr`} />
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-2 mb-8 border-b border-border pb-px">
          <Tabs.Trigger value="sanctions" className="tab-trigger">Month 1: Sanctions</Tabs.Trigger>
          <Tabs.Trigger value="approved" className="tab-trigger">Approved Letters</Tabs.Trigger>
          <Tabs.Trigger value="worklogs" className="tab-trigger">Month 2: Performance</Tabs.Trigger>
          <Tabs.Trigger value="roster" className="tab-trigger">Month 3: Roster</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="sanctions" className="animate-in fade-in duration-300">
          <Section title="Sanction Register" actions={<div className="flex gap-2"><Btn variant="outline" className="h-9 shadow-sm" onClick={handleExportSanctionsExcel}><FileSpreadsheet className="w-4 h-4 mr-2"/>Excel</Btn><Btn variant="gold" className="h-9" onClick={() => setIsAddingSanction(true)}><Plus className="w-4 h-4" /> New Request</Btn></div>}>
            <div className="overflow-x-auto -m-5">
              <table className="data-table">
                <thead><tr><th>Sanction ID</th><th>Personnel</th><th>Limit</th><th>Status</th><th className="text-right">Action</th></tr></thead>
                <tbody>
                  {filteredSanctions.map((s: any) => (
                    <tr key={s.id} className="group hover:bg-muted/5">
                      <td className="font-mono text-xs font-bold text-primary">{s.id}</td>
                      <td>{s.emp}</td><td className="font-bold">{s.hours}h</td>
                      <td><Badge variant={s.status.toLowerCase() as any}>{s.status}</Badge></td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          {s.status === 'Pending' ? (
                            <>
                              <button onClick={() => updateSanctionStatus(s.id, 'Approved')} className="p-1.5 rounded-sm bg-success/10 text-success hover:bg-success hover:text-white transition-all"><Check className="w-4 h-4" /></button>
                              <button onClick={() => updateSanctionStatus(s.id, 'Rejected')} className="p-1.5 rounded-sm bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all"><X className="w-4 h-4" /></button>
                            </>
                          ) : (
                            <button onClick={() => updateSanctionStatus(s.id, 'Pending')} className="p-1.5 rounded-sm bg-warning/10 text-warning hover:bg-warning hover:text-white transition-all"><Unlock className="w-4 h-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </Tabs.Content>

        <Tabs.Content value="approved" className="animate-in fade-in duration-300">
           <Section title="Active Authorizations" subtitle="Personnel currently authorized to perform extra duties.">
              <div className="grid grid-cols-2 gap-4">
                {approvedSanctions.map((s: any) => (
                  <div key={s.id} className="panel p-5 border-l-4 border-l-success flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success"><ScrollText className="w-6 h-6"/></div>
                      <div>
                        <div className="text-sm font-black text-primary uppercase italic">{s.emp}</div>
                        <div className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest">{s.id} · {s.hours}h Limit</div>
                      </div>
                    </div>
                    <Btn variant="outline" className="h-9 px-3 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handlePrintLetter(s)}><Printer className="w-4 h-4 mr-2"/> Print Letter</Btn>
                  </div>
                ))}
              </div>
           </Section>
        </Tabs.Content>

        <Tabs.Content value="roster" className="animate-in fade-in duration-300">
          <Section title="Final Disbursement Roster" actions={<div className="flex gap-2"><Btn variant="outline" className="h-9 shadow-sm" onClick={handleExportRosterExcel}><FileSpreadsheet className="w-4 h-4 mr-2"/>Excel</Btn><Btn variant="primary" className="h-9 shadow-sm" onClick={handleExportRosterPDF}><Printer className="w-4 h-4 mr-2"/> Export PDF Bill</Btn></div>}>
             <div className="overflow-x-auto -m-5">
              <table className="data-table">
                <thead><tr><th>Personnel</th><th>Sanctioned</th><th>Actual</th><th className="text-warning">Leave</th><th>Payable</th><th className="text-right">Net Amount</th></tr></thead>
                <tbody>
                  {rosterData.map((r: any) => (
                    <tr key={r.id}>
                      <td><div className="font-bold">{r.name}</div><div className="text-[0.6rem] opacity-50 uppercase">{r.svc} · {r.dept}</div></td>
                      <td className="font-mono text-xs">{r.hours}h</td>
                      <td className="font-mono text-xs font-bold">{r.gross}h {r.exceeds && "⚠️"}</td>
                      <td className="font-mono text-xs text-warning">-{r.leave}h</td>
                      <td className="font-mono font-black text-primary">{r.payable}h</td>
                      <td className="text-right font-mono font-bold text-accent">Rs. {r.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </Tabs.Content>
      </Tabs.Root>

      {/* Security Modals & Overlays truncated for brevity but remain intact */}
      {isAddingSanction && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-2xl rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
             <div className="bg-gradient-command px-6 py-4 flex items-center justify-between border-b border-white/10"><h3 className="text-white font-heading font-black italic uppercase text-lg">New {typeLabel} Sanction</h3><button onClick={() => setIsAddingSanction(false)} className="text-white/70 hover:text-white"><X className="w-6 h-6"/></button></div>
             <div className="p-8 grid grid-cols-2 gap-6">
                <Field label="Personnel" required>
                  <Select value={formSvc} onChange={(e) => setFormSvc(e.target.value)}>
                    <option value="">Select staff...</option>
                    {personnel.filter(p => p.cardType === selectedCadre).map(p => <option key={p.svc} value={p.svc}>{p.name} ({p.svc})</option>)}
                  </Select>
                </Field>
                <Field label="Max Hours" required>
                  <Input type="number" value={formHours} onChange={(e) => setFormHours(e.target.value)} placeholder="Limit for period" />
                </Field>
             </div>
             <div className="bg-muted/30 p-5 flex justify-end gap-3">
                <Btn variant="outline" onClick={() => setIsAddingSanction(false)}>Cancel</Btn>
                <Btn variant="gold" onClick={handleSubmitSanction}>Submit</Btn>
             </div>
          </div>
        </div>
      )}

      {unlockModal && (
        <div className="fixed inset-0 z-[110] bg-primary/70 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-md rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
            <div className="bg-destructive px-6 py-4 flex justify-between items-center text-white"><div className="flex items-center gap-2"><ShieldX className="w-5 h-5"/><h3 className="text-lg font-heading font-black italic uppercase">Verify Access</h3></div><button onClick={() => setUnlockModal(null)}><X className="w-5 h-5"/></button></div>
            <div className="p-8 space-y-6">
               <Field label="Secret Password"><Input type="password" value={secretPassword} onChange={(e) => setSecretPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlockVerify()}/></Field>
            </div>
            <div className="bg-muted/30 p-5 flex justify-end gap-3"><Btn variant="outline" onClick={() => setUnlockModal(null)}>Abort</Btn><Btn variant="danger" onClick={handleUnlockVerify}>Verify</Btn></div>
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

export default OvertimeSystem;
