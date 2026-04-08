import { SupportPageLayout } from '../../components/SupportPageLayout';

const shippingCards = [
  {
    title: 'Dispatch timeline',
    body:
      'Ready-to-ship retail orders are typically dispatched within 2 to 4 business days. Wholesale, custom, or inspection-heavy orders may require additional handling time before they leave the atelier.',
  },
  {
    title: 'Tracked delivery',
    body:
      'All eligible shipments are sent with tracking so customers can monitor progress. Signature confirmation may be required for higher-value deliveries.',
  },
  {
    title: 'International transit',
    body:
      'Transit windows vary by destination and customs processing. Duties, import assessments, and regional handling fees may be applied by the destination country and remain the responsibility of the recipient unless agreed otherwise.',
  },
];

const returns = [
  'Contact us within 7 days of delivery if your order arrives damaged, incomplete, or materially incorrect.',
  'Because many items are delicate, custom, or limited-run, returns are reviewed case by case rather than auto-approved.',
  'Unused standard-stock items may be eligible for exchange or store credit when returned in original condition.',
  'Custom sourcing, cut lengths, special-order kits, and wholesale reserve orders are generally non-returnable once confirmed.',
];

export default function ShippingReturnsPage() {
  return (
    <SupportPageLayout
      eyebrow="Shipping & Returns"
      title="Delivery expectations and return guidance for careful orders."
      description="We handle materials that are delicate, high value, and often difficult to replace. These guidelines explain how we dispatch, track, review, and support shipments responsibly."
      accent="bg-primary-container"
    >
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {shippingCards.map((card) => (
            <article key={card.title} className="rounded-[1.75rem] border border-outline-variant/15 bg-surface-container-lowest p-8">
              <h2 className="font-headline text-2xl italic text-primary">{card.title}</h2>
              <p className="mt-4 text-sm leading-8 text-on-surface-variant">{card.body}</p>
            </article>
          ))}
        </div>

        <aside className="rounded-[1.75rem] border border-outline-variant/15 bg-surface-container-low p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant/58">Returns policy</p>
          <h2 className="mt-4 font-headline text-3xl italic text-primary">Reviewed with care</h2>
          <ul className="mt-6 space-y-4">
            {returns.map((item) => (
              <li key={item} className="rounded-2xl bg-surface-container-lowest px-5 py-4 text-sm leading-7 text-on-surface-variant">
                {item}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </SupportPageLayout>
  );
}
