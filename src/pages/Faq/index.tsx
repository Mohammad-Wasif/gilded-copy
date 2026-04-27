import { useState, useEffect } from 'react';
import { ChevronDown, Search, ArrowRight, Headphones, MessageCircle, Mail } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../lib/api';

interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

const defaultFaqGroups: FaqGroup[] = [
  {
    id: 'orders',
    title: 'Orders & Availability',
    items: [
      {
        question: 'Are all products available year-round?',
        answer: 'Our core materials such as zari, dabka, beads, sequins, and trims are generally available throughout the year. Limited heritage and deadstock collections are released in small batches and may not be restocked.',
      },
      {
        question: 'How can I check if a product is in stock?',
        answer: 'Each product page displays its availability status: In Stock, Low Stock, Made to Order, or Sold Out.',
      },
      {
        question: 'Can I reserve items before placing a bulk order?',
        answer: 'Yes. We can temporarily reserve materials for confirmed projects while you finalize quantities. Reservation requests are reviewed based on availability.',
      },
      {
        question: 'Do you restock sold-out items?',
        answer: 'Some standard materials are restocked regularly, but limited or heritage collections may not return once sold out.',
      },
      {
        question: 'Is there a minimum order quantity?',
        answer: 'Retail orders have no minimum. Wholesale or bulk orders may have minimum quantity requirements depending on the product type.',
      },
      {
        question: 'Can I request large quantities for production?',
        answer: 'Yes. For studio or production requirements, we recommend contacting us in advance to confirm availability and timelines.',
      },
      {
        question: 'Can I mix different products in one order?',
        answer: 'Yes. You can combine multiple products in a single retail order. Bulk orders may be processed separately.',
      },
      {
        question: 'How accurate are product colors and finishes shown online?',
        answer: 'We aim for high accuracy, but slight variations may occur due to lighting and screen differences. For critical projects, we recommend confirming before ordering.',
      },
    ]
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    items: [
      {
        question: 'How long does dispatch take?',
        answer: 'Retail orders are typically dispatched within 2–4 business days. Bulk or custom orders may take longer depending on preparation.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes. We ship worldwide to artisans, boutiques, costume houses, and production studios.',
      },
      {
        question: 'How long does delivery take?',
        answer: 'Domestic delivery usually takes 3–7 days. International shipping timelines vary based on destination and customs processing.',
      },
      {
        question: 'Will I receive tracking details?',
        answer: 'Yes. Tracking information is shared via email or WhatsApp once your order is dispatched.',
      },
      {
        question: 'Are there any customs charges for international orders?',
        answer: 'Custom duties and taxes (if applicable) are the responsibility of the customer and vary by country.',
      },
      {
        question: 'Can I request urgent or priority shipping?',
        answer: 'Yes. If you need expedited shipping, contact us before placing the order to check availability.',
      },
      {
        question: 'What happens if my order is delayed?',
        answer: 'If your order is delayed, contact us with your order number and we will provide an update and support.',
      },
      {
        question: 'Do you ship fragile or high-value materials securely?',
        answer: 'Yes. All orders are carefully packed to protect delicate embroidery materials during transit.',
      },
    ]
  },
  {
    id: 'wholesale',
    title: 'Wholesale & Bulk Orders',
    items: [
      {
        question: 'Do you offer wholesale pricing?',
        answer: 'Yes. We provide wholesale pricing for boutiques, studios, export houses, and production units.',
      },
      {
        question: 'How can I apply for wholesale access?',
        answer: 'Submit your business details through our contact or wholesale inquiry form. Our team will review and respond.',
      },
      {
        question: 'What information is required for wholesale approval?',
        answer: 'Business name, location, product requirements, estimated quantities, and type of business.',
      },
      {
        question: 'Can I place recurring bulk orders?',
        answer: 'Yes. We support ongoing supply for studios and production teams.',
      },
      {
        question: 'Do you provide custom sourcing for bulk projects?',
        answer: 'Yes. We can source specific materials based on finish, texture, size, or reference samples.',
      },
      {
        question: 'Can you match materials from a reference image?',
        answer: 'In many cases, yes. Share a clear image or sample, and we will suggest the closest match or source it.',
      },
      {
        question: 'What is the lead time for bulk or custom orders?',
        answer: 'Lead times vary depending on quantity and sourcing complexity. Most requests are reviewed within 3–5 working days.',
      },
      {
        question: 'Do you offer special pricing for large-volume orders?',
        answer: 'Yes. Pricing is adjusted based on quantity and product category.',
      },
    ]
  },
  {
    id: 'product',
    title: 'Product & Care',
    items: [
      {
        question: 'How should embroidery materials be stored?',
        answer: 'Store in a cool, dry place away from sunlight, humidity, and corrosive surfaces.',
      },
      {
        question: 'How do I prevent tarnishing of metallic materials?',
        answer: 'Use acid-free wrapping and keep materials sealed in protective packaging.',
      },
      {
        question: 'Are your materials suitable for bridal and couture work?',
        answer: 'Yes. Our materials are widely used in bridal, couture, costume, and high-end design applications.',
      },
      {
        question: 'Do you offer material recommendations for specific use cases?',
        answer: 'Yes. You can contact us for suggestions based on your project requirements.',
      },
      {
        question: 'Can I use these materials for machine embroidery?',
        answer: 'Some materials are suitable, but we recommend checking compatibility based on the technique.',
      },
      {
        question: 'Do you provide samples before bulk purchase?',
        answer: 'For large orders, sample requests can be reviewed based on availability.',
      },
      {
        question: 'Are product measurements and specifications accurate?',
        answer: 'Yes. We maintain high accuracy, but slight variations may occur in handmade or heritage materials.',
      },
      {
        question: 'How do I choose the right material for my project?',
        answer: 'You can explore product categories or contact us for guidance based on design, finish, and budget.',
      },
    ]
  },
  {
    id: 'support',
    title: 'Account & Support',
    items: [
      {
        question: 'Do I need an account to place an order?',
        answer: 'No. You can checkout as a guest. Creating an account helps with tracking and managing orders.',
      },
      {
        question: 'What can I do with a customer account?',
        answer: 'View orders, save addresses, track shipments, and manage account details.',
      },
      {
        question: 'How do I reset my password?',
        answer: 'Use the “Forgot Password” option on the login page.',
      },
      {
        question: 'How can I contact support?',
        answer: 'You can reach us via contact form, WhatsApp, or email.',
      },
      {
        question: 'What details should I include when contacting support?',
        answer: 'Order number, issue description, and relevant images (if applicable).',
      },
      {
        question: 'How quickly will I receive a response?',
        answer: 'Most queries are responded to within 24–48 hours.',
      },
      {
        question: 'Can I modify or cancel an order after placing it?',
        answer: 'Changes may be possible before dispatch. Contact us immediately after placing the order.',
      },
      {
        question: 'What should I do if I receive a damaged or incorrect product?',
        answer: 'Contact us within 48 hours with photos and order details. We will assist with resolution.',
      },
    ]
  }
];

