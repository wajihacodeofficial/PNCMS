import { useNavigate } from "react-router-dom";
import { ShieldCheck, Lock, User } from "lucide-react";
import warship from "@/assets/navy-warship.jpg";
import crest from "@/assets/navy-crest.png";
import { Btn } from "@/components/pncms/ui-kit";

const Login = () => {
  const nav = useNavigate();
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <img src={warship} alt="Pakistan Navy warship at sea" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1280} />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--primary)/0.6)_100%)]" />

      {/* Top strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
      <div className="absolute top-6 left-8 label-mil text-white/60 text-[0.65rem]">
        RESTRICTED · GOVERNMENT OF PAKISTAN · NAVAL COMMAND
      </div>
      <div className="absolute top-6 right-8 label-mil text-white/60 text-[0.65rem]">
        SYSTEM v3.4.1 · BUILD 20260428
      </div>

      <div className="absolute bottom-5 left-0 right-0 text-center label-mil text-white/60 text-[0.65rem] z-10">
        Developed by <span className="text-white font-semibold tracking-widest">Code Vertex Solutions</span>
      </div>

      <div className="relative w-[440px] animate-fade-in">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-md shadow-elevated p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-md bg-white flex items-center justify-center shadow-elevated mb-4">
              <img src={crest} alt="Pakistan Navy crest" className="w-16 h-16 object-contain" width={64} height={64} />
            </div>
            <h1 className="text-3xl text-white tracking-wider">PNCMS</h1>
            <div className="gold-rule mx-auto my-2" />
            <p className="label-mil text-[0.65rem] text-white/70">Civilian Management System</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); nav("/dashboard"); }} className="space-y-5">
            <div>
              <label className="label-mil text-white/80">User ID</label>
              <div className="mt-1.5 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input defaultValue="ADM-CLERK-04" className="w-full h-11 pl-10 pr-3 bg-white/5 border border-white/20 rounded-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent" />
              </div>
            </div>
            <div>
              <label className="label-mil text-white/80">Secure Password</label>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input type="password" defaultValue="••••••••••" className="w-full h-11 pl-10 pr-3 bg-white/5 border border-white/20 rounded-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent" />
              </div>
            </div>

            <Btn variant="gold" className="w-full h-11 text-sm" type="submit">
              <ShieldCheck className="w-4 h-4" /> Login to Terminal
            </Btn>
          </form>

          <div className="mt-7 pt-5 border-t border-white/10 text-center">
            <p className="label-mil text-[0.6rem] text-accent">Authorized Personnel Only</p>
            <p className="text-[0.65rem] text-white/50 mt-1.5 font-body">All access is logged and monitored under Naval Cyber Policy 2024.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
