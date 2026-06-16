import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import { Btn, Field, Input, Select, Section } from '@/components/pncms/ui-kit';
import { Save, X, Plus, Trash2, FileCheck2, User } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, addYears } from 'date-fns';
import {
  useDepartments,
  useRanks,
  usePersonnel,
  useUpsertEmployee,
  useCreateLog,
} from '@/hooks/use-api';
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
    phoneNumber: '',
    rankId: '',
    departmentId: '',
    cardType: 'Ministerial',
    bps: 'BPS-07',
    basicPay: '',
    initialLfpBalance: 0,
    status: 'Active',
    attachedTo: '',
    attachedToRef: '',
    remarks: '',
    appointmentDate: '',
    joiningDate: '',
    dob: '',
    cnic: '',
    fatherName: '',
    motherName: '',
    gender: 'Male',
    bloodGroup: 'A+',
    maritalStatus: 'Single',
    religion: 'Islam',
    placeOfBirth: '',
    presentAddress: '',
    permanentAddress: '',
    domicile: '',
    domicileDistrict: '',
    qualification: 'Matric',
    languages: 'Urdu, English',
    itSkills: '',
    height: '',
    weight: '',
    distinguishingMarks: '',
    medicalCategory: 'AYE',
    accountNo: '',
    bankName: 'NBP',
    pensionAccount: '',
    gpfAccount: '',
    nokName: '',
    nokContact: '',
    nokRelation: '',
    nokAddress: '',
    nokCnic: '',
    emergencyContact: '',
    emergencyContactRelation: '',
    phones: [{ number: '', brand: '', model: '', imei1: '', imei2: '' }],
    photo: '',
    letters: [
      { type: 'Appointment', refNo: '', refDate: '', fileName: '', fileNo: '', filePath: '' },
      { type: 'Joining', refNo: '', refDate: '', fileName: '', fileNo: '', filePath: '' },
      { type: 'Transfer', refNo: '', refDate: '', fileName: '', fileNo: '', filePath: '' },
    ],
  });

  useEffect(() => {
    if (isEdit && personnel.length > 0) {
      const emp = (personnel as any[]).find((p) => p.serviceNo === id);
      if (emp) {
        // Map letters carefully
        const appointmentLetter = emp.letters?.find(
          (l: any) =>
            l.fileName?.toLowerCase().includes('appoint') ||
            l.referenceNumber?.toLowerCase().includes('appoint') ||
            (!l.referenceNumber?.toLowerCase().includes('join') &&
              !l.fileName?.toLowerCase().includes('join'))
        );
        const joiningLetter = emp.letters?.find(
          (l: any) =>
            l.fileName?.toLowerCase().includes('join') ||
            l.referenceNumber?.toLowerCase().includes('join')
        );
        const transferLetter = emp.letters?.find(
          (l: any) =>
            l.fileName?.toLowerCase().includes('transfer') ||
            l.referenceNumber?.toLowerCase().includes('transfer')
        );

        setForm({
          ...emp,
          photo: emp.photo || '',
          accountNo: emp.bankAccount || '',
          joiningDate: emp.joiningCurrentUnitDate || '',
          basicPay: emp.basicPay || '',
          initialLfpBalance: emp.initialLfpBalance || 0,
          attachedToRef: emp.attachedToRef || '',
          maritalStatus: emp.maritalStatus || 'Single',
          religion: emp.religion || 'Islam',
          motherName: emp.motherName || '',
          placeOfBirth: emp.placeOfBirth || '',
          height: emp.height || '',
          weight: emp.weight || '',
          distinguishingMarks: emp.distinguishingMarks || '',
          medicalCategory: emp.medicalCategory || 'AYE',
          qualification: emp.qualification || 'Matric',
          emergencyContact: emp.emergencyContact || '',
          emergencyContactRelation: emp.emergencyContactRelation || '',
          pensionAccount: emp.pensionAccount || '',
          gpfAccount: emp.gpfAccount || '',
          domicileDistrict: emp.domicileDistrict || '',
          languages: emp.languages || 'Urdu, English',
          itSkills: emp.itSkills || '',
          nokAddress: emp.nokAddress || '',
          phones: emp.phones?.length
            ? emp.phones.map((p: any) => ({
                number: p.phoneNumber || '',
                brand: p.brand || '',
                model: p.model || '',
                imei1: p.imei1 || '',
                imei2: p.imei2 || '',
              }))
            : [{ number: '', brand: '', model: '', imei1: '', imei2: '' }],
          letters: [
            {
              type: 'Appointment',
              refNo: appointmentLetter?.referenceNumber || '',
              refDate: appointmentLetter?.referenceDate
                ? format(
                    new Date(appointmentLetter.referenceDate),
                    'yyyy-MM-dd'
                  )
                : '',
              fileName: appointmentLetter?.fileName || '',
              fileNo: appointmentLetter?.fileNumber || '',
              filePath: appointmentLetter?.filePath || '',
            },
            {
              type: 'Joining',
              refNo: joiningLetter?.referenceNumber || '',
              refDate: joiningLetter?.referenceDate
                ? format(new Date(joiningLetter.referenceDate), 'yyyy-MM-dd')
                : '',
              fileName: joiningLetter?.fileName || '',
              fileNo: joiningLetter?.fileNumber || '',
              filePath: joiningLetter?.filePath || '',
            },
            {
              type: 'Transfer',
              refNo: transferLetter?.referenceNumber || '',
              refDate: transferLetter?.referenceDate
                ? format(new Date(transferLetter.referenceDate), 'yyyy-MM-dd')
                : '',
              fileName: transferLetter?.fileName || '',
              fileNo: transferLetter?.fileNumber || '',
              filePath: transferLetter?.filePath || '',
            },
          ],
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

  const handleUploadPhoto = async () => {
    try {
      const fileData = await (window as any).ipcRenderer.invoke('select-file', { properties: ['openFile'], filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }] });
      if (fileData) {
        toast.info('Uploading photo...');
        const filename = await (window as any).ipcRenderer.invoke('upload-file', { sourcePath: fileData.path, filename: fileData.name });
        setForm({ ...form, photo: filename });
        toast.success('Photo uploaded');
      }
    } catch (err) {
      toast.error('Failed to upload photo');
    }
  };

  const handleUploadLetter = async (type: string) => {
    try {
      const fileData = await (window as any).ipcRenderer.invoke('select-file', { properties: ['openFile'], filters: [{ name: 'Documents', extensions: ['pdf', 'jpg', 'jpeg', 'png'] }] });
      if (fileData) {
        toast.info('Uploading document...');
        const filename = await (window as any).ipcRenderer.invoke('upload-file', { sourcePath: fileData.path, filename: fileData.name });
        
        const newLetters = form.letters.map((l: any) =>
          l.type === type ? { ...l, filePath: filename, fileName: fileData.name } : l
        );
        setForm({ ...form, letters: newLetters });
        toast.success('Document attached');
      }
    } catch (err) {
      toast.error('Failed to attach document');
    }
  };

  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    const fetchPreview = async (filename: string) => {
      if (filename && !previewUrls[filename]) {
        try {
          const b64 = await (window as any).ipcRenderer.invoke('read-file-base64', filename);
          if (b64) setPreviewUrls(prev => ({ ...prev, [filename]: b64 }));
        } catch (e) {
          console.error(e);
        }
      }
    };
    if (form.photo) fetchPreview(form.photo);
  }, [form.photo]);

  const handleSubmit = () => {
    if (!form.serviceNo || !form.name || !form.rankId || !form.departmentId || !form.basicPay) {
      toast.error('Please fill all required fields marked with *');
      return;
    }

    upsertEmployee(form, {
      onSuccess: () => {
        createLog({
          user: localStorage.getItem('username') || 'Admin',
          action: isEdit ? 'UPDATE' : 'CREATE',
          entity: `Personnel: ${form.serviceNo} - ${form.name}`,
          result: 'Success',
        });
        toast.success(
          isEdit ? 'Record updated' : 'Personnel enrolled successfully'
        );
        navigate('/employment-records');
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to save record');
      },
    });
  };

  const handleRankChange = (rankId: string) => {
    const rank = (ranks as any[]).find((r) => r.id === rankId);
    if (rank) {
      setForm({
        ...form,
        rankId,
        bps: rank.bps || '',
        cardType: rank.cadre || form.cardType,
      });
    } else {
      setForm({ ...form, rankId });
    }
  };

  return (
    <AppShell>
      <PageHeader
        title={isEdit ? 'Edit Employment Record' : 'New Employment Record'}
        subtitle={
          isEdit
            ? `Modifying record · ${form.serviceNo}`
            : 'Civilian Staff Enrollment Form'
        }
        actions={
          <>
            <Btn variant="outline" onClick={() => navigate(-1)}>
              <X className="w-4 h-4" /> Cancel
            </Btn>
            <Btn variant="gold" onClick={handleSubmit}>
              <FileCheck2 className="w-4 h-4" /> Submit Record
            </Btn>
          </>
        }
      />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8 space-y-5">
          <Section title="01 · Service Details">
            <div className="flex gap-4 mb-4 items-start">
              <div 
                className="w-24 h-24 bg-muted/50 border-2 border-dashed border-border rounded-sm flex flex-col items-center justify-center cursor-pointer hover:bg-accent/10 transition-colors shrink-0 overflow-hidden"
                onClick={handleUploadPhoto}
              >
                {form.photo && previewUrls[form.photo] ? (
                  <img src={previewUrls[form.photo]} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <User className="w-8 h-8 text-muted-foreground mb-1" />
                    <span className="text-[0.6rem] font-bold uppercase text-muted-foreground text-center">Add<br/>Photo</span>
                  </>
                )}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <Field label="Service Number" required>
                  <Input
                    value={form.serviceNo}
                    onChange={(e) =>
                      setForm({ ...form, serviceNo: e.target.value })
                    }
                    placeholder="xxxxx"
                  />
                </Field>
                <Field label="Rank" required>
                  <Select
                    value={form.rankId}
                    onChange={(e) => handleRankChange(e.target.value)}
                  >
                    <option value="">Select Rank</option>
                    {ranks.map((r: any) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Department" required>
                <Select
                  value={form.departmentId}
                  onChange={(e) =>
                    setForm({ ...form, departmentId: e.target.value })
                  }
                >
                  <option value="">Select Department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Card Type" required>
                <Input
                  value={form.cardType}
                  disabled
                  className="bg-muted/50 font-bold text-primary"
                />
              </Field>
              <Field label="BPS Grade" required>
                <Input
                  value={form.bps}
                  disabled
                  className="bg-muted/50 font-bold text-primary"
                />
              </Field>
              <Field label="Attached To">
                <Input
                  value={form.attachedTo}
                  onChange={(e) => setForm({ ...form, attachedTo: e.target.value })}
                  placeholder="e.g. Naval Dockyard"
                />
              </Field>
              <Field label="Attached To Ref No">
                <Input
                  value={form.attachedToRef}
                  onChange={(e) => setForm({ ...form, attachedToRef: e.target.value })}
                  placeholder="Attachment reference number"
                />
              </Field>
            </div>
          </Section>

          <Section title="02 · Appointment & Joining">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date of Appointment" required>
                <Input
                  type="date"
                  value={form.appointmentDate}
                  onChange={(e) =>
                    setForm({ ...form, appointmentDate: e.target.value })
                  }
                />
              </Field>
              <Field label="Date of Joining" required>
                <Input
                  type="date"
                  value={form.joiningDate}
                  onChange={(e) =>
                    setForm({ ...form, joiningDate: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {['Appointment', 'Joining', 'Transfer'].map((type) => {
                const ltr = form.letters.find((l: any) => l.type === type);
                return (
                  <div
                    key={type}
                    className="space-y-3 p-4 border border-border rounded-sm bg-muted/10"
                  >
                    <h4 className="heading-mil text-[0.7rem] text-primary">
                      {type} Letter
                    </h4>
                    <Field label="Ref Number">
                      <Input
                        value={ltr?.refNo || ''}
                        onChange={(e) =>
                          handleLetterChange(type, 'refNo', e.target.value)
                        }
                      />
                    </Field>
                    <div className="pt-2">
                      {ltr?.filePath ? (
                        <div className="flex items-center justify-between text-xs p-2 bg-card border border-border rounded-sm">
                          <span className="truncate max-w-[100px]" title={ltr.fileName}>{ltr.fileName || 'Document'}</span>
                          <button onClick={() => handleLetterChange(type, 'filePath', '')} className="text-destructive"><X className="w-3 h-3" /></button>
                        </div>
                      ) : (
                        <Btn variant="outline" className="w-full text-xs h-8" onClick={() => handleUploadLetter(type)}>
                          <FileCheck2 className="w-3 h-3 mr-1" /> Attach
                        </Btn>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <Section title="03 · Personal Details">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Full Name" required>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Father's Name" required>
                <Input
                  value={form.fatherName}
                  onChange={(e) =>
                    setForm({ ...form, fatherName: e.target.value })
                  }
                />
              </Field>
              <Field label="Mother's Name">
                <Input
                  value={form.motherName}
                  onChange={(e) =>
                    setForm({ ...form, motherName: e.target.value })
                  }
                />
              </Field>
              <Field label="CNIC" required>
                <Input
                  value={form.cnic}
                  onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                  placeholder="xxxxx-xxxxxxx-x"
                />
              </Field>
              <Field label="Date of Birth" required>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </Field>
              <Field label="Gender">
                <Select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option>Male</option>
                  <option>Female</option>
                </Select>
              </Field>
              <Field label="Blood Group">
                <Select
                  value={form.bloodGroup}
                  onChange={(e) =>
                    setForm({ ...form, bloodGroup: e.target.value })
                  }
                >
                  <option>A+</option>
                  <option>B+</option>
                  <option>O+</option>
                  <option>AB+</option>
                  <option>A-</option>
                  <option>B-</option>
                  <option>O-</option>
                  <option>AB-</option>
                </Select>
              </Field>
              <Field label="Marital Status">
                <Select
                  value={form.maritalStatus}
                  onChange={(e) =>
                    setForm({ ...form, maritalStatus: e.target.value })
                  }
                >
                  <option>Single</option>
                  <option>Married</option>
                  <option>Widowed</option>
                  <option>Divorced</option>
                </Select>
              </Field>
              <Field label="Religion">
                <Input
                  value={form.religion}
                  onChange={(e) =>
                    setForm({ ...form, religion: e.target.value })
                  }
                  placeholder="e.g. Islam"
                />
              </Field>
              <Field label="Place of Birth">
                <Input
                  value={form.placeOfBirth}
                  onChange={(e) =>
                    setForm({ ...form, placeOfBirth: e.target.value })
                  }
                  placeholder="e.g. Karachi"
                />
              </Field>
              <Field label="Phone Number">
                <Input
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                  placeholder="03xx-xxxxxxx"
                />
              </Field>
            </div>
          </Section>

          <Section title="04 · Address & Domicile">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Present Address">
                <Input
                  value={form.presentAddress}
                  onChange={(e) =>
                    setForm({ ...form, presentAddress: e.target.value })
                  }
                  placeholder="Current residential address"
                />
              </Field>
              <Field label="Permanent Address">
                <Input
                  value={form.permanentAddress}
                  onChange={(e) =>
                    setForm({ ...form, permanentAddress: e.target.value })
                  }
                  placeholder="Home town address"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Domicile Province">
                <Input
                  value={form.domicile}
                  onChange={(e) =>
                    setForm({ ...form, domicile: e.target.value })
                  }
                  placeholder="e.g. Punjab"
                />
              </Field>
              <Field label="Domicile District">
                <Input
                  value={form.domicileDistrict}
                  onChange={(e) =>
                    setForm({ ...form, domicileDistrict: e.target.value })
                  }
                  placeholder="e.g. Rawalpindi"
                />
              </Field>
            </div>
          </Section>

          <Section title="05 · Education & Skills">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Highest Qualification">
                <Select
                  value={form.qualification}
                  onChange={(e) =>
                    setForm({ ...form, qualification: e.target.value })
                  }
                >
                  <option>Matric</option>
                  <option>Intermediate</option>
                  <option>Bachelor</option>
                  <option>Master</option>
                  <option>PhD</option>
                  <option>Diploma</option>
                  <option>Other</option>
                </Select>
              </Field>
              <Field label="Languages Spoken">
                <Input
                  value={form.languages}
                  onChange={(e) =>
                    setForm({ ...form, languages: e.target.value })
                  }
                  placeholder="e.g. Urdu, English"
                />
              </Field>

            </div>
          </Section>

          <Section title="06 · Physical Profile">
            <div className="grid grid-cols-4 gap-4">
              <Field label="Height">
                <Input
                  value={form.height}
                  onChange={(e) =>
                    setForm({ ...form, height: e.target.value })
                  }
                  placeholder={"e.g. 5'8\""}
                />
              </Field>
              <Field label="Weight">
                <Input
                  value={form.weight}
                  onChange={(e) =>
                    setForm({ ...form, weight: e.target.value })
                  }
                  placeholder="e.g. 70 kg"
                />
              </Field>
              <Field label="Distinguishing Marks">
                <Input
                  value={form.distinguishingMarks}
                  onChange={(e) =>
                    setForm({ ...form, distinguishingMarks: e.target.value })
                  }
                  placeholder="e.g. Mole on right cheek"
                />
              </Field>
              <Field label="Medical Category">
                <Input
                  value={form.medicalCategory}
                  onChange={(e) =>
                    setForm({ ...form, medicalCategory: e.target.value })
                  }
                  placeholder="e.g. AYE"
                />
              </Field>
            </div>
          </Section>

          <Section title="07 · Phone Support">
            <div className="space-y-4">
              {form.phones.map((phone: any, idx: number) => (
                <div
                  key={idx}
                  className="flex gap-3 items-end p-4 border border-border rounded-sm bg-muted/5"
                >
                  <div className="grid grid-cols-5 gap-3 flex-1">
                    <Field label="Phone Number">
                      <Input
                        value={phone.number}
                        onChange={(e) =>
                          handlePhoneChange(idx, 'number', e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Brand">
                      <Input
                        value={phone.brand}
                        onChange={(e) =>
                          handlePhoneChange(idx, 'brand', e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Model">
                      <Input
                        value={phone.model}
                        onChange={(e) =>
                          handlePhoneChange(idx, 'model', e.target.value)
                        }
                      />
                    </Field>
                    <Field label="IMEI 1">
                      <Input
                        value={phone.imei1}
                        onChange={(e) =>
                          handlePhoneChange(idx, 'imei1', e.target.value)
                        }
                      />
                    </Field>
                    <Field label="IMEI 2">
                      <Input
                        value={phone.imei2}
                        onChange={(e) =>
                          handlePhoneChange(idx, 'imei2', e.target.value)
                        }
                      />
                    </Field>
                  </div>
                  {form.phones.length > 1 && (
                    <button
                      onClick={() =>
                        setForm({
                          ...form,
                          phones: form.phones.filter(
                            (_: any, i: number) => i !== idx
                          ),
                        })
                      }
                      className="mb-1 p-2 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() =>
                  setForm({
                    ...form,
                    phones: [
                      ...form.phones,
                      {
                        number: '',
                        brand: '',
                        model: '',
                        imei1: '',
                        imei2: '',
                      },
                    ],
                  })
                }
                className="w-full py-2 border-2 border-dashed border-border rounded-sm text-xs font-semibold"
              >
                + Add Another Phone
              </button>
            </div>
          </Section>
        </div>

        <div className="col-span-4 space-y-5">
          <Section title="Financial Details">
            <Field label="Basic Pay" required>
              <Input
                type="number"
                value={form.basicPay}
                onChange={(e) =>
                  setForm({ ...form, basicPay: e.target.value })
                }
                placeholder="Enter Basic Pay"
              />
            </Field>
            <Field label="Initial LFP Balance (Days)">
              <Input
                type="number"
                value={form.initialLfpBalance}
                onChange={(e) =>
                  setForm({ ...form, initialLfpBalance: parseInt(e.target.value) || 0 })
                }
                placeholder="Enter days"
              />
            </Field>
            <Field label="Account Number">
              <Input
                value={form.accountNo}
                onChange={(e) =>
                  setForm({ ...form, accountNo: e.target.value })
                }
                placeholder="Enter Account No"
              />
            </Field>
            <Field label="Bank Name">
              <Input
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              />
            </Field>

          </Section>

          <Section title="Next of Kin">
            <Field label="Name">
              <Input
                value={form.nokName}
                onChange={(e) => setForm({ ...form, nokName: e.target.value })}
              />
            </Field>
            <Field label="Relation">
              <Input
                value={form.nokRelation}
                onChange={(e) =>
                  setForm({ ...form, nokRelation: e.target.value })
                }
              />
            </Field>
            <Field label="Contact">
              <Input
                value={form.nokContact}
                onChange={(e) =>
                  setForm({ ...form, nokContact: e.target.value })
                }
              />
            </Field>
            <Field label="CNIC">
              <Input
                value={form.nokCnic}
                onChange={(e) => setForm({ ...form, nokCnic: e.target.value })}
              />
            </Field>
            <Field label="Address">
              <Input
                value={form.nokAddress}
                onChange={(e) =>
                  setForm({ ...form, nokAddress: e.target.value })
                }
              />
            </Field>
          </Section>

          <Section title="Emergency Contact">
            <Field label="Emergency Contact Name">
              <Input
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                placeholder="Contact person name"
              />
            </Field>
          </Section>
        </div>
      </div>
    </AppShell>
  );
};

export default EmploymentRecordForm;
