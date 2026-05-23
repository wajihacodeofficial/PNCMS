import { ReactNode, useState, useEffect, useMemo, createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, ShieldCheck, ChevronDown, ArrowLeft, ArrowRight, RotateCcw, Search, User, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings, usePersonnel } from '@/hooks/use-api';

type Cadre = 'Ministerial' | 'Industrial';

const CadreContext = createContext<{ cadre: Cadre; setCadre: (c: Cadre) => void }>({ cadre: 'Ministerial', setCadre: () => {} });
export const useCadre = () => useContext(CadreContext);

export const PersonnelContext = createContext<{ personnel: any[]; isLoading: boolean }>({ personnel: [], isLoading: false });
export const usePersonnelContext = () => useContext(PersonnelContext);

export const AppShell = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const { data: settings } = useSettings();
  const { data: personnel = [], isLoading: isLoadingPersonnel } = usePersonnel();
  const [clerkName, setClerkName] = useState('Wajiha Zehra');
  const [cadre, setCadreState] = useState<Cadre>(() => {
    return (localStorage.getItem('active_cadre') as Cadre) || 'Ministerial';
  });

  const setCadre = (c: Cadre) => {
    setCadreState(c);
    localStorage.setItem('active_cadre', c);
  };

  useEffect(() => {
    if (settings) {
      if (settings.clerk_name) setClerkName(settings.clerk_name);
      Object.entries(settings).forEach(([key, value]) => {
        localStorage.setItem(key, value as string);
      });
    }
  }, [settings]);

  return (
    <CadreContext.Provider value={{ cadre, setCadre }}>
      <PersonnelContext.Provider value={{ personnel, isLoading: isLoadingPersonnel }}>
        <div className="min-h-screen w-full flex bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30 text-[10px]">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5 border-r border-border pr-4">
                  <button onClick={() => navigate(-1)} className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="Go Back">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigate(1)} className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="Go Forward">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => window.location.reload()} className="p-1.5 rounded-sm hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="Reload App">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs label-mil text-success">
                  <span className="inline-block w-2 h-2 rounded-full bg-success animate-pulse" />
                  Secure Session
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="h-6 w-px bg-border" />
                <div className="flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors px-2 py-1 rounded-sm" onClick={() => navigate('/settings')}>
                  <div className="w-9 h-9 rounded-sm bg-gradient-command text-white flex items-center justify-center text-sm font-bold uppercase">
                    {clerkName.substring(0, 2)}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-primary">Admin Clerk</div>
                    <div className="label-mil text-[0.6rem] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-accent" /> {clerkName}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </header>
            <main className="flex-1 p-8 animate-fade-in text-[10px]">
              {children}
            </main>
          </div>
        </div>
      </PersonnelContext.Provider>
    </CadreContext.Provider>
  );
};

export const PageHeader = ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) => (
  <div className="flex items-end justify-between mb-6 pb-5 border-b border-border text-[10px]">
    <div>
      <h1 className="text-[10px] text-primary leading-none uppercase tracking-tight font-heading font-black italic">{title}</h1>
      <div className="gold-rule mt-3" />
      {subtitle && <p className="label-mil mt-2 text-[10px]">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);
