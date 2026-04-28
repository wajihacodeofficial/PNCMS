import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Field, Input, Select, Section } from "@/components/pncms/ui-kit";
import { Save, X, Upload, User, FileCheck2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  return (
    <AppShell>
      <PageHeader
        title={isEdit ? "Edit Personnel Record" : "Add New Personnel"}
        subtitle={isEdit ? `Modifying record · ${id}` : "Civilian Staff Enrollment Form"}
        actions={
          <>
            <Btn variant="outline" onClick={() => navigate(-1)}><X className="w-4 h-4" /> Cancel</Btn>
            <Btn variant="primary"><Save className="w-4 h-4" /> Save Draft</Btn>
            <Btn variant="gold"><FileCheck2 className="w-4 h-4" /> Submit Record</Btn>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <Section title="01 · Service Details">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Service Number" required><Input defaultValue="PN-CIV-1050" /></Field>
              <Field label="Employee Code" required><Input defaultValue="EMP-2049" /></Field>
              <Field label="Cadre" required><Select><option>Clerical</option><option>Technical</option><option>Drawing</option><option>Stenographer</option><option>Driver</option></Select></Field>
              <Field label="Department" required><Select><option>Administration</option><option>Naval Headquarters</option><option>Naval Dockyard</option><option>Engineering Wing</option><option>Logistics Command</option></Select></Field>
              <Field label="BPS Grade" required><Select>{["BPS-07","BPS-12","BPS-14","BPS-15","BPS-16","BPS-17"].map(b=><option key={b}>{b}</option>)}</Select></Field>
              <Field label="Date of Joining" required><Input type="date" /></Field>
              <Field label="Posting Unit"><Input defaultValue="PNS Bahadur" /></Field>
              <Field label="Designation"><Input defaultValue="Assistant" /></Field>
              <Field label="Status"><Select><option>Active</option><option>On Leave</option><option>Suspended</option><option>Retired</option></Select></Field>
            </div>
          </Section>

          <Section title="02 · Personal Details">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Full Name" required><Input placeholder="As per CNIC" /></Field>
              <Field label="Father's Name" required><Input /></Field>
              <Field label="CNIC" required><Input placeholder="00000-0000000-0" /></Field>
              <Field label="Date of Birth" required><Input type="date" /></Field>
              <Field label="Gender" required><Select><option>Male</option><option>Female</option></Select></Field>
              <Field label="Marital Status"><Select><option>Single</option><option>Married</option></Select></Field>
              <Field label="Religion"><Input defaultValue="Islam" /></Field>
              <Field label="Domicile"><Input defaultValue="Sindh" /></Field>
              <Field label="Blood Group"><Select><option>A+</option><option>B+</option><option>O+</option><option>AB+</option></Select></Field>
            </div>
          </Section>

          <Section title="03 · Contact Details">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Mobile" required><Input placeholder="+92-300-0000000" /></Field>
              <Field label="Alt. Phone"><Input /></Field>
              <Field label="Email"><Input type="email" /></Field>
              <Field label="Permanent Address" required><Input /></Field>
              <Field label="City"><Input defaultValue="Karachi" /></Field>
              <Field label="Postal Code"><Input /></Field>
            </div>
          </Section>

          <Section title="04 · Bank Details">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Bank Name" required><Input defaultValue="National Bank of Pakistan" /></Field>
              <Field label="Branch Code"><Input /></Field>
              <Field label="Account Number" required><Input /></Field>
              <Field label="IBAN" required><Input placeholder="PK00 NBPA 0000 0000 0000 0000" /></Field>
            </div>
          </Section>

          <Section title="05 · Next of Kin">
            <div className="grid grid-cols-3 gap-4">
              <Field label="NOK Name" required><Input /></Field>
              <Field label="Relationship" required><Input /></Field>
              <Field label="NOK Contact" required><Input /></Field>
              <Field label="NOK CNIC"><Input /></Field>
            </div>
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Photograph">
            <div className="border-2 border-dashed border-border rounded-sm p-6 text-center bg-muted/40">
              <div className="w-24 h-28 mx-auto bg-card border border-border flex items-center justify-center"><User className="w-12 h-12 text-muted-foreground" /></div>
              <Btn variant="outline" className="mt-4 w-full"><Upload className="w-4 h-4" /> Upload Photo</Btn>
              <p className="text-[0.65rem] text-muted-foreground mt-2">JPG/PNG · Max 2 MB</p>
            </div>
          </Section>

          <Section title="Appointment Letters">
            <div className="space-y-2">
              {["Initial Appointment Letter","Last Promotion Order","BPS Upgradation Letter","Transfer Order"].map(l=>(
                <div key={l} className="flex items-center justify-between p-2.5 border border-border rounded-sm bg-muted/30">
                  <span className="text-xs font-semibold">{l}</span>
                  <Btn variant="outline" className="h-7 px-2 py-0 text-[0.65rem]"><Upload className="w-3 h-3" /> Upload</Btn>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Verification">
            <div className="space-y-2 text-xs">
              {[["CNIC Verified","success"],["Bank A/C Verified","success"],["Medical Cleared","warning"]].map(([k,v])=>(
                <div key={k} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${v==="success"?"bg-success/10 text-success":"bg-warning/10 text-warning"}`}>{v==="success"?"Cleared":"Pending"}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </AppShell>
  );
};
export default EmployeeForm;