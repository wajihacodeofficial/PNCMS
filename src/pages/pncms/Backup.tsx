import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Field, Input, Badge, StatCard } from "@/components/pncms/ui-kit";
import { Database, DownloadCloud, UploadCloud, HardDrive, ShieldCheck } from "lucide-react";

const Backup = () => (
  <AppShell>
    <PageHeader title="Backup & Restore" subtitle="Database Custody Operations · Authority L3 Required" />

    <div className="grid grid-cols-3 gap-5 mb-6">
      <StatCard label="Last Backup" value="02:00" sub="28-Apr-2026 · Auto" accent="success" icon={<ShieldCheck className="w-5 h-5" />} />
      <StatCard label="DB Size" value="248 MB" sub="412 records · 8.2k tx" accent="info" icon={<Database className="w-5 h-5" />} />
      <StatCard label="Storage Free" value="74%" sub="of 500 GB allocated" accent="primary" icon={<HardDrive className="w-5 h-5" />} />
    </div>

    <div className="grid grid-cols-2 gap-5">
      <Section title="Manual Backup">
        <div className="space-y-4">
          <Field label="Backup Destination Path"><Input defaultValue="D:\PNCMS\Backups\" /></Field>
          <Field label="Backup Tag / Label"><Input placeholder="e.g. PRE-PAYROLL-APR26" /></Field>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Include audit logs</label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Encrypt with AES-256</label>
            <label className="flex items-center gap-2"><input type="checkbox" /> Compress (zip)</label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Verify integrity</label>
          </div>
          <Btn variant="gold" className="w-full"><DownloadCloud className="w-4 h-4" /> Generate Backup Now</Btn>
        </div>
      </Section>

      <Section title="Restore Database">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-sm p-8 text-center bg-muted/30">
            <UploadCloud className="w-12 h-12 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold text-primary">Drop .pnbak file or browse</p>
            <p className="text-xs text-muted-foreground mt-1">Encrypted backup files only</p>
            <Btn variant="outline" className="mt-3">Browse Files</Btn>
          </div>
          <div className="bg-destructive/5 border border-destructive/30 rounded-sm p-3 text-xs text-destructive">
            <strong className="uppercase tracking-wider">⚠ Warning:</strong> Restore overwrites current database. Operation is irreversible and audited.
          </div>
          <Btn variant="danger" className="w-full">Initiate Restore</Btn>
        </div>
      </Section>
    </div>

    <Section title="Backup History" className="mt-5">
      <table className="data-table">
        <thead><tr><th>Tag</th><th>Date / Time</th><th>Size</th><th>Type</th><th>Operator</th><th>Status</th></tr></thead>
        <tbody>
          {[
            ["AUTO-NIGHTLY-2026-04-28","28-Apr-2026 · 02:00:14","248 MB","Auto","System","Verified"],
            ["PRE-PAYROLL-APR26","26-Apr-2026 · 14:22:08","247 MB","Manual","Admin Clerk","Verified"],
            ["AUTO-NIGHTLY-2026-04-27","27-Apr-2026 · 02:00:09","246 MB","Auto","System","Verified"],
            ["MONTH-CLOSE-MAR26","31-Mar-2026 · 18:44:51","241 MB","Manual","Admin Clerk","Archived"],
          ].map(r=>(
            <tr key={r[0]}><td className="font-mono text-xs font-semibold text-primary">{r[0]}</td><td>{r[1]}</td><td className="font-mono">{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td><Badge variant={r[5]==="Archived"?"neutral":"success"}>{r[5]}</Badge></td></tr>
          ))}
        </tbody>
      </table>
    </Section>
  </AppShell>
);
export default Backup;