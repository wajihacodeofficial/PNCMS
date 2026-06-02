import { useState, useMemo } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import { Btn, Badge, Section, Field, Input } from '@/components/pncms/ui-kit';
import {
  Plus,
  MapPin,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
  Download,
} from 'lucide-react';
import { exportToPDF } from '@/lib/export';
import { toast } from 'sonner';
import { useDepartments, useUpsertDepartment, useDeleteDepartment, usePersonnel, useCreateLog } from '@/hooks/use-api';

const Departments = () => {
  const { data: depts = [], isLoading: isDeptsLoading } = useDepartments();
  const { data: personnel = [] } = usePersonnel();
  const { mutate: upsertDept } = useUpsertDepartment();
  const { mutate: deleteDept } = useDeleteDepartment();
  const { mutate: createLog } = useCreateLog();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingDeptId, setViewingDeptId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({ name: '', location: '', navcom: '', hodName: '', hodRank: '', approvedSanctionStrength: 0 });

  const handleOpenModal = (dept?: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (dept) {
      setEditingId(dept.id);
      setFormData({
        name: dept.name,
        location: dept.location,
        navcom: dept.navcom,
        hodName: dept.hodName || '',
        hodRank: dept.hodRank || '',
        approvedSanctionStrength: dept.approvedSanctionStrength || 0
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', location: '', navcom: '', hodName: '', hodRank: '', approvedSanctionStrength: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.navcom) {
      toast.error("Required fields missing");
      return;
    }

    upsertDept({ id: editingId, ...formData }, {
      onSuccess: () => {
        createLog({
          user: localStorage.getItem("username") || "Admin",
          action: editingId ? "UPDATE" : "CREATE",
          entity: `Department: ${formData.name}`,
          result: "Success"
        });
        toast.success(editingId ? "Department updated" : "Department created");
        setIsModalOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.message || "Operation failed");
      }
    });
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteDept(id, {
        onSuccess: () => {
          createLog({
            user: localStorage.getItem("username") || "Admin",
            action: "DELETE",
            entity: `Department: ${name}`,
            result: "Success"
          });
          toast.success("Department deleted");
        }
      });
    }
  };

  const processedDepts = useMemo(() => {
    return (depts as any[]).map(d => {
      const bornCount = personnel.length > 0
        ? (personnel as any[]).filter(p => p.departmentId === d.id).length
        : (d.bornStrength || 0);
      return { ...d, born: bornCount };
    });
  }, [depts, personnel]);

  const viewingDept = useMemo(() => {
    return processedDepts.find(d => d.id === viewingDeptId);
  }, [processedDepts, viewingDeptId]);

  const deptIndividuals = useMemo(() => {
    return (personnel as any[]).filter(p => p.departmentId === viewingDeptId);
  }, [personnel, viewingDeptId]);

  if (isDeptsLoading) return <div className="p-8 text-center font-bold">Loading Establishment Data...</div>;

  if (viewingDept) {
    return (
      <AppShell>
        <PageHeader
          title={`Establishment: ${viewingDept.name}`}
          subtitle={`${viewingDept.location || 'Main Unit'} · Current Strength: ${viewingDept.born}`}
          actions={
            <div className="flex gap-2">
              <Btn variant="outline" onClick={() => exportToPDF(`Personnel Roster - ${viewingDept.name}`, [['Svc No', 'Name', 'Rank']], deptIndividuals.map(i=>[i.serviceNo, i.name, i.rank?.name]), `dept_${viewingDept.name}`)}>
                <Download className="w-4 h-4 mr-2" /> Export PDF
              </Btn>
              <Btn variant="outline" onClick={() => setViewingDeptId(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Departments
              </Btn>
            </div>
          }
        />
        <Section title={`Authorized Personnel List (${deptIndividuals.length})`}>
          <div className="overflow-x-auto -m-5">
            <table className="data-table">
              <thead>
                <tr><th>Svc No</th><th>Name</th><th>Rank</th><th>Status</th></tr>
              </thead>
              <tbody>
                {deptIndividuals.map((ind) => (
                  <tr key={ind.id}>
                    <td className="font-mono text-xs font-bold text-primary">{ind.serviceNo}</td>
                    <td className="font-bold text-primary">{ind.name}</td>
                    <td className="text-xs uppercase font-bold text-muted-foreground/60">{ind.rank?.name}</td>
                    <td><Badge variant="neutral">{ind.status}</Badge></td>
                  </tr>
                ))}
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
        title="Department Management"
        subtitle="Operational Units · Administrative Wings · Strength Control"
        actions={
          <div className="flex gap-2">
            <Btn
              variant="outline"
              onClick={() => {
                const headers = ["Department Name","Location","Navcom","HOD / OIC","Born","Sanctioned","Status"];
                const rows = processedDepts.map(d => {
                  const variance = d.born - (d.approvedSanctionStrength || 0);
                  const status =
                    variance > 0 ? `+${variance} Excess` :
                    variance < 0 ? `${Math.abs(variance)} Shortage` :
                    "Balanced";
                  return [
                    d.name,
                    d.location || "PNS DILAWAR",
                    d.navcom,
                    `${d.hodName} (${d.hodRank})`,
                    d.born,
                    d.approvedSanctionStrength || 0,
                    status
                  ];
                });
                exportToPDF("Active Establishment Strength", [headers], rows, "establishment_strength");
                toast.success("PDF Exported");
              }}
            >
              <Download className="w-4 h-4 mr-2" /> Export PDF
            </Btn>

            <Btn
              variant="outline"
              onClick={() => {
                const headers = ["Department Name","Location","Navcom","HOD / OIC","Born","Sanctioned","Status"];
                const rows = processedDepts.map(d => {
                  const variance = d.born - (d.approvedSanctionStrength || 0);
                  const status =
                    variance > 0 ? `+${variance} Excess` :
                    variance < 0 ? `${Math.abs(variance)} Shortage` :
                    "Balanced";
                  return [
                    d.name,
                    d.location || "PNS DILAWAR",
                    d.navcom,
                    `${d.hodName} (${d.hodRank})`,
                    d.born,
                    d.approvedSanctionStrength || 0,
                    status
                  ].join(",");
                });
                const csv = [headers.join(","), ...rows].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "establishment_strength.csv";
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Excel Exported");
              }}
            >
              <Download className="w-4 h-4 mr-2" /> Export Excel
            </Btn>

            <Btn variant="gold" onClick={() => handleOpenModal()}>
              <Plus className="w-4 h-4" /> Add New Department
            </Btn>
          </div>
        }
      />

       <Section title="Active Establishment Strength">
           <Btn
             variant="outline"
             onClick={() => {
               const headers = ["Department Name","Location","Navcom","HOD / OIC","Born","Sanctioned","Status"];
               const rows = processedDepts.map(d => {
                 const variance = d.born - (d.approvedSanctionStrength || 0);
                 const status =
                   variance > 0 ? `+${variance} Excess` :
                   variance < 0 ? `${Math.abs(variance)} Shortage` :
                   "Balanced";
                 return [
                   d.name,
                   d.location || "PNS DILAWAR",
                   d.navcom,
                   `${d.hodName} (${d.hodRank})`,
                   d.born,
                   d.approvedSanctionStrength || 0,
                   status
                 ];
               });
               exportToPDF(
                 "Active Establishment Strength",
                 [headers],
                 rows,
                 "establishment_strength"
               );
               toast.success("PDF Exported");
             }}
           >
             <Download className="w-4 h-4 mr-2" /> Export PDF
           </Btn>

           <Btn
             variant="outline"
             onClick={() => {
               const headers = ["Department Name","Location","Navcom","HOD / OIC","Born","Sanctioned","Status"];
               const rows = processedDepts.map(d => {
                 const variance = d.born - (d.approvedSanctionStrength || 0);
                 const status =
                   variance > 0 ? `+${variance} Excess` :
                   variance < 0 ? `${Math.abs(variance)} Shortage` :
                   "Balanced";
                 return [
                   d.name,
                   d.location || "PNS DILAWAR",
                   d.navcom,
                   `${d.hodName} (${d.hodRank})`,
                   d.born,
                   d.approvedSanctionStrength || 0,
                   status
                 ].join(",");
               });
               const csvContent = [headers.join(","), ...rows].join("\n");
               const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
               const url = URL.createObjectURL(blob);
               const a = document.createElement("a");
               a.href = url;
               a.download = "establishment_strength.csv";
               a.click();
               URL.revokeObjectURL(url);
               toast.success("Excel Exported");
             }}
           >
             <Download className="w-4 h-4 mr-2" /> Export Excel
           </Btn>
       </Section>

         <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Location</th>
                <th>Navcom</th>
                <th>HOD / OIC</th>
                <th>Born</th>
                <th>Sanctioned</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {processedDepts.map((d) => {
                const variance = d.born - (d.approvedSanctionStrength || 0);
                return (
                  <tr key={d.id} onClick={() => setViewingDeptId(d.id)} className="cursor-pointer hover:bg-primary/5 transition-colors group">
                    <td className="font-bold text-primary group-hover:italic">{d.name}</td>
                    <td><div className="flex items-center gap-2 text-[0.65rem]"><MapPin className="w-3 h-3 text-accent" />{d.location || 'PNS DILAWAR'}</div></td>
                    <td><Badge variant="neutral">{d.navcom}</Badge></td>
                    <td>
                      <div className="text-[0.65rem]">
                        <p className="font-bold text-primary">{d.hodName}</p>
                        <p className="text-muted-foreground uppercase">{d.hodRank}</p>
                      </div>
                    </td>
                    <td className="font-mono font-bold">{d.born}</td>
                    <td className="font-mono text-muted-foreground">{d.approvedSanctionStrength || 0}</td>
                     <td>
                        <div className={`text-[0.6rem] font-bold uppercase ${variance > 0 ? 'text-danger' : variance < 0 ? 'text-warning' : 'text-success'}`}>
                          {variance > 0 ? `+${variance} Excess` : variance < 0 ? `${Math.abs(variance)} Shortage` : 'Balanced'}
                        </div>
                     </td>
                    <td className="text-right" onClick={e=>e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button onClick={(e) => handleOpenModal(d, e)} className="p-1.5 rounded-sm hover:bg-primary/10 text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={(e) => handleDelete(d.id, d.name, e)} className="p-1.5 rounded-sm hover:bg-primary/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8">
          <div className="bg-card w-full max-w-2xl rounded-md shadow-elevated border border-border overflow-hidden animate-in zoom-in-95">
            <div className="bg-primary px-6 py-4 flex items-center justify-between text-white font-heading font-bold uppercase italic tracking-wider">
               {editingId ? 'Modify Department' : 'Register Department'}
               <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Department Name" required><Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></Field>
                <Field label="Location"><Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="e.g. PNS DILAWAR" /></Field>
                <Field label="Navcom (5-Digit)" required><Input value={formData.navcom} onChange={e => setFormData({ ...formData, navcom: e.target.value })} maxLength={5} /></Field>
                <Field label="Sanctioned Strength"><Input type="number" value={formData.approvedSanctionStrength} onChange={e => setFormData({ ...formData, approvedSanctionStrength: parseInt(e.target.value) || 0 })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <Field label="HOD / OIC Name"><Input value={formData.hodName} onChange={e => setFormData({ ...formData, hodName: e.target.value })} /></Field>
                <Field label="HOD Rank"><Input value={formData.hodRank} onChange={e => setFormData({ ...formData, hodRank: e.target.value })} /></Field>
              </div>
            </div>
            <div className="bg-muted/30 p-5 flex justify-end gap-3 border-t border-border">
              <Btn variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Btn>
              <Btn variant="gold" onClick={handleSave}>Commit Department</Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Departments;
