import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-white mb-6">
          <ArrowLeft size={16} /> Back
        </Link>
        <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-muted)] mb-8">Last updated: 2026</p>
        <div className="space-y-6 text-sm text-[var(--text-secondary)] leading-relaxed">
          <Section title="1. Overview">
            CLAU is designed with privacy as a first principle. Your financial inputs (FIRE
            targets, contributions, balances, etc.) are stored locally in your browser using
            <code className="px-1 py-0.5 mx-1 bg-[var(--surface-light)] rounded">localStorage</code>
            and are not transmitted to any external server.
          </Section>
          <Section title="2. Data We Collect">
            We do not collect, store, or process personally identifiable financial information
            on our servers. The data you enter — name, age, asset values, retirement plans — stays
            on your device.
          </Section>
          <Section title="3. Cookies and Local Storage">
            CLAU uses your browser&apos;s local storage to persist your profile and preferences
            between visits. Clearing browser data will reset the app.
          </Section>
          <Section title="4. Third-Party Services">
            The App may use Google Fonts, which means Google may receive standard request
            metadata. We do not integrate analytics, tracking pixels, or advertising networks in
            the App itself.
          </Section>
          <Section title="5. Children's Privacy">
            CLAU is not intended for children under 16. We do not knowingly collect data from
            anyone under that age.
          </Section>
          <Section title="6. Your Rights">
            Because all data is stored locally, you have full control: clear browser storage to
            delete everything. We have no copy on our side to delete.
          </Section>
          <Section title="7. Changes to This Policy">
            We may update this Policy from time to time. Material changes will be reflected by
            updating the &ldquo;Last updated&rdquo; date.
          </Section>
          <Section title="8. Contact">
            Questions about this Privacy Policy can be addressed to the app maintainer.
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
