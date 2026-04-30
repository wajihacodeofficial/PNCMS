export interface AuditEntry {
  id: string;
  time: string;
  user: string;
  action: string;
  entity: string;
  ip: string;
  result: "Success" | "Failed";
}

export const logAction = (action: string, entity: string, result: "Success" | "Failed" = "Success") => {
  const logsRaw = localStorage.getItem("pncms_audit_logs");
  const logs: AuditEntry[] = logsRaw ? JSON.parse(logsRaw) : [];
  
  const now = new Date();
  const time = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + " " + 
               now.toLocaleTimeString('en-GB', { hour12: false });

  const newEntry: AuditEntry = {
    id: Math.random().toString(36).substr(2, 9),
    time,
    user: localStorage.getItem("clerk_name") || "Admin Clerk",
    action,
    entity,
    ip: "10.4.21.18", // Simulated local IP for internal network
    result
  };

  const updatedLogs = [newEntry, ...logs].slice(0, 100); // Keep last 100 entries
  localStorage.setItem("pncms_audit_logs", JSON.stringify(updatedLogs));
};
