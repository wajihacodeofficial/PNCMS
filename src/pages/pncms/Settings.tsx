import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Field, Input, Badge } from "@/components/pncms/ui-kit";
import { Save, ShieldCheck, Shield, Building2, User, Eye, EyeOff, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const [clerkName, setClerkName] = useState("");
  const [secQuestion, setSecQuestion] = useState("");
  const [secAnswer, setSecAnswer] = useState("");
  const [adminPass, setAdminPass] = useState("");
  
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showSecAnswer, setShowSecAnswer] = useState(false);

  useEffect(() => {
    setClerkName(localStorage.getItem("clerk_name") || "Wajiha Zehra");
    setSecQuestion(localStorage.getItem("sec_question") || "What is your favorite color?");
    setSecAnswer(localStorage.getItem("sec_answer") || "blue");
    setAdminPass(localStorage.getItem("admin_password") || "12345qwert");
  }, []);

  const handleSave = () => {
    localStorage.setItem("clerk_name", clerkName);
    localStorage.setItem("sec_question", secQuestion);
    localStorage.setItem("sec_answer", secAnswer);
    localStorage.setItem("admin_password", adminPass);
    toast.success("System configuration updated successfully.");
  };

  return (
  <AppShell>
    <PageHeader
      title="System Settings & Control"
      subtitle="Administrative Management · Security Parameters"
      actions={<Btn variant="gold" onClick={handleSave}><Save className="w-4 h-4" /> Save Configuration</Btn>}
    />

    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-8 space-y-6">
        <Section title="Personnel Assignment">
          <div className="p-2 bg-primary/5 border border-primary/10 rounded-sm mb-4">
            <p className="text-xs text-primary/70 px-2 py-1">Assign the active administrator responsible for this terminal.</p>
          </div>
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
            <Field label="System Admin Password" required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type={showAdminPass ? "text" : "password"} 
                  value={adminPass} 
                  onChange={(e) => setAdminPass(e.target.value)} 
                  className="pl-10 pr-10 w-full font-mono"
                />
                <button 
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <div className="col-span-2 grid grid-cols-2 gap-6 pt-4 border-t border-border/50">
              <Field label="Recovery Security Question" required>
                <Input value={secQuestion} onChange={(e) => setSecQuestion(e.target.value)} placeholder="e.g. Your first school name" />
              </Field>
              <Field label="Security Answer" required>
                <div className="relative">
                  <Input 
                    type={showSecAnswer ? "text" : "password"} 
                    value={secAnswer} 
                    onChange={(e) => setSecAnswer(e.target.value)} 
                    className="pr-10 w-full font-mono"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowSecAnswer(!showSecAnswer)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                  >
                    {showSecAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
            </div>
          </div>
        </Section>
      </div>

      <div className="col-span-4 space-y-6">
        <Section title="Administrative Hub">
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground mb-4">Quick access to establishment structural management.</p>
            <Btn variant="outline" className="w-full justify-start h-12" onClick={() => navigate("/settings/departments")}>
              <Building2 className="w-5 h-5 mr-3 text-accent" />
              <div className="text-left">
                <div className="text-[0.7rem] font-bold">Manage Departments</div>
                <div className="text-[0.6rem] text-muted-foreground font-normal lowercase tracking-normal">Add/Edit Naval Units & Wings</div>
              </div>
            </Btn>
            <Btn variant="outline" className="w-full justify-start h-12" onClick={() => navigate("/settings/ranks")}>
              <ShieldCheck className="w-5 h-5 mr-3 text-accent" />
              <div className="text-left">
                <div className="text-[0.7rem] font-bold">Manage Rank System</div>
                <div className="text-[0.6rem] text-muted-foreground font-normal lowercase tracking-normal">Configure Civilian BPS Levels</div>
              </div>
            </Btn>
          </div>
        </Section>

        <div className="panel p-5 bg-primary/5 border-dashed border-2 border-primary/20 rounded-md">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h4 className="text-sm font-bold text-primary">System Integrity</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Version</span>
              <span className="font-mono font-bold">v2.4.0-STABLE</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Last Security Sync</span>
              <span className="font-mono font-bold text-success uppercase">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppShell>
  );
};
export default Settings;