export default function FaqPage() {
  const [faqGroups, setFaqGroups] = useState<FaqGroup[]>(defaultFaqGroups);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const res = await api.settings.get('faq_data');
        if (mounted && res?.value) {
          setFaqGroups(typeof res.value === 'string' ? JSON.parse(res.value) : res.value);
        }
      } catch (err) {
        console.error('Failed to load FAQ from backend, using defaults', err);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('orders');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const sections = faqGroups.map(group => document.getElementById(group.id));
      const scrollPosition = window.scrollY + 200; // Offset for sticky headers

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  const filteredGroups = faqGroups.map(group => ({
    ...group,
    items: group.items.filter(item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => group.items.length > 0);

  return (
    <main className="pt-32 pb-20 max-w-4xl mx-auto w-full px-6 min-h-screen">
      {/* Help & FAQs Top Section */}
      <header className="mb-12 text-center">
        <h1 className="font-headline text-4xl md:text-5xl text-primary mb-8 tracking-tight">Help & FAQs</h1>
        
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={20} />
          <input 
            className="w-full pl-12 pr-4 py-4 rounded-md border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary shadow-sm text-lg outline-none transition-all placeholder:text-on-surface-variant/60 font-body" 
            placeholder="Search shipping, zari, bulk order..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Most Asked - Only show if not searching */}
        {!searchQuery && (
          <div className="max-w-2xl mx-auto text-left">
            <h2 className="font-headline text-xl text-primary mb-4">Most Asked</h2>
            <div className="space-y-3">
              <div className="bg-surface-container-lowest p-5 rounded-md border border-outline-variant/30">
                <details className="group [&>summary::-webkit-details-marker]:hidden" open>
                  <summary className="flex justify-between items-center cursor-pointer list-none font-headline text-lg text-on-surface hover:text-primary transition-colors">
                    Do you ship internationally?
                    <ChevronDown className="transition-transform group-open:rotate-180 text-primary" size={20} />
                  </summary>
                  <div className="mt-3 text-on-surface-variant text-sm leading-relaxed font-body">
                    Yes, we ship globally via insured courier. Costs are calculated at checkout.
                    <div className="mt-2">
                      <Link to="/shipping" className="text-primary font-semibold hover:underline text-sm inline-flex items-center gap-1">
                        View Shipping Policy <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </details>
              </div>
              <div className="bg-surface-container-lowest p-5 rounded-md border border-outline-variant/30">
                <details className="group [&>summary::-webkit-details-marker]:hidden" open>
                  <summary className="flex justify-between items-center cursor-pointer list-none font-headline text-lg text-on-surface hover:text-primary transition-colors">
                    How long does delivery take?
                    <ChevronDown className="transition-transform group-open:rotate-180 text-primary" size={20} />
                  </summary>
                  <div className="mt-3 text-on-surface-variant text-sm leading-relaxed font-body">
                    Ready-to-ship items arrive in 5-7 business days. Custom orders require 4-6 weeks for assembly.
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Sticky Horizontal Category Navigation */}
      <nav className="sticky top-[88px] z-40 bg-surface/95 backdrop-blur border-b border-outline-variant/50 mb-10 pb-0 overflow-x-auto no-scrollbar hidden md:block">
        <div className="flex space-x-8 min-w-max px-2">
          {faqGroups.map(group => (
            <a 
              key={group.id}
              href={`#${group.id}`}
              className={`font-headline pb-4 px-1 transition-colors ${
                activeSection === group.id
                  ? 'text-primary border-b-2 border-primary font-semibold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {group.title}
            </a>
          ))}
        </div>
      </nav>

      {/* Mobile Dropdown Navigation */}
      <div className="md:hidden sticky top-[88px] z-40 bg-surface mb-8">
        <select 
          className="w-full p-3 bg-surface-container-low border border-outline-variant rounded font-headline text-primary focus:ring-primary focus:border-primary outline-none" 
          value={`#${activeSection}`}
          onChange={(e) => {
            window.location.hash = e.target.value;
          }}
        >
          {faqGroups.map(group => (
            <option key={group.id} value={`#${group.id}`}>
              {group.title}
            </option>
          ))}
        </select>
      </div>

      {/* Content Structure */}
      <div className="space-y-16">
        {filteredGroups.length === 0 ? (
          <div className="text-center text-on-surface-variant py-10">
            No results found for "{searchQuery}"
          </div>
        ) : (
          filteredGroups.map(group => (
            <section key={group.id} className="scroll-mt-48" id={group.id}>
              <h2 className="font-headline text-2xl text-primary mb-6 border-b border-outline-variant/20 pb-2">
                {group.title}
              </h2>
              <div className="space-y-3">
                {group.items.map((item, index) => (
                  <div key={index} className="bg-surface-container-lowest p-5 rounded-md border border-outline-variant/20 hover:border-outline-variant/50 transition-colors">
                    <details className="group [&>summary::-webkit-details-marker]:hidden" open={searchQuery ? true : undefined}>
                      <summary className="flex justify-between items-center cursor-pointer list-none font-headline text-lg text-on-surface">
                        {item.question}
                        <ChevronDown className="transition-transform group-open:rotate-180 text-primary shrink-0 ml-4" size={20} />
                      </summary>
                      <div className="mt-3 text-on-surface-variant text-sm leading-relaxed font-body">
                        {item.answer}
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Exit Layer */}
      <section className="mt-20 p-10 bg-surface-container-low rounded-xl text-center">
        <h3 className="font-headline text-2xl text-primary mb-3">Still need help?</h3>
        <p className="font-body text-on-surface-variant mb-8 text-sm">We're here to assist you with any inquiries.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/contact" className="px-6 py-3 bg-primary text-white font-label text-sm font-semibold rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <Headphones size={18} /> Contact Support
          </Link>
          <a href="#" className="px-6 py-3 border border-primary text-primary font-label text-sm font-semibold rounded hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2">
            <MessageCircle size={18} /> WhatsApp Chat
          </a>
          <a href="mailto:concierge@zariatelier.com" className="px-6 py-3 border border-primary text-primary font-label text-sm font-semibold rounded hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2">
            <Mail size={18} /> Email Us
          </a>
        </div>
      </section>
    </main>
  );
}
