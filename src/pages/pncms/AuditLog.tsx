import { useState, useMemo, useEffect } from "react";
import { exportToPDF } from "@/lib/export";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Badge, Input } from "@/components/pncms/ui-kit";
import { Download, Filter, Search, ShieldAlert, Clock, Terminal, User, FileText, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const AuditLog = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("ALL");

  useEffect(() => {
    const saved = localStorage.getItem("pncms_audit_logs");
    if (saved) {
      setLogs(JSON.parse(saved));
    } else {
      // If empty, we can show a placeholder or some initial seed data
      // but user asked for "no dummy data", so we start empty or with real system initialization logs
      const initLogs = [
        { id: "init", time: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + " " + new Date().toLocaleTimeString('en-GB', { hour12: false }), user: "System", action: "INITIALIZE", entity: "Audit Register", ip: "127.0.0.1", result: "Success" }
      ];
      setLogs(initLogs);
      localStorage.setItem("pncms_audit_logs", JSON.stringify(initLogs));
    }
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(l => {
      const matchesSearch = 
        l.user.toLowerCase().includes(search.toLowerCase()) || 
        l.entity.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase());
      
      const matchesFilter = filterAction === "ALL" || l.action === filterAction;
      
      return matchesSearch && matchesFilter;
    });
  }, [search, filterAction, logs]);

  const handleExport = () => {
    const headers = [["Time", "User", "Action", "Affected Record", "IP/Terminal", "Result"]];
    const rows = filteredLogs.map(l => [l.time, l.user, l.action, l.entity, l.ip, l.result]);
    exportToPDF("System Audit Trail", headers, rows, "system_audit_log", 
      { period: "Restricted Access", dept: "Information Security", clerk: "Wajiha Zehra · DIL-ADM-04" }
    );
    toast.success("Audit Log PDF Generated");
  };

  return (
    <AppShell>
      <PageHeader
        title="Audit Trail Register"
        subtitle="Tamper-Evident System Activity Log · Restricted"
        actions={
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => setFilterAction("ALL")}><Clock className="w-4 h-4 mr-2" /> Recent</Btn>
            <Btn variant="gold" onClick={handleExport}><Download className="w-4 h-4 mr-2" /> Export Log</Btn>
          </div>
        }
      />
      <Section title={`Activity Records · ${filteredLogs.length} Entries Found`} actions={
        <div className="flex items-center gap-3">
          <select 
            className="h-9 px-3 bg-card border border-border rounded-sm text-xs font-bold focus:outline-none focus:border-accent"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="APPROVE">Approve</option>
            <option value="DISBURSE">Disburse</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Search user, entity, IP…" 
              className="h-9 pl-9 pr-3 w-80 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-accent" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      }>
        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead><tr><th>Time</th><th>User</th><th>Action</th><th>Affected Record</th><th>IP / Terminal</th><th>Result</th></tr></thead>
            <tbody>
              {filteredLogs.map((l)=>(
                <tr key={l.id} className="hover:bg-primary/5 transition-colors group">
                  <td className="font-mono text-[0.65rem] font-bold text-muted-foreground">{l.time}</td>
                  <td className="font-bold text-primary flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {l.user}
                  </td>
                  <td>
                    <Badge variant={l.action==="DELETE"?"danger":l.action==="DISBURSE"||l.action==="APPROVE"?"success":"info"}>
                      {l.action}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground text-xs italic">
                    <span className="flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      {l.entity}
                    </span>
                  </td>
                  <td className="font-mono text-[0.65rem] font-bold flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                    {l.ip}
                  </td>
                  <td>
                    {l.result==="Success" ? (
                      <div className="flex items-center gap-1.5 text-success font-bold text-[0.6rem] uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Success
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-danger font-bold text-[0.6rem] uppercase tracking-wider">
                        <XCircle className="w-3.5 h-3.5" /> Failed
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </AppShell>
  );
};

export default AuditLog;