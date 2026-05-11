import { AppShell, PageHeader } from '@/components/pncms/AppShell';
import { Section, Btn } from '@/components/pncms/ui-kit';
import crest from '@/assets/navy-crest.png';
import { Shield, Code2, Server, FileCheck } from 'lucide-react';

const About = () => (
  <AppShell>
    <PageHeader
      title="About PNCMS"
      subtitle="Software Information & Agency Credits"
    />

    <div className="panel overflow-hidden mb-6">
      <div className="stripe-top-gold" />
      <div className="bg-gradient-command px-8 py-10 text-white flex items-center gap-8">
        <div className="w-28 h-28 rounded-md bg-white p-2 shadow-elevated">
          <img
            src={crest}
            alt="Pakistan Navy crest"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1">
          <div className="label-mil text-white/70">Pakistan Navy</div>
          <h1 className="text-4xl mt-1">PNCMS · Civilian Management System</h1>
          <p className="text-sm text-white/80 mt-2 max-w-2xl">
            A secure desktop administrative platform for managing civilian
            personnel, sanctions, overtime, payments, attendance, leave accounts
            and audit trails across Pakistan Navy establishments.
          </p>
          <div className="flex gap-3 mt-4">
            <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-sm text-xs uppercase tracking-wider">
              Version 1.0.0
            </span>
            <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-sm text-xs uppercase tracking-wider">
              Build 2026.04.28
            </span>
            <span className="px-3 py-1 bg-success/20 border border-success/40 rounded-sm text-xs uppercase tracking-wider">
              Production · Restricted
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-5">
      <Section title="System Information">
        <dl className="text-sm space-y-2.5">
          {[
            ['Application', 'PNCMS'],
            ['Version', '1.0.0 (Stable)'],
            ['Released', '28 April 2026'],
            ['Database Engine', 'PostgreSQL 16 (Encrypted)'],
            ['Runtime', 'Electron · React 18'],
            ['License', 'Pakistan Navy Internal Use Only'],
            ['Classification', 'RESTRICTED'],
            ['Locale', 'English (Pakistan)'],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between border-b border-border pb-2"
            >
              <dt className="label-mil">{k}</dt>
              <dd className="font-semibold text-primary">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="Agency & Development">
        <div className="space-y-4">
          <div>
            <div className="label-mil">Developed By</div>
            <h3 className="heading-mil text-2xl text-primary mt-1">
              Code Vertex Solutions
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Software Development Agency · Karachi, Pakistan
            </p>
          </div>
          <dl className="text-sm space-y-2.5">
            {[
              ['Project Code', 'CVS--2026-001'],
              ['Helpdesk', '+92-3177-760505'],
              ['Email', 'contact@codevertex.solutions'],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between border-b border-border pb-2"
              >
                <dt className="label-mil">{k}</dt>
                <dd className="font-semibold text-primary">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    </div>

    <div className="grid grid-cols-4 gap-5 mt-5">
      {[
        [Shield, 'Secure', 'AES-256 at rest · TLS 1.3'],
        [Code2, 'Modular', 'Component-driven UI'],
        [Server, 'Resilient', 'Auto-backups every 24h'],
        [FileCheck, 'Audited', 'Tamper-evident trails'],
      ].map(([Icon, t, d]: any) => (
        <div key={t} className="panel p-5 text-center">
          <div className="w-12 h-12 mx-auto rounded-sm bg-primary text-accent flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <h4 className="heading-mil text-sm text-primary mt-3">{t}</h4>
          <p className="text-xs text-muted-foreground mt-1">{d}</p>
        </div>
      ))}
    </div>

    <div className="mt-6 text-center text-xs text-muted-foreground">
      © 2026 Pakistan Navy · All rights reserved · Developed by{' '}
      <span className="font-semibold text-primary">Code Vertex Solutions</span>
    </div>
  </AppShell>
);
export default About;
