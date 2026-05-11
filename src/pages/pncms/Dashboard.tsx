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
} from 'lucide-react';
import { exportToPDF } from '@/lib/export';
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
  const { data: stats = { totalPersonnel: 0, onLeave: 0, openLogs: 0 }, isLoading } = useDashboardStats();
  const { data: logs = [] } = useLogs();

  const handleExportPDF = () => {
    const headers = [['Metric', 'Value', 'Subtitle']];
    const data = [
      ['Total Personnel', stats.totalPersonnel.toString(), 'Active across directorates'],
      ['Currently on Leave', stats.onLeave.toString(), 'Personnel away today'],
      ['Open Work Logs', stats.openLogs.toString(), 'In current cycle'],
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
          value={isLoading ? '...' : stats.totalPersonnel}
          sub="Unit Strength"
          icon={<Users className="w-5 h-5" />}
          accent="primary"
          onClick={() => navigate('/employment-records')}
        />
        <StatCard
          label="Currently on Leave"
          value={isLoading ? '...' : stats.onLeave}
          sub="Absent today"
          icon={<CalendarDays className="w-5 h-5" />}
          accent="danger"
          onClick={() => navigate('/leave')}
        />
        <StatCard
          label="Open Work Logs"
          value={isLoading ? '...' : stats.openLogs}
          sub="Active Overtime"
          icon={<ClipboardList className="w-5 h-5" />}
          accent="info"
          onClick={() => navigate('/overtime')}
        />
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
        <Section title="Recent System Activity" className="col-span-8">
          <div className="overflow-hidden -m-5">
            <table className="data-table">
              <thead>
                <tr><th>Time</th><th>User</th><th>Action</th><th>Affected Record</th></tr>
              </thead>
              <tbody>
                {logs.slice(0, 5).map((l: any) => (
                  <tr key={l.id} className="hover:bg-muted/30">
                    <td className="font-mono text-[0.6rem] text-muted-foreground">{format(new Date(l.time), 'HH:mm:ss')}</td>
                    <td className="font-bold text-primary">{l.user}</td>
                    <td><Badge variant={l.action === 'DELETE' ? 'danger' : 'info'} className="text-[0.6rem]">{l.action}</Badge></td>
                    <td className="text-xs italic truncate max-w-[200px]">{l.entity}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-10 text-muted-foreground italic">No recent activity detected.</td></tr>
                )}
              </tbody>
            </table>
            <div className="bg-muted/20 p-3 border-t border-border flex justify-center">
              <Btn variant="ghost" className="text-[0.65rem] font-bold h-7" onClick={() => navigate('/audit')}>View Full Audit Trail</Btn>
            </div>
          </div>
        </Section>

        <div className="col-span-4 space-y-6">
          <Section title="Operational Readiness">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[0.65rem] font-bold mb-1.5 uppercase">
                  <span>Local DB Connectivity</span>
                  <span className="text-success">Active</span>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success w-full animate-pulse" />
                </div>
              </div>
              <div className="p-4 bg-primary/5 rounded-sm border border-border">
                <div className="text-[0.65rem] label-mil text-primary opacity-60 mb-2 uppercase">Sync Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs font-bold italic">Offline Storage Validated</span>
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </AppShell>
  );
};
export default Dashboard;
