import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Badge, Section, Select, StatCard } from "@/components/pncms/ui-kit";
import { Wallet, CheckCircle2, Send, Download, Filter } from "lucide-react";
import { payments } from "@/data/mock";

const Payments = () => {
  const subtotal = payments.reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === "Pending").reduce((s,p)=>s+p.amount,0);
  return (
    <AppShell>
      <PageHeader
        title="Payment Processing Hub"
        subtitle="Overtime & Late Sitting Disbursement"
        actions={<>
          <Btn variant="outline"><Download className="w-4 h-4" /> Export Bill</Btn>
          <Btn variant="primary"><Send className="w-4 h-4" /> Forward to Finance</Btn>
        </>}
      />

      <div className="grid grid-cols-4 gap-5 mb-6">
        <StatCard label="Batch ID" value="APR-2026-B" sub="Current cycle" accent="primary" icon={<Wallet className="w-5 h-5" />} />
        <StatCard label="Personnel In Batch" value={payments.length} sub="5 Departments" accent="info" />
        <StatCard label="Pending Amount" value={`Rs. ${pending.toLocaleString()}`} sub="Awaiting processing" accent="warning" />
        <StatCard label="Batch Total" value={`Rs. ${subtotal.toLocaleString()}`} sub="Gross disbursement" accent="gold" />
      </div>

      <Section title="Disbursement Roster" actions={
        <div className="flex gap-2">
          <Select className="h-9"><option>All Departments</option><option>Engineering Wing</option><option>Administration</option></Select>
          <Select className="h-9"><option>All Status</option><option>Pending</option><option>Processed</option><option>Paid</option></Select>
          <Btn variant="outline" className="h-9 py-0"><Filter className="w-4 h-4" /> Filters</Btn>
        </div>
      }>
        <div className="overflow-x-auto -m-5">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th><th>Cadre</th><th className="text-right">Gross Hrs</th>
                <th className="text-right">Leave Ded.</th><th className="text-right">Payable</th>
                <th className="text-right">Hourly Rate</th><th className="text-right">Amount Payable</th>
                <th>Status</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.emp}>
                  <td className="font-semibold">{p.emp}</td>
                  <td className="text-muted-foreground">{p.cadre}</td>
                  <td className="text-right font-mono">{p.gross}</td>
                  <td className="text-right font-mono text-warning">−{p.leave}</td>
                  <td className="text-right font-mono font-bold">{p.payable}</td>
                  <td className="text-right font-mono">Rs. {p.rate}</td>
                  <td className="text-right font-mono font-bold text-primary">Rs. {p.amount.toLocaleString()}</td>
                  <td><Badge variant={p.status.toLowerCase() as any}>{p.status}</Badge></td>
                  <td className="text-right">
                    <div className="flex gap-1 justify-end">
                      {p.status === "Pending" && <Btn variant="outline" className="py-1 text-[0.6rem]">Mark Processed</Btn>}
                      {p.status === "Processed" && <Btn variant="success" className="py-1 text-[0.6rem]"><CheckCircle2 className="w-3 h-3" /> Mark Paid</Btn>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/60">
              <tr className="border-t-2 border-primary">
                <td colSpan={6} className="px-4 py-3 text-right label-mil">Department Subtotal · Engineering Wing</td>
                <td className="px-4 py-3 text-right font-bold text-primary">Rs. 23,520</td>
                <td colSpan={2}></td>
              </tr>
              <tr className="bg-primary text-primary-foreground">
                <td colSpan={6} className="px-4 py-4 text-right heading-mil tracking-widest">Grand Total · Batch APR-2026-B</td>
                <td className="px-4 py-4 text-right text-2xl heading-mil text-accent">Rs. {subtotal.toLocaleString()}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Section>
    </AppShell>
  );
};
export default Payments;
