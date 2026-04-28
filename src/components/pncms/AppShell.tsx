import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Bell, ShieldCheck, ChevronDown } from "lucide-react";

export const AppShell = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen w-full flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top status bar */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs label-mil text-success">
              <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
              Secure Session · Encrypted
            </div>
            <span className="text-border">|</span>
            <span className="label-mil">Terminal: NHQ-ADM-04</span>
          </div>
          <div className="flex items-center gap-5">
            <button className="relative text-muted-foreground hover:text-primary">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[10px] rounded-full flex items-center justify-center">3</span>
            </button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-gradient-command text-white flex items-center justify-center text-sm font-bold">
                AC
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-primary">Admin Clerk</div>
                <div className="label-mil text-[0.6rem] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-accent" /> Authority L3
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  );
};

export const PageHeader = ({
  title, subtitle, actions,
}: { title: string; subtitle?: string; actions?: ReactNode }) => (
  <div className="flex items-end justify-between mb-6 pb-5 border-b border-border">
    <div>
      <h1 className="text-3xl text-primary leading-none">{title}</h1>
      <div className="gold-rule mt-3" />
      {subtitle && <p className="label-mil mt-2">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);
