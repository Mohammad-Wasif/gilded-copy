import { SupportPageLayout } from '../../components/SupportPageLayout';

const terms = [
  {
    title: 'Use of the website',
    body:
      'By accessing this website, you agree to use it lawfully and in a way that does not disrupt our services, misrepresent your identity, or interfere with the experience of other customers, artisans, or staff.',
  },
  {
    title: 'Product presentation',
    body:
      'We make every effort to present materials, finishes, and tones accurately. Because many products are handmade or historically inspired, minor variation in color, texture, patina, or packaging may occur and should be expected.',
  },
  {
    title: 'Pricing and availability',
    body:
      'Prices, product listings, and availability may change without prior notice. We reserve the right to limit quantities, decline orders that appear fraudulent, and cancel transactions where pricing or inventory errors are discovered before fulfillment.',
  },
  {
    title: 'Accounts and restricted access',
    body:
      'Customers are responsible for keeping their login information secure. Administrative routes and internal tools are restricted to approved personnel only, and unauthorized attempts to access them are prohibited.',
  },
  {
    title: 'Liability and support',
    body:
      'To the fullest extent permitted by law, Hindustan Embroidery is not liable for indirect or consequential damages arising from the use of this website, delays caused by carriers, or misuse of products outside their intended application. Support inquiries will always be reviewed in good faith.',
  },
];

export default function TermsOfServicePage() {
  return (
    <SupportPageLayout
      eyebrow="Terms of Service"
      title="The operating terms that govern purchases and platform access."
      description="These terms help define how the store functions, what customers can expect, and how we protect the integrity of the website, products, and internal systems."
      accent="bg-tertiary"
    >
      <div className="space-y-5">
        {terms.map((term, index) => (
          <article
            key={term.title}
            className="grid gap-6 rounded-[1.75rem] border border-outline-variant/15 bg-surface-container-lowest p-8 lg:grid-cols-[120px_1fr]"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">Clause {index + 1}</div>
            <div>
              <h2 className="font-headline text-2xl italic text-primary">{term.title}</h2>
              <p className="mt-4 text-sm leading-8 text-on-surface-variant">{term.body}</p>
            </div>
          </article>
        ))}
      </div>
    </SupportPageLayout>
  );
}
