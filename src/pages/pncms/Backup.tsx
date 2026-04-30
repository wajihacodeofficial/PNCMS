import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Field, Input, Badge, StatCard } from "@/components/pncms/ui-kit";
import { Database, DownloadCloud, UploadCloud, HardDrive, ShieldCheck, Clock, FileText, Search, Filter, Trash2, CheckCircle2, AlertTriangle, RefreshCw, Loader2, FileJson } from "lucide-react";
import { toast } from "sonner";
import { logAction } from "@/lib/audit";

const INITIAL_HISTORY = [
  { id: "1", tag: "AUTO-NIGHTLY-2026-04-28", date: "28-Apr-2026", time: "02:00:14", size: "248 MB", type: "Auto", operator: "System", status: "Verified" },
  { id: "2", tag: "PRE-PAYROLL-APR26", date: "26-Apr-2026", time: "14:22:08", size: "247 MB", type: "Manual", operator: "Admin Clerk", status: "Verified" },
  { id: "3", tag: "AUTO-NIGHTLY-2026-04-27", date: "27-Apr-2026", time: "02:00:09", size: "246 MB", type: "Auto", operator: "System", status: "Verified" },
  { id: "4", tag: "MONTH-CLOSE-MAR26", date: "31-Mar-2026", time: "18:44:51", size: "241 MB", type: "Manual", operator: "Admin Clerk", status: "Archived" },
];

const Backup = () => {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("pncms_backup_history");
    return saved ? JSON.parse(saved) : INITIAL_HISTORY;
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupTag, setBackupTag] = useState("");
  const [destPath, setDestPath] = useState("D:\\PNCMS\\Backups\\");

  useEffect(() => {
    localStorage.setItem("pncms_backup_history", JSON.stringify(history));
  }, [history]);

  const handleBackup = () => {
    if (isBackingUp) return;
    setIsBackingUp(true);
    setBackupProgress(0);
    
    toast.loading("Initializing Database Dump...", { id: "backup-process" });

    // Simulate progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    setTimeout(() => {
      const now = new Date();
      const newBackup = {
        id: Math.random().toString(36).substr(2, 9),
        tag: backupTag || `MANUAL-BACKUP-${now.toISOString().split('T')[0]}`,
        date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
        time: now.toLocaleTimeString('en-GB', { hour12: false }),
        size: `${(248 + Math.random()).toFixed(2)} MB`,
        type: "Manual",
        operator: localStorage.getItem("clerk_name") || "Admin Clerk",
        status: "Verified"
      };

      setHistory([newBackup, ...history]);
      setIsBackingUp(false);
      setBackupTag("");
      logAction("BACKUP", `Database Snapshot: ${newBackup.tag}`, "Success");
      toast.success("Database Backup Generated Successfully", { id: "backup-process" });
    }, 3500);
  };

  const handleRestore = () => {
    toast.error("Security Restriction: Database restore requires hardware key (HASP) verification.");
  };

  return (
    <AppShell>
      <PageHeader title="Backup & Restore" subtitle="Database Custody Operations · Authority L3 Required" 
        actions={<Btn variant="outline" onClick={() => window.location.reload()}><RefreshCw className="w-4 h-4 mr-2" /> Refresh State</Btn>}
      />

      <div className="grid grid-cols-3 gap-5 mb-6">
        <StatCard label="Last Backup" value={history[0]?.time.substring(0, 5) || "00:00"} sub={`${history[0]?.date} · ${history[0]?.type}`} accent="success" icon={<ShieldCheck className="w-5 h-5" />} />
        <StatCard label="DB Size" value={history[0]?.size || "0 MB"} sub={`${history.length} snapshots · 12.4k tx`} accent="info" icon={<Database className="w-5 h-5" />} />
        <StatCard label="Storage Free" value="74%" sub="of 500 GB allocated" accent="primary" icon={<HardDrive className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Section title="Manual Backup">
          <div className="space-y-4">
            <Field label="Backup Destination Path"><Input value={destPath} onChange={(e) => setDestPath(e.target.value)} /></Field>
            <Field label="Backup Tag / Label"><Input placeholder="e.g. PRE-PAYROLL-APR26" value={backupTag} onChange={(e) => setBackupTag(e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Include audit logs</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Encrypt with AES-256</label>
              <label className="flex items-center gap-2"><input type="checkbox" /> Compress (zip)</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Verify integrity</label>
            </div>
            
            {isBackingUp && (
              <div className="space-y-2">
                <div className="flex justify-between text-[0.6rem] font-bold text-accent uppercase tracking-widest">
                  <span>Compressing DB Blobs...</span>
                  <span>{backupProgress}%</span>
                </div>
                <div className="h-1 w-full bg-accent/10 rounded-full overflow-hidden">
                  <div className="h-full bg-accent transition-all duration-300" style={{ width: `${backupProgress}%` }} />
                </div>
              </div>
            )}

            <Btn variant="gold" className="w-full h-11" onClick={handleBackup} disabled={isBackingUp}>
              {isBackingUp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <DownloadCloud className="w-4 h-4 mr-2" />} 
              {isBackingUp ? "Processing Snapshot..." : "Generate Backup Now"}
            </Btn>
          </div>
        </Section>

        <Section title="Restore Database">
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-sm p-8 text-center bg-muted/30 group hover:bg-muted/50 transition-colors cursor-pointer">
              <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
              <p className="mt-3 text-sm font-semibold text-primary">Drop .pnbak file or browse</p>
              <p className="text-xs text-muted-foreground mt-1">Encrypted backup files only</p>
              <Btn variant="outline" className="mt-3 h-8 text-xs">Browse Files</Btn>
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
            <thead><tr><th>Tag</th><th>Date / Time</th><th>Size</th><th>Type</th><th>Operator</th><th>Status</th></tr></thead>
            <tbody>
              {history.map(r=>(
                <tr key={r.id} className="hover:bg-primary/5 transition-colors">
                  <td className="font-mono text-[0.65rem] font-bold text-primary flex items-center gap-2">
                    <FileJson className="w-3.5 h-3.5 text-accent" />
                    {r.tag}
                  </td>
                  <td className="text-xs">{r.date} · {r.time}</td>
                  <td className="font-mono text-xs font-bold text-muted-foreground">{r.size}</td>
                  <td><Badge variant={r.type === "Auto" ? "info" : "warning"}>{r.type}</Badge></td>
                  <td className="text-xs font-semibold">{r.operator}</td>
                  <td><Badge variant={r.status==="Archived"?"neutral":"success"}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </AppShell>
  );
};

export default Backup;