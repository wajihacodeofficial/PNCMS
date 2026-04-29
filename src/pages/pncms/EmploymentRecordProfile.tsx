import { useState, useMemo } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import {
  Btn,
  Badge,
  Section,
  StatCard,
  Field,
  Input,
} from '@/components/pncms/ui-kit';
import {
  Printer,
  Pencil,
  Download,
  Phone,
  MapPin,
  Building2,
  IdCard,
  Wallet,
  CalendarDays,
  ClipboardList,
  ShieldCheck,
  History,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  ArrowUpCircle,
  ExternalLink,
  Clock,
  FileText,
  User,
  UserCheck,
  Anchor,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import * as Tabs from '@radix-ui/react-tabs';
import {
  intervalToDuration,
  formatDuration,
  subDays,
  format,
  isWithinInterval,
  parse,
} from 'date-fns';
import { Switch } from '@/components/ui/switch';

const EmploymentRecordProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isActive, setIsActive] = useState(true);

  const { tenureStr, isMinisterial } = useMemo(() => {
    const isMin = id?.includes('1042') || true;
    const joiningUnitDate = new Date('2022-01-15');
    const unitDuration = intervalToDuration({
      start: joiningUnitDate,
      end: new Date(),
    });
    const str = formatDuration(unitDuration, {
      format: ['years', 'months', 'days'],
      delimiter: ', ',
    });
    return { tenureStr: str, isMinisterial: isMin };
  }, [id]);

  const [transfers, setTransfers] = useState<any[]>([
    {
      id: '1',
      date: '12-Mar-2012',
      event: 'Initial Appointment',
      type: 'appointment',
      ref: 'NHQ/APP/2012/99',
      unit: 'PNS Bahadur',
      prevUnit: '-',
      toUnit: '-',
      fromUnit: '-',
      remarks: 'Enrolled as LDC',
    },
    {
      id: '2',
      date: '15-May-2024',
      event: 'Transferred From',
      type: 'transfer',
      ref: 'NHQ/TRF/24/112',
      unit: '-',
      prevUnit: 'PNS Bahadur',
      toUnit: 'PNS Dilawar',
      fromUnit: '-',
      remarks: 'Posted to Admin Directorate',
    },
    {
      id: '3',
      date: '16-May-2024',
      event: 'Transferred To',
      type: 'transfer',
      ref: 'NHQ/TRF/24/113',
      unit: '-',
      prevUnit: '-',
      toUnit: '-',
      fromUnit: 'PNS Dilawar',
      remarks: 'Assigned as Assistant',
    },
  ]);

  const [attachments, setAttachments] = useState<any[]>([
    {
      id: '1',
      date: '01-Sep-2025',
      event: 'Unit Attachment',
      type: 'attachment',
      ref: 'ATT//2025/08',
      attachedFrom: 'NHQ Islamabad',
      attachedTo: 'Naval Dockyard',
      tenderUnit: 'External Unit',
    },
  ]);

  const [courses, setCourses] = useState<any[]>([
    {
      id: '1',
      title: 'Civilian Staff Induction',
      loc: 'Naval Academy',
      start: '15-Apr-2012',
      end: '30-May-2012',
      dur: '45 Days',
      ref: 'NHQ/EDU/12/42',
    },
    {
      id: '2',
      title: 'Advance IT Skills',
      loc: 'NIIT Islamabad',
      start: '01-Jan-2018',
      end: '31-Mar-2018',
      dur: '90 Days',
      ref: 'DTE/IT/2018/11',
    },
    {
      id: '3',
      title: 'Public Procurement Rules',
      loc: 'NHQ Islamabad',
      start: '10-Oct-2023',
      end: '24-Oct-2023',
      dur: '14 Days',
      ref: 'ADM/PP/2023/04',
    },
  ]);

  const [promotions, setPromotions] = useState<any[]>([
    {
      id: '1',
      prev: 'LDC',
      promoted: 'UDC',
      date: '15-Aug-2018',
      ref: 'DPC-2018-091',
      batch: 'Batch-24',
      course: 'IT Foundation',
    },
    {
      id: '2',
      prev: 'UDC',
      promoted: 'Assistant',
      date: '04-Jan-2022',
      ref: 'DPC-2022-114',
      batch: 'Batch-31',
      course: 'Advance Admin',
    },
  ]);

  const [disciplines, setDisciplines] = useState<any[]>([]);

  // NEW: State for Leave Records to sync with Attendance
  const [leaveRecords, setLeaveRecords] = useState<any[]>([
    {
      type: 'Casual Leave',
      start: '2026-02-12',
      end: '2026-02-14',
      days: 3,
      ref: 'LVE/2026/02/12',
    },
    {
      type: 'Recreation Leave',
      start: '2026-01-10',
      end: '2026-01-24',
      days: 15,
      ref: 'LVE/2026/01/05',
    },
    {
      type: 'Earned Leave',
      start: '2025-11-01',
      end: '2025-11-10',
      days: 10,
      ref: 'LVE/2025/11/01',
    },
    {
      type: 'Casual Leave',
      start: '2025-03-14',
      end: '2025-03-16',
      days: 3,
      ref: 'LVE/2025/03/14',
    },
    // Adding one active leave for testing visibility
    {
      type: 'Casual Leave',
      start: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
      days: 3,
      ref: 'LVE/2026/ACTIVE',
    },
  ]);

  const initialAttendance = useMemo(() => {
    const start = new Date('2024-05-16');
    const end = new Date();
    const days = Math.max(
      0,
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );

    return Array.from({ length: days + 1 }).map((_, i) => {
      const d = subDays(end, i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

      // Check if this date falls within any leave record
      let status = isWeekend ? 'Weekend' : 'Present';
      const activeLeave = leaveRecords.find((l) => {
        const lStart = new Date(l.start);
        const lEnd = new Date(l.end);
        // Normalize time to midnight for accurate comparison
        lStart.setHours(0, 0, 0, 0);
        lEnd.setHours(23, 59, 59, 999);
        return d >= lStart && d <= lEnd;
      });

      if (activeLeave) {
        status = activeLeave.type;
      }

      return {
        id: i.toString(),
        d: format(d, 'dd-MMM-yyyy'),
        s: status,
      };
    });
  }, [leaveRecords]);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    fields: { key: string; label: string; type?: string }[];
    data: any;
    onSave: (data: any) => void;
  }>({ isOpen: false, title: '', fields: [], data: {}, onSave: () => {} });

  const [showLeaveDetails, setShowLeaveDetails] = useState(false);

  const openModal = (
    title: string,
    fields: { key: string; label: string; type?: string }[],
    initialData: any,
    onSave: (d: any) => void
  ) => {
    setModal({ isOpen: true, title, fields, data: initialData || {}, onSave });
  };

  const handleModalSave = () => {
    modal.onSave({ ...modal.data, id: modal.data.id || Date.now().toString() });
    setModal({ ...modal, isOpen: false });
  };

  const transferFields = [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'event', label: 'Event Name' },
    { key: 'type', label: 'Type (appointment/transfer)' },
    { key: 'ref', label: 'Ref Letter' },
    { key: 'unit', label: 'Unit (Initial Appointment)' },
    { key: 'prevUnit', label: 'Previous Unit' },
    { key: 'toUnit', label: 'Transferred To' },
    { key: 'fromUnit', label: 'Transferred From' },
    { key: 'remarks', label: 'Remarks' },
  ];

  const attachmentFields = [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'event', label: 'Event Name' },
    { key: 'ref', label: 'Ref Letter' },
    { key: 'attachedFrom', label: 'Attached From' },
    { key: 'attachedTo', label: 'Attached To' },
    { key: 'tenderUnit', label: 'Tender / External Unit' },
  ];

  const courseFields = [
    { key: 'title', label: 'Course Title' },
    { key: 'loc', label: 'Location' },
    { key: 'start', label: 'Start Date', type: 'date' },
    { key: 'end', label: 'End Date', type: 'date' },
    { key: 'dur', label: 'Duration' },
    { key: 'ref', label: 'Ref Letter' },
  ];

  const promotionFields = [
    { key: 'prev', label: 'Previous Rank' },
    { key: 'promoted', label: 'Promoted To' },
    { key: 'date', label: 'Effective Date', type: 'date' },
    { key: 'ref', label: 'Ref Letter' },
    { key: 'batch', label: 'Batch' },
    { key: 'course', label: 'Course' },
  ];

  const disciplineFields = [
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'action', label: 'Action Taken' },
    { key: 'reason', label: 'Reason' },
    { key: 'ref', label: 'Ref Letter' },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Employment Record Profile"
        subtitle={`Service Record · ${id ?? '-1042'}`}
        actions={
          <>
            <Btn variant="outline">
              <Printer className="w-4 h-4" /> Print Profile
            </Btn>
            <Btn variant="outline">
              <Download className="w-4 h-4" /> Export PDF
            </Btn>
            <Btn
              variant="gold"
              onClick={() =>
                navigate(`/employment-records/edit/${id ?? '-1042'}`)
              }
            >
              <Pencil className="w-4 h-4" /> Edit Record
            </Btn>
          </>
        }
      />

      <div className="flex gap-6 mb-6">
        <div className="w-80 shrink-0">
          <div className="panel overflow-hidden border-t-4 border-t-accent">
            <div className="p-6 text-center">
              <div className="w-32 h-40 mx-auto bg-muted rounded-sm flex items-center justify-center mb-4 shadow-inner border border-border">
                <User className="w-16 h-16 text-muted-foreground/20" />
              </div>
              <h2 className="text-xl font-heading font-bold text-primary">
                Muhammad Tariq Khan
              </h2>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                {id ?? '-1042'}
              </p>

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
                <Badge variant={isMinisterial ? 'info' : 'warning'}>
                  {isMinisterial ? 'Ministerial' : 'Industrial'}
                </Badge>
              </div>
            </div>

            <div className="border-t border-border p-4 bg-muted/20 space-y-3">
              <div className="flex items-center gap-3 text-xs">
                <Building2 className="w-4 h-4 text-accent" />
                <div className="flex flex-col">
                  <span className="label-mil text-[0.6rem] text-muted-foreground">
                    Department
                  </span>
                  <span className="font-semibold text-primary">
                    Administration
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <MapPin className="w-4 h-4 text-accent" />
                <div className="flex flex-col">
                  <span className="label-mil text-[0.6rem] text-muted-foreground">
                    Unit Location
                  </span>
                  <span className="text-foreground/80">NHQ Islamabad</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <CalendarDays className="w-4 h-4 text-accent" />
                <div className="flex flex-col">
                  <span className="label-mil text-[0.6rem] text-muted-foreground">
                    Joining Date (PNS Dilawar)
                  </span>
                  <span className="text-foreground/80 font-mono">
                    16-May-2024
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Phone className="w-4 h-4 text-accent" />
                <span className="text-foreground/80">+92-300-1234567</span>
              </div>
            </div>

            <div
              className={`p-4 transition-colors flex justify-between items-center ${isActive ? 'bg-primary' : 'bg-muted'}`}
            >
              <div className="flex flex-col">
                <span className="text-[0.6rem] font-bold tracking-widest uppercase text-white/70">
                  Current Status
                </span>
                <span
                  className={`text-xs font-bold uppercase ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                >
                  {isActive ? 'Active' : 'Inactive'}
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

        <div className="flex-1">
          <Tabs.Root defaultValue="overview" className="flex flex-col h-full">
            <Tabs.List className="flex gap-1 border-b border-border mb-4">
              <TabTrigger value="overview" label="Overview" icon={UserCheck} />
              <TabTrigger
                value="service"
                label="Service Timeline"
                icon={History}
              />
              <TabTrigger
                value="career"
                label="Courses & Promotion"
                icon={GraduationCap}
              />
              <TabTrigger
                value="financial"
                label={isMinisterial ? 'Late Sitting' : 'Overtime'}
                icon={Clock}
              />
              <TabTrigger
                value="attendance"
                label="Attendance & Leave"
                icon={CalendarDays}
              />
              <TabTrigger
                value="discipline"
                label="Discipline"
                icon={ShieldCheck}
              />
            </Tabs.List>

            <Tabs.Content
              value="overview"
              className="space-y-5 animate-in fade-in slide-in-from-right-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Service Tenure"
                  value="14 Years"
                  sub="Joined 2012"
                  accent="primary"
                  icon={<CalendarDays className="w-5 h-5" />}
                />
                <StatCard
                  label="BPS Grade"
                  value="BPS-14"
                  sub="Last Promoted 2022"
                  accent="info"
                  icon={<FileText className="w-5 h-5" />}
                />
              </div>

              <Section title="Basic Personnel Details">
                <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm">
                  <DataRow label="Father's Name" value="Khan Muhammad" />
                  <DataRow label="CNIC" value="42101-1234567-1" />
                  <DataRow label="DOB" value="08-Aug-1984" />
                  <DataRow label="Gender" value="Male" />
                  <DataRow label="Blood Group" value="B+" />
                  <DataRow label="Domicile" value="Sindh / Karachi" />
                  <DataRow
                    label="Permanent Addr."
                    value="House 12-B, PN Colony, Karsaz, Karachi"
                  />
                  <DataRow
                    label="Present Addr."
                    value="Block 4, NHQ Staff Quarters, Islamabad"
                  />
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
                    <DataRow
                      label="Bank Name"
                      value="National Bank of Pakistan"
                    />
                    <DataRow label="Account No" value="401278219981" />
                    <DataRow label="Branch" value="Karsaz (0412)" />
                    <AccountTypeRow
                      label="Account Type"
                      value="Salary Current"
                    />
                  </div>
                </Section>
              </div>
            </Tabs.Content>

            <Tabs.Content
              value="service"
              className="space-y-5 animate-in fade-in slide-in-from-right-2"
            >
              <div className="grid grid-cols-1 gap-5">
                <Section title="Appointments & Transfers">
                  <div className="flex justify-end mb-4">
                    <Btn
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openModal(
                          'Add Transfer',
                          transferFields,
                          { type: 'transfer' },
                          (d) => setTransfers([...transfers, d])
                        )
                      }
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Record
                    </Btn>
                  </div>
                  <div className="overflow-x-auto -m-5 mt-0">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Event</th>
                          <th>Unit / Details</th>
                          <th>Ref. Letter</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transfers.map((t) => (
                          <tr key={t.id}>
                            <td className="text-xs font-mono font-bold text-accent">
                              {t.date}
                            </td>
                            <td className="font-bold text-primary">
                              <div className="flex items-center gap-2">
                                {t.type === 'transfer' ? (
                                  <ArrowRight className="w-3.5 h-3.5 text-info" />
                                ) : (
                                  <FileText className="w-3.5 h-3.5 text-accent" />
                                )}
                                {t.event}
                              </div>
                            </td>
                            <td className="text-xs">
                              {t.type === 'appointment' && (
                                <span>{t.unit}</span>
                              )}
                              {t.type === 'transfer' && (
                                <div className="space-y-1">
                                  {t.prevUnit && t.prevUnit !== '-' && (
                                    <div>
                                      <span className="text-muted-foreground mr-2">
                                        Prev:
                                      </span>
                                      {t.prevUnit}
                                    </div>
                                  )}
                                  {t.toUnit && t.toUnit !== '-' && (
                                    <div>
                                      <span className="text-muted-foreground mr-2">
                                        To:
                                      </span>
                                      {t.toUnit}
                                    </div>
                                  )}
                                  {t.fromUnit && t.fromUnit !== '-' && (
                                    <div>
                                      <span className="text-muted-foreground mr-2">
                                        From:
                                      </span>
                                      {t.fromUnit}
                                    </div>
                                  )}
                                  {t.remarks && t.remarks !== '-' && (
                                    <div>
                                      <span className="text-muted-foreground mr-2">
                                        Remarks:
                                      </span>
                                      <span className="font-semibold italic text-foreground/80">
                                        {t.remarks}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="text-[0.65rem] font-mono">
                              <Badge variant="neutral">{t.ref}</Badge>
                            </td>
                            <td className="text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() =>
                                    openModal(
                                      'Edit Transfer',
                                      transferFields,
                                      t,
                                      (d) =>
                                        setTransfers(
                                          transfers.map((x) =>
                                            x.id === d.id ? d : x
                                          )
                                        )
                                    )
                                  }
                                  className="p-1 rounded bg-muted hover:bg-muted/80 text-primary"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    setTransfers(
                                      transfers.filter((x) => x.id !== t.id)
                                    )
                                  }
                                  className="p-1 rounded bg-muted hover:bg-destructive/20 text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>

                <Section title="Attachments">
                  <div className="flex justify-end mb-4">
                    <Btn
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openModal(
                          'Add Attachment',
                          attachmentFields,
                          { type: 'attachment' },
                          (d) => setAttachments([...attachments, d])
                        )
                      }
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Record
                    </Btn>
                  </div>
                  <div className="overflow-x-auto -m-5 mt-0">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Event</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Mode</th>
                          <th>Ref. Letter</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attachments.map((a) => (
                          <tr key={a.id}>
                            <td className="text-xs font-mono font-bold text-accent">
                              {a.date}
                            </td>
                            <td className="font-bold text-primary">
                              <div className="flex items-center gap-2">
                                <ExternalLink className="w-3.5 h-3.5 text-warning" />
                                {a.event}
                              </div>
                            </td>
                            <td className="text-xs">{a.attachedFrom}</td>
                            <td className="text-xs font-semibold text-warning">
                              {a.attachedTo}
                            </td>
                            <td className="text-xs">{a.tenderUnit}</td>
                            <td className="text-[0.65rem] font-mono">
                              <Badge variant="neutral">{a.ref}</Badge>
                            </td>
                            <td className="text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() =>
                                    openModal(
                                      'Edit Attachment',
                                      attachmentFields,
                                      a,
                                      (d) =>
                                        setAttachments(
                                          attachments.map((x) =>
                                            x.id === d.id ? d : x
                                          )
                                        )
                                    )
                                  }
                                  className="p-1 rounded bg-muted hover:bg-muted/80 text-primary"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    setAttachments(
                                      attachments.filter((x) => x.id !== a.id)
                                    )
                                  }
                                  className="p-1 rounded bg-muted hover:bg-destructive/20 text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>
              </div>
            </Tabs.Content>

            <Tabs.Content
              value="career"
              className="space-y-5 animate-in fade-in slide-in-from-right-2"
            >
              <div className="grid grid-cols-1 gap-5">
                <Section title="Professional Courses & Trainings">
                  <div className="flex justify-end mb-4">
                    <Btn
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openModal('Add Course', courseFields, {}, (d) =>
                          setCourses([...courses, d])
                        )
                      }
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Record
                    </Btn>
                  </div>
                  <div className="overflow-x-auto -m-5 mt-0">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Course Title</th>
                          <th>Location</th>
                          <th>Duration</th>
                          <th>Ref. Letter</th>
                          <th className="text-right">Period</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {courses.map((c) => (
                          <tr key={c.id}>
                            <td className="font-bold text-primary">
                              {c.title}
                            </td>
                            <td className="text-xs">{c.loc}</td>
                            <td className="text-xs font-mono">{c.dur}</td>
                            <td className="text-[0.65rem] font-mono text-accent">
                              {c.ref}
                            </td>
                            <td className="text-right text-[0.65rem] font-mono">
                              <div className="text-foreground">{c.start}</div>
                              <div className="text-muted-foreground">
                                to {c.end}
                              </div>
                            </td>
                            <td className="text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() =>
                                    openModal(
                                      'Edit Course',
                                      courseFields,
                                      c,
                                      (d) =>
                                        setCourses(
                                          courses.map((x) =>
                                            x.id === d.id ? d : x
                                          )
                                        )
                                    )
                                  }
                                  className="p-1 rounded bg-muted hover:bg-muted/80 text-primary"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    setCourses(
                                      courses.filter((x) => x.id !== c.id)
                                    )
                                  }
                                  className="p-1 rounded bg-muted hover:bg-destructive/20 text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>

                <Section title="Promotion History">
                  <div className="flex justify-end mb-4">
                    <Btn
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openModal('Add Promotion', promotionFields, {}, (d) =>
                          setPromotions([...promotions, d])
                        )
                      }
                    >
                      <Plus className="w-3 h-3 mr-1" /> Add Record
                    </Btn>
                  </div>
                  <div className="overflow-x-auto -m-5 mt-0">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Previous Rank</th>
                          <th>Promoted To</th>
                          <th>Batch / Course</th>
                          <th>Ref. Letter</th>
                          <th className="text-right">Effective Date</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {promotions.map((p) => (
                          <tr key={p.id}>
                            <td className="text-sm text-muted-foreground">
                              {p.prev}
                            </td>
                            <td className="font-bold text-primary">
                              <div className="flex items-center gap-2">
                                <ArrowUpCircle className="w-3.5 h-3.5 text-success" />
                                {p.promoted}
                              </div>
                            </td>
                            <td className="text-xs">
                              <div className="font-semibold">{p.batch}</div>
                              <div className="text-[0.65rem] text-muted-foreground">
                                {p.course}
                              </div>
                            </td>
                            <td className="text-[0.65rem] font-mono text-accent">
                              {p.ref}
                            </td>
                            <td className="text-right font-bold text-accent text-xs">
                              {p.date}
                            </td>
                            <td className="text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() =>
                                    openModal(
                                      'Edit Promotion',
                                      promotionFields,
                                      p,
                                      (d) =>
                                        setPromotions(
                                          promotions.map((x) =>
                                            x.id === d.id ? d : x
                                          )
                                        )
                                    )
                                  }
                                  className="p-1 rounded bg-muted hover:bg-muted/80 text-primary"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    setPromotions(
                                      promotions.filter((x) => x.id !== p.id)
                                    )
                                  }
                                  className="p-1 rounded bg-muted hover:bg-destructive/20 text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>
              </div>
            </Tabs.Content>

            <Tabs.Content
              value="financial"
              className="space-y-5 animate-in fade-in slide-in-from-right-2"
            >
              <Section
                title={
                  isMinisterial
                    ? 'Late Sitting History (Ministerial)'
                    : 'Overtime History (Industrial)'
                }
              >
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
                      {
                        p: 'Apr 2026',
                        r: 'SNC-2026-0142',
                        h: '40',
                        a: '4,200',
                        s: 'Pending',
                      },
                      {
                        p: 'Mar 2026',
                        r: 'SNC-2026-0118',
                        h: '45',
                        a: '4,725',
                        s: 'Approved',
                      },
                      {
                        p: 'Feb 2026',
                        r: 'SNC-2026-0091',
                        h: '30',
                        a: '3,150',
                        s: 'Approved',
                      },
                    ].map((row, i) => (
                      <tr key={i}>
                        <td>{row.p}</td>
                        <td className="font-mono text-xs text-primary">
                          {row.r}
                        </td>
                        <td>{row.h} hrs</td>
                        <td className="font-bold">Rs. {row.a}</td>
                        <td>
                          <Badge
                            variant={
                              row.s === 'Pending' ? 'warning' : 'success'
                            }
                          >
                            {row.s}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            </Tabs.Content>

            <Tabs.Content
              value="attendance"
              className="space-y-5 animate-in fade-in slide-in-from-right-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Section title="Attendance History (Since Joining PNS Dilawar)">
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {initialAttendance.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-2 border-b border-border text-xs"
                      >
                        <span className="font-mono font-bold">{a.d}</span>
                        <Badge
                          variant={
                            a.s === 'Present'
                              ? 'success'
                              : a.s === 'Weekend'
                                ? 'neutral'
                                : 'warning'
                          }
                        >
                          {a.s}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Section>
                <div className="space-y-5">
                  <Section title="Leave Balances">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-muted/20 rounded-sm">
                        <div>
                          <p className="text-xs font-bold text-primary">
                            Casual Leave (CL)
                          </p>
                          <p className="text-[0.65rem] text-muted-foreground">
                            Used: 03 · Remaining: 12
                          </p>
                        </div>
                        <div className="text-xl font-heading font-extrabold text-accent">
                          12
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/20 rounded-sm">
                        <div>
                          <p className="text-xs font-bold text-primary">
                            Earned Leave (EL)
                          </p>
                          <p className="text-[0.65rem] text-muted-foreground">
                            Used: 10 · Remaining: 38
                          </p>
                        </div>
                        <div className="text-xl font-heading font-extrabold text-accent">
                          38
                        </div>
                      </div>

                      <Btn
                        variant="outline"
                        className="w-full text-xs font-bold uppercase tracking-wider"
                        onClick={() => setShowLeaveDetails(true)}
                      >
                        Show Complete Details
                      </Btn>
                    </div>
                  </Section>
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content
              value="discipline"
              className="space-y-5 animate-in fade-in slide-in-from-right-2"
            >
              <Section title="Discipline & Warnings History">
                <div className="flex justify-end mb-4">
                  <Btn
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openModal(
                        'Add Discipline Record',
                        disciplineFields,
                        {},
                        (d) => setDisciplines([...disciplines, d])
                      )
                    }
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Record
                  </Btn>
                </div>
                {disciplines.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-border rounded-sm bg-muted/20">
                    <ShieldCheck className="w-12 h-12 text-success/30 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-primary">
                      No disciplinary actions on file
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Personnel has maintained a clean record since joining.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -m-5 mt-0">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Action Taken</th>
                          <th>Reason</th>
                          <th>Ref. Letter</th>
                          <th className="text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {disciplines.map((d) => (
                          <tr key={d.id}>
                            <td className="text-xs font-mono">{d.date}</td>
                            <td className="font-bold text-destructive">
                              {d.action}
                            </td>
                            <td className="text-xs">{d.reason}</td>
                            <td className="text-[0.65rem] font-mono text-accent">
                              {d.ref}
                            </td>
                            <td className="text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() =>
                                    openModal(
                                      'Edit Discipline Record',
                                      disciplineFields,
                                      d,
                                      (x) =>
                                        setDisciplines(
                                          disciplines.map((y) =>
                                            y.id === x.id ? x : y
                                          )
                                        )
                                    )
                                  }
                                  className="p-1 rounded bg-muted hover:bg-muted/80 text-primary"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDisciplines(
                                      disciplines.filter((x) => x.id !== d.id)
                                    )
                                  }
                                  className="p-1 rounded bg-muted hover:bg-destructive/20 text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-[60] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in">
          <div className="bg-card w-full max-w-xl rounded-md shadow-elevated border border-border flex flex-col">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg text-white font-heading font-bold">
                {modal.title}
              </h3>
              <button
                onClick={() => setModal({ ...modal, isOpen: false })}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {modal.fields.map((f) => (
                <Field key={f.key} label={f.label}>
                  <Input
                    type={f.type || 'text'}
                    value={modal.data[f.key] || ''}
                    onChange={(e) =>
                      setModal({
                        ...modal,
                        data: { ...modal.data, [f.key]: e.target.value },
                      })
                    }
                  />
                </Field>
              ))}
            </div>
            <div className="bg-muted/30 p-4 border-t border-border flex justify-end gap-3 mt-auto">
              <Btn
                variant="outline"
                onClick={() => setModal({ ...modal, isOpen: false })}
              >
                Cancel
              </Btn>
              <Btn variant="gold" onClick={handleModalSave}>
                Save Record
              </Btn>
            </div>
          </div>
        </div>
      )}

      {showLeaveDetails && (
        <div className="fixed inset-0 z-[60] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in">
          <div className="bg-card w-full max-w-4xl rounded-md shadow-elevated border border-border flex flex-col overflow-hidden">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg text-white font-heading font-bold">
                  Complete Leave Account
                </h3>
                <p className="text-xs text-white/70 font-mono mt-1">
                  Muhammad Tariq Khan · -1042
                </p>
              </div>
              <button
                onClick={() => setShowLeaveDetails(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto max-h-[80vh]">
              <table className="data-table">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th>Leave Category</th>
                    <th className="text-center">Entitlement / Credited</th>
                    <th className="text-center">Availed / Used</th>
                    <th className="text-right text-primary font-bold">
                      Balance Remaining
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-bold">Casual Leave (CL)</td>
                    <td className="text-center font-mono">15 days</td>
                    <td className="text-center font-mono text-destructive">
                      03 days
                    </td>
                    <td className="text-right font-mono font-bold text-success text-lg">
                      12 days
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">Earned Leave (EL)</td>
                    <td className="text-center font-mono">48 days</td>
                    <td className="text-center font-mono text-destructive">
                      10 days
                    </td>
                    <td className="text-right font-mono font-bold text-success text-lg">
                      38 days
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">Medical Leave (ML)</td>
                    <td className="text-center font-mono">10 days</td>
                    <td className="text-center font-mono text-destructive">
                      00 days
                    </td>
                    <td className="text-right font-mono font-bold text-success text-lg">
                      10 days
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">Recreation Leave (RL)</td>
                    <td className="text-center font-mono">15 days</td>
                    <td className="text-center font-mono text-destructive">
                      15 days
                    </td>
                    <td className="text-right font-mono font-bold text-muted-foreground text-lg">
                      00 days
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="p-6 border-t border-border bg-muted/10">
                <h4 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
                  <History className="w-4 h-4" /> Leave Availed History
                </h4>
                <div className="space-y-6">
                  {Object.entries(
                    leaveRecords.reduce((acc: any, curr: any) => {
                      const year = curr.start.split('-')[0];
                      if (!acc[year]) acc[year] = [];
                      acc[year].push(curr);
                      return acc;
                    }, {})
                  )
                    .sort((a: any, b: any) => b[0] - a[0])
                    .map(([year, records]: [string, any]) => (
                      <div key={year}>
                        <h5 className="text-xs font-bold font-mono text-accent mb-2 border-b border-border pb-1">
                          YEAR {year}
                        </h5>
                        <div className="space-y-2">
                          {records.map((h: any, i: number) => (
                            <div
                              key={i}
                              className="flex justify-between items-center p-3 border border-border bg-card rounded-sm text-sm"
                            >
                              <div>
                                <div className="font-bold text-primary">
                                  {h.type}{' '}
                                  <Badge
                                    variant="neutral"
                                    className="ml-2 font-mono text-[0.6rem]"
                                  >
                                    {h.ref}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {format(new Date(h.start), 'dd-MMM-yyyy')} to{' '}
                                  {format(new Date(h.end), 'dd-MMM-yyyy')}
                                </div>
                              </div>
                              <div className="font-mono font-bold text-destructive">
                                {h.days} days used
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

const TabTrigger = ({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
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
    <span className="label-mil text-[0.65rem] text-muted-foreground">
      {label}
    </span>
    <span className="font-semibold text-primary text-right">{value}</span>
  </div>
);

const AccountTypeRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between border-b border-border pb-1.5">
    <span className="label-mil text-[0.65rem] text-muted-foreground">
      {label}
    </span>
    <span className="font-semibold text-primary text-right">{value}</span>
  </div>
);

export default EmploymentRecordProfile;
