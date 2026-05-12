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
  Plus, Check, X, 
  Printer, 
  ScrollText, ShieldCheck,
  Building2, HardHat, ArrowLeft,
  ShieldX, Unlock, FileSpreadsheet, FileDown
} from 'lucide-react';
import * as Tabs from "@radix-ui/react-tabs";
import { toast } from 'sonner';
import { exportToPDF, exportToExcel } from "@/lib/export";
import { useSanctions, usePersonnel, useCreateSanction, useUpdateSanction, useSettings, useCreateLog } from '@/hooks/use-api';

const OvertimeSystem = () => {
  const { data: allSanctions = [], isLoading: isSanctionsLoading } = useSanctions();
  const { data: personnel = [], isLoading: isPersonnelLoading } = usePersonnel();
  const { data: settings = {} } = useSettings();
  const { mutate: createSanction } = useCreateSanction();
  const { mutate: updateSanction } = useUpdateSanction();
  const { mutate: createLog } = useCreateLog();

  const { cadre, setCadre } = useCadre();
  const [selectedCadre, setSelectedCadre] = useState<'Ministerial' | 'Industrial' | null>(null);
  const [activeTab, setActiveTab] = useState("sanctions");
  const [isAddingSanction, setIsAddingSanction] = useState(false);
  
  const [clerkName, setClerkName] = useState("Wajiha Zehra");
  const [formSvc, setFormSvc] = useState("");
  const [formHours, setFormHours] = useState("");

  const rates = useMemo(() => ({
    Ministerial: parseInt(settings.rate_ministerial || "380"),
    Industrial: parseInt(settings.rate_industrial || "420")
  }), [settings]);

  useEffect(() => {
    if (settings.clerk_name) setClerkName(settings.clerk_name);
  }, [settings]);

  // Security
  const [unlockModal, setUnlockModal] = useState<{ id: string; targetStatus: string } | null>(null);
  const [unlockUsername, setUnlockUsername] = useState("");
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
    const emp = personnel.find((p: any) => p.serviceNo === formSvc);
    if (!emp) {
      toast.error("Employee not found");
      return;
    }

    createSanction({
      svc: formSvc,
      hours: parseInt(formHours),
      period: "May 2026",
      status: "Pending",
      cadre: selectedCadre
    }, {
      onSuccess: () => {
        createLog({
          user: localStorage.getItem("username") || "Admin",
          action: "CREATE",
          entity: `Sanction for ${formSvc} (${formHours}h)`,
          result: "Success"
        });
        toast.success("Sanction request submitted");
        setIsAddingSanction(false);
        setFormSvc("");
        setFormHours("");
      }
    });
  };

  const updateSanctionStatus = (id: string, status: string) => {
    const current = (allSanctions as any[]).find((s: any) => s.id === id);
    if (current && (current.status === 'Approved' || current.status === 'Rejected') && status !== current.status) {
      setUnlockModal({ id, targetStatus: status });
      return;
    }
    
    updateSanction({ id, status }, {
      onSuccess: () => {
        createLog({
          user: localStorage.getItem("username") || "Admin",
          action: "UPDATE",
          entity: `Sanction ${id} set to ${status}`,
          result: "Success"
        });
        toast.success(`Sanction marked as ${status}`);
      }
    });
  };

  const handleUnlockVerify = () => {
    const savedPass = settings.secret_password || "998877";
    if (unlockUsername === 'Administrator' && secretPassword === savedPass) {
      if (unlockModal) {
        updateSanction({ id: unlockModal.id, status: unlockModal.targetStatus }, {
          onSuccess: () => {
            createLog({
              user: "Administrator",
              action: "OVERRIDE",
              entity: `Sanction ${unlockModal.id} manually set to ${unlockModal.targetStatus}`,
              result: "Success"
            });
            toast.success("Security Override Successful");
          }
        });
      }
      setUnlockModal(null);
      setUnlockUsername("");
      setSecretPassword("");
    } else {
      toast.error("Authorization Failed");
    }
  };

  const typeLabel = selectedCadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime';
  const hourlyRate = selectedCadre ? rates[selectedCadre] : 0;
  
  const filteredSanctions = useMemo(() => {
    return (allSanctions as any[]).filter(s => {
      // In a real app, cadre might be on the employee or sanction record
      // For now we filter based on what we just selected
      return s.employee?.cardType === selectedCadre;
    });
  }, [allSanctions, selectedCadre]);

  const approvedSanctions = useMemo(() => filteredSanctions.filter(s => s.status === 'Approved'), [filteredSanctions]);

  // Roster Logic (Mocking performance data for the bill based on approved sanctions)
  const rosterData = useMemo(() => {
    return approvedSanctions.map((s: any) => {
      const gross = Math.floor(Math.random() * (s.hours - 10)) + 10; // Random mock performance
      const leave = Math.floor(Math.random() * 5);
      const payable = gross - leave;
      return {
        ...s,
        gross, leave, payable,
        amount: payable * hourlyRate,
      };
    });
  }, [approvedSanctions, hourlyRate]);

  const totalDisbursement = rosterData.reduce((sum, item) => sum + item.amount, 0);

  if (!selectedCadre) {
    return (
      <AppShell>
        <PageHeader title="Allowance Control Center" subtitle="Authorization & Disbursement Management Hub" />
        {(isSanctionsLoading || isPersonnelLoading) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
             <p className="label-mil">Synchronizing Allowance Database...</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-10 py-20">
            <CadreCard type="Ministerial" icon={<Building2 className="w-10 h-10" />} label="Late-Sitting" rate={rates.Ministerial} onClick={() => handleCadreSelect('Ministerial')} />
            <CadreCard type="Industrial" icon={<HardHat className="w-10 h-10" />} label="Overtime" rate={rates.Industrial} onClick={() => handleCadreSelect('Industrial')} />
          </div>
        )}
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
          <Tabs.Trigger value="roster" className="tab-trigger">Month 2: Roster</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="sanctions" className="animate-in fade-in duration-300">
          <Section title="Sanction Register" actions={<div className="flex gap-2"><Btn variant="gold" className="h-9" onClick={() => setIsAddingSanction(true)}><Plus className="w-4 h-4" /> New Request</Btn></div>}>
            <div className="overflow-x-auto -m-5">
              <table className="data-table">
                <thead><tr><th>Sanction ID</th><th>Personnel</th><th>Limit</th><th>Status</th><th className="text-right">Action</th></tr></thead>
                <tbody>
                  {filteredSanctions.map((s: any) => (
                    <tr key={s.id} className="group hover:bg-muted/5">
                      <td className="font-mono text-xs font-bold text-primary">{s.id.slice(-8).toUpperCase()}</td>
                      <td>
                        <div className="font-bold">{s.employee?.name}</div>
                        <div className="text-[0.65rem] text-muted-foreground font-mono">{s.employee?.serviceNo}</div>
                      </td>
                      <td className="font-bold">{s.hours}h</td>
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
                  {filteredSanctions.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-20 text-muted-foreground italic">No sanctions recorded for this cadre.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </Tabs.Content>

        <Tabs.Content value="approved" className="animate-in fade-in duration-300">
           <Section title="Active Authorizations">
              <div className="grid grid-cols-2 gap-4">
                {approvedSanctions.map((s: any) => (
                  <div key={s.id} className="panel p-5 border-l-4 border-l-success flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success"><ScrollText className="w-6 h-6"/></div>
                      <div>
                        <div className="text-sm font-black text-primary uppercase italic">{s.employee?.name}</div>
                        <div className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest">{s.employee?.serviceNo} · {s.hours}h Limit</div>
                      </div>
                    </div>
                  </div>
                ))}
                {approvedSanctions.length === 0 && (
                  <div className="col-span-2 py-20 text-center opacity-50 italic">No approved authorizations.</div>
                )}
              </div>
           </Section>
        </Tabs.Content>

        <Tabs.Content value="roster" className="animate-in fade-in duration-300">
          <Section title="Final Disbursement Roster" actions={<div className="flex gap-2"><Btn variant="primary" className="h-9 shadow-sm" onClick={() => toast.info("PDF Generation enabled for production")}><Printer className="w-4 h-4 mr-2"/> Export Bill</Btn></div>}>
             <div className="overflow-x-auto -m-5">
              <table className="data-table">
                <thead><tr><th>Personnel</th><th>Sanctioned</th><th>Actual</th><th>Payable</th><th className="text-right">Net Amount</th></tr></thead>
                <tbody>
                  {rosterData.map((r: any) => (
                    <tr key={r.id}>
                      <td><div className="font-bold">{r.employee?.name}</div><div className="text-[0.6rem] opacity-50 uppercase">{r.employee?.serviceNo} · {r.employee?.department?.name}</div></td>
                      <td className="font-mono text-xs">{r.hours}h</td>
                      <td className="font-mono text-xs font-bold">{r.gross}h</td>
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

      {isAddingSanction && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-2xl rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
             <div className="bg-primary px-6 py-4 flex items-center justify-between"><h3 className="text-white font-heading font-black italic uppercase text-lg">New {typeLabel} Sanction</h3><button onClick={() => setIsAddingSanction(false)} className="text-white/70 hover:text-white"><X className="w-6 h-6"/></button></div>
             <div className="p-8 grid grid-cols-2 gap-6">
                <Field label="Service Number" required>
                  <Input 
                    value={formSvc} 
                    onChange={(e) => setFormSvc(e.target.value)} 
                    placeholder="Enter SVC No..." 
                  />
                </Field>
                <Field label="Personnel Name">
                  <Input 
                    value={personnel.find((p: any) => p.serviceNo === formSvc)?.name || 'Not found'} 
                    disabled 
                    className="bg-muted/50"
                  />
                </Field>
                <Field label="Max Hours" required>
                  <Input type="number" value={formHours} onChange={(e) => setFormHours(e.target.value)} placeholder="Limit for period" />
                </Field>
             </div>
             <div className="bg-muted/30 p-5 flex justify-end gap-3 border-t border-border">
                <Btn variant="outline" onClick={() => setIsAddingSanction(false)}>Cancel</Btn>
                <Btn variant="gold" onClick={handleSubmitSanction}>Submit Request</Btn>
             </div>
          </div>
        </div>
      )}

      {unlockModal && (
        <div className="fixed inset-0 z-[110] bg-primary/70 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-md rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
            <div className="bg-destructive px-6 py-4 flex justify-between items-center text-white font-bold uppercase italic"><div className="flex items-center gap-2"><ShieldX className="w-5 h-5"/><h3>Verify Access</h3></div><button onClick={() => setUnlockModal(null)}><X className="w-5 h-5"/></button></div>
            <div className="p-8 space-y-4">
              <Field label="Admin Username"><Input placeholder="Username" value={unlockUsername} onChange={(e) => setUnlockUsername(e.target.value)} /></Field>
              <Field label="System Password"><Input type="password" placeholder="••••••••" value={secretPassword} onChange={(e) => setSecretPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUnlockVerify()} /></Field>
            </div>
            <div className="bg-muted/30 p-5 flex justify-end gap-3 border-t border-border"><Btn variant="outline" onClick={() => setUnlockModal(null)}>Abort</Btn><Btn variant="danger" onClick={handleUnlockVerify}>Verify</Btn></div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

const CadreCard = ({ type, icon, label, rate, onClick }: { type: string; icon: React.ReactNode; label: string; rate: number; onClick: () => void }) => (
  <button onClick={onClick} className="group relative w-80 p-10 bg-card border border-border rounded-sm shadow-sm hover:shadow-elevated hover:border-primary transition-all duration-300 text-center flex flex-col items-center">
    <div className="w-20 h-20 rounded-full bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">{icon}</div>
    <h3 className="text-2xl font-heading font-black italic uppercase text-primary tracking-tight mb-2">{type}</h3>
    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mb-4">{label} Management</p>
    <div className="gold-rule mb-4" />
    <Badge variant="neutral">Fixed Rate: Rs. {rate}/hr</Badge>
  </button>
);

export default OvertimeSystem;
