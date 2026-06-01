import React, { useState, useMemo } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Badge, Section, Field, Select } from "@/components/pncms/ui-kit";
import { Plus, Download, Search, Filter, Eye, Pencil, Upload, X, ShieldAlert, RotateCcw, AlertTriangle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { toast } from "sonner";
import { usePersonnel, useRanks, useDepartments } from "@/hooks/use-api";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ExcelJS from 'exceljs';
import { useUpsertEmployee, useCreateLog, useDeleteEmployee, useSettings } from "@/hooks/use-api";

// Memoized Table Row for performance
const RecordRow = React.memo(({ p, onNavigate, onDelete }: { p: any; onNavigate: (path: string) => void; onDelete: (id: string, svc: string) => void }) => (
  <tr key={p.serviceNo} className="hover:bg-muted/30 transition-colors">
    <td className="font-mono text-xs text-primary font-semibold">{p.serviceNo}</td>
    <td className="font-semibold text-xs">{p.rank?.name}</td>
    <td>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-[0.65rem] font-bold">
          {(p.name || "N A").split(" ").map((n: string)=>n[0]).slice(0,2).join("")}
        </div>
        <span className="font-semibold">{p.name}</span>
      </div>
    </td>
    <td className="text-muted-foreground">{p.department?.name}</td>
    <td><Badge variant={p.cardType === "Industrial" ? "warning" : "info"}>{p.cardType}</Badge></td>
    <td className="font-mono text-xs">{p.bps}</td>
    <td>
      <Badge variant={p.status === "Active" ? "success" : p.status === "On Leave" ? "warning" : p.status === "Absent" ? "danger" : "danger"}>
        {p.status}
      </Badge>
    </td>
    <td className="text-xs text-muted-foreground">{p.attachedTo || '—'}</td>
    <td className="text-xs text-muted-foreground max-w-[160px] truncate" title={p.remarks || ''}>{p.remarks || '—'}</td>
    <td className="text-right">
      <div className="flex justify-end gap-1">
        <Btn variant="ghost" className="p-1.5 h-auto text-info" title="View Profile" onClick={() => onNavigate(`/employment-records/${p.serviceNo}`)}>
          <Eye className="w-4 h-4" />
        </Btn>
        <Btn variant="ghost" className="p-1.5 h-auto text-primary" title="Edit Record" onClick={() => onNavigate(`/employment-records/edit/${p.serviceNo}`)}>
          <Pencil className="w-4 h-4" />
        </Btn>
        <Btn variant="ghost" className="p-1.5 h-auto text-destructive" title="Delete Record" onClick={() => onDelete(p.serviceNo, p.serviceNo)}>
          <X className="w-4 h-4" />
        </Btn>
      </div>
    </td>
  </tr>
));

const EmploymentRecords = () => {
  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("All Ranks");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [cardFilter, setCardFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteSvc, setDeleteSvc] = useState<string | null>(null);
  
  const { data: personnel = [], isLoading, error } = usePersonnel();
  
  if (error) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4 text-destructive text-sm font-bold uppercase tracking-widest">
        <ShieldAlert className="w-12 h-12" />
        <div>Personnel Sync Error</div>
        <div className="text-xs opacity-70">{(error as any)?.message || "Failed to retrieve civilian records"}</div>
        <Btn variant="outline" className="mt-4" onClick={() => window.location.reload()}><RotateCcw className="w-4 h-4" /> Reset Connection</Btn>
      </div>
    );
  }
  const { data: ranks = [] } = useRanks();
  const { data: departments = [] } = useDepartments();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { mutateAsync: upsertEmployee } = useUpsertEmployee();
  const { mutate: deleteEmployee } = useDeleteEmployee();
  const { mutate: createLog } = useCreateLog();

  const [showNominalRollModal, setShowNominalRollModal] = useState(false);
  const [nominalFields, setNominalFields] = useState<Record<string, boolean>>({
    serviceNo: true,
    name: true,
    rank: true,
    department: true,
    bps: true,
    cardType: false,
    status: false,
    cnic: false,
    phoneNumber: false,
    fatherName: false,
    dob: false,
    bloodGroup: false,
    presentAddress: false,
    permanentAddress: false,
    joiningDate: false,
    appointmentDate: false,
    bankName: false,
    accountNo: false,
  });

  const FIELD_MAP: Record<string, string> = {
    serviceNo: "Service No",
    name: "Name",
    rank: "Rank",
    department: "Department",
    bps: "BPS",
    cardType: "Card Type",
    status: "Status",
    cnic: "CNIC",
    phoneNumber: "Phone Number",
    fatherName: "Father's Name",
    dob: "Date of Birth",
    bloodGroup: "Blood Group",
    presentAddress: "Present Address",
    permanentAddress: "Permanent Address",
    joiningDate: "Joining Date",
    appointmentDate: "Appointment Date",
    bankName: "Bank Name",
    accountNo: "Bank Account No",
  };

  const handleDelete = (id: string, svc: string) => {
    setDeleteId(id);
    setDeleteSvc(svc);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    deleteEmployee(deleteId, {
      onSuccess: () => {
        createLog({
          user: localStorage.getItem("username") || "Admin",
          action: "DELETE",
          entity: `Personnel: ${deleteSvc}`,
          result: "Success"
        });
        toast.success(`Record ${deleteSvc} deleted successfully`);
        setDeleteId(null);
        setDeleteSvc(null);
      }
    });
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const toastId = toast.loading("Processing import file...");

    try {
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      
      if (file.name.endsWith('.csv')) {
        await workbook.csv.read(file.stream() as any);
      } else {
        await workbook.xlsx.load(arrayBuffer);
      }

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) throw new Error("No worksheet found");

      let headerRowIndex = 1;
      let colMap: Record<string, number> = {};
      let foundHeaders: string[] = [];

      // Scan up to 10 rows to find the header row (skips document titles)
      for (let i = 1; i <= 10; i++) {
        const row = worksheet.getRow(i);
        const tempMap: Record<string, number> = {};
        const tempHeaders: string[] = [];
        
        row.eachCell((cell, colNumber) => {
          const title = cell.text?.toLowerCase().trim();
          if (!title) return;
          tempHeaders.push(title);

          if (title.includes('service') || title.includes('svc') || title.includes('sno') || title.includes('id') || title === 'no') tempMap.serviceNo = colNumber;
          else if (title.includes('name')) tempMap.name = colNumber;
          else if (title.includes('rank')) tempMap.rankName = colNumber;
          else if (title.includes('dept') || title.includes('department')) tempMap.deptName = colNumber;
          else if (title.includes('bps') || title.includes('grade')) tempMap.bps = colNumber;
          else if (title.includes('card') || title.includes('type')) tempMap.cardType = colNumber;
          else if (title.includes('status')) tempMap.status = colNumber;
          else if (title.includes('cnic')) tempMap.cnic = colNumber;
          else if (title.includes('phone') || title.includes('contact') || title.includes('mob')) tempMap.phoneNumber = colNumber;
          else if (title.includes('father')) tempMap.fatherName = colNumber;
          else if (title.includes('dob') || title.includes('birth')) tempMap.dob = colNumber;
          else if (title.includes('blood')) tempMap.bloodGroup = colNumber;
          else if (title.includes('present')) tempMap.presentAddress = colNumber;
          else if (title.includes('permanent')) tempMap.permanentAddress = colNumber;
          else if (title.includes('join')) tempMap.joiningDate = colNumber;
          else if (title.includes('appoint')) tempMap.appointmentDate = colNumber;
          else if (title.includes('bank')) tempMap.bankName = colNumber;
          else if (title.includes('account')) tempMap.accountNo = colNumber;
        });

        if (tempMap.serviceNo && tempMap.name) {
          colMap = tempMap;
          headerRowIndex = i;
          foundHeaders = tempHeaders;
          break;
        } else if (tempHeaders.length > foundHeaders.length) {
          foundHeaders = tempHeaders;
        }
      }

      if (!colMap.serviceNo || !colMap.name) {
        throw new Error(`Could not find 'Service No' and 'Name' headers. Detected columns: ${foundHeaders.join(', ') || 'None'}`);
      }

      let successCount = 0;
      let errorCount = 0;

      const rows: any[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber <= headerRowIndex) return;
        
        const getVal = (key: string) => colMap[key] ? row.getCell(colMap[key]).text?.toString().trim() : '';

        const serviceNo = getVal('serviceNo');
        const name = getVal('name');
        
        if (serviceNo && name) {
          rows.push({
            serviceNo,
            name,
            phoneNumber: getVal('phoneNumber'),
            rankName: getVal('rankName'),
            deptName: getVal('deptName'),
            bps: getVal('bps'),
            cardType: getVal('cardType') || 'Ministerial',
            status: getVal('status') || 'Active',
            cnic: getVal('cnic') || undefined,
            fatherName: getVal('fatherName'),
            dob: getVal('dob'),
            bloodGroup: getVal('bloodGroup'),
            presentAddress: getVal('presentAddress'),
            permanentAddress: getVal('permanentAddress'),
            joiningDate: getVal('joiningDate') || new Date().toISOString().split('T')[0],
            appointmentDate: getVal('appointmentDate'),
            bankName: getVal('bankName'),
            accountNo: getVal('accountNo'),
          });
        }
      });

      for (const rowData of rows) {
        try {
          const rank = ranks.find((r: any) => r.name.toLowerCase() === rowData.rankName?.toLowerCase());
          const dept = departments.find((d: any) => d.name.toLowerCase() === rowData.deptName?.toLowerCase());

          await upsertEmployee({
            ...rowData,
            rankName: rowData.rankName || "Unknown Rank",
            deptName: rowData.deptName || "Unknown Department",
            rankId: rank?.id,
            departmentId: dept?.id,
            bps: rowData.bps || rank?.bps || "BPS-1",
          });
          successCount++;
        } catch (err) {
          console.error(`Row failed: ${rowData.serviceNo}`, err);
          errorCount++;
        }
      }

      createLog({
        user: localStorage.getItem("username") || "Admin",
        action: "IMPORT",
        entity: `Imported ${successCount} personnel records from ${file.name}`,
        result: "Success"
      });

      toast.success(`Import Complete: ${successCount} added, ${errorCount} failed`, { id: toastId });
    } catch (error: any) {
      toast.error(`Import Failed: ${error.message}`, { id: toastId });
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  // Optimized filtering logic
  const filteredPersonnel = useMemo(() => {
    return (personnel as any[]).filter(p => {
      const q = search.toLowerCase();
      const matchesSearch = search === "" || 
        (p.name || "").toLowerCase().includes(q) || 
        (p.serviceNo || "").toLowerCase().includes(q);
      
      const matchesRank = rankFilter === "All Ranks" || p.rank?.name === rankFilter;
      const matchesDept = deptFilter === "All Departments" || p.department?.name === deptFilter;
      const matchesCard = cardFilter === "All Types" || p.cardType === cardFilter;
      const matchesStatus = statusFilter === "All Status" || p.status === statusFilter;
      
      return matchesSearch && matchesRank && matchesDept && matchesCard && matchesStatus;
    }).sort((a, b) => (a.serviceNo || "").localeCompare(b.serviceNo || ""));
  }, [personnel, search, rankFilter, deptFilter, cardFilter, statusFilter]);

  const handleExportPDF = () => {
    const headers = [["Service No", "Rank", "Name", "Department", "BPS", "Status", "Attached To", "Remarks"]];
    const data = filteredPersonnel.map(p => [p.serviceNo, p.rank?.name, p.name, p.department?.name, p.bps, p.status, p.attachedTo || '', p.remarks || '']);
    exportToPDF("Employment Records", headers, data, "Employment_Records");
  };

  const handleExportExcel = () => {
    const headers = ["Service No", "Rank", "Name", "Department", "BPS", "Status", "Attached To", "Remarks"];
    const data = filteredPersonnel.map(p => [p.serviceNo, p.rank?.name, p.name, p.department?.name, p.bps, p.status, p.attachedTo || '', p.remarks || '']);
    exportToExcel("Employment Records", headers, data, "Employment_Records");
  };

  const handleExportNominalRoll = () => {
    const selectedKeys = Object.keys(FIELD_MAP).filter(k => nominalFields[k]);
    if (selectedKeys.length === 0) {
      toast.error("Please select at least one field");
      return;
    }

    const headers = selectedKeys.map(k => FIELD_MAP[k]);
    
    const data = filteredPersonnel.map(p => {
      return selectedKeys.map(k => {
        if (k === 'rank') return p.rank?.name || '';
        if (k === 'department') return p.department?.name || '';
        if (k === 'joiningDate' && p.joiningDate) return new Date(p.joiningDate).toLocaleDateString();
        if (k === 'appointmentDate' && p.appointmentDate) return new Date(p.appointmentDate).toLocaleDateString();
        if (k === 'dob' && p.dob) return new Date(p.dob).toLocaleDateString();
        return p[k] || '';
      });
    });

    exportToExcel("Nominal Roll", headers, data, "Nominal_Roll");
    setShowNominalRollModal(false);
  };
  
  return (
    <AppShell>
      <PageHeader
        title="Employment Record"
        subtitle="Civilian Staff Management & Personnel Files"
        actions={
          <>
            <div>
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept=".csv,.xlsx,.xls" 
                onChange={handleImport} 
                disabled={isImporting}
              />
              <Btn 
                variant="outline" 
                className={isImporting ? "opacity-50 pointer-events-none" : ""}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className={`w-4 h-4 mr-2 ${isImporting ? "animate-bounce" : ""}`} /> 
                {isImporting ? "Processing..." : "Import Data"}
              </Btn>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Btn variant="outline"><Download className="w-4 h-4 mr-2" /> Export records</Btn>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
                <div className="h-px bg-border my-1" />
                <DropdownMenuItem onClick={() => setShowNominalRollModal(true)}>Generate Nominal Roll</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Btn variant="gold" onClick={() => navigate("/employment-records/new")}><Plus className="w-4 h-4 mr-2" /> Add Record</Btn>
          </>
        }
      />

      <Section title="Search & Filters" className="mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                placeholder="Search by Name or Service Number..." 
                className="h-10 pl-10 pr-3 w-full bg-muted/30 border border-border rounded-sm text-sm focus:outline-none focus:border-accent transition-colors" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Btn 
              variant={showFilters ? "primary" : "outline"} 
              className="h-10 px-4" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" /> 
              {showFilters ? "Hide Filters" : "Advanced Filters"}
            </Btn>
            {(search || rankFilter !== "All Ranks" || deptFilter !== "All Departments") && (
              <Btn variant="ghost" className="h-10 text-destructive" onClick={() => {
                setSearch(""); setRankFilter("All Ranks"); setDeptFilter("All Departments"); setCardFilter("All Types"); setStatusFilter("All Status");
              }}>
                <X className="w-4 h-4" /> Reset
              </Btn>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/20 border border-border rounded-sm animate-in fade-in slide-in-from-top-2">
              <Field label="Rank">
                <Select value={rankFilter} onChange={(e) => setRankFilter(e.target.value)}>
                  <option>All Ranks</option>
                  {ranks.map((r: any) => <option key={r.id}>{r.name}</option>)}
                </Select>
              </Field>
              <Field label="Department">
                <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  <option>All Departments</option>
                  {departments.map((d: any) => <option key={d.id}>{d.name}</option>)}
                </Select>
              </Field>
              <Field label="Card Type">
                <Select value={cardFilter} onChange={(e) => setCardFilter(e.target.value)}>
                  <option>All Types</option>
                  <option>Ministerial</option>
                  <option>Industrial</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>All Status</option>
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Absent</option>
                  <option>Suspended</option>
                </Select>
              </Field>
            </div>
          )}
        </div>
      </Section>

      <Section title={`Employment Records · ${isLoading ? '...' : filteredPersonnel.length} Personnel Found`}>
        <div className="overflow-x-auto -m-5 min-h-[400px]">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service No</th>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Card Type</th>
                  <th>BPS</th>
                  <th>Status</th>
                  <th>Attached To</th>
                  <th>Remarks</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonnel.map((p) => (
                  <RecordRow key={p.serviceNo} p={p} onNavigate={navigate} onDelete={handleDelete} />
                ))}
                {filteredPersonnel.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-muted-foreground italic">
                      {isLoading ? "Syncing with personnel database..." : "No matching records found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </Section>
      {deleteId && (
        <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-md shadow-elevated overflow-hidden border border-destructive/20 animate-in zoom-in-95 duration-200">
            <div className="bg-destructive/10 px-6 py-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-heading font-black italic uppercase text-destructive tracking-tight">Security Confirmation</h2>
              <p className="text-sm text-foreground/70 mt-2 leading-relaxed">
                Are you sure you want to permanently delete personnel record <span className="font-bold text-destructive">{deleteSvc}</span>?
              </p>
              <div className="mt-2 text-[0.6rem] font-bold uppercase tracking-widest text-destructive/60 bg-destructive/5 px-3 py-1 rounded-full border border-destructive/10">
                This action cannot be undone
              </div>
            </div>
            <div className="border-t border-border bg-muted/40 px-6 py-4 flex gap-3">
              <Btn variant="outline" className="flex-1" onClick={() => { setDeleteId(null); setDeleteSvc(null); }}>Abort Action</Btn>
              <Btn variant="danger" className="flex-1" onClick={confirmDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Confirm Delete
              </Btn>
            </div>
          </div>
        </div>
      )}

      {showNominalRollModal && (
        <div className="fixed inset-0 z-[100] bg-primary/60 backdrop-blur-sm flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-2xl rounded-md shadow-elevated overflow-hidden border border-border animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-command px-6 py-4 flex items-center justify-between border-b border-white/10">
              <h2 className="text-lg text-white font-heading italic font-black uppercase tracking-tight">Generate Nominal Roll</h2>
              <button onClick={() => setShowNominalRollModal(false)} className="text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-4">Select the specific fields you want to include in the Nominal Roll Excel report for the {filteredPersonnel.length} currently filtered personnel.</p>
              <div className="grid grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-2">
                {Object.entries(FIELD_MAP).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 p-3 bg-muted/30 border border-border rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      className="accent-primary w-4 h-4"
                      checked={nominalFields[key]} 
                      onChange={(e) => setNominalFields(prev => ({ ...prev, [key]: e.target.checked }))} 
                    />
                    <span className="text-sm font-semibold">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="border-t border-border bg-muted/40 px-6 py-4 flex gap-3 justify-end">
              <Btn variant="outline" onClick={() => setShowNominalRollModal(false)}>Cancel</Btn>
              <Btn variant="gold" onClick={handleExportNominalRoll}>
                <Download className="w-4 h-4 mr-2" /> Export Nominal Roll
              </Btn>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};

export default EmploymentRecords;
