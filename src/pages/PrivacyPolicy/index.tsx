import { SupportPageLayout } from '../../components/SupportPageLayout';

const sections = [
  {
    title: 'Information we collect',
    body:
      'We collect the information needed to process orders, respond to inquiries, coordinate deliveries, and improve the store experience. This may include your name, email address, shipping details, billing information, purchase history, and messages sent through our contact forms.',
  },
  {
    title: 'How we use your information',
    body:
      'Your information is used to fulfill purchases, provide customer support, send service updates, and maintain secure account access. We may also use purchase and browsing patterns in aggregate form to refine merchandising, operations, and site performance.',
  },
  {
    title: 'Communications',
    body:
      'If you subscribe to updates, we may send editorial notes, product releases, and atelier announcements. You can opt out of non-essential communications at any time while still receiving transactional notifications related to your orders or account.',
  },
  {
    title: 'Sharing and protection',
    body:
      'We share information only with the service providers needed to operate the store responsibly, such as payment processors, fulfillment partners, and technical infrastructure vendors. Reasonable administrative and technical safeguards are used to protect customer information from unauthorized access.',
  },
  {
    title: 'Retention and requests',
    body:
      'We retain order and account records for as long as necessary to satisfy legal, operational, and support obligations. If you need to update, correct, or request deletion of your personal information, contact the atelier support team and we will review the request in accordance with applicable requirements.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <SupportPageLayout
      eyebrow="Privacy Policy"
      title="A clear view of how customer information is handled."
      description="Trust is part of the product experience. This policy explains the information we collect, why we use it, and the steps we take to operate the store responsibly."
      accent="bg-secondary"
    >
      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="rounded-[1.75rem] bg-primary p-8 text-on-primary">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/72">Policy summary</p>
          <h2 className="mt-4 font-headline text-3xl italic">Respectful data use</h2>
          <p className="mt-5 text-sm leading-7 text-white/84">
            We collect only the information needed to run orders, accounts, communications, and support in a dependable way.
          </p>
        </aside>

        <div className="space-y-5">
          {sections.map((section, index) => (
            <article key={section.title} className="rounded-[1.75rem] border border-outline-variant/15 bg-surface-container-lowest p-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-on-surface-variant/55">
                Section {index + 1}
              </p>
              <h2 className="mt-3 font-headline text-2xl italic text-primary">{section.title}</h2>
              <p className="mt-4 text-sm leading-8 text-on-surface-variant">{section.body}</p>
            </article>
          ))}
        </div>
      </div>
    </SupportPageLayout>
  );
}
