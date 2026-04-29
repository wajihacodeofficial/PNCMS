import { useState } from 'react';
import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import { Btn, Badge, Section, Field, Input } from '@/components/pncms/ui-kit';
import {
  Plus,
  Building2,
  MapPin,
  Users,
  Shield,
  Pencil,
  Trash2,
  X,
  ArrowLeft,
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  location: string;
  navcom: string;
  hod: string;
  hodRank: string;
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
  departmentId: string;
}

const Departments = () => {
  const [depts, setDepts] = useState<Department[]>([
    {
      id: '1',
      name: 'Civil Admin',
      location: 'A & R Block',
      navcom: '12345',
      hod: 'Lt Hamza Asif',
      hodRank: 'LT PN',
      born: 20,
      sanctioned: 15,
    },
    {
      id: '2',
      name: 'A & R ',
      location: 'A & R Block',
      navcom: '54321',
      hod: 'Lt Hamza Asif',
      hodRank: 'LT PN',
      born: 30,
      sanctioned: 25,
    },
    {
      id: '3',
      name: 'SRB Section',
      location: 'A & R Block',
      navcom: '54321',
      hod: 'Lt Hamza Asif',
      hodRank: 'LT PN',
      born: 10,
      sanctioned: 12,
    },
  ]);

  // Mock individuals data
  const [individuals, setIndividuals] = useState<Individual[]>([
    {
      id: '101',
      serviceNo: '10235',
      rank: 'Assistant',
      name: 'Ali Khan',
      cadre: 'Ministerial',
      phone: '0300-1234567',
      departmentId: '1',
    },
    {
      id: '102',
      serviceNo: '10245',
      rank: 'UDC',
      name: 'Usman Raza',
      cadre: 'Ministerial',
      phone: '0321-7654321',
      departmentId: '1',
    },
    {
      id: '103',
      serviceNo: '20415',
      rank: 'Technician',
      name: 'Bilal Ahmed',
      cadre: 'Industrial',
      phone: '0333-9876543',
      departmentId: '2',
    },
    {
      id: '104',
      serviceNo: '20425',
      rank: 'Foreman',
      name: 'Zain Malik',
      cadre: 'Industrial',
      phone: '0345-1122334',
      departmentId: '2',
    },
    {
      id: '105',
      serviceNo: '30015',
      rank: 'LDC',
      name: 'Fahad Mustafa',
      cadre: 'Ministerial',
      phone: '0301-2233445',
      departmentId: '3',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [viewingDept, setViewingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState<Partial<Department>>({});

  const [isIndModalOpen, setIsIndModalOpen] = useState(false);
  const [editingInd, setEditingInd] = useState<Individual | null>(null);
  const [indFormData, setIndFormData] = useState<Partial<Individual>>({});

  const handleOpenIndModal = (ind?: Individual, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (ind) {
      setEditingInd(ind);
      setIndFormData(ind);
    } else {
      setEditingInd(null);
      setIndFormData({
        serviceNo: '',
        name: '',
        rank: '',
        cadre: 'Ministerial',
        phone: '',
        departmentId: viewingDept?.id || '',
      });
    }
    setIsIndModalOpen(true);
  };

  const handleCloseIndModal = () => {
    setIsIndModalOpen(false);
    setEditingInd(null);
    setIndFormData({});
  };

  const handleSaveInd = () => {
    const { serviceNo, rank } = indFormData;
    if (rank?.toLowerCase() === 'casual labour') {
      if (serviceNo?.length !== 4) {
        alert('Casual Labour must have exactly a 4-digit Service Number.');
        return;
      }
    } else {
      if (!serviceNo || serviceNo.length < 5 || serviceNo.length > 6) {
        alert('Service Number must be 5 to 6 digits.');
        return;
      }
    }

    if (editingInd) {
      setIndividuals(
        individuals.map((ind) =>
          ind.id === editingInd.id
            ? ({ ...ind, ...indFormData } as Individual)
            : ind
        )
      );
    } else {
      const newInd = {
        ...indFormData,
        id: Date.now().toString(),
      } as Individual;
      setIndividuals([...individuals, newInd]);
    }
    handleCloseIndModal();
  };

  const handleDeleteInd = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIndividuals(individuals.filter((ind) => ind.id !== id));
  };



  const handleOpenModal = (dept?: Department, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (dept) {
      setEditingDept(dept);
      setFormData(dept);
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        location: '',
        navcom: '',
        hod: '',
        hodRank: '',
        born: 0,
        sanctioned: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    setFormData({});
  };

  const handleSave = () => {
    if (editingDept) {
      setDepts(
        depts.map((d) =>
          d.id === editingDept.id ? ({ ...d, ...formData } as Department) : d
        )
      );
    } else {
      const newDept = {
        ...formData,
        id: Date.now().toString(),
      } as Department;
      setDepts([...depts, newDept]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDepts(depts.filter((d) => d.id !== id));
  };

  if (viewingDept) {
    const deptIndividuals = individuals.filter(
      (ind) => ind.departmentId === viewingDept.id
    );

    return (
      <AppShell>
        <PageHeader
          title={`Personnel in ${viewingDept.name}`}
          subtitle="Department Roster and Strength"
          actions={
            <div className="flex gap-2">
              <Btn variant="gold" onClick={() => handleOpenIndModal()}>
                <Plus className="w-4 h-4 mr-1" /> Add Personnel
              </Btn>
              <Btn variant="outline" onClick={() => setViewingDept(null)}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Departments
              </Btn>
            </div>
          }
        />
        <div className="grid grid-cols-1 gap-6">
          <Section title="Assigned Personnel">
            <div className="overflow-x-auto -m-5">
              <table className="data-table">
                <thead>
                  <tr className="bg-muted/50">
                    <th>Service Number</th>
                    <th>Name</th>
                    <th>Rank</th>
                    <th>Cadre</th>
                    <th>Phone Number</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deptIndividuals.map((ind) => (
                    <tr key={ind.id}>
                      <td className="font-mono text-sm font-semibold">
                        {ind.serviceNo}
                      </td>
                      <td className="font-bold text-primary">{ind.name}</td>
                      <td>{ind.rank}</td>
                      <td>
                        <Badge variant="neutral">{ind.cadre}</Badge>
                      </td>
                      <td className="font-mono text-xs">{ind.phone}</td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={(e) => handleOpenIndModal(ind, e)}
                            className="p-1.5 rounded-sm hover:bg-muted text-primary"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteInd(ind.id, e)}
                            className="p-1.5 rounded-sm hover:bg-muted text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {deptIndividuals.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No individuals assigned to this department yet.
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
        title="Department Management"
        subtitle="Manage Establishments · Units · Strength Control"
        actions={
          <Btn variant="gold" onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4" /> Add Department
          </Btn>
        }
      />

      <div className="grid grid-cols-1 gap-6">
        <Section title="Active Departments · Establishment Strength">
          <div className="overflow-x-auto -m-5">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Location</th>
                  <th>Navcom</th>
                  <th>HOD / OIC</th>
                  <th>Born Strength</th>
                  <th>Sanctioned</th>
                  <th>Variance</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {depts.map((d) => {
                  const variance = d.born - d.sanctioned;
                  const varianceText =
                    variance > 0
                      ? `+${variance} Excess`
                      : variance < 0
                        ? `${variance} Shortage`
                        : 'Balanced';
                  const varianceColor =
                    variance > 0
                      ? 'text-green-500 font-bold'
                      : variance < 0
                        ? 'text-destructive font-bold'
                        : 'text-muted-foreground font-bold';

                  return (
                    <tr
                      key={d.id}
                      onClick={() => setViewingDept(d)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <td className="font-bold text-primary">{d.name}</td>
                      <td>
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="w-3 h-3 text-accent" />
                          {d.location || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <Badge variant="neutral">{d.navcom}</Badge>
                      </td>
                      <td>
                        <div className="text-xs">
                          <p className="font-semibold">{d.hod}</p>
                          <p className="text-muted-foreground text-[0.6rem] uppercase">
                            {d.hodRank}
                          </p>
                        </div>
                      </td>
                      <td className="font-mono text-sm">{d.born}</td>
                      <td className="font-mono text-sm">{d.sanctioned}</td>
                      <td className={`font-mono text-sm ${varianceColor}`}>
                        {varianceText}
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={(e) => handleOpenModal(d, e)}
                            className="p-1.5 rounded-sm hover:bg-muted text-primary"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(d.id, e)}
                            className="p-1.5 rounded-sm hover:bg-muted text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in">
          <div className="bg-card w-full max-w-2xl rounded-md shadow-elevated overflow-hidden border border-border">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg text-white font-heading font-bold">
                {editingDept ? 'Edit Department' : 'Register New Department'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-white/70 hover:text-white"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Department Name" required>
                  <Input
                    placeholder="e.g. Finance Directorate"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </Field>
                <Field label="Location">
                  <Input
                    placeholder="e.g. NHQ Block B"
                    value={formData.location || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </Field>
                <Field label="Navcom (5-Digit)" required>
                  <Input
                    placeholder="e.g. 12345"
                    maxLength={5}
                    value={formData.navcom || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, navcom: e.target.value })
                    }
                  />
                </Field>
                <Field label="Establishment Code">
                  <Input placeholder="e.g. EST-202" />
                </Field>
              </div>

              <div className="gold-rule" />

              <div className="grid grid-cols-2 gap-4">
                <Field label="HOD / OIC Name" required>
                  <Input
                    value={formData.hod || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, hod: e.target.value })
                    }
                  />
                </Field>
                <Field label="HOD Rank" required>
                  <Input
                    value={formData.hodRank || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, hodRank: e.target.value })
                    }
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Born Strength (Current)" required>
                  <Input
                    type="number"
                    value={formData.born || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        born: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </Field>
                <Field label="Approved Sanction Strength" required>
                  <Input
                    type="number"
                    value={formData.sanctioned || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sanctioned: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </Field>
              </div>
            </div>
            <div className="bg-muted/30 p-4 border-t border-border flex justify-end gap-3">
              <Btn variant="outline" onClick={handleCloseModal}>
                Cancel
              </Btn>
              <Btn variant="gold" onClick={handleSave}>
                {editingDept ? 'Update Department' : 'Save Department'}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Individual Modal */}
      {isIndModalOpen && (
        <div className="fixed inset-0 z-[60] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in">
          <div className="bg-card w-full max-w-2xl rounded-md shadow-elevated overflow-hidden border border-border">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg text-white font-heading font-bold">
                {editingInd ? 'Edit Personnel' : 'Add Personnel'}
              </h3>
              <button
                onClick={handleCloseIndModal}
                className="text-white/70 hover:text-white"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Service Number" required>
                  <Input
                    placeholder="e.g. 12345"
                    maxLength={6}
                    value={indFormData.serviceNo || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setIndFormData({ ...indFormData, serviceNo: val });
                    }}
                  />
                </Field>
                <Field label="Name" required>
                  <Input
                    placeholder="e.g. Ali Khan"
                    value={indFormData.name || ''}
                    onChange={(e) =>
                      setIndFormData({ ...indFormData, name: e.target.value })
                    }
                  />
                </Field>
                <Field label="Rank" required>
                  <Input
                    placeholder="e.g. Assistant"
                    value={indFormData.rank || ''}
                    onChange={(e) =>
                      setIndFormData({ ...indFormData, rank: e.target.value })
                    }
                  />
                </Field>
                <Field label="Cadre" required>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={indFormData.cadre || 'Ministerial'}
                    onChange={(e) =>
                      setIndFormData({ ...indFormData, cadre: e.target.value })
                    }
                  >
                    <option value="Ministerial">Ministerial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </Field>
                <Field label="Phone Number">
                  <Input
                    placeholder="e.g. 0300-1234567"
                    value={indFormData.phone || ''}
                    onChange={(e) =>
                      setIndFormData({ ...indFormData, phone: e.target.value })
                    }
                  />
                </Field>
              </div>
            </div>
            <div className="bg-muted/30 p-4 border-t border-border flex justify-end gap-3">
              <Btn variant="outline" onClick={handleCloseIndModal}>
                Cancel
              </Btn>
              <Btn variant="gold" onClick={handleSaveInd}>
                {editingInd ? 'Update Personnel' : 'Save Personnel'}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default Departments;
