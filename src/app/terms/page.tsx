import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-white mb-6">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: 2026</p>
        <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
          <Section title="1. Acceptance of Terms">
            By accessing or using CLAU (the &ldquo;App&rdquo;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, do not use the App.
          </Section>
          <Section title="2. No Financial Advice">
            CLAU provides educational tools, calculators, and simulations for informational
            purposes only. Nothing in the App constitutes financial, investment, legal, tax, or
            accounting advice. The App is not a registered investment advisor, broker-dealer, or
            tax preparer. You should consult licensed professionals before making any financial
            decision.
          </Section>
          <Section title="3. No Guarantees">
            All projections, simulations (including Monte Carlo simulations), historical returns,
            and figures shown in the App are estimates based on user-supplied inputs and
            assumptions. Actual investment results will vary and may be substantially worse than
            projected. Past performance does not guarantee future results.
          </Section>
          <Section title="4. Limitation of Liability">
            To the maximum extent permitted by law, CLAU and its operators shall not be liable
            for any direct, indirect, incidental, consequential, special, or punitive damages
            arising from your use of, or inability to use, the App, including but not limited to
            financial loss, lost profits, lost data, or business interruption — even if advised
            of the possibility of such damages.
          </Section>
          <Section title="5. User Responsibility">
            You are solely responsible for any financial decisions you make. You acknowledge that
            (a) inputs may be incorrect, (b) assumptions may not match reality, (c) markets are
            unpredictable, and (d) tax laws change. Verify all calculations independently before
            acting on them.
          </Section>
          <Section title="6. Data Storage">
            CLAU stores your inputs locally on your device. We do not transmit personal
            financial data to any server. You are responsible for backing up your data.
          </Section>
          <Section title="7. Intellectual Property">
            All content, design, and code in the App is owned by CLAU or its licensors and
            protected by copyright and other laws.
          </Section>
          <Section title="8. Termination">
            We may suspend or terminate access to the App at any time, with or without notice.
          </Section>
          <Section title="9. Changes to Terms">
            We may update these Terms at any time. Continued use of the App after changes
            constitutes acceptance.
          </Section>
          <Section title="10. Governing Law">
            These Terms are governed by the laws of the United States, without regard to
            conflict-of-law principles.
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-semibold text-white mb-2">{title}</h2>
      <p>{children}</p>
    </div>
  );
}
