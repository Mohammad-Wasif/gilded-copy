import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const WholesaleSection = () => (
  <section className="bg-surface-container-low py-24 px-8 border-t border-outline-variant/10">
    <div className="max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="order-2 lg:order-1">
          <h2 className="font-headline text-4xl text-primary mb-8 leading-tight">Bulk Orders? Get Wholesale Pricing & Discounts</h2>
          <ul className="space-y-6 mb-10">
            {[
              { title: "Low Minimum Order Quantity", desc: "Start your bulk journey with just 10 units per SKU." },
              { title: "Up to 40% Discount", desc: "Tiered pricing based on volume to support your business growth." },
              { title: "Custom Sourcing", desc: "Access unique materials and custom-dyed threads for large orders." }
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-4">
                <CheckCircle2 className="text-primary mt-1 shrink-0" size={20} />
                <div>
                  <p className="font-bold text-primary">{item.title}</p>
                  <p className="text-on-surface-variant">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/" className="inline-block bg-primary text-on-primary px-10 py-4 font-semibold tracking-wide editorial-shadow hover:scale-[1.02] transition-transform mb-6">Request Wholesale Access</Link>
          <p className="text-xs text-on-surface-variant italic">Trusted by over 500+ commercial units across the globe.</p>
        </div>
        <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx3gAmfrhXT7j2TUARFxu-mMLfdnOWBSa95F8jzJC1ENr4l80EGK1iLy-BcdU2Nmw-ZjtnbjeAblFjdwObnAV5x7GJwObT2MRb7Gj8qol2rSYMwuWOdhhmDvtpoirFfyJO3ZFTQenumFc1x5eg2H4UUTGgxB9fTImsFRSc5N0NvMxLDbtRtJeM3OYxDZoPLisRT9_Z2-ST4Jgz6ecozzi6fdWtZIbfVJCguZsZ2tOkpmcR8MdEK7LM9_RwNkL5tPamGxL9J54ugIo"
              alt="Bulk Threads"
              className="w-full aspect-[3/4] object-cover editorial-shadow rounded-sm"
              referrerPolicy="no-referrer"
            />
            <div className="h-24 bg-primary/5 border border-primary/10 rounded-sm"></div>
          </div>
          <div className="pt-12 space-y-4">
            <div className="h-24 bg-tertiary-container/10 border border-tertiary-container/20 rounded-sm"></div>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzpEQjBRESzWV-0VBOZGn7UB8xUJIXrTf0kj2HzEv0jxsHkRfaRmB1-BuTSvVFom6XkDkgqtwQejQ_BieG-FOIejfpIy8MFEc_sVYYeY0sseZAjEUvo1tQGcnA5QfGtjyjg0tn2pJrYWiNjLlp9J5PEvU14AkRCjfhU7SYUbzDxPLZnts-bYacZK-fpfdmp_xwOhfxTPkdh6W-1Q7jcs-C9CjcJ2Y6Tja5zu9l2T6iGGPTJz9xajOVAyr_r3XpC4KOqJpGB-XsjcE"
              alt="Artisanal Work"
              className="w-full aspect-[3/4] object-cover editorial-shadow rounded-sm"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default WholesaleSection;
