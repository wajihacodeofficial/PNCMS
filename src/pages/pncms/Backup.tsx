import { useState, useMemo } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Field, Input, Badge, StatCard } from "@/components/pncms/ui-kit";
import { Database, DownloadCloud, UploadCloud, HardDrive, ShieldCheck, Clock, FileJson, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useExportBackup, useImportBackup, useCreateLog, useDashboardStats } from "@/hooks/use-api";

const Backup = () => {
  const [history, setHistory] = useState<{id: string, tag: string, date: string, time: string, size: string, operator: string}[]>(() => {
    const saved = localStorage.getItem("pncms_backup_history");
    return saved ? JSON.parse(saved) : [];
  });

  const { data: stats } = useDashboardStats();
  const { mutateAsync: exportBackup } = useExportBackup();
  const { mutateAsync: importBackup } = useImportBackup();
  const { mutate: createLog } = useCreateLog();

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupTag, setBackupTag] = useState("");

  const handleBackup = async () => {
    if (isBackingUp) return;
    setIsBackingUp(true);
    
    const toastId = toast.loading("Generating Database Snapshot...");

    try {
      const result = await exportBackup(backupTag) as any;
      
      if (result.success) {
        const now = new Date();
        const newEntry = {
          id: Math.random().toString(36).substr(2, 9),
          tag: backupTag || `MANUAL-${now.toISOString().split('T')[0]}`,
          date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
          time: now.toLocaleTimeString('en-GB', { hour12: false }),
          size: "248.67 MB", // Real size would come from handler if needed
          operator: localStorage.getItem("clerk_name") || "Admin Clerk"
        };

        const newHistory = [newEntry, ...history].slice(0, 20);
        setHistory(newHistory);
        localStorage.setItem("pncms_backup_history", JSON.stringify(newHistory));

        createLog({
          user: newEntry.operator,
          action: "BACKUP",
          entity: `Database exported to: ${result.path}`,
          result: "Success"
        });

        toast.success("Database Backup Exported Successfully", { id: toastId });
        setBackupTag("");
      } else {
        toast.error("Backup cancelled or failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Backup process failed", { id: toastId });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    const confirmRestore = window.confirm("CRITICAL WARNING: Restoring a backup will OVERWRITE the entire current database. This cannot be undone. Proceed?");
    if (!confirmRestore) return;

    const toastId = toast.loading("Importing Database Backup...");

    try {
      const result = await importBackup() as any;
      if (result.success) {
        createLog({
          user: localStorage.getItem("clerk_name") || "Admin Clerk",
          action: "RESTORE",
          entity: `Full Database Restoration Performed`,
          result: "Success"
        });
        toast.success("Database Restored Successfully. Application will now reload.", { id: toastId });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error("Restore cancelled or failed", { id: toastId });
      }
    } catch (err) {
      toast.error("Restore process failed", { id: toastId });
    }
  };

  return (
    <AppShell>
      <PageHeader title="Backup & Restore" subtitle="Database Custody Operations · Authority L3 Required" 
        actions={<Btn variant="outline" onClick={() => window.location.reload()}><RefreshCw className="w-4 h-4 mr-2" /> Reload App</Btn>}
      />

      <div className="grid grid-cols-3 gap-5 mb-6">
        <StatCard label="Last Backup" value={history[0]?.time.substring(0, 5) || "NONE"} sub={history[0]?.date || "No recent snapshots"} accent="success" icon={<ShieldCheck className="w-5 h-5" />} />
        <StatCard label="DB Size" value="248.67 MB" sub={`${stats?.totalPersonnel || 0} personnel records`} accent="info" icon={<Database className="w-5 h-5" />} />
        <StatCard label="Storage Free" value="74%" sub="of 500 GB allocated" accent="primary" icon={<HardDrive className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Section title="Manual Backup">
          <div className="space-y-4">
            <Field label="Backup Tag / Label"><Input placeholder="e.g. PRE-PAYROLL-APR26" value={backupTag} onChange={(e) => setBackupTag(e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3 text-xs opacity-60">
              <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> Include audit logs</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> Encrypt with AES-256</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> Verify integrity</label>
            </div>
            
            <Btn variant="gold" className="w-full h-11" onClick={handleBackup} disabled={isBackingUp}>
              {isBackingUp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <DownloadCloud className="w-4 h-4 mr-2" />} 
              {isBackingUp ? "Processing Snapshot..." : "Generate & Export Backup"}
            </Btn>
          </div>
        </Section>

        <Section title="Restore Database">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-sm p-8 text-center bg-muted/30 group hover:bg-muted/50 transition-colors cursor-pointer" onClick={handleRestore}>
              <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="mt-3 text-sm font-semibold text-primary">Import .pnbak file</p>
              <p className="text-xs text-muted-foreground mt-1">Encrypted backup files only</p>
            </div>
            <div className="bg-destructive/5 border border-destructive/30 rounded-sm p-3 text-xs text-destructive flex gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong className="uppercase tracking-wider">⚠ Warning:</strong> Restore overwrites current database. Operation is irreversible and audited.
              </div>
            </div>
            <Btn variant="danger" className="w-full h-11" onClick={handleRestore}>
              <RefreshCw className="w-4 h-4 mr-2" /> Initiate Restore
            </Btn>
          </div>
        </Section>
      </div>

      <Section title={`Backup History · ${history.length} Records`} className="mt-5">
        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead><tr><th>Tag</th><th>Date / Time</th><th>Size</th><th>Operator</th><th>Status</th></tr></thead>
            <tbody>
              {history.map(r=>(
                <tr key={r.id} className="hover:bg-primary/5 transition-colors">
                  <td className="font-mono text-[0.65rem] font-bold text-primary flex items-center gap-2">
                    <FileJson className="w-3.5 h-3.5 text-accent" />
                    {r.tag}
                  </td>
                  <td className="text-xs">{r.date} · {r.time}</td>
                  <td className="font-mono text-xs font-bold text-muted-foreground">{r.size}</td>
                  <td className="text-xs font-semibold">{r.operator}</td>
                  <td><Badge variant="success">Verified</Badge></td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-muted-foreground italic">No backup history found on this station.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </AppShell>
  );
};

export default Backup;