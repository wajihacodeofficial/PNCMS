import { useState } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Field, Input, Select, Badge } from "@/components/pncms/ui-kit";
import { Plus, Pencil, Trash2, ShieldCheck, Briefcase, Factory, X, User, ArrowLeft, Download, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";

interface Rank {
  id: string;
  name: string;
  bps: string;
  cadre: "Ministerial" | "Industrial";
  born: number;
  sanctioned: number;
}

interface Individual {
  id: string;
  serviceNo: string;
  rank: string;
  name: string;
  cadre: string;
  phone: string;
  department: string;
}

const Ranks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRank, setEditingRank] = useState<Rank | null>(null);
  const [activeCadre, setActiveCadre] = useState<"Ministerial" | "Industrial">("Ministerial");
  const [viewingRank, setViewingRank] = useState<Rank | null>(null);

  const [formData, setFormData] = useState<Partial<Rank>>({});

  // Mock ranks
  const [ranks, setRanks] = useState<Rank[]>([
    { id: "1", name: "Assistant", bps: "BPS-15", cadre: "Ministerial", born: 2, sanctioned: 6 },
    { id: "2", name: "UDC", bps: "BPS-11", cadre: "Ministerial", born: 1, sanctioned: 15 },
    { id: "3", name: "LDC", bps: "BPS-9", cadre: "Ministerial", born: 1, sanctioned: 25 },
    { id: "4", name: "Stenographer", bps: "BPS-14", cadre: "Ministerial", born: 0, sanctioned: 3 },
    { id: "5", name: "Driver", bps: "BPS-4", cadre: "Industrial", born: 0, sanctioned: 10 },
    { id: "6", name: "Technician", bps: "BPS-7", cadre: "Industrial", born: 1, sanctioned: 20 },
    { id: "7", name: "Foreman", bps: "BPS-16", cadre: "Industrial", born: 1, sanctioned: 2 },
  ]);

  // Mock individuals for rank view
  const individuals: Individual[] = [
    { id: '101', serviceNo: '10235', rank: 'Assistant', name: 'Ali Khan', cadre: 'Ministerial', phone: '0300-1234567', department: 'Administration' },
    { id: '102', serviceNo: '10245', rank: 'UDC', name: 'Usman Raza', cadre: 'Ministerial', phone: '0321-7654321', department: 'Administration' },
    { id: '103', serviceNo: '20415', rank: 'Technician', name: 'Bilal Ahmed', cadre: 'Industrial', phone: '0333-9876543', department: 'Engineering' },
    { id: '104', serviceNo: '20425', rank: 'Foreman', name: 'Zain Malik', cadre: 'Industrial', phone: '0345-1122334', department: 'Engineering' },
    { id: '105', serviceNo: '30015', rank: 'Assistant', name: 'Fahad Mustafa', cadre: 'Ministerial', phone: '0301-2233445', department: 'Logistics' },
  ];

  const handleOpenModal = (rank?: Rank, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (rank) {
      setEditingRank(rank);
      setFormData(rank);
    } else {
      setEditingRank(null);
      setFormData({
        name: "",
        bps: "",
        cadre: activeCadre,
        born: 0,
        sanctioned: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingRank) {
      setRanks(ranks.map(r => r.id === editingRank.id ? { ...r, ...formData } as Rank : r));
    } else {
      const newRank = { ...formData, id: Date.now().toString() } as Rank;
      setRanks([...ranks, newRank]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this rank definition?")) {
      setRanks(ranks.filter(r => r.id !== id));
    }
  };

  const exportPDF = () => {
    if (!viewingRank) return;
    const doc = new jsPDF();
    const rankInds = individuals.filter(ind => ind.rank === viewingRank.name);
    
    doc.setFontSize(18);
    doc.text(`Personnel Roster - Rank: ${viewingRank.name}`, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Cadre: ${viewingRank.cadre} | Total Personnel: ${rankInds.length}`, 14, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [['Service No', 'Name', 'Department', 'Contact']],
      body: rankInds.map(ind => [ind.serviceNo, ind.name, ind.department, ind.phone]),
      headStyles: { fillColor: [24, 44, 71] },
      styles: { fontSize: 9 }
    });
    
    doc.save(`Personnel_Roster_${viewingRank.name}.pdf`);
  };

  const exportExcel = async () => {
    if (!viewingRank) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Personnel - ${viewingRank.name}`);
    const rankInds = individuals.filter(ind => ind.rank === viewingRank.name);

    worksheet.columns = [
      { header: 'Service No', key: 'serviceNo', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Department', key: 'department', width: 25 },
      { header: 'Contact', key: 'phone', width: 20 },
    ];

    rankInds.forEach(ind => worksheet.addRow(ind));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `Personnel_Roster_${viewingRank.name}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredRanks = ranks.filter(r => r.cadre === activeCadre);
  const rankIndividuals = viewingRank ? individuals.filter(ind => ind.rank === viewingRank.name) : [];

  if (viewingRank) {
    return (
      <AppShell>
        <PageHeader
          title={`Personnel with Rank: ${viewingRank.name}`}
          subtitle={`${viewingRank.cadre} Cadre · Total Born: ${viewingRank.born}`}
          actions={
            <div className="flex gap-2">
              <Btn variant="gold" onClick={exportExcel}><FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel</Btn>
              <Btn variant="gold" onClick={exportPDF}><Download className="w-4 h-4 mr-2" /> Export PDF</Btn>
              <Btn variant="outline" onClick={() => setViewingRank(null)}><ArrowLeft className="w-4 h-4 mr-2" /> Back to Ranks</Btn>
            </div>
          }
        />
        <div className="grid grid-cols-1 gap-6">
          <Section title="Rank Roster">
            <div className="overflow-x-auto -m-5">
              <table className="data-table">
                <thead className="bg-muted/50">
                  <tr>
                    <th>Service No</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {rankIndividuals.length > 0 ? rankIndividuals.map((ind) => (
                    <tr key={ind.id}>
                      <td className="font-mono text-xs font-bold text-accent">{ind.serviceNo}</td>
                      <td className="font-bold text-primary">{ind.name}</td>
                      <td className="text-xs">{ind.department}</td>
                      <td className="font-mono text-xs">{ind.phone}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="text-center py-20 text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <User className="w-12 h-12 text-muted/30" />
                          <p className="font-bold">No personnel found</p>
                          <p className="text-xs">No personnel currently holding this rank in the database.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Rank System Management"
        subtitle="Define & Configure Personnel Hierarchy"
        actions={
          <Btn variant="gold" onClick={() => handleOpenModal()}><Plus className="w-4 h-4" /> Create Rank</Btn>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button 
          onClick={() => setActiveCadre("Ministerial")}
          className={`p-6 rounded-lg border text-left transition-all ${
            activeCadre === "Ministerial" 
            ? "border-accent bg-accent/10 shadow-md" 
            : "border-border bg-card hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${activeCadre === "Ministerial" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-lg font-bold font-heading ${activeCadre === "Ministerial" ? "text-primary" : "text-foreground"}`}>Ministerial Cadre</h3>
              <p className="text-sm text-muted-foreground mt-1">Administrative and office personnel</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => setActiveCadre("Industrial")}
          className={`p-6 rounded-lg border text-left transition-all ${
            activeCadre === "Industrial" 
            ? "border-accent bg-accent/10 shadow-md" 
            : "border-border bg-card hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${activeCadre === "Industrial" ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"}`}>
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <h3 className={`text-lg font-bold font-heading ${activeCadre === "Industrial" ? "text-primary" : "text-foreground"}`}>Industrial Cadre</h3>
              <p className="text-sm text-muted-foreground mt-1">Technical, workshop, and field staff</p>
            </div>
          </div>
        </button>
      </div>

      <div className="w-full">
        <Section title={`${activeCadre} Ranks`}>
          <div className="overflow-x-auto -m-5">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank Title</th>
                  <th>Born Strength</th>
                  <th>Sanctioned Strength</th>
                  <th>Variance</th>
                  <th>Remarks</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRanks.map((r) => {
                  const variance = r.born - r.sanctioned;
                  const varianceText =
                    variance > 0
                      ? `+${variance} Excess`
                      : variance < 0
                        ? `${Math.abs(variance)} Shortage`
                        : 'Balanced';
                  const varianceColor =
                    variance > 0
                      ? 'text-green-500 font-bold'
                      : variance < 0
                        ? 'text-destructive font-bold'
                        : 'text-muted-foreground font-bold';
                        
                  return (
                  <tr key={r.id} className="cursor-pointer hover:bg-muted/60 group" onClick={() => setViewingRank(r)}>
                    <td>
                      <div className="font-bold text-primary group-hover:text-primary group-hover:font-black transition-all">{r.name}</div>
                      <div className="text-[0.65rem] text-muted-foreground font-mono mt-0.5">{r.bps}</div>
                    </td>
                    <td className="font-mono text-sm">{r.born}</td>
                    <td className="font-mono text-sm">{r.sanctioned}</td>
                    <td className={`font-mono text-sm ${varianceColor}`}>{varianceText}</td>
                    <td className="text-xs text-muted-foreground italic">
                       {variance < 0 ? "Requires recruitment" : variance > 0 ? "Review postings" : "Optimal"}
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={(e) => handleOpenModal(r, e)} className="p-1.5 rounded-sm hover:bg-muted text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={(e) => handleDelete(r.id, e)} className="p-1.5 rounded-sm hover:bg-muted text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-md shadow-elevated overflow-hidden border border-border">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg text-white font-heading font-bold">{editingRank ? "Edit Rank Definition" : "New Rank Definition"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <Field label="Rank Title" required>
                <Input 
                  placeholder="e.g. Senior Clerk" 
                  value={formData.name || ""}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </Field>
              <Field label="Cadre" required>
                <Select 
                  value={formData.cadre || activeCadre} 
                  onChange={(e) => setFormData({...formData, cadre: e.target.value as any})}
                >
                  <option value="Ministerial">Ministerial</option>
                  <option value="Industrial">Industrial</option>
                </Select>
              </Field>
              <Field label="BPS Level" required>
                <Input 
                  placeholder="e.g. BPS-11" 
                  value={formData.bps || ""}
                  onChange={(e) => setFormData({...formData, bps: e.target.value})}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Born Strength">
                  <Input type="number" value={formData.born || 0} onChange={(e) => setFormData({...formData, born: parseInt(e.target.value)})} />
                </Field>
                <Field label="Sanctioned Strength">
                  <Input type="number" value={formData.sanctioned || 0} onChange={(e) => setFormData({...formData, sanctioned: parseInt(e.target.value)})} />
                </Field>
              </div>
            </div>
            <div className="bg-muted/30 p-4 border-t border-border flex justify-end gap-3">
              <Btn variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Btn>
              <Btn variant="gold" onClick={handleSave}>Save Changes</Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Ranks;
