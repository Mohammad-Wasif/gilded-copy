import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SupportPageLayout } from '../../components/SupportPageLayout';

const faqGroups = [
  {
    title: 'Orders & availability',
    items: [
      {
        question: 'Do you keep all collections in stock year-round?',
        answer:
          'Our signature zari, dabka, beads, and atelier kits remain available throughout most of the year. Limited heritage collections and restored deadstock materials are released in smaller batches and may not be restocked once sold through.',
      },
      {
        question: 'Can I reserve materials for a larger production run?',
        answer:
          'Yes. For studio, bridal, and retail projects, we can hold inventory for a short planning window while your team confirms quantities. Use the contact page to request a reserve review.',
      },
      {
        question: 'Do you support custom sourcing requests?',
        answer:
          'We do. If you need a specific metal tone, texture, gauge, or era-inspired embellishment, our team can review bespoke sourcing or recommend the closest in-house option.',
      },
    ],
  },
  {
    title: 'Shipping & care',
    items: [
      {
        question: 'How long does dispatch usually take?',
        answer:
          'Most ready-to-ship retail orders leave our studio within 2 to 4 business days. Bulk and custom orders may require handling, inspection, or packaging time before dispatch.',
      },
      {
        question: 'Do you ship internationally?',
        answer:
          'Yes. We regularly ship to independent artisans, costume houses, and retail partners worldwide. Transit time depends on destination, customs review, and the value of the shipment.',
      },
      {
        question: 'How should metallic embroidery materials be stored?',
        answer:
          'Keep materials in a cool, dry place away from direct sunlight, humidity, and corrosive surfaces. For long-term storage, use acid-free wrapping and seal high-value items in protective sleeves.',
      },
    ],
  },
  {
    title: 'Accounts & support',
    items: [
      {
        question: 'What is the difference between customer and admin access?',
        answer:
          'Customer accounts are intended for browsing, checkout, and order management. Admin access is restricted to authorized internal staff and should never be used by shoppers or partners.',
      },
      {
        question: 'Do you offer wholesale support for boutiques or design houses?',
        answer:
          'Yes. We work with boutiques, costume departments, and luxury ateliers on curated wholesale relationships. Contact us with your business profile and estimated purchase cadence.',
      },
      {
        question: 'How can I get help with a delayed or damaged delivery?',
        answer:
          'Reach out through our contact page with your order reference, shipment date, and any relevant photos. We will review the issue and guide you through the next step quickly.',
      },
    ],
  },
];

export default function FaqPage() {
  const [openItem, setOpenItem] = useState('Do you keep all collections in stock year-round?');

  return (
    <SupportPageLayout
      eyebrow="FAQ"
      title="Answers for customers, collaborators, and careful makers."
      description="Browse practical guidance on ordering, shipping, custom sourcing, account access, and support expectations. The goal is clarity without losing the editorial tone of the atelier."
      accent="bg-primary"
    >
      <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="rounded-[1.75rem] border border-outline-variant/15 bg-surface-container-low p-8">
          <h2 className="font-headline text-3xl italic text-primary">Before you reach out</h2>
          <p className="mt-4 text-sm leading-7 text-on-surface-variant">
            The questions on this page cover the topics we are asked most often by individual artisans, studios, and wholesale buyers.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-on-surface-variant">
            {faqGroups.map((group) => (
              <li key={group.title} className="border-b border-outline-variant/15 pb-4 last:border-b-0 last:pb-0">
                <p className="font-semibold uppercase tracking-[0.2em] text-primary">{group.title}</p>
                <p className="mt-2 leading-7">{group.items.length} common questions</p>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-8">
          {faqGroups.map((group) => (
            <section key={group.title} className="rounded-[1.75rem] border border-outline-variant/15 bg-surface-container-lowest p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between gap-4 border-b border-outline-variant/15 pb-4">
                <h2 className="font-headline text-2xl italic text-primary">{group.title}</h2>
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant/55">
                  {group.items.length} entries
                </span>
              </div>

              <div className="space-y-4">
                {group.items.map((item) => {
                  const isOpen = openItem === item.question;

                  return (
                    <article key={item.question} className="rounded-2xl border border-outline-variant/20 bg-surface p-1">
                      <button
                        type="button"
                        onClick={() => setOpenItem(isOpen ? '' : item.question)}
                        className="flex w-full items-center justify-between gap-4 rounded-[calc(1rem-2px)] px-5 py-4 text-left"
                      >
                        <span className="font-headline text-lg text-on-surface">{item.question}</span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {isOpen && <p className="px-5 pb-5 text-sm leading-7 text-on-surface-variant">{item.answer}</p>}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </SupportPageLayout>
  );
}
