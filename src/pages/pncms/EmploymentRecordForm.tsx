import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import { Btn, Field, Input, Select, Section } from '@/components/pncms/ui-kit';
import { Save, X, Plus, Trash2, FileCheck2, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addYears } from 'date-fns';
import { useDepartments, useRanks, usePersonnel, useUpsertEmployee, useCreateLog } from '@/hooks/use-api';
import { toast } from 'sonner';

const EmploymentRecordForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { data: departments = [] } = useDepartments();
  const { data: ranks = [] } = useRanks();
  const { data: personnel = [] } = usePersonnel();
  const { mutate: upsertEmployee } = useUpsertEmployee();
  const { mutate: createLog } = useCreateLog();

  const [form, setForm] = useState<any>({
    serviceNo: '',
    name: '',
    rankId: '',
    departmentId: '',
    cardType: 'Ministerial',
    bps: 'BPS-07',
    status: 'Active',
    appointmentDate: '',
    joiningDate: '',
    dob: '',
    cnic: '',
    fatherName: '',
    gender: 'Male',
    bloodGroup: 'A+',
    presentAddress: '',
    permanentAddress: '',
    accountNo: '',
    bankName: 'NBP',
    nokName: '',
    nokContact: '',
    nokRelation: '',
    nokAddress: '',
    nokCnic: '',
    phones: [{ number: '', brand: '', model: '', imei1: '', imei2: '' }],
    letters: [
      { type: 'Appointment', refNo: '', refDate: '', fileName: '', fileNo: '' },
      { type: 'Joining', refNo: '', refDate: '', fileName: '', fileNo: '' }
    ]
  });

  useEffect(() => {
    if (isEdit && personnel.length > 0) {
      const emp = (personnel as any[]).find(p => p.id === id);
      if (emp) {
        setForm({
          ...emp,
          phones: emp.phones?.length ? emp.phones : [{ number: '', brand: '', model: '', imei1: '', imei2: '' }],
          letters: emp.letters?.length ? emp.letters : [
            { type: 'Appointment', refNo: '', refDate: '', fileName: '', fileNo: '' },
            { type: 'Joining', refNo: '', refDate: '', fileName: '', fileNo: '' }
          ]
        });
      }
    }
  }, [isEdit, id, personnel]);

  const retirementDate = form.appointmentDate
    ? format(addYears(new Date(form.appointmentDate), 60), 'yyyy-MM-dd')
    : '';

  const handlePhoneChange = (idx: number, field: string, val: string) => {
    const newPhones = [...form.phones];
    newPhones[idx] = { ...newPhones[idx], [field]: val };
    setForm({ ...form, phones: newPhones });
  };

  const handleLetterChange = (type: string, field: string, val: string) => {
    const newLetters = form.letters.map((l: any) => 
      l.type === type ? { ...l, [field]: val } : l
    );
    setForm({ ...form, letters: newLetters });
  };

  const handleSubmit = () => {
    if (!form.serviceNo || !form.name || !form.rankId || !form.departmentId) {
      toast.error("Please fill all required fields marked with *");
      return;
    }

    upsertEmployee(form, {
      onSuccess: () => {
        createLog({
          user: localStorage.getItem("username") || "Admin",
          action: isEdit ? "UPDATE" : "CREATE",
          entity: `Personnel: ${form.serviceNo} - ${form.name}`,
          result: "Success"
        });
        toast.success(isEdit ? "Record updated" : "Personnel enrolled successfully");
        navigate('/employment-records');
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to save record");
      }
    });
  };

  const handleRankChange = (rankId: string) => {
    const rank = (ranks as any[]).find(r => r.id === rankId);
    if (rank) {
      setForm({
        ...form,
        rankId,
        bps: rank.bps || '',
        cardType: rank.cadre || form.cardType
      });
    } else {
      setForm({ ...form, rankId });
    }
  };

  return (
    <AppShell>
      <PageHeader
        title={isEdit ? 'Edit Employment Record' : 'New Employment Record'}
        subtitle={isEdit ? `Modifying record · ${form.serviceNo}` : 'Civilian Staff Enrollment Form'}
        actions={
          <>
            <Btn variant="outline" onClick={() => navigate(-1)}><X className="w-4 h-4" /> Cancel</Btn>
            <Btn variant="gold" onClick={handleSubmit}><FileCheck2 className="w-4 h-4" /> Submit Record</Btn>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 space-y-5">
          <Section title="01 · Service Details">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Service Number" required><Input value={form.serviceNo} onChange={e => setForm({...form, serviceNo: e.target.value})} placeholder="-XXXX" /></Field>
              <Field label="Rank" required>
                <Select value={form.rankId} onChange={e => handleRankChange(e.target.value)}>
                  <option value="">Select Rank</option>
                  {ranks.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </Select>
              </Field>
              <Field label="Department" required>
                <Select value={form.departmentId} onChange={e => setForm({...form, departmentId: e.target.value})}>
                  <option value="">Select Department</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </Field>
              <Field label="Card Type" required>
                <Input value={form.cardType} disabled className="bg-muted/50 font-bold text-primary" />
              </Field>
              <Field label="BPS Grade" required>
                <Input value={form.bps} disabled className="bg-muted/50 font-bold text-primary" />
              </Field>
              <Field label="Status">
                <Select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option>Active</option><option>On Leave</option><option>Suspended</option><option>Retired</option>
                </Select>
              </Field>
            </div>
          </Section>

          <Section title="02 · Appointment & Joining">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Date of Appointment" required><Input type="date" value={form.appointmentDate} onChange={e => setForm({...form, appointmentDate: e.target.value})} /></Field>
              <Field label="Date of Joining" required><Input type="date" value={form.joiningDate} onChange={e => setForm({...form, joiningDate: e.target.value})} /></Field>
              <Field label="Date of Retirement (Auto)"><Input value={retirementDate} disabled className="bg-muted/50 font-bold text-primary" /></Field>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-6">
              {['Appointment', 'Joining'].map(type => (
                <div key={type} className="space-y-3 p-4 border border-border rounded-sm bg-muted/10">
                  <h4 className="heading-mil text-[0.7rem] text-primary">{type} Letter Metadata</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Ref Number"><Input value={form.letters.find((l:any)=>l.type===type)?.refNo} onChange={e => handleLetterChange(type, 'refNo', e.target.value)} /></Field>
                    <Field label="Ref Date"><Input type="date" value={form.letters.find((l:any)=>l.type===type)?.refDate} onChange={e => handleLetterChange(type, 'refDate', e.target.value)} /></Field>
                    <Field label="File Name"><Input value={form.letters.find((l:any)=>l.type===type)?.fileName} onChange={e => handleLetterChange(type, 'fileName', e.target.value)} /></Field>
                    <Field label="File Number"><Input value={form.letters.find((l:any)=>l.type===type)?.fileNo} onChange={e => handleLetterChange(type, 'fileNo', e.target.value)} /></Field>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="03 · Personal Details">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Field label="Full Name" required><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></Field>
              <Field label="Father's Name" required><Input value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} /></Field>
              <Field label="CNIC" required><Input value={form.cnic} onChange={e => setForm({...form, cnic: e.target.value})} /></Field>
              <Field label="Date of Birth" required><Input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} /></Field>
              <Field label="Gender"><Select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}><option>Male</option><option>Female</option></Select></Field>
              <Field label="Blood Group"><Select value={form.bloodGroup} onChange={e => setForm({...form, bloodGroup: e.target.value})}><option>A+</option><option>B+</option><option>O+</option><option>AB+</option></Select></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Present Address"><Input value={form.presentAddress} onChange={e => setForm({...form, presentAddress: e.target.value})} /></Field>
              <Field label="Permanent Address"><Input value={form.permanentAddress} onChange={e => setForm({...form, permanentAddress: e.target.value})} /></Field>
            </div>
          </Section>

          <Section title="04 · Phone Support">
            <div className="space-y-4">
              {form.phones.map((phone: any, idx: number) => (
                <div key={idx} className="flex gap-3 items-end p-4 border border-border rounded-sm bg-muted/5">
                  <div className="grid grid-cols-5 gap-3 flex-1">
                    <Field label="Number"><Input value={phone.number} onChange={e => handlePhoneChange(idx, 'number', e.target.value)} /></Field>
                    <Field label="Brand"><Input value={phone.brand} onChange={e => handlePhoneChange(idx, 'brand', e.target.value)} /></Field>
                    <Field label="Model"><Input value={phone.model} onChange={e => handlePhoneChange(idx, 'model', e.target.value)} /></Field>
                    <Field label="IMEI 1"><Input value={phone.imei1} onChange={e => handlePhoneChange(idx, 'imei1', e.target.value)} /></Field>
                    <Field label="IMEI 2"><Input value={phone.imei2} onChange={e => handlePhoneChange(idx, 'imei2', e.target.value)} /></Field>
                  </div>
                  {form.phones.length > 1 && <button onClick={() => setForm({...form, phones: form.phones.filter((_:any,i:number)=>i!==idx)})} className="mb-1 p-2 text-destructive"><Trash2 className="w-4 h-4" /></button>}
                </div>
              ))}
              <button onClick={() => setForm({...form, phones: [...form.phones, {number:'',brand:'',model:'',imei1:'',imei2:''}]})} className="w-full py-2 border-2 border-dashed border-border rounded-sm text-xs font-semibold">+ Add Another Phone</button>
            </div>
          </Section>
        </div>

        <div className="col-span-4 space-y-5">
          <Section title="Financial Details">
            <Field label="Account Number"><Input value={form.accountNo} onChange={e => setForm({...form, accountNo: e.target.value})} /></Field>
            <Field label="Bank Name"><Input value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} /></Field>
          </Section>
          <Section title="Next of Kin">
            <Field label="Name"><Input value={form.nokName} onChange={e => setForm({...form, nokName: e.target.value})} /></Field>
            <Field label="Relation"><Input value={form.nokRelation} onChange={e => setForm({...form, nokRelation: e.target.value})} /></Field>
            <Field label="Contact"><Input value={form.nokContact} onChange={e => setForm({...form, nokContact: e.target.value})} /></Field>
            <Field label="CNIC"><Input value={form.nokCnic} onChange={e => setForm({...form, nokCnic: e.target.value})} /></Field>
            <Field label="Address"><Input value={form.nokAddress} onChange={e => setForm({...form, nokAddress: e.target.value})} /></Field>
          </Section>
        </div>
      </div>
    </AppShell>
  );
};

export default EmploymentRecordForm;
