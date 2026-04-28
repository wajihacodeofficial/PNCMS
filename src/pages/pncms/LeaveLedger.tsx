import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Section, Badge } from "@/components/pncms/ui-kit";
import { Download, Filter } from "lucide-react";
import { personnel } from "@/data/mock";

const LeaveLedger = () => (
  <AppShell>
    <PageHeader
      title="Leave Balance Ledger"
      subtitle="Civilian Personnel · Annual Leave Account FY 2025-26"
      actions={<><Btn variant="outline"><Filter className="w-4 h-4" /> Filter</Btn><Btn variant="gold"><Download className="w-4 h-4" /> Export Ledger</Btn></>}
    />
    <Section title="Per-Employee Balances">
      <div className="overflow-x-auto -m-5">
        <table className="data-table">
          <thead><tr><th>Employee</th><th>CL</th><th>RL</th><th>ML</th><th>DL</th><th>LWOP</th><th>LFP</th><th>Att. Days</th><th>Auto-Credit</th></tr></thead>
          <tbody>
            {personnel.map((p,i)=>(
              <tr key={p.svc}>
                <td>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-[0.65rem] text-muted-foreground font-mono">{p.svc}</div>
                </td>
                <td className="font-mono">{12-i%5} / 20</td>
                <td className="font-mono">{20-i%6} / 30</td>
                <td className="font-mono">{8-i%4} / 10</td>
                <td className="font-mono">{5-i%3} / 5</td>
                <td className="font-mono">{i%2}</td>
                <td className="font-mono">{4-i%3} / 12</td>
                <td className="font-mono">{22-i%4}</td>
                <td>{i%3===0 ? <Badge variant="success">Credited</Badge> : <Badge variant="pending">Pending</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  </AppShell>
);
export default LeaveLedger;