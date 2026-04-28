import React, { useState, useMemo } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Badge, Section, Field, Select } from "@/components/pncms/ui-kit";
import { Plus, Download, Search, Filter, Eye, Pencil, Upload, X } from "lucide-react";
import { personnel } from "@/data/mock";
import { useNavigate } from "react-router-dom";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { toast } from "sonner";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Memoized Table Row for performance
const RecordRow = React.memo(({ p, onNavigate }: { p: (typeof personnel)[0]; onNavigate: (path: string) => void }) => (
  <tr key={p.svc} className="hover:bg-muted/30 transition-colors">
    <td className="font-mono text-xs text-primary font-semibold">{p.svc}</td>
    <td className="font-semibold text-xs">{p.rank}</td>
    <td>
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-[0.65rem] font-bold">
          {p.name.split(" ").map((n: string)=>n[0]).slice(0,2).join("")}
        </div>
        <span className="font-semibold">{p.name}</span>
      </div>
    </td>
    <td className="text-muted-foreground">{p.dept}</td>
    <td><Badge variant={p.cardType === "Industrial" ? "warning" : "info"}>{p.cardType}</Badge></td>
    <td className="font-mono text-xs">{p.bps}</td>
    <td>
      <Badge variant={p.status === "Active" ? "success" : p.status === "On Leave" ? "warning" : "danger"}>
        {p.status}
      </Badge>
    </td>
    <td className="text-right">
      <div className="flex justify-end gap-1">
        <Btn variant="ghost" className="p-1.5 h-auto text-info" onClick={() => onNavigate(`/employment-records/${p.svc}`)}>
          <Eye className="w-4 h-4" />
        </Btn>
        <Btn variant="ghost" className="p-1.5 h-auto text-primary" onClick={() => onNavigate(`/employment-records/edit/${p.svc}`)}>
          <Pencil className="w-4 h-4" />
        </Btn>
      </div>
    </td>
  </tr>
));

const EmploymentRecords = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState("All Ranks");
  const [deptFilter, setDeptFilter] = useState("All Departments");
  const [cardFilter, setCardFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  
  const [isImporting, setIsImporting] = useState(false);
  
  const navigate = useNavigate();

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    // Simulate parsing delay
    setTimeout(() => {
      setIsImporting(false);
      toast.success(`Successfully imported 24 new personnel from ${file.name}`, {
        description: "Records have been merged with the existing command database.",
      });
    }, 1500);
  };

  // Optimized filtering logic
  const filteredPersonnel = useMemo(() => {
    return personnel.filter(p => {
      const q = search.toLowerCase();
      const matchesSearch = search === "" || 
        p.name.toLowerCase().includes(q) || 
        p.svc.toLowerCase().includes(q);
      
      const matchesRank = rankFilter === "All Ranks" || p.rank === rankFilter;
      const matchesDept = deptFilter === "All Departments" || p.dept === deptFilter;
      const matchesCard = cardFilter === "All Types" || p.cardType === cardFilter;
      const matchesStatus = statusFilter === "All Status" || p.status === statusFilter;
      
      return matchesSearch && matchesRank && matchesDept && matchesCard && matchesStatus;
    });
  }, [search, rankFilter, deptFilter, cardFilter, statusFilter]);

  const handleExportPDF = () => {
    const headers = [["Service No", "Rank", "Name", "Department", "BPS", "Status"]];
    const data = filteredPersonnel.map(p => [p.svc, p.rank, p.name, p.dept, p.bps, p.status]);
    exportToPDF("Employment Records", headers, data, "Employment_Records");
  };

  const handleExportExcel = () => {
    const headers = ["Service No", "Rank", "Name", "Department", "BPS", "Status"];
    const data = filteredPersonnel.map(p => [p.svc, p.rank, p.name, p.dept, p.bps, p.status]);
    exportToExcel("Employment Records", headers, data, "Employment_Records");
  };
  
  return (
    <AppShell>
      <PageHeader
        title="Employment Record"
        subtitle="Civilian Staff Management & Personnel Files"
        actions={
          <>
            <label className="cursor-pointer">
              <input 
                type="file" 
                className="hidden" 
                accept=".csv,.xlsx,.xls" 
                onChange={handleImport} 
                disabled={isImporting}
              />
              <Btn variant="outline" className={isImporting ? "opacity-50 pointer-events-none" : ""}>
                <Upload className={`w-4 h-4 ${isImporting ? "animate-bounce" : ""}`} /> 
                {isImporting ? "Processing..." : "Import Data"}
              </Btn>
            </label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Btn variant="outline"><Download className="w-4 h-4" /> Export records</Btn>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportPDF}>Export as PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportExcel}>Export as Excel</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Btn variant="gold" onClick={() => navigate("/employment-records/new")}><Plus className="w-4 h-4" /> Add Record</Btn>
          </>
        }
      />

      {/* Advanced Search Panel */}
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
              <Filter className="w-4 h-4" /> 
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
                  <option>Assistant</option>
                  <option>UDC</option>
                  <option>LDC</option>
                </Select>
              </Field>
              <Field label="Department">
                <Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  <option>All Departments</option>
                  <option>Administration</option>
                  <option>Engineering Wing</option>
                  <option>Naval Dockyard</option>
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
                  <option>Suspended</option>
                </Select>
              </Field>
            </div>
          )}
        </div>
      </Section>

      <Section title={`Employment Records · ${filteredPersonnel.length} Personnel Found`}>
        <div className="overflow-x-auto -m-5">
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
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersonnel.map((p) => (
                <RecordRow key={p.svc} p={p} onNavigate={navigate} />
              ))}
              {filteredPersonnel.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-muted-foreground italic">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </AppShell>
  );
};

export default EmploymentRecords;
