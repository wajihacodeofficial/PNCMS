import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

/* === BADGE === */
type BadgeVariant = "pending" | "approved" | "rejected" | "paid" | "processed" | "open" | "closed" | "info" | "danger" | "success" | "warning" | "neutral";
export const Badge = ({ children, variant = "neutral", className }: { children: ReactNode; variant?: BadgeVariant; className?: string }) => {
  const map: Record<BadgeVariant, string> = {
    pending:   "bg-warning/10 text-warning border-warning/30",
    approved:  "bg-success/10 text-success border-success/30",
    rejected:  "bg-destructive/10 text-destructive border-destructive/30",
    paid:      "bg-success/10 text-success border-success/30",
    processed: "bg-info/10 text-info border-info/30",
    open:      "bg-info/10 text-info border-info/30",
    closed:    "bg-muted text-muted-foreground border-border",
    info:      "bg-info/10 text-info border-info/30",
    danger:    "bg-destructive/10 text-destructive border-destructive/30",
    success:   "bg-success/10 text-success border-success/30",
    warning:   "bg-warning/10 text-warning border-warning/30",
    neutral:   "bg-muted text-foreground border-border",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider border rounded-sm", map[variant], className)}>
      {children}
    </span>
  );
};

/* === BUTTON === */
type BtnVariant = "primary" | "gold" | "outline" | "ghost" | "danger" | "success";
export const Btn = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }>(
  ({ children, variant = "primary", className, ...rest }, ref) => {
    const map: Record<BtnVariant, string> = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      gold:    "bg-accent text-accent-foreground hover:brightness-105 shadow-command",
      outline: "border border-primary/30 text-primary hover:bg-primary/5",
      ghost:   "text-primary hover:bg-muted",
      danger:  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      success: "bg-success text-success-foreground hover:bg-success/90",
    };
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all",
          map[variant],
          className
        )}
        {...rest}
      >
        {children}
      </button>
    );
  }
);
Btn.displayName = "Btn";

/* === FIELD === */
export const Field = ({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) => (
  <div className="flex flex-col gap-1.5">
    <label className="label-mil flex items-center gap-1">
      {label}{required && <span className="text-destructive">*</span>}
    </label>
    {children}
  </div>
);

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={cn(
      "h-10 px-3 bg-card border border-border rounded-sm text-sm text-foreground font-body focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
      props.className
    )}
  />
);

export const Select = ({ children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...props}
    className={cn(
      "h-10 px-3 bg-card border border-border rounded-sm text-sm text-foreground font-body focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
      props.className
    )}
  >
    {children}
  </select>
);

/* === STAT CARD === */
export const StatCard = ({
  label, value, sub, icon, accent = "primary", onClick
}: { label: string; value: string | number; sub?: string; icon?: ReactNode; accent?: "primary" | "gold" | "success" | "warning" | "danger" | "info"; onClick?: () => void }) => {
  const tints: Record<string, string> = {
    primary: "text-primary",
    gold: "text-accent",
    success: "text-success",
    warning: "text-warning",
    danger: "text-destructive",
    info: "text-info",
  };
  return (
    <div 
      onClick={onClick}
      className={cn(
        "panel relative overflow-hidden p-5 transition-all duration-200",
        onClick ? "cursor-pointer hover:shadow-elevated hover:-translate-y-1 group" : ""
      )}
    >
      <div className={cn("stripe-top-gold absolute top-0 left-0 transition-transform duration-300", onClick ? "group-hover:scale-x-110" : "")} />
      <div className="flex items-start justify-between">
        <div>
          <div className="label-mil group-hover:text-primary transition-colors">{label}</div>
          <div className={cn("mt-2 text-4xl font-heading font-extrabold italic", tints[accent])}>{value}</div>
          {sub && <div className="text-xs text-muted-foreground mt-1.5 font-body">{sub}</div>}
        </div>
        {icon && (
          <div className={cn("w-11 h-11 rounded-sm bg-primary/5 text-primary flex items-center justify-center transition-colors", onClick ? "group-hover:bg-primary group-hover:text-white" : "")}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

/* === SECTION === */
export const Section = ({ title, actions, children, className }: { title: string; actions?: ReactNode; children: ReactNode; className?: string }) => (
  <section className={cn("panel", className)}>
    <header className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/40">
      <h3 className="heading-mil text-sm text-primary tracking-widest">{title}</h3>
      {actions}
    </header>
    <div className="p-5">{children}</div>
  </section>
);
