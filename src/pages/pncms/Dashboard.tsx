import { useNavigate } from 'react-router-dom';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import { StatCard, Section, Btn, Badge } from '@/components/pncms/ui-kit';
import {
  Users,
  ClipboardList,
  Wallet,
  CalendarDays,
  Plus,
  FileBarChart2,
  UserPlus,
  FileDown,
  Clock,
  Gavel,
  Building2,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { exportToPDF, exportBlankEmployeeRecordForm, exportBlankLeaveRequestForm } from '@/lib/export';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDashboardStats, useLogs } from '@/hooks/use-api';
import { format } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const {
    data: stats = { personnelCount: 0, leaveCount: 0, pendingSanctions: 0 },
    isLoading,
  } = useDashboardStats();
  const { data: logs = [] } = useLogs();

  const handleExportPDF = () => {
    const headers = [['Metric', 'Value', 'Subtitle']];
    const data = [
      [
        'Total Personnel',
        stats.personnelCount.toString(),
        'Active across directorates',
      ],
      [
        'Currently on Leave',
        stats.leaveCount.toString(),
        'Personnel away today',
      ],
      ['Open Work Logs', stats.pendingSanctions.toString(), 'In current cycle'],
    ];
    exportToPDF('PNCMS Operational Brief', headers, data, 'pncms_brief');
  };

  return (
    <AppShell>
      <PageHeader
        title="Command Dashboard"
        subtitle="Civilian Management System · Operational Overview"
        actions={
          <div className="flex gap-3">
            <Btn variant="outline" onClick={handleExportPDF}>
              <FileBarChart2 className="w-4 h-4" /> Export Brief
            </Btn>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Btn variant="gold">
                  <Plus className="w-4 h-4" /> Quick Entry
                </Btn>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-background-alt border-border w-52"
              >
                <DropdownMenuItem
                  onClick={() => navigate('/employment-records/new')}
                  className="gap-2 cursor-pointer font-bold"
                >
                  <UserPlus className="w-4 h-4 text-accent" /> Enroll Personnel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/attendance')}
                  className="gap-2 cursor-pointer font-bold"
                >
                  <Clock className="w-4 h-4 text-accent" /> Mark Attendance
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/leave/new')}
                  className="gap-2 cursor-pointer font-bold"
                >
                  <CalendarDays className="w-4 h-4 text-accent" /> Record Leave
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate('/discipline')}
                  className="gap-2 cursor-pointer font-bold"
                >
                  <Gavel className="w-4 h-4 text-accent" /> Log Discipline
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-5">
        <StatCard
          label="Total Personnel"
          value={stats.personnelCount || 0}
          sub="Unit Strength"
          icon={<Users className="w-5 h-5" />}
          accent="primary"
          onClick={() => navigate('/employment-records')}
        />
        <StatCard
          label="Currently on Leave"
          value={stats.leaveCount || 0}
          sub="Absent today"
          icon={<CalendarDays className="w-5 h-5" />}
          accent="danger"
          onClick={() => navigate('/leave')}
        />
        <StatCard
          label="Open Work Logs"
          value={stats.pendingSanctions || 0}
          sub="Active Overtime"
          icon={<ClipboardList className="w-5 h-5" />}
          accent="info"
          onClick={() => navigate('/overtime')}
        />
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
        <Section title="Establishment Insights" className="col-span-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-accent/5 border border-accent/20 rounded-md">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Unit Distribution
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Admin Offices</span>
                  <span className="font-mono font-bold">04 Units</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Operational Wings
                  </span>
                  <span className="font-mono font-bold">02 Units</span>
                </div>
                <div className="h-1 bg-muted rounded-full mt-2">
                  <div className="h-full bg-accent w-2/3" />
                </div>
              </div>
            </div>
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-md">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Cadre Strength
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Ministerial Staff
                  </span>
                  <span className="font-mono font-bold">65%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Industrial Staff
                  </span>
                  <span className="font-mono font-bold">35%</span>
                </div>
                <div className="h-1 bg-muted rounded-full mt-2">
                  <div className="h-full bg-primary w-3/4" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 border border-dashed border-border rounded-md bg-muted/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs font-bold text-primary">
                  Daily Muster Status
                </p>
                <p className="text-[0.65rem] text-muted-foreground">
                  All attendance records for {format(new Date(), 'dd MMM')} are
                  validated.
                </p>
              </div>
            </div>
            <Btn
              variant="outline"
              className="h-8 text-[0.65rem]"
              onClick={() => navigate('/attendance')}
            >
              View Muster
            </Btn>
          </div>
        </Section>

        <div className="col-span-4 space-y-6">
          <Section title="Direct Command Actions">
            <div className="space-y-3">
              <Btn
                variant="outline"
                className="w-full justify-start h-12 border-accent/20 hover:border-accent/50"
                onClick={() => navigate('/employment-records')}
              >
                <Users className="w-5 h-5 mr-3 text-accent" />
                <div className="text-left">
                  <div className="text-[0.7rem] font-bold uppercase">
                    Personnel Roster
                  </div>
                  <div className="text-[0.6rem] text-muted-foreground">
                    Manage active service records
                  </div>
                </div>
              </Btn>
              <Btn
                variant="outline"
                className="w-full justify-start h-12 border-accent/20 hover:border-accent/50"
                onClick={() => navigate('/leave')}
              >
                <CalendarDays className="w-5 h-5 mr-3 text-accent" />
                <div className="text-left">
                  <div className="text-[0.7rem] font-bold uppercase">
                    Leave Accounts
                  </div>
                  <div className="text-[0.6rem] text-muted-foreground">
                    Absence & balance tracking
                  </div>
                </div>
              </Btn>
              <Btn
                variant="outline"
                className="w-full justify-start h-12 border-accent/20 hover:border-accent/50"
                onClick={() => navigate('/overtime')}
              >
                <Wallet className="w-5 h-5 mr-3 text-accent" />
                <div className="text-left">
                  <div className="text-[0.7rem] font-bold uppercase">
                    Allowance Control
                  </div>
                  <div className="text-[0.6rem] text-muted-foreground">
                    Sanctions & financial logs
                  </div>
                </div>
              </Btn>
              <Btn
                variant="outline"
                className="w-full justify-start h-12 border-accent/20 hover:border-accent/50"
                onClick={() => navigate('/settings')}
              >
                <Settings className="w-5 h-5 mr-3 text-accent" />
                <div className="text-left">
                  <div className="text-[0.7rem] font-bold uppercase">
                    System Configuration
                  </div>
                  <div className="text-[0.6rem] text-muted-foreground">
                    Control security & parameters
                  </div>
                </div>
              </Btn>
            </div>
          </Section>

          <Section title="Forms & Templates">
            <p className="text-[0.65rem] text-muted-foreground mb-4">
              Download standard blank service forms to print and fill manually by hand.
            </p>
            <div className="space-y-3">
              <Btn
                variant="outline"
                className="w-full justify-between h-10 border-border hover:border-accent"
                onClick={() => exportBlankEmployeeRecordForm('blank_employee_record_form')}
              >
                <div className="flex items-center">
                  <FileDown className="w-4 h-4 mr-3 text-accent" />
                  <span className="text-[0.7rem] font-bold uppercase">Employee Record Form</span>
                </div>
                <Badge variant="info" className="text-[0.55rem]">PDF</Badge>
              </Btn>
              <Btn
                variant="outline"
                className="w-full justify-between h-10 border-border hover:border-accent"
                onClick={() => exportBlankLeaveRequestForm('blank_leave_request_form')}
              >
                <div className="flex items-center">
                  <FileDown className="w-4 h-4 mr-3 text-accent" />
                  <span className="text-[0.7rem] font-bold uppercase">Leave Request Form</span>
                </div>
                <Badge variant="info" className="text-[0.55rem]">PDF</Badge>
              </Btn>
            </div>
          </Section>
        </div>
      </div>
    </AppShell>
  );
};
export default Dashboard;


