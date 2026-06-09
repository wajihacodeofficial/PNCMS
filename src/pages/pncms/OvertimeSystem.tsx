import { useState, useMemo, useEffect } from 'react';

// ─── Helper ───────────────────────────────────────────────────────────────────
// Returns the number of calendar days in a given period string like "June 2026"
const getDaysInMonth = (period: string): number => {
  if (!period) return 30;
  const parts = period.trim().split(' ');
  if (parts.length === 2) {
    const d = new Date(`${parts[0]} 1, ${parts[1]}`);
    if (!isNaN(d.getTime())) {
      return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    }
  }
  return 30; // fallback
};

// Generate a rolling list of months (3 past → current → 3 future)
const generateMonthOptions = (): string[] => {
  const months: string[] = [];
  const now = new Date();
  for (let i = -3; i <= 5; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
  }
  return months;
};
import { useParams, useNavigate } from 'react-router-dom';
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
  ShieldX, Unlock, FileSpreadsheet, FileDown, Receipt, FileText
} from 'lucide-react';
import * as Tabs from "@radix-ui/react-tabs";
import { toast } from 'sonner';
import { exportToPDF, exportToExcel } from "@/lib/export";
import { useSanctions, usePersonnel, useCreateSanction, useUpdateSanction, useSettings, useCreateLog, useRanks } from '@/hooks/use-api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const OvertimeSystem = () => {
  const { data: allSanctions = [], isLoading: isSanctionsLoading } = useSanctions();
  const { data: personnel = [], isLoading: isPersonnelLoading } = usePersonnel();
  const { data: settings = {} } = useSettings();
  const { data: ranks = [] } = useRanks();
  const { mutate: createSanction } = useCreateSanction();
  const { mutate: updateSanction } = useUpdateSanction();
  const { mutate: createLog } = useCreateLog();

  const { cadreId } = useParams();
  const navigate = useNavigate();
  const selectedCadre = cadreId === 'industrial' ? 'Industrial' : 'Ministerial';
  const typeLabel = selectedCadre === 'Ministerial' ? 'Late-Sitting' : 'Overtime';

  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isAddingSanction, setIsAddingSanction] = useState(false);
  
  const [clerkName, setClerkName] = useState("Wajiha Zehra");
  const [formSvc, setFormSvc] = useState("");
  const [formHours, setFormHours] = useState("");
  const [formRank, setFormRank] = useState("");
  const [formDateInitiated, setFormDateInitiated] = useState("");
  const [formAction, setFormAction] = useState("");
  const [formPeriod, setFormPeriod] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

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

  useEffect(() => {
    // Reset active tab when cadre changes via sidebar
    setActiveTab(null);
  }, [selectedCadre]);

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
    // Auto‑fill rank from employee record
    const rankName = emp.rank?.name || '';
    setFormRank(rankName);

    const payload: any = {
      svc: formSvc,
      sanctionId: `SN-${Date.now()}`,
      hours: parseInt(formHours),
      limit: parseInt(formHours),
      rank: rankName,
      action: formAction || typeLabel,
      period: formPeriod,
      status: "Pending",
      date: new Date().toISOString().split('T')[0],
    };

    // Only include dateInitiated if the user actually set it
    if (formDateInitiated) {
      payload.dateInitiated = new Date(formDateInitiated).toISOString();
    }

    createSanction(payload, {
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
        setFormRank("");
        setFormDateInitiated("");
        setFormAction("");
        setFormPeriod(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
      },
      onError: (err: any) => {
        console.error("Create sanction error:", err);
        toast.error(err?.message || "Failed to submit sanction request");
      }
    });
  };

  const updateSanctionStatus = (id: string, status: string) => {
    const current = (allSanctions as any[]).find((s: any) => s.id === id);
    if (current && (current.status === 'Approved' || current.status === 'Rejected') && status !== current.status && status !== 'Paid') {
      setUnlockModal({ id, targetStatus: status });
      return;
    }
    
    let updatedTimelineStr = current?.timeline;
    if (status === 'Paid' && current) {
      const timeline = JSON.parse(current.timeline || '[]');
      updatedTimelineStr = JSON.stringify([
        ...timeline,
        { event: 'Payment Disbursed', time: new Date().toISOString(), user: localStorage.getItem("username") || 'Admin Clerk' }
      ]);
    }
    
    updateSanction({ id, status, ...(updatedTimelineStr ? { timeline: updatedTimelineStr } : {}) }, {
      onSuccess: () => {
        createLog({
          user: localStorage.getItem("username") || "Admin",
          action: "UPDATE",
          entity: `Sanction ${id} set to ${status}`,
          result: "Success"
        });
        toast.success(status === 'Paid' ? `Payment successfully recorded` : `Sanction marked as ${status}`);
      }
    });
  };

  const handleUnlockVerify = () => {
    const savedUser = settings.admin_username || "";
    const savedPass = settings.admin_password || "";
    if (unlockUsername === savedUser && secretPassword === savedPass) {
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

  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  // ─── Rate calculation ──────────────────────────────────────────────────────
  // Ministerial cadre (Late-Sitting) — ALL ranks, fixed daily rates:
  //   dailyRate = 225 (weekday) or 285 (holiday)
  //   amount    = totalDays × dailyRate
  //
  // Industrial cadre (non-MTD / rateType="basic"):
  //   hourlyRate = basicPay ÷ daysInMonth ÷ 8
  //   amount     = totalHours × hourlyRate
  //
  // Industrial MTD (rateType="fixed"):
  //   hourlyRate = weekdayRate (Rs. 80) or holidayRate (Rs. 100)
  //   amount     = totalHours × hourlyRate
  const calculateSanctionAmount = (s: any) => {
    // Day-type config (weekday vs holiday)
    let dayTypesConfig: Record<string, 'weekday' | 'holiday'> = {
      Monday: 'weekday',
      Tuesday: 'weekday',
      Wednesday: 'weekday',
      Thursday: 'weekday',
      Friday: 'weekday',
      Saturday: 'holiday',
      Sunday: 'holiday',
    };
    if (settings.day_types) {
      try { dayTypesConfig = JSON.parse(settings.day_types); } catch (e) { console.error(e); }
    }

    const targetDate = s.dateInitiated || s.date || new Date().toISOString();
    const dateObj = new Date(targetDate);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const isHoliday = dayTypesConfig[dayName] === 'holiday';

    const cadre = s.employee?.cardType || selectedCadre;

    // ── Ministerial: fixed daily rate ──────────────────────────────────────
    if (cadre === 'Ministerial') {
      const dailyRate = isHoliday ? 285 : 225;
      const totalDays = s.limit ?? s.hours ?? 0;
      const amount = Math.round(totalDays * dailyRate);
      return {
        rate: dailyRate,
        isHoliday,
        dayName,
        isMTD: false,
        usesBasicPay: false,
        isMinisterial: true,
        amount,
      };
    }

    // ── Industrial ─────────────────────────────────────────────────────────
    const matchedRank = (ranks as any[]).find(
      (r: any) => r.name === (s.rank || s.employee?.rank?.name)
    );
    const rateType = matchedRank?.rateType || 'basic';
    const usesBasicPay = rateType === 'basic';

    const totalHours = s.limit ?? s.hours ?? 0;

    let hourlyRate = 0;
    if (usesBasicPay) {
      // Industrial non-MTD: basicPay ÷ daysInMonth ÷ 8
      const basicPay = parseFloat(s.employee?.basicPay || '0');
      const daysInMonth = getDaysInMonth(s.period || formPeriod);
      hourlyRate = basicPay > 0 ? basicPay / daysInMonth / 8 : 0;
    } else {
      // Industrial MTD: fixed hourly rate (weekday=80, holiday=100)
      hourlyRate = isHoliday
        ? parseFloat(matchedRank?.holidayRate || '0')
        : parseFloat(matchedRank?.weekdayRate || '0');
    }

    const amount = Math.round(totalHours * hourlyRate);
    return {
      rate: Math.round(hourlyRate * 100) / 100,
      isHoliday,
      dayName,
      isMTD: !usesBasicPay,
      usesBasicPay,
      isMinisterial: false,
      amount,
    };
  };

  const handleExportStatus = (status: 'All' | 'Pending' | 'Approved' | 'Rejected') => {
    const listToExport = (allSanctions as any[]).filter(s => {
      if (s.employee?.cardType !== selectedCadre) return false;
      if (status !== 'All' && s.status !== status) return false;
      return true;
    });

    const isMin = selectedCadre === 'Ministerial';
    const qtyLabel = isMin ? 'Total Days' : 'Total Hours';
    const headers = [['Sanction ID', 'Personnel', 'Service No', 'Rank', qtyLabel, 'Period', 'Action', 'Status']];
    const rows = listToExport.map((s: any) => {
      const { rate, isHoliday, usesBasicPay, isMinisterial } = calculateSanctionAmount(s);
      const qtyStr = isMin ? `${s.limit ?? s.hours} days` : `${s.limit ?? s.hours} hrs`;
      const rateStr = isMinisterial
        ? `Rs. ${rate}/day (${isHoliday ? 'Holiday' : 'Weekday'} Fixed)`
        : `Rs. ${rate.toFixed(2)}/hr — ${usesBasicPay ? 'Basic Pay' : (isHoliday ? 'Holiday Fixed' : 'Weekday Fixed')}`;
      return [
        s.id.slice(-8).toUpperCase(),
        s.employee?.name || 'N/A',
        s.employee?.serviceNo || 'N/A',
        s.rank || 'N/A',
        qtyStr,
        s.period || 'N/A',
        s.action || 'N/A',
        `${s.status} (${rateStr})`,
      ];
    });

    const titleSuffix = status === 'All' ? 'Full Register' : `${status} Register`;
    exportToPDF(
      `${selectedCadre} · ${titleSuffix}`,
      headers,
      rows,
      `sanctions_${status.toLowerCase()}_${selectedCadre.toLowerCase()}_${new Date().toISOString().slice(0,10)}`,
      { period: new Date().toLocaleDateString('en-GB'), dept: `${selectedCadre} Cadre`, clerk: clerkName }
    );
  };

  const filteredSanctions = useMemo(() => {
    return (allSanctions as any[]).filter(s => {
      if (s.employee?.cardType !== selectedCadre) return false;
      if (statusFilter !== 'All' && s.status !== statusFilter) return false;
      return true;
    });
  }, [allSanctions, selectedCadre, statusFilter]);

  const approvedSanctions = useMemo(() => filteredSanctions.filter(s => s.status === 'Approved'), [filteredSanctions]);

  const [rosterFilter, setRosterFilter] = useState<'All' | 'Pending' | 'Paid'>('All');

  const paymentSanctions = useMemo(() => {
    return (allSanctions as any[]).filter(s => {
      if (s.employee?.cardType !== selectedCadre) return false;
      if (rosterFilter === 'All') {
        return s.status === 'Approved' || s.status === 'Paid';
      } else if (rosterFilter === 'Pending') {
        return s.status === 'Approved';
      } else {
        return s.status === 'Paid';
      }
    });
  }, [allSanctions, selectedCadre, rosterFilter]);

  const handleExportRosterStatus = (status: 'All' | 'Pending' | 'Paid') => {
    const listToExport = (allSanctions as any[]).filter(s => {
      if (s.employee?.cardType !== selectedCadre) return false;
      if (status === 'All') {
        return s.status === 'Approved' || s.status === 'Paid';
      } else if (status === 'Pending') {
        return s.status === 'Approved';
      } else {
        return s.status === 'Paid';
      }
    });

    const isMin = selectedCadre === 'Ministerial';
    const rows = listToExport.map((s: any) => {
      const qty = s.limit ?? s.hours;
      const { rate, isHoliday, amount, usesBasicPay, isMinisterial } = calculateSanctionAmount(s);
      const qtyStr = isMin ? `${qty} days` : `${qty} hrs`;
      const rateStr = isMinisterial
        ? `Rs. ${rate}/day (${isHoliday ? 'Holiday Fixed' : 'Weekday Fixed'})`
        : `Rs. ${rate.toFixed(2)}/hr (${usesBasicPay ? 'Basic÷Days÷8' : (isHoliday ? 'HD Fixed' : 'WD Fixed')})`;
      return [
        s.employee?.name || 'N/A',
        s.employee?.serviceNo || 'N/A',
        s.employee?.department?.name || 'N/A',
        s.period || 'N/A',
        qtyStr,
        rateStr,
        `Rs. ${amount.toLocaleString()}`,
        s.status === 'Paid' ? 'Paid' : 'Pending Payment',
      ];
    });

    const qtyColLabel = isMin ? 'Total Days' : 'Total Hours';
    const rateColLabel = isMin ? 'Daily Rate' : 'Hourly Rate';
    const headers = [['Personnel', 'Service No', 'Department', 'Period', qtyColLabel, rateColLabel, 'Net Amount', 'Status']];
    const titleSuffix = status === 'All' ? 'Full Roster' : `${status} Payments`;
    const totalAmount = listToExport.reduce((sum, s) => sum + calculateSanctionAmount(s).amount, 0);
    const basisNote = isMin
      ? 'Fixed Daily Rate (Rs. 225 WD / Rs. 285 HD)'
      : 'Basic Pay ÷ Days in Month ÷ 8 hrs (MTD: Fixed Hourly)';

    exportToPDF(
      `${selectedCadre} · ${titleSuffix}`,
      headers,
      rows,
      `payment_roster_${status.toLowerCase()}_${selectedCadre.toLowerCase()}_${new Date().toISOString().slice(0,10)}`,
      { period: new Date().toLocaleDateString('en-GB'), dept: `${selectedCadre} Cadre`, clerk: clerkName },
      [
        { label: 'Total Personnel', value: `${listToExport.length}` },
        { label: 'Total Disbursement', value: `Rs. ${totalAmount.toLocaleString()}` },
        { label: 'Calculation Basis', value: basisNote },
      ]
    );
  };

  // Roster Logic – use approved limit (allowance) sittings for payable
  const rosterData = useMemo(() => {
    return paymentSanctions.map((s: any) => {
      const limitHours = s.limit ?? s.hours;
      const payable = limitHours;
      const { rate, amount, isHoliday, dayName } = calculateSanctionAmount(s);
      return {
        ...s,
        payable,
        rate,
        amount,
        isHoliday,
        dayName,
      };
    });
  }, [paymentSanctions, settings, selectedCadre]);

  const totalDisbursement = rosterData.reduce((sum, item) => sum + item.amount, 0);

  if (!activeTab) {
    return (
      <AppShell>
        <PageHeader title={`${typeLabel} Control System`} subtitle={`${selectedCadre} Cadre · Authorization & Disbursement`} />
        {(isSanctionsLoading || isPersonnelLoading) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
             <p className="label-mil">Synchronizing Allowance Database...</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-10 py-20 flex-wrap">
            <ActionCard title="Sanction Request Initiation" icon={<Plus className="w-10 h-10" />} onClick={() => setActiveTab('sanctions')} />
            <ActionCard title="Payments" icon={<Receipt className="w-10 h-10" />} onClick={() => setActiveTab('roster')} />
          </div>
        )}
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => setActiveTab(null)} className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"><ArrowLeft className="w-5 h-5" /></button>
        <PageHeader title={`${activeTab === 'sanctions' ? 'Sanction Applications' : activeTab === 'approved' ? 'Approved Sanctions' : 'Payment Disbursals'}`} subtitle={`${selectedCadre} Cadre · Rates: Rs. ${selectedCadre === 'Ministerial' ? (settings.rate_ministerial_weekday || '225') : (settings.rate_industrial_weekday || '380')} (WD) / Rs. ${selectedCadre === 'Ministerial' ? (settings.rate_ministerial_holiday || '285') : (settings.rate_industrial_holiday || '460')} (HD)`} />
      </div>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.Content value="sanctions" className="animate-in fade-in duration-300">
          <Section title="Sanction Register" actions={
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Btn variant="outline" className="h-9">
                    <FileText className="w-4 h-4 mr-1" /> Export PDF
                  </Btn>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border shadow-elevated w-48">
                  <DropdownMenuItem onClick={() => handleExportStatus('All')} className="cursor-pointer font-bold">
                    Export All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportStatus('Pending')} className="cursor-pointer font-bold">
                    Export Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportStatus('Approved')} className="cursor-pointer font-bold">
                    Export Approved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportStatus('Rejected')} className="cursor-pointer font-bold">
                    Export Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Btn variant="gold" className="h-9" onClick={() => setIsAddingSanction(true)}><Plus className="w-4 h-4" /> New Request</Btn>
            </div>
          }>
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-sm border border-border w-fit mb-4">
              {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-[0.65rem] font-bold uppercase transition-all rounded-[1px] ${
                    statusFilter === status
                      ? 'bg-accent text-accent-foreground shadow-command scale-105 z-10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto -mx-5 -mb-5 mt-4">
              <table className="data-table">
                <thead><tr><th>Sanction ID</th><th>Personnel</th><th>Rank</th><th>{selectedCadre === 'Ministerial' ? 'Total Days' : 'Total Hours'}</th><th>Period</th><th>Action</th><th>Status</th><th className="text-right">Action</th></tr></thead>
                <tbody>
                  {filteredSanctions.map((s: any) => (
                    <tr key={s.id} className="group hover:bg-muted/5">
                      <td className="font-mono text-xs font-bold text-primary">{s.id.slice(-8).toUpperCase()}</td>
                      <td>
                        <div className="font-bold">{s.employee?.name}</div>
                        <div className="text-[0.65rem] text-muted-foreground font-mono">{s.employee?.serviceNo}</div>
                      </td>
                      <td>{s.rank || ''}</td>
                      <td className="font-bold font-mono">{s.limit ?? s.hours} {selectedCadre === 'Ministerial' ? 'days' : 'hrs'}</td>
                      <td className="text-xs text-muted-foreground">{s.period || ''}</td>
                      <td>{s.action || ''}</td>
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
                    <tr><td colSpan={7} className="text-center py-20 text-muted-foreground italic">No sanctions recorded for this cadre.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </Tabs.Content>

        <Tabs.Content value="approved" className="animate-in fade-in duration-300">
           <Section title="Active Authorizations" actions={
             <Btn variant="outline" className="h-9" onClick={() => {
                const isMin = selectedCadre === 'Ministerial';
                const headers = [['Personnel', 'Service No', 'Rank', isMin ? 'Total Days' : 'Total Hours', 'Action', 'Status']];
                const rows = approvedSanctions.map((s: any) => [
                  s.employee?.name || 'N/A',
                  s.employee?.serviceNo || 'N/A',
                  s.rank || 'N/A',
                  isMin ? `${s.limit ?? s.hours} days` : `${s.limit ?? s.hours} hrs`,
                  s.action || 'N/A',
                  s.status,
                ]);
                exportToPDF(
                  `${selectedCadre} · Approved Sanctions`,
                  headers,
                  rows,
                  `approved_sanctions_${selectedCadre.toLowerCase()}_${new Date().toISOString().slice(0,10)}`,
                  { period: new Date().toLocaleDateString('en-GB'), dept: `${selectedCadre} Cadre`, clerk: clerkName }
                );
              }}>
                <FileText className="w-4 h-4 mr-1" /> Export PDF
              </Btn>
            }>
              <div className="grid grid-cols-2 gap-4">
                {approvedSanctions.map((s: any) => (
                  <div key={s.id} className="panel p-5 border-l-4 border-l-success flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success"><ScrollText className="w-6 h-6"/></div>
                      <div>
                        <div className="text-sm font-black text-primary uppercase italic">{s.employee?.name}</div>
                        <div className="text-[0.6rem] font-bold text-muted-foreground uppercase tracking-widest">{s.employee?.serviceNo} · {s.limit ?? s.hours} {selectedCadre === 'Ministerial' ? 'days' : 'hrs'} · {s.period}</div>
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
          <Section title="Final Disbursement Roster" actions={
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Btn variant="outline" className="h-9">
                    <FileText className="w-4 h-4 mr-1" /> Export PDF
                  </Btn>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border shadow-elevated w-52">
                  <DropdownMenuItem onClick={() => handleExportRosterStatus('All')} className="cursor-pointer font-bold">
                    Export All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportRosterStatus('Pending')} className="cursor-pointer font-bold">
                    Export Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportRosterStatus('Paid')} className="cursor-pointer font-bold">
                    Export Paid
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Btn variant="primary" className="h-9 shadow-sm" onClick={() => {
                const isMin = selectedCadre === 'Ministerial';
                const qtyColLabel = isMin ? 'Total Days' : 'Total Hours';
                const rateColLabel = isMin ? 'Daily Rate' : 'Hourly Rate';
                const headers = [['Personnel', 'Service No', 'Department', 'Period', qtyColLabel, rateColLabel, 'Net Amount', 'Status']];
                const rows = rosterData.map((r: any) => {
                  const qtyStr = isMin ? `${r.payable} days` : `${r.payable} hrs`;
                  const rateStr = isMin
                    ? `Rs. ${r.rate}/day (${r.isHoliday ? 'Holiday Fixed' : 'Weekday Fixed'})`
                    : `Rs. ${r.rate.toFixed(2)}/hr (${r.usesBasicPay ? 'Basic÷Days÷8' : (r.isHoliday ? 'HD Fixed' : 'WD Fixed')})`;
                  return [
                    r.employee?.name || 'N/A',
                    r.employee?.serviceNo || 'N/A',
                    r.employee?.department?.name || 'N/A',
                    r.period || 'N/A',
                    qtyStr,
                    rateStr,
                    `Rs. ${r.amount.toLocaleString()}`,
                    r.status === 'Paid' ? 'Paid' : 'Pending Payment',
                  ];
                });
                const basisNote = isMin
                  ? 'Fixed Daily Rate (Rs. 225 WD / Rs. 285 HD)'
                  : 'Basic Pay ÷ Days ÷ 8 hrs (MTD: Fixed Hourly)';
                exportToPDF(
                  `${selectedCadre} · ${typeLabel} Payment Bill`,
                  headers,
                  rows,
                  `payment_bill_${selectedCadre.toLowerCase()}_${new Date().toISOString().slice(0,10)}`,
                  { period: new Date().toLocaleDateString('en-GB'), dept: `${selectedCadre} Cadre`, clerk: clerkName },
                  [
                    { label: 'Total Personnel', value: `${rosterData.length}` },
                    { label: 'Total Disbursement', value: `Rs. ${totalDisbursement.toLocaleString()}` },
                    { label: 'Calculation Basis', value: basisNote },
                  ]
                );
              }}><Printer className="w-4 h-4 mr-2"/> Export Bill</Btn>
            </div>
          }>
            <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-sm border border-border w-fit mb-4">
              {(['All', 'Pending', 'Paid'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setRosterFilter(status)}
                  className={`px-3 py-1.5 text-[0.65rem] font-bold uppercase transition-all rounded-[1px] ${
                    rosterFilter === status
                      ? 'bg-accent text-accent-foreground shadow-command scale-105 z-10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {status === 'Pending' ? 'Pending Payment' : status}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto -mx-5 -mb-5 mt-4">
                <table className="data-table">
                  <thead><tr><th>Personnel</th><th>Period</th><th>{selectedCadre === 'Ministerial' ? 'Total Days' : 'Total Hours'}</th><th>{selectedCadre === 'Ministerial' ? 'Daily Rate' : 'Hourly Rate'}</th><th>Status</th><th className="text-right">Net Amount</th><th className="text-right">Action</th></tr></thead>
                  <tbody>
                    {rosterData.map((r: any) => (
                      <tr key={r.id}>
                        <td><div className="font-bold">{r.employee?.name}</div><div className="text-[0.6rem] opacity-50 uppercase">{r.employee?.serviceNo} · {r.employee?.department?.name}</div></td>
                        <td className="text-xs text-muted-foreground">{r.period || '—'}</td>
                        <td className="font-mono font-black text-primary">{r.payable} {selectedCadre === 'Ministerial' ? 'days' : 'hrs'}</td>
                        <td className="text-xs font-mono">
                          {selectedCadre === 'Ministerial' ? (
                            <>
                              <div className="font-bold text-accent">Rs. {r.rate}/day</div>
                              <div className="text-[0.6rem] text-muted-foreground uppercase">{r.isHoliday ? 'Holiday Fixed' : 'Weekday Fixed'}</div>
                            </>
                          ) : (
                            <>
                              <div className="font-bold text-accent">Rs. {r.rate.toFixed(2)}/hr</div>
                              <div className="text-[0.6rem] text-muted-foreground uppercase">
                                {r.usesBasicPay ? 'Basic ÷ Days ÷ 8' : (r.isHoliday ? 'Holiday Fixed' : 'Weekday Fixed')}
                              </div>
                            </>
                          )}
                        </td>
                        <td><Badge variant={r.status === 'Paid' ? 'success' : 'warning' as any}>{r.status === 'Paid' ? 'Paid' : 'Pending Payment'}</Badge></td>
                        <td className="text-right font-mono font-bold text-accent">Rs. {r.amount.toLocaleString()}</td>
                        <td className="text-right">
                          {r.status !== 'Paid' && (
                          <button onClick={() => updateSanctionStatus(r.id, 'Paid')} className="p-1.5 rounded-sm bg-success/10 text-success hover:bg-success hover:text-white transition-all shadow-sm" title="Mark as Paid">
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                      </td>
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
          <div className="bg-card w-full max-w-3xl rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
             <div className="bg-primary px-6 py-4 flex items-center justify-between">
               <h3 className="text-white font-heading font-black italic uppercase text-lg">New {typeLabel} Sanction</h3>
               <button onClick={() => setIsAddingSanction(false)} className="text-white/70 hover:text-white"><X className="w-6 h-6"/></button>
             </div>
             <div className="p-8 grid grid-cols-3 gap-6">

               {/* Row 1 — Identity */}
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
               <Field label="Rank">
                 <Input value={personnel.find((p: any) => p.serviceNo === formSvc)?.rank?.name || 'Not found'} disabled className="bg-muted/50" />
               </Field>

               {/* Row 2 — Pay & rate preview */}
               {selectedCadre === 'Industrial' && (
                 <Field label="Basic Pay (from record)">
                   <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-muted-foreground uppercase">Rs.</span>
                     <Input
                       value={(() => {
                         const emp = (personnel as any[]).find((p: any) => p.serviceNo === formSvc);
                         return emp?.basicPay ? Number(emp.basicPay).toLocaleString() : '';
                       })()}
                       disabled
                       className="bg-muted/50 pl-10 font-mono font-bold text-accent"
                       placeholder="Auto-filled"
                     />
                   </div>
                 </Field>
               )}
               <Field label="Sanction Period" required>
                 <Select value={formPeriod} onChange={(e) => setFormPeriod(e.target.value)}>
                   {generateMonthOptions().map(m => <option key={m} value={m}>{m}</option>)}
                 </Select>
               </Field>
               <Field label={selectedCadre === 'Ministerial' ? 'Daily Rate (Fixed)' : 'Computed Hourly Rate'}>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-muted-foreground uppercase">Rs.</span>
                   <Input
                     value={(() => {
                       if (selectedCadre === 'Ministerial') {
                         return '225/day (WD) · 285/day (HD) — Fixed';
                       }
                       const emp = (personnel as any[]).find((p: any) => p.serviceNo === formSvc);
                       const rank = (ranks as any[]).find((r: any) => r.name === emp?.rank?.name);
                       if (rank?.rateType === 'fixed') return `${rank.weekdayRate}/hr (WD) · ${rank.holidayRate}/hr (HD) — MTD Fixed`;
                       const bp = parseFloat(emp?.basicPay || '0');
                       const days = getDaysInMonth(formPeriod);
                       if (!bp) return '';
                       return (bp / days / 8).toFixed(2);
                     })()}
                     disabled
                     className="bg-muted/50 pl-10 font-mono font-bold text-primary"
                     placeholder={selectedCadre === 'Ministerial' ? 'Fixed rate' : 'Select employee & period'}
                   />
                 </div>
               </Field>

               {/* Row 3 — Qty & date */}
               <Field label="Date Initiated" required>
                 <Input type="date" value={formDateInitiated} onChange={(e) => setFormDateInitiated(e.target.value)} />
               </Field>
               <Field label={selectedCadre === 'Ministerial' ? 'Total Days (Late-Sitting)' : 'Total Hours (Overtime)'} required>
                 <Input
                   type="number"
                   value={formHours}
                   onChange={(e) => setFormHours(e.target.value)}
                   placeholder={selectedCadre === 'Ministerial' ? 'Enter total late-sitting days' : 'Enter total overtime hours'}
                 />
               </Field>
               <Field label="Estimated Amount">
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-muted-foreground uppercase">Rs.</span>
                   <Input
                     value={(() => {
                       const qty = parseFloat(formHours) || 0;
                       if (!qty) return '';
                       // Ministerial: fixed daily rate
                       if (selectedCadre === 'Ministerial') {
                         // Use weekday rate as preview (actual depends on day type)
                         return Math.round(qty * 225).toLocaleString() + ' (WD est.)';
                       }
                       // Industrial
                       const emp = (personnel as any[]).find((p: any) => p.serviceNo === formSvc);
                       const rank = (ranks as any[]).find((r: any) => r.name === emp?.rank?.name);
                       if (rank?.rateType === 'fixed') {
                         const r = parseFloat(rank.weekdayRate || '0');
                         return Math.round(qty * r).toLocaleString();
                       }
                       const bp = parseFloat(emp?.basicPay || '0');
                       const days = getDaysInMonth(formPeriod);
                       if (!bp) return '';
                       return Math.round(qty * (bp / days / 8)).toLocaleString();
                     })()}
                     disabled
                     className="bg-muted/50 pl-10 font-mono font-bold text-accent"
                     placeholder="Auto-calculated"
                   />
                 </div>
               </Field>

               {/* Row 4 — Action */}
               <Field label="Action / Purpose (Optional)" className="col-span-3">
                 <Input value={formAction} onChange={(e) => setFormAction(e.target.value)} placeholder="Describe work to be done (optional)" />
               </Field>
             </div>

             {/* Formula note */}
             <div className="mx-8 mb-4 p-3 bg-accent/5 border border-accent/20 rounded-sm text-[0.65rem] text-muted-foreground">
               {selectedCadre === 'Ministerial' ? (
                 <>
                   <span className="font-bold text-accent uppercase tracking-wide">Rate Formula (Ministerial Late-Sitting): </span>
                   Fixed Daily Rate × Total Days = Net Amount &nbsp;|&nbsp;
                   <span className="font-bold text-primary">Weekday</span>: Rs. 225/day &nbsp;·&nbsp;
                   <span className="font-bold text-primary">Holiday</span>: Rs. 285/day
                 </>
               ) : (
                 <>
                   <span className="font-bold text-accent uppercase tracking-wide">Rate Formula (Industrial): </span>
                   Basic Pay ÷ Days in Month ÷ 8 hrs × Total Hours = Net Amount &nbsp;|&nbsp;
                   <span className="font-bold text-primary">MTD (Fixed)</span>: Rs. 80/hr (Weekday) · Rs. 100/hr (Holiday)
                 </>
               )}
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

const ActionCard = ({ title, icon, onClick }: { title: string; icon: React.ReactNode; onClick: () => void }) => (
  <button onClick={onClick} className="group relative w-80 p-10 bg-card border border-border rounded-sm shadow-sm hover:shadow-elevated hover:border-primary transition-all duration-300 text-center flex flex-col items-center">
    <div className="w-20 h-20 rounded-full bg-primary/5 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">{icon}</div>
    <h3 className="text-xl font-heading font-black italic uppercase text-primary tracking-tight mb-4">{title}</h3>
    <div className="gold-rule mt-auto" />
  </button>
);

export default OvertimeSystem;
