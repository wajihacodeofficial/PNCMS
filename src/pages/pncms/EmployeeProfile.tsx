import { AppShell, PageHeader } from "@/components/pncms/AppShell";
import { Btn, Badge, Section, StatCard } from "@/components/pncms/ui-kit";
import { Printer, Pencil, Download, Mail, Phone, MapPin, Building2, IdCard, Wallet, CalendarDays, ClipboardList } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const EmployeeProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  return (
    <AppShell>
      <PageHeader
        title="Personnel Profile"
        subtitle={`Service Record · ${id ?? "PN-CIV-1042"}`}
        actions={
          <>
            <Btn variant="outline"><Printer className="w-4 h-4" /> Print</Btn>
            <Btn variant="outline"><Download className="w-4 h-4" /> Export PDF</Btn>
            <Btn variant="gold" onClick={() => navigate("/personnel/edit/PN-CIV-1042")}><Pencil className="w-4 h-4" /> Edit Record</Btn>
          </>
        }
      />

      <div className="panel mb-5 overflow-hidden">
        <div className="stripe-top-gold" />
        <div className="bg-gradient-command px-7 py-6 text-white flex items-center gap-6">
          <div className="w-24 h-28 bg-white/10 border border-white/20 rounded-sm flex items-center justify-center text-3xl font-heading font-extrabold">MTK</div>
          <div className="flex-1">
            <div className="label-mil text-white/70">PN-CIV-1042 · EMP-2041</div>
            <h2 className="text-3xl mt-1">Muhammad Tariq Khan</h2>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Administration · BPS-14</span>
              <span className="flex items-center gap-1.5"><IdCard className="w-4 h-4" /> 42101-1234567-1</span>
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> +92-300-1234567</span>
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> tariq.k@pn.gov.pk</span>
            </div>
          </div>
          <Badge variant="success">Active</Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-5">
        <StatCard label="Years of Service" value="14" sub="Joined Mar 2012" accent="primary" icon={<CalendarDays className="w-5 h-5" />} />
        <StatCard label="Sanctions YTD" value="08" sub="6 approved · 2 pending" accent="info" icon={<ClipboardList className="w-5 h-5" />} />
        <StatCard label="OT Earnings YTD" value="Rs. 142K" sub="356 hours billed" accent="success" icon={<Wallet className="w-5 h-5" />} />
        <StatCard label="Leave Balance" value="22" sub="CL 12 · EL 10" accent="warning" icon={<CalendarDays className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <Section title="Service Details" className="col-span-1">
          <dl className="text-sm space-y-2.5">
            {[
              ["Service No","PN-CIV-1042"],
              ["Cadre","Clerical"],
              ["Department","Administration"],
              ["BPS Grade","BPS-14"],
              ["Posting","NHQ Islamabad"],
              ["Date of Joining","12-Mar-2012"],
              ["Confirmation","18-Mar-2014"],
              ["Last Promotion","04-Jan-2022"],
            ].map(([k,v])=>(
              <div key={k} className="flex justify-between border-b border-border pb-2">
                <dt className="label-mil">{k}</dt>
                <dd className="font-semibold text-primary">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Personal & Contact" className="col-span-1">
          <dl className="text-sm space-y-2.5">
            {[
              ["Father's Name","Khan Muhammad"],
              ["CNIC","42101-1234567-1"],
              ["DOB","08-Aug-1984"],
              ["Gender","Male"],
              ["Marital Status","Married"],
              ["Domicile","Sindh / Karachi"],
              ["Blood Group","B+"],
              ["Address","House 12-B, PN Colony, Karsaz"],
            ].map(([k,v])=>(
              <div key={k} className="flex justify-between border-b border-border pb-2">
                <dt className="label-mil">{k}</dt>
                <dd className="font-semibold text-primary text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Bank & Next of Kin" className="col-span-1">
          <dl className="text-sm space-y-2.5">
            {[
              ["Bank","NBP · Karsaz Branch"],
              ["Account No","4012-7821-9981"],
              ["IBAN","PK36 NBPA 0040 1278 2199 81"],
              ["NOK Name","Saima Tariq"],
              ["Relation","Spouse"],
              ["NOK Contact","+92-321-9876543"],
              ["NOK CNIC","42101-7654321-2"],
              ["Emergency","Karachi Naval Hospital"],
            ].map(([k,v])=>(
              <div key={k} className="flex justify-between border-b border-border pb-2">
                <dt className="label-mil">{k}</dt>
                <dd className="font-semibold text-primary text-right">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>

      <div className="grid grid-cols-2 gap-5 mt-5">
        <Section title="Sanctions History">
          <table className="data-table">
            <thead><tr><th>Sanction</th><th>Period</th><th>Hours</th><th>Status</th></tr></thead>
            <tbody>
              {[
                ["SNC-2026-0142","Apr 2026","40","Pending"],
                ["SNC-2026-0118","Mar 2026","45","Approved"],
                ["SNC-2026-0091","Feb 2026","30","Approved"],
                ["SNC-2026-0064","Jan 2026","50","Approved"],
              ].map(r=>(
                <tr key={r[0]}>
                  <td className="font-mono text-xs text-primary font-semibold">{r[0]}</td>
                  <td>{r[1]}</td>
                  <td>{r[2]}</td>
                  <td>{r[3]==="Pending"?<Badge variant="pending">Pending</Badge>:<Badge variant="approved">Approved</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Payment History">
          <table className="data-table">
            <thead><tr><th>Period</th><th>Hours</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {[
                ["Mar 2026","45","Rs. 15,750","Paid"],
                ["Feb 2026","30","Rs. 10,500","Paid"],
                ["Jan 2026","50","Rs. 17,500","Paid"],
                ["Dec 2025","42","Rs. 14,700","Paid"],
              ].map(r=>(
                <tr key={r[0]}>
                  <td>{r[0]}</td>
                  <td>{r[1]}</td>
                  <td className="font-mono font-semibold text-success">{r[2]}</td>
                  <td><Badge variant="paid">{r[3]}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      </div>
    </AppShell>
  );
};
export default EmployeeProfile;