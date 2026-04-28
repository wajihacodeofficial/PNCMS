import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, FileWarning, ClipboardList, Wallet,
  CalendarDays, CheckSquare, FileBarChart2, Settings, LogOut,
  DatabaseBackup, ShieldAlert, Bell, HelpCircle, Info, Building2, ShieldCheck, Gavel
} from "lucide-react";
import crest from "@/assets/navy-crest.png";

const groups: { heading: string; items: { to: string; label: string; icon: React.ComponentType<{ className?: string }> }[] }[] = [
  { heading: "Command", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/notifications", label: "Notifications", icon: Bell },
  ]},
  { heading: "Establishment", items: [
    { to: "/settings/departments", label: "Departments", icon: Building2 },
    { to: "/settings/ranks", label: "Rank System", icon: ShieldCheck },
  ]},
  { heading: "Personnel", items: [
    { to: "/employment-records", label: "Employment Record", icon: Users },
    { to: "/attendance", label: "Attendance", icon: CheckSquare },
    { to: "/discipline", label: "Disciplinary Actions", icon: Gavel },
  ]},
  { heading: "Overtime & Pay", items: [
    { to: "/sanctions", label: "Sanctions", icon: FileWarning },
    { to: "/work-logs", label: "Work Logs", icon: ClipboardList },
    { to: "/payments", label: "Payments", icon: Wallet },
  ]},
  { heading: "Leave", items: [
    { to: "/leave", label: "Leave Accounts", icon: CalendarDays },
  ]},
  { heading: "System Controls", items: [
    { to: "/reports", label: "Reports Hub", icon: FileBarChart2 },
    { to: "/audit", label: "Audit Trail", icon: ShieldAlert },
    { to: "/backup", label: "Backup & Restore", icon: DatabaseBackup },
    { to: "/settings", label: "System Settings", icon: Settings },
  ]},
];

export const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <aside className="w-[240px] shrink-0 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 pt-6 pb-5 border-b border-sidebar-border">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-md bg-white flex items-center justify-center shadow-elevated p-1.5">
            <img src={crest} alt="Pakistan Navy crest" className="w-full h-full object-contain" width={80} height={80} loading="lazy" />
          </div>
          <h1 className="mt-3 text-2xl text-white tracking-wider">PNCMS</h1>
          <div className="gold-rule mx-auto my-2" />
          <p className="label-mil text-[0.6rem] text-sidebar-foreground/70 leading-tight">
            Pakistan Navy<br/>Civilian Management System
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {groups.map(group => (
          <div key={group.heading} className="mb-1">
            <div className="px-5 pt-3 pb-1.5 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/40">
              {group.heading}
            </div>
            {group.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-5 py-2.5 text-[0.82rem] font-body font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-active text-white"
                      : "text-sidebar-foreground/85 hover:bg-sidebar-hover hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />}
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="tracking-wide">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-semibold uppercase tracking-wider">Logout</span>
        </button>
        <div className="mt-3 pt-3 border-t border-sidebar-border text-center">
          <p className="text-[0.6rem] text-sidebar-foreground/50 font-body tracking-wide">
            Developed by
          </p>
          <p className="text-[0.65rem] text-white font-semibold uppercase tracking-wider mt-0.5">
            Code Vertex Solutions
          </p>
        </div>
      </div>
    </aside>
  );
};
