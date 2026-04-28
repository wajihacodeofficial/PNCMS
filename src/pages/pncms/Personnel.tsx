import { useState } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Badge, Section, Field, Input, Select } from "@/components/pncms/ui-kit";
import { Plus, Download, Search, Filter, Eye, Pencil, Upload, X, User } from "lucide-react";
import { personnel } from "@/data/mock";

const Personnel = () => {
  const [open, setOpen] = useState(false);
  return (
    <AppShell>
      <PageHeader
        title="Personnel Directory"
        subtitle="Authorized Civilian Staff Management"
        actions={
          <>
            <Btn variant="outline"><Download className="w-4 h-4" /> Export State</Btn>
            <Btn variant="gold" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Add Personnel</Btn>
          </>
        }
      />

      <Section title="Records · 412 Personnel On File" actions={
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input placeholder="Search service no, name, CNIC…" className="h-9 pl-9 pr-3 w-72 bg-card border border-border rounded-sm text-sm focus:outline-none focus:border-accent" />
          </div>
          <Btn variant="outline" className="h-9 py-0"><Filter className="w-4 h-4" /> Filters</Btn>
        </div>
      }>
        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Service No</th>
                <th>Employee Code</th>
                <th>Name</th>
                <th>Cadre</th>
                <th>Department</th>
                <th>BPS</th>
                <th>CNIC</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {personnel.map((p) => (
                <tr key={p.svc}>
                  <td className="font-mono text-xs text-primary font-semibold">{p.svc}</td>
                  <td className="font-mono text-xs">{p.code}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-[0.65rem] font-bold">
                        {p.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                      </div>
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td>{p.cadre}</td>
                  <td className="text-muted-foreground">{p.dept}</td>
                  <td><Badge variant="neutral">{p.bps}</Badge></td>
                  <td className="font-mono text-xs">{p.cnic}</td>
                  <td>
                    {p.status === "Active" && <Badge variant="success">{p.status}</Badge>}
                    {p.status === "On Leave" && <Badge variant="warning">{p.status}</Badge>}
                    {p.status === "Suspended" && <Badge variant="danger">{p.status}</Badge>}
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 rounded-sm hover:bg-muted text-info"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-sm hover:bg-muted text-primary"><Pencil className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 text-xs">
          <span className="label-mil">Showing 1–8 of 412</span>
          <div className="flex gap-1">
            {["‹","1","2","3","…","52","›"].map((p,i) => (
              <button key={i} className={`w-8 h-8 rounded-sm border border-border text-xs ${p==="1"?"bg-primary text-primary-foreground":""}`}>{p}</button>
            ))}
          </div>
        </div>
      </Section>

      {open && <EnrollmentModal onClose={() => setOpen(false)} />}
    </AppShell>
  );
};

const EnrollmentModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-8 animate-fade-in">
    <div className="bg-card w-full max-w-5xl rounded-md shadow-elevated overflow-hidden">
      {/* Navy top strip */}
      <div className="bg-gradient-command px-7 py-5 flex items-center justify-between">
        <div>
          <div className="label-mil text-accent">Personnel Enrollment Portal</div>
          <h2 className="text-2xl text-white mt-1">New Civilian Staff Registration</h2>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
      </div>
      <div className="h-1 bg-accent" />

      <div className="p-7 space-y-7 max-h-[75vh] overflow-y-auto">
        <FormSection title="01 · Basic Personal Identity">
          <Field label="Full Name" required><Input defaultValue="" placeholder="As per CNIC" /></Field>
          <Field label="Father's Name" required><Input /></Field>
          <Field label="CNIC Number" required><Input placeholder="00000-0000000-0" /></Field>
          <Field label="Date of Birth" required><Input type="date" /></Field>
          <Field label="Gender" required><Select><option>Male</option><option>Female</option></Select></Field>
          <Field label="Religion"><Input defaultValue="Islam" /></Field>
        </FormSection>

        <FormSection title="02 · Service Details">
          <Field label="Service Number" required><Input placeholder="PN-CIV-XXXX" /></Field>
          <Field label="Employee Code" required><Input /></Field>
          <Field label="Cadre" required><Select><option>Clerical</option><option>Technical</option><option>Drawing</option><option>Stenographer</option><option>Driver</option></Select></Field>
          <Field label="Department" required><Select><option>Administration</option><option>Naval Headquarters</option><option>Naval Dockyard</option><option>Engineering Wing</option></Select></Field>
          <Field label="BPS Grade" required><Select>{["BPS-07","BPS-12","BPS-14","BPS-15","BPS-16","BPS-17"].map(b=><option key={b}>{b}</option>)}</Select></Field>
          <Field label="Date of Joining" required><Input type="date" /></Field>
        </FormSection>

        <FormSection title="03 · Contact & Residential">
          <Field label="Mobile Number" required><Input placeholder="+92-300-0000000" /></Field>
          <Field label="Alt. Phone"><Input /></Field>
          <Field label="Email"><Input type="email" /></Field>
          <Field label="Permanent Address" required><Input /></Field>
          <Field label="City" required><Input defaultValue="Karachi" /></Field>
          <Field label="Postal Code"><Input /></Field>
        </FormSection>

        <FormSection title="04 · Banking Details">
          <Field label="Bank Name" required><Input defaultValue="National Bank of Pakistan" /></Field>
          <Field label="Branch Code" required><Input /></Field>
          <Field label="Account Number" required><Input /></Field>
          <Field label="IBAN" required><Input placeholder="PK00 NBPA 0000 0000 0000 0000" /></Field>
        </FormSection>

        <FormSection title="05 · Next of Kin">
          <Field label="NOK Name" required><Input /></Field>
          <Field label="Relationship" required><Input /></Field>
          <Field label="NOK Contact" required><Input /></Field>
          <Field label="NOK CNIC"><Input /></Field>
        </FormSection>

        <div>
          <h3 className="heading-mil text-sm text-primary mb-3 tracking-widest">06 · Photo Upload</h3>
          <div className="border-2 border-dashed border-border rounded-sm p-8 flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-4">
              <div className="w-20 h-24 bg-card border border-border flex items-center justify-center"><User className="w-10 h-10 text-muted-foreground" /></div>
              <div>
                <div className="text-sm font-semibold text-primary">Personnel Photograph</div>
                <div className="text-xs text-muted-foreground mt-0.5">JPG/PNG · Passport size · Max 2 MB</div>
              </div>
            </div>
            <Btn variant="outline"><Upload className="w-4 h-4" /> Upload Photo</Btn>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-muted/40 px-7 py-4 flex items-center justify-between">
        <span className="label-mil">All fields marked * are mandatory</span>
        <div className="flex gap-3">
          <Btn variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary">Save Draft</Btn>
          <Btn variant="gold">Submit Enrollment</Btn>
        </div>
      </div>
    </div>
  </div>
);

const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="heading-mil text-sm text-primary mb-4 tracking-widest pb-2 border-b border-border">{title}</h3>
    <div className="grid grid-cols-3 gap-4">{children}</div>
  </div>
);

export default Personnel;
