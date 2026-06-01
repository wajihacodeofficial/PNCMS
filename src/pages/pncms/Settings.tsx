import { useState, useEffect } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import {
  Btn,
  Section,
  Field,
  Input,
  Badge,
  Select,
} from '@/components/pncms/ui-kit';
import {
  Save,
  ShieldCheck,
  Shield,
  Building2,
  User,
  Eye,
  EyeOff,
  Lock,
  Landmark,
  History,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSettings, useUpsertSetting } from '@/hooks/use-api';

const Settings = () => {
  const navigate = useNavigate();
  const { data: settings = {}, isLoading } = useSettings();
  const upsertSetting = useUpsertSetting();

  const [clerkName, setClerkName] = useState('');
  const [secQuestion, setSecQuestion] = useState('');
  const [secAnswer, setSecAnswer] = useState('');
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [minRate, setMinRate] = useState('380');
  const [indRate, setIndRate] = useState('420');

  useEffect(() => {
    if (settings) {
      setClerkName(settings.clerk_name || 'Wajiha Zehra');
      setSecQuestion(settings.sec_question || 'What is the secret code?');
      setSecAnswer(settings.sec_answer || '14081947');
      setAdminUser(settings.admin_username || 'PNCMS');
      setAdminPass(settings.admin_password || '14081947');
      setLoginUser(settings.login_username || 'Administrator');
      setLoginPass(settings.login_password || 'pncms@2026');
      setMinRate(settings.rate_ministerial || '380');
      setIndRate(settings.rate_industrial || '420');
    }
  }, [settings]);

  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSecAnswer, setShowSecAnswer] = useState(false);

  const handleSave = async () => {
    const config = {
      clerk_name: clerkName,
      sec_question: secQuestion,
      sec_answer: secAnswer,
      admin_username: adminUser,
      admin_password: adminPass,
      login_username: loginUser,
      login_password: loginPass,
      rate_ministerial: minRate,
      rate_industrial: indRate,
    };

    try {
      for (const [key, value] of Object.entries(config)) {
        await upsertSetting.mutateAsync({ key, value });
      }
      // Also update localStorage for immediate UI consistency in other parts of the app
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
          <Section title="Allowance Disbursement Rates">
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-sm mb-6 flex items-center gap-3">
              <Landmark className="w-6 h-6 text-accent" />
              <p className="text-xs text-primary font-bold uppercase tracking-tight">
                Financial parameters for automated overtime & late-sitting
                calculations.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Field label="Ministerial (Late-Sitting) Rate" required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-muted-foreground uppercase">
                    Rs.
                  </span>
                  <Input
                    type="number"
                    value={minRate}
                    onChange={(e) => setMinRate(e.target.value)}
                    className="pl-10 font-mono font-bold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-muted-foreground uppercase">
                    / HR
                  </span>
                </div>
              </Field>
              <Field label="Industrial (Overtime) Rate" required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-muted-foreground uppercase">
                    Rs.
                  </span>
                  <Input
                    type="number"
                    value={indRate}
                    onChange={(e) => setIndRate(e.target.value)}
                    className="pl-10 font-mono font-bold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold text-muted-foreground uppercase">
                    / HR
                  </span>
                </div>
              </Field>
            </div>
          </Section>

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
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showLoginPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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
                  <button
                    type="button"
                    onClick={() => setShowAdminPass(!showAdminPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showAdminPass ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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
                    <button
                      type="button"
                      onClick={() => setShowSecAnswer(!showSecAnswer)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    >
                      {showSecAnswer ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
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
