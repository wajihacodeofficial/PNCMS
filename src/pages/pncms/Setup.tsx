import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, AlertCircle, CheckCircle2, Eye, EyeOff, HelpCircle } from 'lucide-react';
import warship from '@/assets/navy-warship.jpg';
import crest from '@/assets/navy-crest.png';
import { Btn } from '@/components/pncms/ui-kit';
import { api } from '@/lib/api';

const Setup = () => {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [secQuestion, setSecQuestion] = useState("What is your mother's maiden name?");
  const [secAnswer, setSecAnswer] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) return setError('Username is required.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    if (!secAnswer.trim()) return setError('Security answer is required.');

    setLoading(true);
    try {
      await api.setupAdmin({ username: username.trim(), password, secQuestion, secAnswer: secAnswer.trim() });
      setSuccess('System configured successfully! Redirecting to login...');
      setTimeout(() => nav('/'), 1800);
    } catch (err: any) {
      setError(err?.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <img
        src={warship}
        alt="Pakistan Navy warship"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--primary)/0.6)_100%)]" />

      <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
      <div className="absolute top-6 left-8 label-mil text-white/60 text-[0.65rem]">
        RESTRICTED · GOVERNMENT OF PAKISTAN · PNS DILAWAR COMMAND
      </div>
      <div className="absolute top-6 right-8 label-mil text-white/60 text-[0.65rem]">
        FIRST TIME SETUP
      </div>

      <div className="absolute bottom-5 left-0 right-0 text-center label-mil text-white/60 text-[0.65rem] z-10">
        Developed by{' '}
        <span className="text-white font-semibold tracking-widest">Code Vertex Solutions</span>
      </div>

      <div className="relative w-[460px] animate-fade-in">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-md shadow-elevated p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-md bg-white flex items-center justify-center shadow-elevated mb-4">
              <img src={crest} alt="Pakistan Navy crest" className="w-16 h-16 object-contain" />
            </div>
            <h1 className="text-3xl text-white tracking-wider">PNCMS</h1>
            <div className="gold-rule mx-auto my-2" />
            <p className="label-mil text-[0.65rem] text-white/70">Initial System Configuration</p>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-sm p-3 mb-6 text-center">
            <p className="text-white/80 text-xs leading-relaxed">
              Welcome. This is your <span className="text-accent font-bold">first time running PNCMS</span>.<br />
              Please create an administrator account to continue.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/20 border border-destructive p-3 rounded-md flex items-center gap-2 text-sm mb-5">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <span className="text-white">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-500/20 border border-green-500 p-3 rounded-md flex items-center gap-2 text-sm mb-5">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-white">{success}</span>
            </div>
          )}

          <form onSubmit={handleSetup} className="space-y-4">
            {/* Username */}
            <div>
              <label className="label-mil text-white/80">Administrator Username</label>
              <div className="mt-1.5 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full h-11 pl-10 pr-3 bg-white/5 border border-white/20 rounded-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent"
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label-mil text-white/80">Password</label>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full h-11 pl-10 pr-11 bg-white/5 border border-white/20 rounded-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label-mil text-white/80">Confirm Password</label>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full h-11 pl-10 pr-11 bg-white/5 border border-white/20 rounded-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Security Question */}
            <div>
              <label className="label-mil text-white/80">Security Question</label>
              <div className="mt-1.5 relative">
                <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <select
                  value={secQuestion}
                  onChange={(e) => setSecQuestion(e.target.value)}
                  className="w-full h-11 pl-10 pr-3 bg-white/5 border border-white/20 rounded-sm text-white focus:outline-none focus:border-accent appearance-none"
                >
                  <option value="What is your mother's maiden name?" className="bg-primary text-white">What is your mother's maiden name?</option>
                  <option value="What was the name of your first pet?" className="bg-primary text-white">What was the name of your first pet?</option>
                  <option value="What city were you born in?" className="bg-primary text-white">What city were you born in?</option>
                  <option value="What is your favorite book?" className="bg-primary text-white">What is your favorite book?</option>
                  <option value="What was the make of your first car?" className="bg-primary text-white">What was the make of your first car?</option>
                </select>
              </div>
            </div>

            {/* Security Answer */}
            <div>
              <label className="label-mil text-white/80">Security Answer</label>
              <div className="mt-1.5 relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  value={secAnswer}
                  onChange={(e) => setSecAnswer(e.target.value)}
                  placeholder="Enter your answer"
                  className="w-full h-11 pl-10 pr-3 bg-white/5 border border-white/20 rounded-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent"
                  autoComplete="off"
                />
              </div>
            </div>

            <Btn
              variant="gold"
              className="w-full h-11 text-sm mt-2"
              type="submit"
              disabled={loading}
            >
              <ShieldCheck className="w-4 h-4" />
              {loading ? 'Configuring System...' : 'Create Account & Continue'}
            </Btn>
          </form>

          <div className="mt-7 pt-5 border-t border-white/10 text-center">
            <p className="label-mil text-[0.6rem] text-accent">Authorized Personnel Only</p>
            <p className="text-[0.65rem] text-white/50 mt-1.5 font-body">
              These credentials will be required for all future logins and administrative actions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setup;
