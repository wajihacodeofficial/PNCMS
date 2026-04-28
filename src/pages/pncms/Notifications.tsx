import { useState, useMemo } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Badge } from "@/components/pncms/ui-kit";
import { CheckCheck, AlertTriangle, Clock, Wallet, CalendarDays, FileWarning, X, Trash2, BellOff } from "lucide-react";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  t: string;
  time: string;
  tag: string;
  isRead: boolean;
  group: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: "1", t: "Sanction SNC-2026-0142 awaiting Director approval", time: "12 min ago", tag: "Sanction", isRead: false, group: "Pending Approvals" },
  { id: "2", t: "Sanction SNC-2026-0138 pending Section Officer verification", time: "2 hr ago", tag: "Sanction", isRead: false, group: "Pending Approvals" },
  { id: "3", t: "Leave Application LV-2026-091 (Bilal A. Siddiqui) awaiting verification", time: "4 hr ago", tag: "Leave", isRead: false, group: "Pending Approvals" },
  { id: "4", t: "Payment batch APR-2026-C ready for disbursement (Rs. 84,200)", time: "Today 09:10", tag: "Payment", isRead: false, group: "Pending Payments" },
  { id: "5", t: "3 employees awaiting overtime payment for Mar 2026", time: "Yesterday", tag: "Payment", isRead: true, group: "Pending Payments" },
  { id: "6", t: "Saima Nawaz exceeded EL allocation by 2 days", time: "1 hr ago", tag: "Leave", isRead: false, group: "Leave Conflicts" },
  { id: "7", t: "Two staff in Logistics on simultaneous CL — coverage warning", time: "3 hr ago", tag: "Leave", isRead: true, group: "Leave Conflicts" },
  { id: "8", t: "Auto-backup completed successfully (248 MB)", time: "02:00", tag: "System", isRead: true, group: "System Alerts" },
  { id: "9", t: "Failed login attempt from 172.31.4.12 — review audit log", time: "Yesterday 16:11", tag: "Security", isRead: false, group: "System Alerts" },
];

const Notifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    toast.success("All notifications marked as read");
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.info("Notification removed");
  };

  const groups = useMemo(() => {
    const config = [
      { title: "Pending Approvals", icon: AlertTriangle, accent: "warning" as const },
      { title: "Pending Payments", icon: Wallet, accent: "info" as const },
      { title: "Leave Conflicts", icon: CalendarDays, accent: "danger" as const },
      { title: "System Alerts", icon: FileWarning, accent: "primary" as const },
    ];

    return config.map(c => ({
      ...c,
      items: notifications.filter(n => n.group === c.title)
    }));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <AppShell>
      <PageHeader
        title="Notifications & Alerts"
        subtitle={`Operational Events Requiring Attention · ${unreadCount} Unread`}
        actions={
          <div className="flex gap-2">
            <Btn variant="outline" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4" /> Mark All Read
            </Btn>
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-5">
        {groups.map(g => (
          <Section 
            key={g.title} 
            title={`${g.title} · ${g.items.length}`}
            className={g.items.length === 0 ? "opacity-50" : ""}
          >
            <ul className="space-y-3">
              {g.items.map((it) => (
                <li 
                  key={it.id} 
                  className={`group relative flex items-start gap-3 p-3 border border-border rounded-sm transition-all duration-200 ${
                    it.isRead ? "bg-muted/10 border-border/50" : "bg-muted/40 border-primary/20 shadow-sm"
                  }`}
                  onClick={() => markRead(it.id)}
                >
                  <div className={`w-9 h-9 rounded-sm flex items-center justify-center shrink-0 ${
                    it.isRead ? "bg-muted text-muted-foreground" : `bg-${g.accent}/10 text-${g.accent}`
                  }`}>
                    <g.icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pr-8">
                    <p className={`text-sm leading-snug transition-colors ${
                      it.isRead ? "text-muted-foreground" : "text-primary font-semibold"
                    }`}>
                      {it.t}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {!it.isRead && <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                      <Badge variant={it.isRead ? "neutral" : "info"}>{it.tag}</Badge>
                      <span className="text-[0.65rem] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {it.time}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteNotification(it.id); }}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
              {g.items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground opacity-60">
                  <BellOff className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-xs italic">No pending notifications in this category</p>
                </div>
              )}
            </ul>
          </Section>
        ))}
      </div>
    </AppShell>
  );
};

export default Notifications;