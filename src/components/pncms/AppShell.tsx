import { ReactNode, useState, useEffect, useMemo, createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { Bell, ShieldCheck, ChevronDown, ArrowLeft, ArrowRight, RotateCcw, Search, User, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { personnel } from '@/data/mock';

type Cadre = 'Ministerial' | 'Industrial';

const CadreContext = createContext<{
  cadre: Cadre;
  setCadre: (c: Cadre) => void;
}>({ cadre: 'Ministerial', setCadre: () => {} });

export const useCadre = () => useContext(CadreContext);

export const AppShell = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [clerkName, setClerkName] = useState("Wajiha Zehra");
  const [globalSearch, setGlobalSearch] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [cadre, setCadreState] = useState<Cadre>(() => {
    return (localStorage.getItem("active_cadre") as Cadre) || 'Ministerial';
  });

  const searchResults = useMemo(() => {
    if (!globalSearch) return [];
    const searchLower = globalSearch.toLowerCase();
    return personnel.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.svc.includes(searchLower)
    ).slice(0, 6);
  }, [globalSearch]);

  const setCadre = (c: Cadre) => {
    setCadreState(c);
    localStorage.setItem("active_cadre", c);
  };

  useEffect(() => {
    const saved = localStorage.getItem("clerk_name");
    if (saved) setClerkName(saved);
  }, []);

  return (
    <CadreContext.Provider value={{ cadre, setCadre }}>
      <div className="min-h-screen w-full flex bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
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

            <div className="flex-1 max-w-xl px-12 relative group">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
                <input 
                  type="text" 
                  placeholder="Global Personnel Search..." 
                  className="w-full h-10 pl-10 pr-12 bg-muted/30 border border-border rounded-sm text-sm focus:outline-none focus:border-accent focus:bg-card transition-all font-medium"
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 border border-border rounded bg-muted/50 text-[0.6rem] text-muted-foreground font-bold uppercase tracking-tighter">
                  <Command className="w-2.5 h-2.5" /> K
                </div>
              </div>

              {showResults && globalSearch && (
                <div className="absolute top-full left-12 right-12 mt-1 bg-card border border-border rounded-sm shadow-elevated z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-border bg-muted/20 text-[0.6rem] font-bold text-muted-foreground uppercase tracking-wider flex justify-between items-center">
                    Search Results
                    <button onClick={() => setShowResults(false)} className="hover:text-primary">Close</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {searchResults.length > 0 ? searchResults.map(p => (
                      <button
                        key={p.svc}
                        onClick={() => {
                          navigate(`/personnel/${p.svc}`);
                          setGlobalSearch("");
                          setShowResults(false);
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 group/item"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-sm bg-accent/10 flex items-center justify-center text-accent">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-primary group-hover/item:text-accent transition-colors">{p.name}</div>
                            <div className="text-[0.65rem] text-muted-foreground uppercase">{p.rank} · {p.dept}</div>
                          </div>
                        </div>
                        <div className="text-xs font-mono font-bold text-accent">{p.svc}</div>
                      </button>
                    )) : (
                      <div className="p-8 text-center text-muted-foreground italic text-xs">No personnel matches found for "{globalSearch}"</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate('/notifications')}
                className="relative text-muted-foreground hover:text-primary"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[10px] rounded-full flex items-center justify-center">3</span>
              </button>
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
          <main className="flex-1 p-8 animate-fade-in">{children}</main>
        </div>
      </div>
    </CadreContext.Provider>
  );
};

export const PageHeader = ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) => (
  <div className="flex items-end justify-between mb-6 pb-5 border-b border-border">
    <div>
      <h1 className="text-3xl text-primary leading-none uppercase tracking-tight font-heading font-black italic">{title}</h1>
      <div className="gold-rule mt-3" />
      {subtitle && <p className="label-mil mt-2">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-3">{actions}</div>}
  </div>
);
