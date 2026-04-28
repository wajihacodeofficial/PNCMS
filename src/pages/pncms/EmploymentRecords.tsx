import { useState } from "react";
import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Badge, Section, Field, Input, Select } from "@/components/pncms/ui-kit";
import { Plus, Download, Search, Filter, Eye, Pencil, Upload, X } from "lucide-react";
import { personnel } from "@/data/mock";
import { useNavigate } from "react-router-dom";
import { exportToPDF, exportToExcel } from "@/lib/export";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EmploymentRecords = () => {
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const handleExportPDF = () => {
    const headers = [["Service No", "Rank", "Name", "Department", "BPS", "Status"]];
    const data = personnel.map(p => [p.svc, p.rank, p.name, p.dept, p.bps, p.status]);
    exportToPDF("Pakistan Navy Civilian Management System - Employment Records", headers, data, "Employment_Records");
  };

  const handleExportExcel = () => {
    const headers = ["Service No", "Rank", "Name", "Department", "BPS", "Status"];
    const data = personnel.map(p => [p.svc, p.rank, p.name, p.dept, p.bps, p.status]);
    exportToExcel("Employment Records", headers, data, "Employment_Records");
  };
  
  return (
    <AppShell>
      <PageHeader
        title="Employment Record"
        subtitle="Civilian Staff Management & Personnel Files"
        actions={
          <>
            <Btn variant="outline"><Upload className="w-4 h-4" /> Import Data</Btn>
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
          </div>

          {showFilters && (
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/20 border border-border rounded-sm animate-in fade-in slide-in-from-top-2">
              <Field label="Rank">
                <Select>
                  <option>All Ranks</option>
                  <option>Assistant</option>
                  <option>UDC</option>
                  <option>LDC</option>
                </Select>
              </Field>
              <Field label="Department">
                <Select>
                  <option>All Departments</option>
                  <option>Administration</option>
                  <option>Engineering Wing</option>
                </Select>
              </Field>
              <Field label="Card Type">
                <Select>
                  <option>All Types</option>
                  <option>Ministerial</option>
                  <option>Industrial</option>
                </Select>
              </Field>
              <Field label="Status">
                <Select>
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

      <Section title="Employment Records · 412 Personnel On File">
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
              {personnel.map((p) => (
                <tr key={p.svc}>
                  <td className="font-mono text-xs text-primary font-semibold">{p.svc}</td>
                  <td className="font-semibold text-xs">{p.rank}</td>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-[0.65rem] font-bold">
                        {p.name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                      </div>
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="text-muted-foreground">{p.dept}</td>
                  <td>
                    <Badge variant={p.cardType === "Industrial" ? "warning" : "info"}>{p.cardType}</Badge>
                  </td>
                  <td><Badge variant="neutral">{p.bps}</Badge></td>
                  <td>
                    <Badge variant={p.status === "Active" ? "success" : p.status === "On Leave" ? "warning" : "danger"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={()=>navigate(`/employment-records/${p.svc}`)} className="p-1.5 rounded-sm hover:bg-muted text-info"><Eye className="w-4 h-4" /></button>
                      <button onClick={()=>navigate(`/employment-records/edit/${p.svc}`)} className="p-1.5 rounded-sm hover:bg-muted text-primary"><Pencil className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-sm hover:bg-muted text-destructive"><X className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 text-xs">
          <span className="label-mil">Showing 1–8 of 412</span>
          <div className="flex gap-1">
            {["‹","1","2","3","…","52","›"].map((p,i) => (
              <button key={i} className={`w-8 h-8 rounded-sm border border-border text-xs ${p==="1"?"bg-primary text-primary-foreground":""}`}>{p}</button>
            ))}
          </div>
        </div>
      </Section>
    </AppShell>
  );
};



const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="heading-mil text-sm text-primary mb-4 tracking-widest pb-2 border-b border-border">{title}</h3>
    <div className="grid grid-cols-3 gap-4">{children}</div>
  </div>
);

export default EmploymentRecords;
