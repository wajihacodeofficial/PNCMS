import { useState, useMemo, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import {
  Btn,
  Badge,
  Section,
  StatCard,
  Field,
  Input,
  Select,
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
  Search,
  Calendar,
  ShieldX,
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
  parseISO,
} from 'date-fns';
import { Switch } from '@/components/ui/switch';
import { exportToPDF, exportComprehensiveProfileToPDF } from '@/lib/export';
import { toast } from 'sonner';
import {
  usePersonnel,
  useEmployee,
  useLeaves,
  useDisciplinaryActions,
  usePayments,
  useUpsertDisciplinaryAction,
  useCreateLog,
  useDeleteLeave,
  useSettings,
  useSanctions
} from '@/hooks/use-api';


const EmploymentRecordProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: personnel = [], isLoading: isEmployeeLoading } = usePersonnel();
  const employee = useMemo(() => personnel.find((p: any) => p.serviceNo === id), [personnel, id]);
  // Fetch full employee record including real DB attendance (muster roll records)
  const { data: employeeWithAttendance } = useEmployee(id || '');
  const { data: allLeaves = [] } = useLeaves();
  const { data: allDisciplines = [] } = useDisciplinaryActions();
  const { data: allPayments = [] } = usePayments();
  const { data: allSanctions = [] } = useSanctions();
  const { mutate: upsertDiscipline } = useUpsertDisciplinaryAction();
  const { mutate: createLog } = useCreateLog();

  const { data: settings = {} } = useSettings();
  const { mutate: deleteLeave } = useDeleteLeave();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leaveIdToDelete, setLeaveIdToDelete] = useState("");
  const [deleteUsername, setDeleteUsername] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  const handleDeleteVerify = () => {
    const savedUser = settings.admin_username || "PNCMS";
    const savedPass = settings.admin_password || "14081947";
    if (deleteUsername === savedUser && deletePassword === savedPass) {
      deleteLeave(leaveIdToDelete, {
        onSuccess: () => {
          createLog({
            user: savedUser,
            action: "DELETE",
            entity: `Leave Record ID: ${leaveIdToDelete}`,
            result: "Success"
          });
          toast.success("Leave record deleted successfully");
          setDeleteConfirmOpen(false);
          setLeaveIdToDelete("");
          setDeleteUsername("");
          setDeletePassword("");
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to delete leave record");
        }
      });
    } else {
      toast.error("Invalid Admin Username or Password");
    }
  };

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

  const profile = useMemo(() => {
    if (!employee) return null;
    return {
      ...employee,
      svc: employee.serviceNo,
      rank: employee.rank?.name,
      dept: employee.department?.name,
      permAddr: employee.permanentAddress,
      presAddr: employee.presentAddress,
      joinDate: employee.joiningCurrentUnitDate || 'N/A',
    };
  }, [employee]);

  const personLeaves = useMemo(() => {
    return allLeaves.filter((l: any) => l.serviceNo === employee?.serviceNo).map((l: any) => ({
      id: l.id,
      type: l.type === 'CL' ? 'Casual Leave' : l.type === 'LFP' ? 'Leave on Full Pay' : l.type === 'SL' ? 'Sick Leave' : 'Other Leave',
      start: l.startDate,
      end: l.endDate,
      days: l.days,
      ref: `LVE/${(l.startDate || "").replace(/-/g, '/')}/${employee?.serviceNo}`
    }));
  }, [allLeaves, employee]);

  const personSanctions = useMemo(() => {
    return allSanctions.filter((s: any) => s.serviceNo === employee?.serviceNo);
  }, [allSanctions, employee]);

  const leaveBalances = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const employeeLeaves = allLeaves.filter(
      (l: any) => l.serviceNo === employee?.serviceNo && new Date(l.startDate).getFullYear() === currentYear && l.status !== 'Rejected'
    );

    const getUsed = (type: string) => {
      return employeeLeaves
        .filter((l: any) => l.type === type)
        .reduce((sum: number, l: any) => sum + l.days, 0);
    };

    return {
      CL: { used: getUsed('CL'), max: 20 },
      LFP: { used: getUsed('LFP'), max: 12 },
      RL: { used: getUsed('RL'), max: 15 },
      LWOP: { used: getUsed('LWOP'), max: null },
      DL: { used: getUsed('DL'), max: 5 },
    };
  }, [allLeaves, employee]);

  const personDisciplines = useMemo(() => {
    return allDisciplines.filter((d: any) => d.serviceNo === employee?.serviceNo);
  }, [allDisciplines, employee]);

  const personPayments = useMemo(() => {
    return allPayments.filter((p: any) => p.serviceNo === employee?.serviceNo);
  }, [allPayments, employee]);

  const initialAttendance = useMemo(() => {
    const dbAttendance: any[] = (employeeWithAttendance as any)?.attendance || [];
    if (dbAttendance.length === 0) return [];
    return dbAttendance
      .map((a: any, i: number) => ({
        id: a.id || i.toString(),
        d: format(parseISO(a.date), 'dd-MMM-yyyy'),
        s: a.status,
      }))
      .sort((a: any, b: any) => {
        const dateA = parse(a.d, 'dd-MMM-yyyy', new Date());
        const dateB = parse(b.d, 'dd-MMM-yyyy', new Date());
        return dateB.getTime() - dateA.getTime();
      });
  }, [employeeWithAttendance]);

  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceDateFilter, setAttendanceDateFilter] = useState('');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState('All');

  const groupedAttendance = useMemo(() => {
    const filtered = initialAttendance.filter((a) => {
      let matchesDate = true;
      if (attendanceDateFilter) {
        const target = format(parseISO(attendanceDateFilter), 'dd-MMM-yyyy');
        matchesDate = a.d === target;
      }

      let matchesStatus = true;
      if (attendanceStatusFilter !== 'All') {
        if (attendanceStatusFilter === 'Leave') {
          matchesStatus = !['Present', 'Weekend'].includes(a.s);
        } else {
          matchesStatus = a.s === attendanceStatusFilter;
        }
      }

      const matchesSearch = !attendanceSearch || (a.d || "").toLowerCase().includes(attendanceSearch.toLowerCase());

      return matchesDate && matchesStatus && matchesSearch;
    });

    const groups: Record<string, typeof initialAttendance> = {};
    filtered.forEach((a) => {
      const month = format(parse(a.d, 'dd-MMM-yyyy', new Date()), 'MMMM yyyy');
      if (!groups[month]) groups[month] = [];
      groups[month].push(a);
    });
    return groups;
  }, [initialAttendance, attendanceSearch, attendanceDateFilter, attendanceStatusFilter]);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    fields: { key: string; label: string; type?: string }[];
    data: any;
    onSave: (data: any) => void;
  }>({ isOpen: false, title: '', fields: [], data: {}, onSave: () => { } });

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

  const handlePDF = () => {
    const present = initialAttendance.filter(a => a.s === 'P' || a.s === 'Present').length;
    const absent = initialAttendance.filter(a => a.s === 'A' || a.s === 'Absent').length;
    const leave = initialAttendance.filter(a =>
      !['P', 'Present', 'A', 'Absent', 'Weekend'].includes(a.s)
    ).length;

    const clUsed = personLeaves.filter((l: any) =>
      l.type === 'Casual Leave'
    ).reduce((sum: number, l: any) => sum + parseInt(l.days || '0'), 0);
    const lfpUsed = personLeaves.filter((l: any) =>
      l.type === 'Leave on Full Pay'
    ).reduce((sum: number, l: any) => sum + parseInt(l.days || '0'), 0);

    const actionWise = personDisciplines.reduce((acc: any, d: any) => {
      acc[d.action] = (acc[d.action] || 0) + 1;
      return acc;
    }, {});
    const explanationsCount = personDisciplines.filter((d: any) =>
      d.action?.toLowerCase().includes('explanation')
    ).length;
    if (explanationsCount > 0) actionWise["Total Explanations"] = explanationsCount;

    const allLeavesForPDF = (employeeWithAttendance as any)?.leaves || [];
    const leaveRows = allLeavesForPDF.map((l: any) => [
      l.type || '—',
      l.startDate || '—',
      l.endDate || '—',
      `${l.days || 0} days`,
      l.status || '—',
    ]);

    const exportData = {
      profile: {
        svc: profile?.svc,
        name: profile?.name,
        rank: profile?.rank,
        department: profile?.dept,
        bps: profile?.bps,
        cadre: profile?.cardType || "Ministerial",
        status: profile?.status || "Active",
        cnic: profile?.cnic || "N/A",
        phone: profile?.phoneNumber || "N/A",
        dob: profile?.dob || "N/A",
        bloodGroup: profile?.bloodGroup || "N/A",
        fatherName: profile?.fatherName || "N/A",
        domicile: profile?.domicile || "Sindh",
        presentAddress: profile?.presentAddress || "N/A",
        permanentAddress: profile?.permanentAddress || "N/A"
      },
      nok: {
        name: profile?.nokName || "N/A",
        relation: profile?.nokRelation || "N/A",
        contact: profile?.nokContact || "N/A"
      },
      financial: {
        bankName: profile?.bankName || "N/A",
        accountNo: profile?.accountNo || "N/A"
      },
      leaveBalances: {
        clEnt: 15,
        clRem: 15 - clUsed,
        lfpEnt: 48,
        lfpRem: 48 - lfpUsed
      },
      attendanceStats: { present, absent, leave },
      leaveRows,
      disciplineStats: actionWise,
      serviceHistory: [
        ...transfers.map(t => [t.event, t.date, t.unit || t.toUnit || t.fromUnit, t.ref, t.remarks]),
        ...attachments.map(a => [`Attachment: ${a.event}`, a.date, a.attachedTo, a.ref, ""]),
        ...promotions.map(p => [`Promotion: ${p.promoted}`, p.date, "", p.ref, `From ${p.prev}`])
      ]
    };

    exportComprehensiveProfileToPDF(exportData, `comprehensive_profile_${profile?.svc}`);
    toast.success("Comprehensive Profile PDF Generated");
  };

  const handleExportAttendance = () => {
    const headers = [["Date", "Status", "Remarks"]];
    const rows: string[][] = [];

    Object.entries(groupedAttendance).forEach(([month, records]) => {
      rows.push([[month.toUpperCase(), "", ""] as any]);
      records.forEach(a => {
        rows.push([a.d, a.s, ""]);
      });
    });

    exportToPDF(
      `Attendance Statement - ${profile?.name}`,
      headers,
      rows,
      `attendance_${profile?.svc}`,
      { period: "Historical Record", dept: profile?.dept, clerk: "Wajiha Zehra · DIL-ADM-04" },
      [
        { label: "SVC NO", value: profile?.svc },
        { label: "NAME", value: profile?.name },
        { label: "UNIT", value: profile?.unitLocation }
      ]
    );
    toast.success("Attendance Report Generated");
  };

  if (isEmployeeLoading) return null; 
  if (!profile) return <div className="p-20 text-center">Personnel Record Not Found.</div>;

  return (

    <AppShell>
      <PageHeader
        title={`${profile?.name || 'Personnel Profile'}`}
        subtitle={`Service Record · ${profile?.svc || 'N/A'}`}
        actions={
          <>
            <Btn variant="outline" onClick={handlePDF}>
              <Download className="w-4 h-4" /> Export PDF
            </Btn>
            <Btn
              variant="gold"
              onClick={() =>
                navigate(`/employment-records/edit/${profile.svc}`)
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
              <div className="flex flex-col">
                <h2 className="text-2xl font-heading font-black text-white italic tracking-tight">
                  {profile?.name || 'Unknown Personnel'}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="warning" className="text-[0.65rem] px-2 py-0.5">
                    {profile?.rank || 'N/A'}
                  </Badge>
                  <Badge variant="neutral" className="text-[0.65rem] px-2 py-0.5">
                    {profile?.svc || 'N/A'}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 p-2 bg-muted/30 rounded-sm">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-accent uppercase">
                  <Anchor className="w-3.5 h-3.5" /> {profile?.unitLocation || 'NO UNIT ASSIGNED'}
                </div>
                <div className="text-[0.65rem] text-muted-foreground mt-1 italic">
                  Tenure: {tenureStr}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="info">{profile.rank}</Badge>
                <Badge variant={profile.cardType === 'Ministerial' ? 'info' : 'warning'}>
                  {profile.cardType}
                </Badge>
              </div>
            </div>

            <div className="border-t border-border p-4 bg-muted/20 space-y-3">
              <div className="flex flex-col p-4 border-r border-border/50">
                <span className="text-[0.6rem] label-mil mb-1">Department</span>
                <span className="text-sm font-bold text-primary flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-accent" />
                  {profile?.dept || 'Unassigned'}
                </span>
              </div>
              <div className="flex flex-col p-4 border-r border-border/50">
                <span className="text-[0.6rem] label-mil mb-1">Card Type</span>
                <span className="text-sm font-bold text-primary">
                  {profile?.cardType || 'N/A'}
                </span>
              </div>
              <div className="flex flex-col p-4 border-r border-border/50">
                <span className="text-[0.6rem] label-mil mb-1">BPS Scale</span>
                <span className="text-sm font-bold text-accent">{profile?.bps || 'N/A'}</span>
              </div>
              <div className="flex flex-col p-4">
                <span className="text-[0.6rem] label-mil mb-1">CNIC / ID</span>
                <span className="text-sm font-mono font-bold text-primary">
                  {profile?.cnic || 'N/A'}
                </span>
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
                label={profile.cardType === 'Ministerial' ? 'Late Sitting' : 'Overtime'}
                icon={Clock}
              />
              <TabTrigger
                value="payments"
                label="Payment History"
                icon={Wallet}
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
                  value={tenureStr}
                  sub={`Joined ${profile.joinDate}`}
                  accent="primary"
                  icon={<CalendarDays className="w-5 h-5" />}
                />
                <StatCard
                  label="BPS Grade"
                  value={profile.bps}
                  sub={`Last Promoted ${profile.lastPromotion}`}
                  accent="info"
                  icon={<FileText className="w-5 h-5" />}
                />
              </div>

              <Section title="Basic Personnel Details">
                <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-sm">
                  <DataRow label="Father's Name" value={profile.fatherName} />
                  <DataRow label="Mother's Name" value={profile.motherName} />
                  <DataRow label="CNIC" value={profile.cnic} />
                  
                  <DataRow label="DOB" value={profile.dob} />
                  <DataRow label="Gender" value={profile.gender} />
                  <DataRow label="Marital Status" value={profile.maritalStatus} />
                  
                  <DataRow label="Blood Group" value={profile.bloodGroup} />
                  <DataRow label="Religion" value={profile.religion} />
                  <DataRow label="Place of Birth" value={profile.placeOfBirth} />

                  <DataRow label="Domicile Province" value={profile.domicile} />
                  <DataRow label="Domicile District" value={profile.domicileDistrict} />
                  <DataRow label="Phone Number" value={profile.phoneNumber} />
                </div>
              </Section>

              <div className="grid grid-cols-2 gap-5">
                <Section title="Education & Professional Skills">
                  <div className="space-y-3 text-sm">
                    <DataRow label="Highest Qualification" value={profile.qualification} />
                    <DataRow label="Languages" value={profile.languages} />
                    <DataRow label="IT & Technical Skills" value={profile.itSkills} />
                  </div>
                </Section>

                <Section title="Physical & Medical Profile">
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <DataRow label="Height" value={profile.height} />
                      <DataRow label="Weight" value={profile.weight} />
                    </div>
                    <DataRow label="Medical Category" value={profile.medicalCategory} />
                    <DataRow label="Distinguishing Marks" value={profile.distinguishingMarks} />
                  </div>
                </Section>
              </div>

              <Section title="Addresses">
                <div className="space-y-3 text-sm">
                  <DataRow label="Present Address" value={profile.presentAddress} />
                  <DataRow label="Permanent Address" value={profile.permanentAddress} />
                </div>
              </Section>

              <div className="grid grid-cols-2 gap-5">
                <Section title="Next of Kin & Emergency Details">
                  <div className="space-y-3 text-sm">
                    <DataRow label="NOK Name" value={profile.nokName} />
                    <DataRow label="Relation" value={profile.nokRelation} />
                    <DataRow label="NOK Contact" value={profile.nokContact} />
                    <DataRow label="NOK CNIC" value={profile.nokCnic} />
                    <DataRow label="NOK Address" value={profile.nokAddress} />
                    <hr className="border-border my-2" />
                    <DataRow label="Emergency Contact" value={profile.emergencyContact} />
                    <DataRow label="Emergency Relation" value={profile.emergencyContactRelation} />
                  </div>
                </Section>

                <Section title="Financial & Bank Details">
                  <div className="space-y-3 text-sm">
                    <DataRow label="Bank Name" value={profile.bankName} />
                    <DataRow label="Account No" value={profile.bankAccount} />
                    <DataRow label="Branch" value={profile.bankBranch} />
                    <AccountTypeRow label="Account Type" value={profile.accountType} />
                    <DataRow label="Pension Account" value={profile.pensionAccount} />
                    <DataRow label="GPF Account" value={profile.gpfAccount} />
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
                    {personSanctions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted-foreground py-8">
                          No history or sanction records found.
                        </td>
                      </tr>
                    ) : (
                      personSanctions.map((row: any, i: number) => (
                        <tr key={row.id || i}>
                          <td>{row.period}</td>
                          <td className="font-mono text-xs text-primary">
                            {row.sanctionId}
                          </td>
                          <td>{row.hours} hrs</td>
                          <td className="font-bold">Rs. {row.amount?.toLocaleString() || '0'}</td>
                          <td>
                            <Badge
                              variant={
                                row.status === 'Pending'
                                  ? 'warning'
                                  : row.status === 'Rejected'
                                  ? 'danger'
                                  : row.status === 'Paid'
                                  ? 'info'
                                  : 'success'
                              }
                            >
                              {row.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Section>
            </Tabs.Content>

            <Tabs.Content
              value="payments"
              className="space-y-5 animate-in fade-in slide-in-from-right-2"
            >
              <Section title="Payment History">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Category</th>
                      <th>Hours/Days</th>
                      <th>Rate</th>
                      <th>Deduction</th>
                      <th>Net Payable</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center text-muted-foreground py-8">
                          No payment records found.
                        </td>
                      </tr>
                    ) : (
                      personPayments.map((p: any, i: number) => (
                        <tr key={p.id || i}>
                          <td>{p.period}</td>
                          <td><Badge variant={p.type === 'Industrial' ? 'warning' : 'info'}>{p.type}</Badge></td>
                          <td className="font-mono text-xs">{p.gross} hrs</td>
                          <td className="font-mono text-xs">Rs. {p.rate}</td>
                          <td className="font-mono text-xs text-destructive">- Rs. {p.leave}</td>
                          <td className="font-bold text-success">Rs. {p.payable?.toLocaleString() || '0'}</td>
                          <td>
                            <Badge
                              variant={p.status === 'Paid' ? 'success' : 'warning'}
                            >
                              {p.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </Section>
            </Tabs.Content>

            <Tabs.Content
              value="attendance"
              className="space-y-5 animate-in fade-in slide-in-from-right-2"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Section
                  title="Attendance History (Since Joining PNS Dilawar)"
                  actions={
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-accent" />
                        <input
                          type="date"
                          className="h-8 pl-7 pr-2 bg-muted/20 border border-border rounded-sm text-[0.65rem] focus:outline-none focus:border-accent font-bold"
                          value={attendanceDateFilter}
                          onChange={(e) => setAttendanceDateFilter(e.target.value)}
                        />
                      </div>
                      <Select
                        className="h-8 text-[0.65rem] w-32"
                        value={attendanceStatusFilter}
                        onChange={(e) => setAttendanceStatusFilter(e.target.value)}
                      >
                        <option value="All">All Status</option>
                        <option value="Present">Present Only</option>
                        <option value="Weekend">Weekends</option>
                        <option value="Leave">All Leaves</option>
                        <option value="Casual Leave">Casual Leave</option>
                        <option value="Recreation Leave">Recreation Leave</option>
                      </Select>
                      <Btn variant="outline" size="sm" className="h-8 px-2" onClick={handleExportAttendance}>
                        <Download className="w-3 h-3 mr-1" /> Export
                      </Btn>
                    </div>
                  }
                >
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {Object.entries(groupedAttendance).map(([month, records]) => (
                      <div key={month} className="space-y-2">
                        <div className="text-[0.6rem] font-bold text-accent uppercase tracking-widest border-b border-border/50 pb-1 mb-2 sticky top-0 bg-card z-10 py-1 flex justify-between items-center">
                          {month}
                          <Badge variant="neutral" className="text-[0.5rem]">{records.length} Records</Badge>
                        </div>
                        {records.map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between p-2 border-b border-border/50 text-xs hover:bg-muted/10 transition-colors"
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
                    ))}
                    {Object.keys(groupedAttendance).length === 0 && (
                      <div className="text-center py-12 bg-muted/10 border-2 border-dashed border-border rounded-sm">
                        <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                        <p className="text-xs font-bold text-muted-foreground uppercase">No Records Found</p>
                        <p className="text-[0.6rem] text-muted-foreground mt-1">Try adjusting your filters or date range.</p>
                        {(attendanceDateFilter || attendanceStatusFilter !== 'All') && (
                          <Btn variant="ghost" size="sm" className="mt-4 h-7 text-[0.6rem]" onClick={() => { setAttendanceDateFilter(''); setAttendanceStatusFilter('All'); }}>
                            Clear All Filters
                          </Btn>
                        )}
                      </div>
                    )}
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
                            Used: {String(leaveBalances.CL.used).padStart(2, '0')} · Remaining: {String(Math.max(0, leaveBalances.CL.max - leaveBalances.CL.used)).padStart(2, '0')}
                          </p>
                        </div>
                        <div className="text-xl font-heading font-extrabold text-accent">
                          {Math.max(0, leaveBalances.CL.max - leaveBalances.CL.used)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/20 rounded-sm">
                        <div>
                          <p className="text-xs font-bold text-primary">
                            Leave on Full Pay (LFP)
                          </p>
                          <p className="text-[0.65rem] text-muted-foreground">
                            Used: {String(leaveBalances.LFP.used).padStart(2, '0')} · Remaining: {String(Math.max(0, leaveBalances.LFP.max - leaveBalances.LFP.used)).padStart(2, '0')}
                          </p>
                        </div>
                        <div className="text-xl font-heading font-extrabold text-accent">
                          {Math.max(0, leaveBalances.LFP.max - leaveBalances.LFP.used)}
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
                    onClick={() =>
                      openModal(
                        'Add Discipline Record',
                        disciplineFields,
                        {},
                        (d) => {
                          upsertDiscipline({ ...d, svc: profile.svc }, {
                            onSuccess: () => {
                              createLog({
                                user: localStorage.getItem("username") || "Admin",
                                action: "CREATE",
                                entity: `Discipline: ${profile.svc} - ${d.action}`,
                                result: "Success"
                              });
                              toast.success("Discipline record added");
                            }
                          });
                        }
                      )
                    }

                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Record
                  </Btn>
                </div>
                {personDisciplines.length === 0 ? (
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
                        {personDisciplines.map((d: any) => (
                          <tr key={d.id}>
                            <td className="text-xs font-mono">{d.date}</td>
                            <td className="font-bold text-destructive">
                              {d.action}
                            </td>
                            <td className="text-xs">{d.reason || d.offense}</td>
                            <td className="text-[0.65rem] font-mono text-accent">
                              {d.ref || d.reference}
                            </td>
                            <td className="text-right">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() =>
                                    openModal(
                                      'Edit Discipline Record',
                                      disciplineFields,
                                      { ...d, ref: d.reference || d.ref, reason: d.offense || d.reason },
                                      (x) => {
                                        upsertDiscipline({ ...x, svc: profile.svc }, {
                                          onSuccess: () => {
                                            createLog({
                                              user: localStorage.getItem("username") || "Admin",
                                              action: "UPDATE",
                                              entity: `Discipline: ${profile.svc} - ${x.action}`,
                                              result: "Success"
                                            });
                                            toast.success("Discipline record updated");
                                          }
                                        });
                                      }
                                    )
                                  }
                                  className="p-1 rounded bg-muted hover:bg-muted/80 text-primary"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this record?")) {
                                      toast.error("Delete not implemented for individual discipline records yet");
                                    }
                                  }}
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
                  {profile.name} · {profile.svc}
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
                    <td className="text-center font-mono">{leaveBalances.CL.max} days</td>
                    <td className="text-center font-mono text-destructive">
                      {String(leaveBalances.CL.used).padStart(2, '0')} days
                    </td>
                    <td className="text-right font-mono font-bold text-success text-lg">
                      {String(Math.max(0, leaveBalances.CL.max - leaveBalances.CL.used)).padStart(2, '0')} days
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">Leave on Full Pay (LFP)</td>
                    <td className="text-center font-mono">{leaveBalances.LFP.max} days</td>
                    <td className="text-center font-mono text-destructive">
                      {String(leaveBalances.LFP.used).padStart(2, '0')} days
                    </td>
                    <td className="text-right font-mono font-bold text-success text-lg">
                      {String(Math.max(0, leaveBalances.LFP.max - leaveBalances.LFP.used)).padStart(2, '0')} days
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">Recreation Leave (RL)</td>
                    <td className="text-center font-mono">{leaveBalances.RL.max} days</td>
                    <td className="text-center font-mono text-destructive">
                      {String(leaveBalances.RL.used).padStart(2, '0')} days
                    </td>
                    <td className="text-right font-mono font-bold text-success text-lg">
                      {String(Math.max(0, leaveBalances.RL.max - leaveBalances.RL.used)).padStart(2, '0')} days
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">Disability Leave (DL)</td>
                    <td className="text-center font-mono">{leaveBalances.DL.max} days</td>
                    <td className="text-center font-mono text-destructive">
                      {String(leaveBalances.DL.used).padStart(2, '0')} days
                    </td>
                    <td className="text-right font-mono font-bold text-success text-lg">
                      {String(Math.max(0, leaveBalances.DL.max - leaveBalances.DL.used)).padStart(2, '0')} days
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">Leave Without Pay (LWOP)</td>
                    <td className="text-center font-mono">—</td>
                    <td className="text-center font-mono text-destructive">
                      {String(leaveBalances.LWOP.used).padStart(2, '0')} days
                    </td>
                    <td className="text-right font-mono font-bold text-muted-foreground text-lg">
                      —
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
                    personLeaves.reduce((acc: any, curr: any) => {
                      const year = (curr.start || "").split('-')[0] || "N/A";
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
                              <div className="flex items-center gap-3">
                                <div className="font-mono font-bold text-destructive">
                                  {h.days} days used
                                </div>
                                <button
                                  onClick={() => {
                                    setLeaveIdToDelete(h.id);
                                    setDeleteConfirmOpen(true);
                                  }}
                                  className="p-1.5 rounded bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                                  title="Delete Leave Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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

      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-[110] bg-primary/70 backdrop-blur-md flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-md rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
            <div className="bg-destructive px-6 py-4 flex justify-between items-center text-white font-bold uppercase italic"><div className="flex items-center gap-2"><ShieldX className="w-5 h-5"/><h3>Verify Access</h3></div><button onClick={() => setDeleteConfirmOpen(false)}><X className="w-5 h-5"/></button></div>
            <div className="p-8 space-y-4">
              <p className="text-xs text-muted-foreground">Admin credentials required to delete this leave record.</p>
              <Field label="Admin Username"><Input placeholder="Username" value={deleteUsername} onChange={(e) => setDeleteUsername(e.target.value)} /></Field>
              <Field label="System Password"><Input type="password" placeholder="••••••••" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleDeleteVerify()} /></Field>
            </div>
            <div className="bg-muted/30 p-5 flex justify-end gap-3 border-t border-border"><Btn variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Abort</Btn><Btn variant="danger" onClick={handleDeleteVerify}>Delete Record</Btn></div>
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
