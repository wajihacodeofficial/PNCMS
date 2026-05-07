import { useState, useMemo } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Field, Input, Select } from "@/components/pncms/ui-kit";
import { Plus, Pencil, Trash2, Briefcase, Factory, X, User, ArrowLeft, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { useRanks, useUpsertRank, useDeleteRank, usePersonnel, useCreateLog } from "@/hooks/use-api";
import { exportToPDF, exportToExcel } from "@/lib/export";

interface Rank {
  id: string;
  name: string;
  bps: string;
  cadre: "Ministerial" | "Industrial";
  born?: number;
  sanctioned?: number;
}

const Ranks = () => {
  const { data: ranks = [], isLoading: isRanksLoading } = useRanks();
  const { data: personnel = [] } = usePersonnel();
  const { mutate: upsertRank } = useUpsertRank();
  const { mutate: deleteRank } = useDeleteRank();
  const { mutate: createLog } = useCreateLog();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeCadre, setActiveCadre] = useState<"Ministerial" | "Industrial">("Ministerial");
  const [viewingRank, setViewingRank] = useState<Rank | null>(null);
  const [formData, setFormData] = useState<any>({ name: "", bps: "", cadre: "Ministerial", sanctioned: 0 });

  const handleOpenModal = (rank?: Rank, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (rank) {
      setEditingId(rank.id);
      setFormData({
        name: rank.name,
        bps: rank.bps,
        cadre: rank.cadre,
        sanctioned: rank.sanctioned || 0
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", bps: "", cadre: activeCadre, sanctioned: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.bps) {
      toast.error("Please fill required fields");
      return;
    }

    upsertRank({ id: editingId, ...formData }, {
      onSuccess: () => {
        createLog({
          user: localStorage.getItem("username") || "Admin",
          action: editingId ? "UPDATE" : "CREATE",
          entity: `Rank: ${formData.name} (${formData.cadre})`,
          result: "Success"
        });
        toast.success(editingId ? "Rank updated" : "Rank created");
        setIsModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.message || "Operation failed");
      }
    });
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the rank: ${name}?`)) {
      deleteRank(id, {
        onSuccess: () => {
          createLog({
            user: localStorage.getItem("username") || "Admin",
            action: "DELETE",
            entity: `Rank: ${name}`,
            result: "Success"
          });
          toast.success("Rank deleted");
        }
      });
    }
  };

  const processedRanks = useMemo(() => {
    return (ranks as any[]).map(r => {
      const bornCount = (personnel as any[]).filter(p => p.rankId === r.id).length;
      return { ...r, born: bornCount };
    });
  }, [ranks, personnel]);

  const filteredRanks = processedRanks.filter(r => r.cadre === activeCadre);
  const rankIndividuals = viewingRank ? (personnel as any[]).filter(p => p.rankId === viewingRank.id) : [];

  if (isRanksLoading) return <div className="p-8 text-center font-bold">Loading Rank Definitions...</div>;

  if (viewingRank) {
    return (
      <AppShell>
        <PageHeader
          title={`Rank Roster: ${viewingRank.name}`}
          subtitle={`${viewingRank.cadre} Cadre · BPS Level: ${viewingRank.bps}`}
          actions={
            <div className="flex gap-2">
              <Btn variant="gold" onClick={() => exportToExcel('Personnel Roster', [['Svc No', 'Name', 'Dept']], rankIndividuals.map(i=>[i.serviceNo, i.name, i.department?.name]), `roster_${viewingRank.name}`)}><FileSpreadsheet className="w-4 h-4 mr-2" /> Save Excel</Btn>
              <Btn variant="outline" onClick={() => setViewingRank(null)}><ArrowLeft className="w-4 h-4 mr-2" /> Back to List</Btn>
            </div>
          }
        />
        <Section title={`Personnel Born against this Rank (${rankIndividuals.length})`}>
          <div className="overflow-x-auto -m-5">
            <table className="data-table">
              <thead>
                <tr><th>Service No</th><th>Name</th><th>Department</th><th>Status</th></tr>
              </thead>
              <tbody>
                {rankIndividuals.map((ind) => (
                  <tr key={ind.id}>
                    <td className="font-mono text-xs font-bold text-primary">{ind.serviceNo}</td>
                    <td className="font-bold text-primary">{ind.name}</td>
                    <td className="text-xs uppercase font-bold text-muted-foreground/60">{ind.department?.name}</td>
                    <td><span className="text-[0.6rem] font-bold uppercase py-0.5 px-2 bg-success/10 text-success rounded-full">{ind.status}</span></td>
                  </tr>
                ))}
                {rankIndividuals.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-20 text-muted-foreground italic">No personnel currently holding this rank.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Rank System Management"
        subtitle="Command Hierarchy · Cadre Definitions · Strength Monitoring"
        actions={<Btn variant="gold" onClick={() => handleOpenModal()}><Plus className="w-4 h-4" /> Define New Rank</Btn>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button onClick={() => setActiveCadre("Ministerial")} className={`p-6 rounded-sm border text-left transition-all ${activeCadre === "Ministerial" ? "border-accent bg-accent/5 shadow-md" : "border-border bg-card hover:bg-muted/50"}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-sm ${activeCadre === "Ministerial" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}><Briefcase className="w-6 h-6" /></div>
            <div>
              <h3 className="text-lg font-bold font-heading uppercase italic">Ministerial Cadre</h3>
              <p className="text-xs text-muted-foreground mt-1">Administrative, Clerical and Office Support Staff</p>
            </div>
          </div>
        </button>
        <button onClick={() => setActiveCadre("Industrial")} className={`p-6 rounded-sm border text-left transition-all ${activeCadre === "Industrial" ? "border-accent bg-accent/5 shadow-md" : "border-border bg-card hover:bg-muted/50"}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-sm ${activeCadre === "Industrial" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}><Factory className="w-6 h-6" /></div>
            <div>
              <h3 className="text-lg font-bold font-heading uppercase italic">Industrial Cadre</h3>
              <p className="text-xs text-muted-foreground mt-1">Technical, Workshop and Skilled Engineering Personnel</p>
            </div>
          </div>
        </button>
      </div>

      <Section title={`${activeCadre} Command Structure`}>
        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr><th>Rank Title</th><th>Level</th><th>Born</th><th>Sanctioned</th><th>Status</th><th className="text-right">Actions</th></tr>
            </thead>
            <tbody>
              {filteredRanks.map((r) => (
                <tr key={r.id} className="cursor-pointer hover:bg-primary/5 group" onClick={() => setViewingRank(r)}>
                  <td><div className="font-bold text-primary group-hover:italic transition-all">{r.name}</div></td>
                  <td className="font-mono text-xs text-muted-foreground">{r.bps}</td>
                  <td className="font-mono font-bold">{r.born}</td>
                  <td className="font-mono text-muted-foreground">{r.sanctioned || 0}</td>
                  <td>
                    <div className={`text-[0.6rem] font-bold uppercase flex items-center gap-1.5`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${r.born > (r.sanctioned||0) ? 'bg-danger' : 'bg-success'}`} />
                       {r.born > (r.sanctioned||0) ? 'Overstrength' : 'Within Limit'}
                    </div>
                  </td>
                  <td className="text-right" onClick={e=>e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <button onClick={(e) => handleOpenModal(r, e)} className="p-1.5 rounded-sm hover:bg-primary/10 text-primary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={(e) => handleDelete(r.id, r.name, e)} className="p-1.5 rounded-sm hover:bg-primary/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-md rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
            <div className="bg-primary px-6 py-4 flex items-center justify-between text-white font-heading font-bold uppercase italic tracking-wider">
               {editingId ? "Modify Rank" : "Define Rank"}
               <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-4">
              <Field label="Rank Title" required><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></Field>
              <Field label="BPS Level" required><Input value={formData.bps} onChange={e => setFormData({...formData, bps: e.target.value})} placeholder="e.g. BPS-07" /></Field>
              <Field label="Cadre" required><Select value={formData.cadre} onChange={e => setFormData({...formData, cadre: e.target.value})}><option value="Ministerial">Ministerial</option><option value="Industrial">Industrial</option></Select></Field>
              <Field label="Sanctioned Strength"><Input type="number" value={formData.sanctioned} onChange={e => setFormData({...formData, sanctioned: parseInt(e.target.value)})} /></Field>
            </div>
            <div className="bg-muted/30 p-5 flex justify-end gap-3 border-t border-border">
              <Btn variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Btn>
              <Btn variant="gold" onClick={handleSave}>Commit Definition</Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Ranks;
