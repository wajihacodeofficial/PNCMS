import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { SpecialLeaveModal } from "@/components/pncms/SpecialLeaveModal";
import { UnlockMusterModal } from "@/components/pncms/UnlockMusterModal";
import { StatCard, Section, Btn, Badge, Input, Field } from "@/components/pncms/ui-kit";
import { Calendar, Clock, UserPlus, ListChecks, Flag, ShieldCheck, ClipboardList, PieChart, Users, Search, RotateCcw, FileDown, AlertCircle, Trash2, ShieldX, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useRef } from "react";
import { format, isWithinInterval, parseISO, eachDayOfInterval, isWeekend, startOfMonth, endOfMonth, differenceInCalendarDays } from "date-fns";
import { exportToPDF } from "@/lib/export";
import { toast } from "sonner";
import { useLeaves, useBatchUpdateAttendance, useDeleteLeave, useSettings, useCreateLog } from "@/hooks/use-api";

const LeaveDashboard = () => {
  const navigate = useNavigate();
  const { data: leaves = [], isLoading } = useLeaves();
  const [serviceSearch, setServiceSearch] = useState("");
  const [specialModalOpen, setSpecialModalOpen] = useState(false);
  const batchUpdate = useBatchUpdateAttendance();
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{date:string, updates:any[]} | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const { data: settings = {} } = useSettings();
  const { mutate: deleteLeave } = useDeleteLeave();
  const { mutate: createLog } = useCreateLog();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leaveIdToDelete, setLeaveIdToDelete] = useState("");
  const [deleteUsername, setDeleteUsername] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const today = new Date();

  const handleDeleteVerify = () => {
    const savedUser = settings.admin_username || "PNCMS";
    const savedPass = settings.admin_password || "14081947";
    if (deleteUsername === savedUser && deletePassword === savedPass) {
      deleteLeave(
        { id: leaveIdToDelete, username: deleteUsername, password: deletePassword },
        {
          onSuccess: () => {
            createLog({
              user: savedUser,
              action: "DELETE",
              entity: `Leave Record ID: ${leaveIdToDelete}`,
              result: "Success"
            });
            toast.success("Leave record deleted successfully");
            setDeleteConfirmOpen(false);
            setLeaveIdToDelete("");
            setDeleteUsername("");
            setDeletePassword("");
          },
          onError: (err: any) => {
            toast.error(err?.message || "Failed to delete leave record");
          }
        }
      );
    } else {
      toast.error("Invalid Admin Username or Password");
    }
  };

  // Auto-mark attendance for newly approved leaves
  useEffect(() => {
    if (isLoading) return;
    const processed = new Set<string>();
    leaves.forEach((l: any) => {
      if (l.status !== 'Approved' || processed.has(l.id)) return;
      const start = parseISO(l.startDate);
      const end = parseISO(l.endDate);
      const dates = eachDayOfInterval({ start, end });
      const updates = dates.map(d => ({
        serviceNo: l.employee?.serviceNo,
        date: format(d, 'yyyy-MM-dd'),
        status: 'Present',
        type: 'Leave',
        leaveId: l.id,
      }));
      batchUpdate.mutate(
        { date: l.startDate, updates },
        {
          onError: (err: any) => {
            if (err?.message?.includes("locked")) {
              return;
            } else {
              toast.error(err.message || "Failed to mark attendance");
            }
          }
        }
      );
      processed.add(l.id);
    });
  }, [leaves, isLoading]);

  const currentOnLeave = useMemo(() => {
    return (leaves as any[])
      .filter(l => l.status === 'Approved')
      .filter(l => {
        // date filter if set
        if (dateFilter && !isWithinInterval(parseISO(dateFilter), { start: parseISO(l.startDate), end: parseISO(l.endDate) })) {
          return false;
        }
        // service number filter if set
        if (serviceSearch && !(l.employee?.serviceNo?.includes(serviceSearch))) {
          return false;
        }
        return true;
      })
      .map(l => {
        const start = parseISO(l.startDate);
        const end = parseISO(l.endDate);
        const weekend = eachDayOfInterval({ start, end }).some(isWeekend);
        const totalDays = l.days;
        // Calculate remaining days from today (inclusive) if today is within or before the leave period
        const today = new Date();
        const daysLeft = today > end ? 0 : differenceInCalendarDays(end, today) + 1;
        return {
          id: l.id,
          svc: l.employee?.serviceNo || 'N/A',
          name: l.employee?.name || 'Unknown',
          type: l.type.toUpperCase(),
          from: format(start, 'dd-MMM-yy'),
          to: format(end, 'dd-MMM-yy'),
          days: totalDays,
          daysLeft,
          start,
          end,
          isWeekend: weekend,
        };
      })
      .sort((a, b) => a.svc.localeCompare(b.svc));
  }, [leaves, dateFilter, serviceSearch]);

  const historyResults = useMemo(() => {
    if (!historySearch) return [];
    return (leaves as any[])
      .filter(l => l.employee?.serviceNo === historySearch || l.employee?.serviceNo?.includes(historySearch))
      .map(l => ({
        type: l.type,
        from: format(parseISO(l.startDate), 'dd-MMM-yy'),
        to: format(parseISO(l.endDate), 'dd-MMM-yy'),
        days: l.days,
        status: l.status,
        timestamp: l.createdAt
      }))
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [historySearch, leaves]);

  const pendingCount = (leaves as any[]).filter(l => l.status === 'Submitted' || l.status === 'Pending').length;

  const handleExportCurrent = () => {
    // Export the monthly leave record (active on‑leave) for the current month
    const headers = [["Svc No", "Employee", "Type", "From", "To", "Days"]];
    const rows = currentOnLeave.map(p => [p.svc, p.name, p.type, p.from, p.to, p.days]);
    const start = format(startOfMonth(today), "dd MMM yyyy");
    const end = format(endOfMonth(today), "dd MMM yyyy");
    const filename = `monthly_leave_${format(today, "yyyy_MM")}`;
    exportToPDF(
      "Monthly Leave Record",
      headers,
      rows,
      filename,
      { period: `${start} – ${end}`, dept: "All Departments", clerk: "Admin Staff" }
    );
    toast.success("Monthly Leave Record Exported");
  }

  const handleExportHistory = () => {
    if (historyResults.length === 0) return;
    const headers = [["Type", "From", "To", "Days", "Status"]];
    const rows = historyResults.map(l => [l.type.toUpperCase(), l.from, l.to, l.days, l.status]);
    exportToPDF(`Leave History - SVC ${historySearch}`, headers, rows, `leave_history_${historySearch}`);
    toast.success("Personnel Leave History Exported");
  };

  return (
    <AppShell>
      <SpecialLeaveModal open={specialModalOpen} onClose={() => setSpecialModalOpen(false)} />
      <UnlockMusterModal
        open={unlockModalOpen}
        date={pendingUpdate?.date || ''}
        onClose={() => setUnlockModalOpen(false)}
        onUnlocked={() => {
          if (pendingUpdate) {
            batchUpdate.mutate({ date: pendingUpdate.date, updates: pendingUpdate.updates });
            setPendingUpdate(null);
          }
        }}
      />
      <PageHeader
        title="Leave Command Centre"
        subtitle="Civilian Leave Operations · Monthly Overview"
        actions={
          <div className="flex gap-3">
            <Btn variant="outline" onClick={handleExportCurrent}><FileDown className="w-4 h-4" /> Export Active</Btn>

            <Btn variant="gold" onClick={() => navigate("/leave/new")}><UserPlus className="w-4 h-4" /> New Leave Record</Btn>
            <Btn variant="outline" onClick={() => setSpecialModalOpen(true)}><AlertCircle className="w-4 h-4" /> Add Special Leave</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <Section title="Active On-Leave">
            {/* Date filter for on‑leave roster */}
            <div className="flex items-center gap-2 mb-2">
              <Input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="max-w-[180px]"
              />
              <Btn variant="outline" onClick={() => setDateFilter("")}>Clear</Btn>
              <Input
                placeholder="Service No"
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                className="max-w-[180px] ml-2"
              />
              <Btn variant="outline" onClick={() => setServiceSearch("")}>Clear</Btn>
            </div>
            <div className="overflow-hidden rounded-sm border border-border">
              <table className="w-full text-[0.75rem]">
                  <thead className="bg-muted/50 text-left border-b border-border">
                    <tr>
                      <th className="px-3 py-3 font-bold uppercase tracking-wider">Service Number</th>
                      <th className="px-3 py-3 font-bold uppercase tracking-wider">Name</th>
                      <th className="px-3 py-3 font-bold uppercase tracking-wider">Leave Type</th>
                      <th className="px-3 py-3 font-bold uppercase tracking-wider">From</th>
                      <th className="px-3 py-3 font-bold uppercase tracking-wider">To</th>
                      <th className="px-3 py-3 font-bold uppercase tracking-wider text-right">Days Left</th>
                      <th className="px-3 py-3 font-bold uppercase tracking-wider text-right">Total Days</th>
                      <th className="px-3 py-3 font-bold uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {currentOnLeave.length > 0 ? (
                      currentOnLeave.map((p, i) => (
                        <tr key={i} className={`hover:bg-muted/30 transition-colors ${p.isWeekend ? 'bg-gray-100' : ''}`}>
                          <td className="px-3 py-3 font-mono font-bold text-accent">{p.svc}</td>
                          <td className="px-3 py-3">{p.name}</td>
                          <td className="px-3 py-3">{p.type}</td>
                          <td className="px-3 py-3">{p.from}</td>
                          <td className="px-3 py-3">{p.to}</td>
                          <td className="px-3 py-3 text-right font-bold text-primary">{p.daysLeft}</td>
                          <td className="px-3 py-3 text-right font-bold text-primary">{p.days}</td>
                          <td className="px-3 py-3 text-right">
                            <button
                              onClick={() => {
                                setLeaveIdToDelete(p.id);
                                setDeleteConfirmOpen(true);
                              }}
                              className="p-1 rounded bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                              title="Delete Leave Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground italic">None active.</td>
                      </tr>
                    )}
                  </tbody>
              </table>
            </div>
          </Section>
        </div>
      </div>

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[110] bg-primary/70 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-md rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
            <div className="bg-destructive px-6 py-4 flex justify-between items-center text-white font-bold uppercase italic"><div className="flex items-center gap-2"><ShieldX className="w-5 h-5"/><h3>Verify Access</h3></div><button onClick={() => setDeleteConfirmOpen(false)}><X className="w-5 h-5"/></button></div>
            <div className="p-8 space-y-4">
              <p className="text-xs text-muted-foreground">Admin credentials required to delete this leave record.</p>
              <Field label="Admin Username"><Input placeholder="Username" value={deleteUsername} onChange={(e) => setDeleteUsername(e.target.value)} /></Field>
              <Field label="System Password"><Input type="password" placeholder="••••••••" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleDeleteVerify()} /></Field>
            </div>
            <div className="bg-muted/30 p-5 flex justify-end gap-3 border-t border-border"><Btn variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Abort</Btn><Btn variant="danger" onClick={handleDeleteVerify}>Delete Record</Btn></div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default LeaveDashboard;
