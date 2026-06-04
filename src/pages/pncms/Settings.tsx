import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import {
  Btn,
  Section,
  Field,
  Input,
  Badge,
} from '@/components/pncms/ui-kit';
import {
  Save,
  User,
  Eye,
  EyeOff,
  Lock,
  Landmark,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSettings, useUpsertSetting } from '@/hooks/use-api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const Settings = () => {
  const { data: settings = {}, isLoading } = useSettings();
  const upsertSetting = useUpsertSetting();

  const [clerkName, setClerkName] = useState('');
  const [secQuestion, setSecQuestion] = useState('');
  const [secAnswer, setSecAnswer] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Weekday/Holiday rates — 4 rates replacing single hourly
  const [minWeekdayRate, setMinWeekdayRate] = useState('225');
  const [minHolidayRate, setMinHolidayRate] = useState('285');
  const [indWeekdayRate, setIndWeekdayRate] = useState('380');
  const [indHolidayRate, setIndHolidayRate] = useState('460');

  // Day type config: 'weekday' | 'holiday' per day
  const [dayTypes, setDayTypes] = useState<Record<string, 'weekday' | 'holiday'>>({
    Monday: 'weekday',
    Tuesday: 'weekday',
    Wednesday: 'weekday',
    Thursday: 'weekday',
    Friday: 'weekday',
    Saturday: 'holiday',
    Sunday: 'holiday',
  });

  useEffect(() => {
    if (settings) {
      setClerkName(settings.clerk_name || 'Wajiha Zehra');
      setSecQuestion(settings.sec_question || 'What is the secret code?');
      setSecAnswer(settings.sec_answer || '14081947');
      setAdminUser(settings.admin_username || 'PNCMS');
      setAdminPass(settings.admin_password || '14081947');
      setLoginUser(settings.login_username || 'Administrator');
      setLoginPass(settings.login_password || 'pncms@2026');
      setMinWeekdayRate(settings.rate_ministerial_weekday || '225');
      setMinHolidayRate(settings.rate_ministerial_holiday || '285');
      setIndWeekdayRate(settings.rate_industrial_weekday || '380');
      setIndHolidayRate(settings.rate_industrial_holiday || '460');

      // Restore day types from settings
      if (settings.day_types) {
        try {
          setDayTypes(JSON.parse(settings.day_types));
        } catch { /* ignore parse errors */ }
      }
    }
  }, [settings]);

  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSecAnswer, setShowSecAnswer] = useState(false);

  const toggleDay = (day: string) => {
    setDayTypes(prev => ({
      ...prev,
      [day]: prev[day] === 'weekday' ? 'holiday' : 'weekday',
    }));
  };

  const handleSave = async () => {
    const config: Record<string, string> = {
      clerk_name: clerkName,
      sec_question: secQuestion,
      sec_answer: secAnswer,
      admin_username: adminUser,
      admin_password: adminPass,
      login_username: loginUser,
      login_password: loginPass,
      rate_ministerial_weekday: minWeekdayRate,
      rate_ministerial_holiday: minHolidayRate,
      rate_industrial_weekday: indWeekdayRate,
      rate_industrial_holiday: indHolidayRate,
      // Legacy keys for backward compat
      rate_ministerial: minWeekdayRate,
      rate_industrial: indWeekdayRate,
      day_types: JSON.stringify(dayTypes),
    };

    try {
      for (const [key, value] of Object.entries(config)) {
        await upsertSetting.mutateAsync({ key, value });
      }
      Object.entries(config).forEach(([key, value]) => localStorage.setItem(key, value));
      toast.success('System configuration updated successfully.');
    } catch (error) {
      toast.error('Failed to save configuration.');
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="System Settings & Control"
        subtitle="Administrative Management · Security Parameters"
        actions={
          <Btn variant="gold" onClick={handleSave}>
            <Save className="w-4 h-4" /> Save Configuration
          </Btn>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6">

          {/* ── Day Classification ─────────────────────────── */}
          <Section title="Weekly Day Classification">
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-sm mb-6 flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-accent flex-shrink-0" />
              <p className="text-xs text-primary font-bold uppercase tracking-tight">
                Toggle each day between <span className="text-info">Weekday</span> and{' '}
                <span className="text-accent">Holiday</span>. Rates will be applied accordingly on
                all payment calculations.
              </p>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {DAYS.map(day => {
                const isHoliday = dayTypes[day] === 'holiday';
                return (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`flex flex-col items-center gap-2 py-4 px-2 rounded-sm border-2 transition-all duration-200 ${
                      isHoliday
                        ? 'border-accent bg-accent/10 text-accent shadow-command'
                        : 'border-info/40 bg-info/5 text-info hover:bg-info/10'
                    }`}
                  >
                    <span className="text-[0.6rem] font-black uppercase tracking-widest">
                      {day.slice(0, 3)}
                    </span>
                    <span className={`text-[0.55rem] font-bold uppercase px-2 py-0.5 rounded-sm ${
                      isHoliday ? 'bg-accent text-accent-foreground' : 'bg-info text-white'
                    }`}>
                      {isHoliday ? 'Holiday' : 'Weekday'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[0.65rem] text-muted-foreground mt-4 italic">
              Click any day to toggle its classification. Currently:{' '}
              <span className="font-bold text-info">
                {DAYS.filter(d => dayTypes[d] === 'weekday').join(', ')}
              </span>{' '}
              are Weekdays.{' '}
              <span className="font-bold text-accent">
                {DAYS.filter(d => dayTypes[d] === 'holiday').join(', ')}
              </span>{' '}
              are Holidays.
            </p>
          </Section>

          {/* ── Allowance Rates ─────────────────────────────── */}
          <Section title="Allowance Disbursement Rates">
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-sm mb-6 flex items-center gap-3">
              <Landmark className="w-6 h-6 text-accent" />
              <p className="text-xs text-primary font-bold uppercase tracking-tight">
                Separate rates for Weekday and Holiday attendance. Applied automatically based on
                day classification above.
              </p>
            </div>

            {/* Ministerial */}
            <div className="mb-6">
              <p className="label-mil text-xs text-primary mb-3 border-b border-border pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-info inline-block" />
                Ministerial Staff (Late-Sitting)
              </p>
              <div className="grid grid-cols-2 gap-6">
                <Field label="Weekday Rate (Rs. / Day)" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-muted-foreground uppercase">Rs.</span>
                    <Input
                      type="number"
                      value={minWeekdayRate}
                      onChange={(e) => setMinWeekdayRate(e.target.value)}
                      className="pl-10 font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-muted-foreground uppercase">/ Day</span>
                  </div>
                </Field>
                <Field label="Holiday Rate (Rs. / Day)" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-muted-foreground uppercase">Rs.</span>
                    <Input
                      type="number"
                      value={minHolidayRate}
                      onChange={(e) => setMinHolidayRate(e.target.value)}
                      className="pl-10 font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-accent uppercase">/ Day</span>
                  </div>
                </Field>
              </div>
            </div>

            {/* Industrial */}
            <div>
              <p className="label-mil text-xs text-primary mb-3 border-b border-border pb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning inline-block" />
                Industrial Staff (Overtime)
              </p>
              <div className="p-4 bg-warning/5 border border-warning/30 rounded-sm flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 flex-shrink-0 text-warning">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-tight text-warning mb-1">Rate Based on Individual Basic Pay</p>
                  <p className="text-[0.7rem] text-muted-foreground leading-relaxed">
                    Industrial staff overtime is calculated as <strong className="text-primary font-mono">Basic Pay ÷ 30</strong> per sitting, using each employee's own basic pay from their Employment Record. No fixed rate is configured here — ensure the <span className="font-bold text-primary">Basic Pay</span> field is filled in every Industrial employee record.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* ── Personnel Assignment ─────────────────────── */}
          <Section title="Personnel Assignment">
            <Field label="Active Admin Clerk Name" required>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={clerkName}
                  onChange={(e) => setClerkName(e.target.value)}
                  className="pl-10 w-full font-bold text-primary"
                  placeholder="Full Name"
                />
              </div>
            </Field>
          </Section>

          {/* ── Access Control ───────────────────────────── */}
          <Section title="Access Control & Security">
            <div className="grid grid-cols-2 gap-6">
              <Field label="Login Username (Application Login)" required>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="pl-10 w-full font-mono font-bold"
                  />
                </div>
              </Field>

              <Field label="Login Password (Application Login)" required>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showLoginPass ? 'text' : 'password'}
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="pl-10 pr-10 w-full font-mono"
                  />
                  <button type="button" onClick={() => setShowLoginPass(!showLoginPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <Field label="Admin Username (Action Override)" required>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={adminUser}
                    onChange={(e) => setAdminUser(e.target.value)}
                    className="pl-10 w-full font-mono font-bold"
                  />
                </div>
              </Field>

              <Field label="Admin Password (Action Override)" required>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showAdminPass ? 'text' : 'password'}
                    value={adminPass}
                    onChange={(e) => setAdminPass(e.target.value)}
                    className="pl-10 pr-10 w-full font-mono"
                  />
                  <button type="button" onClick={() => setShowAdminPass(!showAdminPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                    {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>

              <div className="col-span-2 grid grid-cols-2 gap-6 pt-4 border-t border-border/50">
                <Field label="Recovery Security Question" required>
                  <Input
                    value={secQuestion}
                    onChange={(e) => setSecQuestion(e.target.value)}
                    placeholder="e.g. Your first school name"
                  />
                </Field>
                <Field label="Security Answer" required>
                  <div className="relative">
                    <Input
                      type={showSecAnswer ? 'text' : 'password'}
                      value={secAnswer}
                      onChange={(e) => setSecAnswer(e.target.value)}
                      className="pr-10 w-full font-mono"
                    />
                    <button type="button" onClick={() => setShowSecAnswer(!showSecAnswer)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                      {showSecAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </AppShell>
  );
};
export default Settings;
