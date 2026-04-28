import { useState } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Field, Input, Select, Section } from "@/components/pncms/ui-kit";
import { Save, X, Plus, Trash2, FileCheck2, User } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { format, addYears } from "date-fns";

const EmploymentRecordForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Form State
  const [appointmentDate, setAppointmentDate] = useState("");
  const [phones, setPhones] = useState([{ number: "", model: "", brand: "", imei1: "", imei2: "" }]);

  const retirementDate = appointmentDate ? format(addYears(new Date(appointmentDate), 60), "yyyy-MM-dd") : "";

  const addPhone = () => {
    if (phones.length < 5) {
      setPhones([...phones, { number: "", model: "", brand: "", imei1: "", imei2: "" }]);
    }
  };

  const removePhone = (index: number) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  return (
    <AppShell>
      <PageHeader
        title={isEdit ? "Edit Employment Record" : "New Employment Record"}
        subtitle={isEdit ? `Modifying record · ${id}` : "Civilian Staff Enrollment Form"}
        actions={
          <>
            <Btn variant="outline" onClick={() => navigate(-1)}><X className="w-4 h-4" /> Cancel</Btn>
            <Btn variant="primary"><Save className="w-4 h-4" /> Save Draft</Btn>
            <Btn variant="gold"><FileCheck2 className="w-4 h-4" /> Submit Record</Btn>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 space-y-5">
          <Section title="01 · Service Details">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Service Number" required><Input placeholder="PN-CIV-XXXX" /></Field>
              <Field label="Rank" required>
                <Select>
                  <option>Assistant</option>
                  <option>UDC</option>
                  <option>LDC</option>
                  <option>Stenographer</option>
                  <option>Driver</option>
                </Select>
              </Field>
              <Field label="Department" required>
                <Select>
                  <option>Administration</option>
                  <option>Naval Headquarters</option>
                  <option>Naval Dockyard</option>
                  <option>Engineering Wing</option>
                </Select>
              </Field>
              <Field label="Card Type" required>
                <Select>
                  <option value="Ministerial">Ministerial</option>
                  <option value="Industrial">Industrial</option>
                </Select>
              </Field>
              <Field label="BPS Grade" required><Select>{["BPS-07","BPS-12","BPS-14","BPS-15","BPS-16","BPS-17"].map(b=><option key={b}>{b}</option>)}</Select></Field>
              <Field label="Status"><Select><option>Active</option><option>On Leave</option><option>Suspended</option><option>Retired</option></Select></Field>
            </div>
          </Section>

          <Section title="02 · Appointment & Joining">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Date of Appointment" required>
                <Input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
              </Field>
              <Field label="Date of Joining Current Unit" required><Input type="date" /></Field>
              <Field label="Date of Retirement (Auto)">
                <Input value={retirementDate} disabled className="bg-muted/50 font-bold text-primary" />
              </Field>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-6">
              <div className="space-y-3 p-4 border border-border rounded-sm bg-muted/10">
                <h4 className="heading-mil text-[0.7rem] text-primary">Appointment Letter Metadata</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Ref Number"><Input placeholder="e.g. NHQ/123/CIV" /></Field>
                  <Field label="Ref Date"><Input type="date" /></Field>
                  <Field label="File Name"><Input placeholder="e.g. Appt_Letter_2024.pdf" /></Field>
                  <Field label="File Number"><Input placeholder="e.g. F-45/2024" /></Field>
                </div>
              </div>
              <div className="space-y-3 p-4 border border-border rounded-sm bg-muted/10">
                <h4 className="heading-mil text-[0.7rem] text-primary">Joining Letter Metadata</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Ref Number"><Input /></Field>
                  <Field label="Ref Date"><Input type="date" /></Field>
                  <Field label="File Name"><Input /></Field>
                  <Field label="File Number"><Input /></Field>
                </div>
              </div>
            </div>
          </Section>

          <Section title="03 · Personal & Address">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Field label="Full Name" required><Input placeholder="As per CNIC" /></Field>
              <Field label="Father's Name" required><Input /></Field>
              <Field label="CNIC" required><Input placeholder="00000-0000000-0" /></Field>
              <Field label="Date of Birth" required><Input type="date" /></Field>
              <Field label="Gender" required><Select><option>Male</option><option>Female</option></Select></Field>
              <Field label="Blood Group"><Select><option>A+</option><option>B+</option><option>O+</option><option>AB+</option></Select></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Present Address" required><Input placeholder="Current residence" /></Field>
              <Field label="Permanent Address" required><Input placeholder="As per CNIC" /></Field>
            </div>
          </Section>

          <Section title="04 · Multi-Phone Support">
            <div className="space-y-4">
              {phones.map((phone, idx) => (
                <div key={idx} className="flex gap-3 items-end p-4 border border-border rounded-sm bg-muted/5 relative group">
                  <div className="grid grid-cols-5 gap-3 flex-1">
                    <Field label="Phone Number"><Input placeholder="03XX-XXXXXXX" /></Field>
                    <Field label="Brand"><Input placeholder="e.g. Samsung" /></Field>
                    <Field label="Model"><Input placeholder="e.g. S21" /></Field>
                    <Field label="IMEI 1"><Input placeholder="15 digits" /></Field>
                    <Field label="IMEI 2"><Input placeholder="15 digits" /></Field>
                  </div>
                  {phones.length > 1 && (
                    <button 
                      onClick={() => removePhone(idx)}
                      className="mb-1 p-2 text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {phones.length < 5 && (
                <button 
                  onClick={addPhone}
                  className="w-full py-2 border-2 border-dashed border-border rounded-sm text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3" /> Add Another Phone (Up to 5)
                </button>
              )}
            </div>
          </Section>
        </div>

        <div className="col-span-4 space-y-5">
          <Section title="Profile Picture">
            <div className="border-2 border-dashed border-border rounded-sm p-6 text-center bg-muted/40">
              <div className="w-32 h-40 mx-auto bg-card border border-border flex items-center justify-center shadow-inner">
                <User className="w-16 h-16 text-muted-foreground/30" />
              </div>
              <Btn variant="outline" className="mt-4 w-full uppercase text-[0.65rem] tracking-widest">Select Image</Btn>
            </div>
          </Section>

          <Section title="Financial Details">
          
            <div className="space-y-4">
              <Field label="Account Number"><Input /></Field>
              <Field label="Bank Name"><Input defaultValue="NBP" /></Field>
        </div>
              </Section>
              
              <Section title="NOK Details">
            <div className="border border-border rounded-sm p-4">
              <Field label="Name"><Input /></Field>
              <Field label="Contact Number"><Input /></Field>
              <Field label="Address"><Input /></Field>
              <Field label="CNIC"><Input /></Field>
              <Field label="Relation"><Input /></Field>

            </div>
              
              </Section>
          
          
          <div className="panel p-5 bg-accent/5 border border-accent/20 rounded-sm">
            <h4 className="heading-mil text-xs text-accent mb-3">Compliance Notice</h4>
            <p className="text-[0.65rem] text-foreground/70 leading-relaxed">
              All data entered must be verified against service books and CNIC records. Rank-based entitlements will be calculated based on the selected card type and BPS grade.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default EmploymentRecordForm;