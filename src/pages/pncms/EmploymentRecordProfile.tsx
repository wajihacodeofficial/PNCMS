import { useState } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Badge, Section, StatCard } from "@/components/pncms/ui-kit";
import { 
  Printer, Pencil, Download, Phone, MapPin, Building2, IdCard, 
  Wallet, CalendarDays, ClipboardList, ShieldCheck, History, 
  GraduationCap, TrendingUp, ArrowRight, ArrowUpCircle, ExternalLink,
  Clock, FileText, User, UserCheck, Anchor
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import * as Tabs from "@radix-ui/react-tabs";
import { intervalToDuration, formatDuration } from "date-fns";
import { Switch } from "@/components/ui/switch";

const EmploymentRecordProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isActive, setIsActive] = useState(true);
  
  // Mock data for demonstration - in real app would fetch based on id
  const isMinisterial = id?.includes("1042") || true; 
  const joiningUnitDate = new Date("2022-01-15");
  const unitDuration = intervalToDuration({ start: joiningUnitDate, end: new Date() });
  const tenureStr = formatDuration(unitDuration, { format: ['years', 'months', 'days'], delimiter: ', ' });

  return (
    <AppShell>
      <PageHeader
        title="Employment Record Profile"
        subtitle={`Service Record · ${id ?? "PN-CIV-1042"}`}
        actions={
          <>
            <Btn variant="outline"><Printer className="w-4 h-4" /> Print Profile</Btn>
            <Btn variant="outline"><Download className="w-4 h-4" /> Export PDF</Btn>
            <Btn variant="gold" onClick={() => navigate(`/employment-records/edit/${id ?? "PN-CIV-1042"}`)}><Pencil className="w-4 h-4" /> Edit Record</Btn>
          </>
        }
      />

      <div className="flex gap-6 mb-6">
        {/* Profile Card */}
        <div className="w-80 shrink-0">
          <div className="panel overflow-hidden border-t-4 border-t-accent">
            <div className="p-6 text-center">
              <div className="w-32 h-40 mx-auto bg-muted rounded-sm flex items-center justify-center mb-4 shadow-inner border border-border">
                <User className="w-16 h-16 text-muted-foreground/20" />
              </div>
              <h2 className="text-xl font-heading font-bold text-primary">Muhammad Tariq Khan</h2>
              <p className="text-xs font-mono text-muted-foreground mt-1">{id ?? "PN-CIV-1042"}</p>
              
              <div className="mt-4 p-2 bg-muted/30 rounded-sm">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-accent uppercase">
                  <Anchor className="w-3.5 h-3.5" /> NHQ ISLAMABAD
                </div>
                <div className="text-[0.65rem] text-muted-foreground mt-1 italic">
                  Tenure: {tenureStr}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="info">Assistant</Badge>
                <Badge variant={isMinisterial ? "info" : "warning"}>{isMinisterial ? "Ministerial" : "Industrial"}</Badge>
              </div>
            </div>

            <div className="border-t border-border p-4 bg-muted/20 space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <Building2 className="w-4 h-4 text-accent" />
                <div className="flex flex-col">
                   <span className="label-mil text-[0.6rem] text-muted-foreground">Department</span>
                   <span className="font-semibold text-primary">Administration</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <MapPin className="w-4 h-4 text-accent" />
                <div className="flex flex-col">
                   <span className="label-mil text-[0.6rem] text-muted-foreground">Unit Location</span>
                   <span className="text-foreground/80">NHQ Islamabad</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Phone className="w-4 h-4 text-accent" />
                <span className="text-foreground/80">+92-300-1234567</span>
              </div>
            </div>

            <div className={`p-4 transition-colors flex justify-between items-center ${isActive ? "bg-primary" : "bg-muted"}`}>
              <div className="flex flex-col">
                <span className="text-[0.6rem] font-bold tracking-widest uppercase text-white/70">Current Status</span>
                <span className={`text-xs font-bold uppercase ${isActive ? "text-white" : "text-muted-foreground"}`}>
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <Switch 
                checked={isActive} 
                onCheckedChange={setIsActive}
                className="data-[state=checked]:bg-success"
              />
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex-1">
          <Tabs.Root defaultValue="overview" className="flex flex-col h-full">
            <Tabs.List className="flex gap-1 border-b border-border mb-4">
              <TabTrigger value="overview" label="Overview" icon={UserCheck} />
              <TabTrigger value="service" label="Service Timeline" icon={History} />
              <TabTrigger value="career" label="Courses & Promotion" icon={GraduationCap} />
              <TabTrigger value="financial" label={isMinisterial ? "Late Sitting" : "Overtime"} icon={Clock} />
              <TabTrigger value="attendance" label="Attendance & Leave" icon={CalendarDays} />
              <TabTrigger value="discipline" label="Discipline" icon={ShieldCheck} />
            </Tabs.List>

            <Tabs.Content value="overview" className="space-y-5 animate-in fade-in slide-in-from-right-2">
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Service Tenure" value="14 Years" sub="Joined 2012" accent="primary" icon={<CalendarDays className="w-5 h-5" />} />
                <StatCard label="BPS Grade" value="BPS-14" sub="Last Promoted 2022" accent="info" icon={<FileText className="w-5 h-5" />} />
                <StatCard label="Active Sanction" value="Rs. 4,200" sub="Pending Approval" accent="warning" icon={<Wallet className="w-5 h-5" />} />
              </div>
              
              <Section title="Basic Personnel Details">
                <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
                  <DataRow label="Father's Name" value="Khan Muhammad" />
                  <DataRow label="CNIC" value="42101-1234567-1" />
                  <DataRow label="DOB" value="08-Aug-1984" />
                  <DataRow label="Gender" value="Male" />
                  <DataRow label="Blood Group" value="B+" />
                  <DataRow label="Domicile" value="Sindh / Karachi" />
                  <DataRow label="Permanent Addr." value="House 12-B, PN Colony, Karsaz, Karachi" />
                  <DataRow label="Present Addr." value="Block 4, NHQ Staff Quarters, Islamabad" />
                </div>
              </Section>

              <div className="grid grid-cols-2 gap-5">
                <Section title="Next of Kin (NOK) Details">
                  <div className="space-y-3 text-sm">
                    <DataRow label="NOK Name" value="Saima Begum" />
                    <DataRow label="Relation" value="Spouse" />
                    <DataRow label="NOK Contact" value="+92-333-9876543" />
                    <DataRow label="NOK CNIC" value="42101-9988776-2" />
                  </div>
                </Section>

                <Section title="Financial & Bank Details">
                  <div className="space-y-3 text-sm">
                    <DataRow label="Bank Name" value="National Bank of Pakistan" />
                    <DataRow label="Account No" value="401278219981" />
                    <DataRow label="Branch" value="Karsaz (0412)" />
                    <DataRow label="Account Type" value="Salary Current" />
                  </div>
                </Section>
              </div>
            </Tabs.Content>

            <Tabs.Content value="service" className="space-y-5 animate-in fade-in slide-in-from-right-2">
              <Section title="Service Timeline · Transfers & Attachments">
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
                  {[
                    { 
                      date: "12-Mar-2012", 
                      event: "Initial Appointment", 
                      type: "appointment",
                      ref: "NHQ/APP/2012/99", 
                      unit: "PNS Bahadur",
                      details: "Enrolled as LDC (Industrial)"
                    },
                    { 
                      date: "18-Mar-2014", 
                      event: "Confirmation of Service", 
                      type: "confirmation",
                      ref: "NHQ/CONF/2014/12", 
                      unit: "PNS Bahadur" 
                    },
                    { 
                      date: "04-Jan-2022", 
                      event: "Promotion to Assistant", 
                      type: "promotion",
                      ref: "DPC/PROM/2022/04", 
                      unit: "NHQ Islamabad" 
                    },
                    { 
                      date: "15-May-2024", 
                      event: "Internal Transfer", 
                      type: "transfer",
                      ref: "NHQ/TRF/24/112", 
                      fromUnit: "PNS Bahadur",
                      toUnit: "NHQ Islamabad",
                      details: "Posted to Admin Directorate"
                    },
                    { 
                      date: "01-Sep-2025", 
                      event: "Unit Attachment", 
                      type: "attachment",
                      ref: "ATT/PN-CIV/2025/08", 
                      unit: "NHQ Islamabad",
                      attachTo: "Naval Dockyard (Engineering)",
                      attachType: "External",
                      tenderUnit: "N/A",
                      details: "Attached for Technical Audit support"
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 relative group">
                      <div className={`mt-1 w-[24px] h-[24px] rounded-full flex items-center justify-center border-2 border-card z-10 shadow-sm ${
                        item.type === "transfer" ? "bg-info text-white" : 
                        item.type === "attachment" ? "bg-warning text-white" : 
                        item.type === "promotion" ? "bg-success text-white" : "bg-accent text-white"
                      }`}>
                        {item.type === "transfer" ? <ArrowRight className="w-3 h-3" /> : 
                         item.type === "attachment" ? <ExternalLink className="w-3 h-3" /> : 
                         item.type === "promotion" ? <TrendingUp className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 pb-2 border-b border-border/40 group-last:border-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-mono font-bold text-accent">{item.date}</p>
                            <h4 className="text-sm font-bold text-primary mt-0.5">{item.event}</h4>
                          </div>
                          <Badge variant="neutral" className="font-mono text-[0.6rem]">{item.ref}</Badge>
                        </div>
                        
                        <div className="mt-2 grid grid-cols-2 gap-x-8 gap-y-2 text-[0.7rem]">
                          {item.type === "transfer" ? (
                            <>
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <span className="text-muted-foreground">From Unit</span>
                                <span className="font-semibold">{item.fromUnit}</span>
                              </div>
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <span className="text-muted-foreground">To Unit</span>
                                <span className="font-semibold text-primary">{item.toUnit}</span>
                              </div>
                            </>
                          ) : item.type === "attachment" ? (
                            <>
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <span className="text-muted-foreground">Parent Unit</span>
                                <span className="font-semibold">{item.unit}</span>
                              </div>
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <span className="text-muted-foreground">Attached To</span>
                                <span className="font-semibold text-warning">{item.attachTo}</span>
                              </div>
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <span className="text-muted-foreground">Type</span>
                                <Badge variant="warning" className="h-4 px-1.5">{item.attachType}</Badge>
                              </div>
                              <div className="flex justify-between border-b border-border/30 pb-1">
                                <span className="text-muted-foreground">Tender Unit</span>
                                <span className="font-semibold">{item.tenderUnit}</span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between border-b border-border/30 pb-1 col-span-2">
                              <span className="text-muted-foreground">Unit / Location</span>
                              <span className="font-semibold">{item.unit}</span>
                            </div>
                          )}
                          {item.details && (
                            <p className="col-span-2 text-muted-foreground italic mt-1 border-l-2 border-muted pl-2">{item.details}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </Tabs.Content>

            <Tabs.Content value="career" className="space-y-5 animate-in fade-in slide-in-from-right-2">
              <div className="grid grid-cols-1 gap-5">
                <Section title="Professional Courses & Trainings">
                  <div className="overflow-x-auto -m-5">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Course Title</th>
                          <th>Location</th>
                          <th>Duration</th>
                          <th>Ref. Letter</th>
                          <th className="text-right">Period</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { title: "Civilian Staff Induction", loc: "Naval Academy", start: "15-Apr-2012", end: "30-May-2012", dur: "45 Days", ref: "NHQ/EDU/12/42" },
                          { title: "Advance IT Skills", loc: "NIIT Islamabad", start: "01-Jan-2018", end: "31-Mar-2018", dur: "90 Days", ref: "DTE/IT/2018/11" },
                          { title: "Public Procurement Rules", loc: "NHQ Islamabad", start: "10-Oct-2023", end: "24-Oct-2023", dur: "14 Days", ref: "ADM/PP/2023/04" },
                        ].map((c, i) => (
                          <tr key={i}>
                            <td className="font-bold text-primary">{c.title}</td>
                            <td className="text-xs">{c.loc}</td>
                            <td className="text-xs font-mono">{c.dur}</td>
                            <td className="text-[0.65rem] font-mono text-accent">{c.ref}</td>
                            <td className="text-right text-[0.65rem] font-mono">
                              <div className="text-foreground">{c.start}</div>
                              <div className="text-muted-foreground">to {c.end}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>

                <Section title="Promotion History">
                  <div className="overflow-x-auto -m-5">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Previous Rank</th>
                          <th>Promoted To</th>
                          <th>Batch / Course</th>
                          <th>Ref. Letter</th>
                          <th className="text-right">Effective Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { prev: "LDC", promoted: "UDC", date: "15-Aug-2018", ref: "DPC-2018-091", batch: "Batch-24", course: "IT Foundation" },
                          { prev: "UDC", promoted: "Assistant", date: "04-Jan-2022", ref: "DPC-2022-114", batch: "Batch-31", course: "Advance Admin" },
                        ].map((p, i) => (
                          <tr key={i}>
                            <td className="text-sm text-muted-foreground">{p.prev}</td>
                            <td className="font-bold text-primary">
                              <div className="flex items-center gap-2">
                                <ArrowUpCircle className="w-3.5 h-3.5 text-success" />
                                {p.promoted}
                              </div>
                            </td>
                            <td className="text-xs">
                              <div className="font-semibold">{p.batch}</div>
                              <div className="text-[0.65rem] text-muted-foreground">{p.course}</div>
                            </td>
                            <td className="text-[0.65rem] font-mono text-accent">{p.ref}</td>
                            <td className="text-right font-bold text-accent text-xs">{p.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>
              </div>
            </Tabs.Content>

            <Tabs.Content value="financial" className="space-y-5 animate-in fade-in slide-in-from-right-2">
              <Section title={isMinisterial ? "Late Sitting History (Ministerial)" : "Overtime History (Industrial)"}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Reference</th>
                      <th>Hours</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { p: "Apr 2026", r: "SNC-2026-0142", h: "40", a: "4,200", s: "Pending" },
                      { p: "Mar 2026", r: "SNC-2026-0118", h: "45", a: "4,725", s: "Approved" },
                      { p: "Feb 2026", r: "SNC-2026-0091", h: "30", a: "3,150", s: "Approved" },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td>{row.p}</td>
                        <td className="font-mono text-xs text-primary">{row.r}</td>
                        <td>{row.h} hrs</td>
                        <td className="font-bold">Rs. {row.a}</td>
                        <td><Badge variant={row.s === "Pending" ? "warning" : "success"}>{row.s}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
              
              <Section title="Bank Account Details">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <DataRow label="Bank Name" value="National Bank of Pakistan" />
                  <DataRow label="Branch" value="Karsaz (Code: 0412)" />
                  <DataRow label="Account Number" value="401278219981" />
                  <DataRow label="IBAN" value="PK36 NBPA 0040 1278 2199 81" />
                </div>
              </Section>
            </Tabs.Content>

            <Tabs.Content value="attendance" className="space-y-5 animate-in fade-in slide-in-from-right-2">
              <div className="grid grid-cols-2 gap-5">
                <Section title="Recent Attendance">
                  <div className="space-y-2">
                    {[
                      { d: "28-Apr", in: "08:15", out: "16:45", s: "Present" },
                      { d: "27-Apr", in: "08:22", out: "17:10", s: "Present" },
                      { d: "26-Apr", in: "—", out: "—", s: "Weekend" },
                      { d: "25-Apr", in: "08:10", out: "16:30", s: "Present" },
                    ].map((a, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border-b border-border text-xs">
                        <span className="font-mono font-bold">{a.d}</span>
                        <span className="text-muted-foreground">{a.in} — {a.out}</span>
                        <Badge variant={a.s === "Present" ? "success" : "neutral"}>{a.s}</Badge>
                      </div>
                    ))}
                  </div>
                </Section>
                <Section title="Leave Balances">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-sm">
                      <div>
                        <p className="text-xs font-bold text-primary">Casual Leave (CL)</p>
                        <p className="text-[0.65rem] text-muted-foreground">Used: 03 · Remaining: 12</p>
                      </div>
                      <div className="text-xl font-heading font-extrabold text-accent">12</div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-sm">
                      <div>
                        <p className="text-xs font-bold text-primary">Earned Leave (EL)</p>
                        <p className="text-[0.65rem] text-muted-foreground">Used: 10 · Remaining: 38</p>
                      </div>
                      <div className="text-xl font-heading font-extrabold text-accent">38</div>
                    </div>
                  </div>
                </Section>
              </div>
            </Tabs.Content>

            <Tabs.Content value="discipline" className="space-y-5 animate-in fade-in slide-in-from-right-2">
              <Section title="Discipline & Warnings History">
                <div className="p-8 text-center border-2 border-dashed border-border rounded-sm bg-muted/20">
                  <ShieldCheck className="w-12 h-12 text-success/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-primary">No disciplinary actions on file</p>
                  <p className="text-xs text-muted-foreground mt-1">Personnel has maintained a clean record since joining.</p>
                </div>
              </Section>
              
              <Section title="Performance Reviews (ACRs)">
                <div className="space-y-2">
                  {[
                    { y: "2025", s: "Outstanding", c: "Excellent administrative skills." },
                    { y: "2024", s: "Very Good", c: "Diligent and punctual." },
                  ].map((r, i) => (
                    <div key={i} className="p-3 border border-border rounded-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-accent">FY {r.y}</span>
                        <Badge variant="success">{r.s}</Badge>
                      </div>
                      <p className="text-xs italic text-foreground/80">"{r.c}"</p>
                    </div>
                  ))}
                </div>
              </Section>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </AppShell>
  );
};

const TabTrigger = ({ value, label, icon: Icon }: { value: string; label: string; icon: React.ComponentType<{ className?: string }> }) => (
  <Tabs.Trigger
    value={value}
    className="px-4 py-2 text-[0.7rem] font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-primary hover:text-primary transition-all flex items-center gap-2"
  >
    <Icon className="w-3.5 h-3.5" />
    {label}
  </Tabs.Trigger>
);

const DataRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between border-b border-border pb-1.5">
    <span className="label-mil text-[0.65rem] text-muted-foreground">{label}</span>
    <span className="font-semibold text-primary text-right">{value}</span>
  </div>
);

export default EmploymentRecordProfile;