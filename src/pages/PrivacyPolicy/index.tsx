import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, User, CreditCard, CheckCircle } from 'lucide-react';

const tocItems = [
  { id: 'collection', label: 'Information Collection' },
  { id: 'usage', label: 'Data Usage' },
  { id: 'sharing', label: 'Third-Party Sharing' },
  { id: 'security', label: 'Security Standards' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'cookies', label: 'Cookie Policy' },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('collection');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(tocItems[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(tocItems[i].id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto min-h-screen">
      {/* Editorial Header Section */}
      <header className="mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <span className="font-label text-xs tracking-[0.2em] text-on-surface-variant mb-4 block uppercase">Legal & Ethics</span>
            <h1 className="font-headline text-5xl md:text-7xl text-primary leading-tight">Privacy Policy</h1>
          </div>
          <div className="pb-2">
            <p className="font-label text-sm text-on-surface-variant italic">Effective Date: October 24, 2024</p>
          </div>
        </div>
        <div className="h-px bg-outline-variant/30 mt-8 w-full"></div>
      </header>

      {/* Content Grid - Asymmetric Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Sticky Navigation/Table of Contents */}
        <aside className="lg:col-span-3 hidden lg:block">
          <div className="sticky top-40 space-y-6">
            <h4 className="font-headline text-lg text-primary mb-8 italic">On This Page</h4>
            <nav className="flex flex-col space-y-4">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`font-label text-sm pl-4 py-1 transition-all ${
                    activeSection === item.id
                      ? 'text-primary border-l-2 border-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Text Content */}
        <article className="lg:col-span-9 space-y-24">
          {/* Introduction */}
          <section id="introduction">
            <p className="font-headline text-2xl leading-relaxed text-on-surface-variant italic">
              At Hindustan Embroidery, we believe that luxury is built on trust. Your privacy is a fundamental component of the bespoke experience we provide. This policy outlines how we curate, protect, and respect your personal information across our digital atelier.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="space-y-8 scroll-mt-48" id="collection">
            <h2 className="font-headline text-3xl text-primary">Information We Collect</h2>
            <div className="space-y-6 font-body text-on-surface leading-relaxed text-lg">
              <p>We collect personal information that you provide directly to us when you interact with our boutique. This includes:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-surface-container-low rounded-lg space-y-3">
                  <User className="text-tertiary" size={24} />
                  <h3 className="font-headline text-xl">Identity Data</h3>
                  <p className="text-sm text-on-surface-variant">Full name, billing address, shipping address, and email for order fulfillment.</p>
                </div>
                <div className="p-6 bg-surface-container-low rounded-lg space-y-3">
                  <CreditCard className="text-tertiary" size={24} />
                  <h3 className="font-headline text-xl">Transaction Data</h3>
                  <p className="text-sm text-on-surface-variant">Details about payments to and from you and other details of products purchased.</p>
                </div>
              </div>
              <p>Additionally, as you navigate our site, we automatically collect technical data including your IP address, browser type, and time zone through the use of refined digital identifiers.</p>
            </div>
          </section>

          {/* Visual Break / Inset Quote */}
          <section className="relative py-12 px-8 bg-primary/5 rounded-xl border-l-4 border-primary overflow-hidden">
            <div className="relative z-10">
              <p className="font-headline text-xl text-primary italic leading-relaxed">
                "The integrity of a single gold thread is as important as the strength of the fabric it binds. We treat your data with the same artisanal care."
              </p>
            </div>
            <div className="absolute -right-12 -bottom-12 opacity-5">
              <Shield size={200} />
            </div>
          </section>

          {/* How We Use Your Data */}
          <section className="space-y-8 scroll-mt-48" id="usage">
            <h2 className="font-headline text-3xl text-primary">How We Use Your Data</h2>
            <div className="space-y-6 font-body text-on-surface leading-relaxed text-lg">
              <p>Your data is the pattern by which we tailor our services. We use this information to:</p>
              <ul className="space-y-4 list-none pl-0">
                <li className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-tertiary mt-2.5 shrink-0"></span>
                  <span>Process and deliver your bespoke orders with precision.</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-tertiary mt-2.5 shrink-0"></span>
                  <span>Communicate artisan updates, journal entries, and private collection previews.</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-tertiary mt-2.5 shrink-0"></span>
                  <span>Monitor for potential risk or fraudulent activity to ensure a safe atelier environment.</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-tertiary mt-2.5 shrink-0"></span>
                  <span>Enhance the architectural flow of our digital boutique based on user interaction.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Third-Party Sharing */}
          <section className="space-y-8 scroll-mt-48" id="sharing">
            <h2 className="font-headline text-3xl text-primary">Third-Party Sharing</h2>
            <div className="space-y-6 font-body text-on-surface leading-relaxed text-lg">
              <p>We share information only with the service providers needed to operate the store responsibly. These include:</p>
              <ul className="space-y-4 list-none pl-0">
                <li className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-tertiary mt-2.5 shrink-0"></span>
                  <span>Payment processors for secure financial transactions.</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-tertiary mt-2.5 shrink-0"></span>
                  <span>Fulfillment and shipping partners for order delivery.</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-tertiary mt-2.5 shrink-0"></span>
                  <span>Technical infrastructure vendors for site performance and security.</span>
                </li>
              </ul>
              <p>We do not sell, trade, or otherwise transfer your personal information to third parties for marketing purposes. Reasonable administrative and technical safeguards are used to protect customer information from unauthorized access.</p>
            </div>
          </section>

          {/* Security & Protection */}
          <section className="space-y-8 scroll-mt-48" id="security">
            <h2 className="font-headline text-3xl text-primary">Security & Protection</h2>
            <div className="space-y-6 font-body text-on-surface leading-relaxed text-lg">
              <p>We employ industry-leading encryption and secure socket layer (SSL) technology to protect your information. Access to your personal data is restricted to employees and partners who have a legitimate "need to know" to facilitate your experience.</p>
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
                <div className="flex items-center gap-4 mb-4">
                  <CheckCircle className="text-primary" size={24} />
                  <h4 className="font-headline text-xl">The Vault Standard</h4>
                </div>
                <p className="text-on-surface-variant text-base">We do not store full credit card information on our servers. All financial transactions are processed through encrypted payment gateways that maintain the highest PCI-DSS compliance standards.</p>
              </div>
            </div>
          </section>

          {/* Your Sovereign Rights */}
          <section className="space-y-8 scroll-mt-48" id="rights">
            <h2 className="font-headline text-3xl text-primary">Your Sovereign Rights</h2>
            <p className="font-body text-on-surface leading-relaxed text-lg">As a patron of Hindustan Embroidery, you possess the following rights regarding your personal data:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h5 className="font-headline text-lg text-tertiary">Access</h5>
                <p className="text-sm text-on-surface-variant">The right to request a digital transcript of all data we hold.</p>
              </div>
              <div className="space-y-2">
                <h5 className="font-headline text-lg text-tertiary">Rectification</h5>
                <p className="text-sm text-on-surface-variant">The right to correct any inaccuracies in your profile.</p>
              </div>
              <div className="space-y-2">
                <h5 className="font-headline text-lg text-tertiary">Erasure</h5>
                <p className="text-sm text-on-surface-variant">The right to request the total removal of your data from our system.</p>
              </div>
            </div>
          </section>

          {/* Cookie Policy */}
          <section className="space-y-8 scroll-mt-48" id="cookies">
            <h2 className="font-headline text-3xl text-primary">Cookie Policy</h2>
            <div className="space-y-6 font-body text-on-surface leading-relaxed text-lg">
              <p>We use cookies and similar tracking technologies to enhance your browsing experience. These cookies help us understand how you interact with our site, remember your preferences, and improve our services.</p>
              <ul className="space-y-4 list-none pl-0">
                <li className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-tertiary mt-2.5 shrink-0"></span>
                  <span><strong>Essential cookies:</strong> Required for the site to function properly, including cart management and authentication.</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-tertiary mt-2.5 shrink-0"></span>
                  <span><strong>Analytics cookies:</strong> Help us understand site usage patterns in aggregate form.</span>
                </li>
                <li className="flex items-start gap-4">
                  <span className="w-2 h-2 rounded-full bg-tertiary mt-2.5 shrink-0"></span>
                  <span><strong>Preference cookies:</strong> Remember your display and language preferences across sessions.</span>
                </li>
              </ul>
              <p>You can manage cookie preferences through your browser settings. Disabling certain cookies may affect your ability to use some features of our site.</p>
            </div>
          </section>
        </article>
      </div>

      {/* Contact Section */}
      <section className="mt-32 p-12 bg-surface-container-low rounded-2xl text-center max-w-4xl mx-auto">
        <h3 className="font-headline text-3xl text-primary mb-6">Concierge Support</h3>
        <p className="font-body text-on-surface-variant mb-10 text-lg">Should you have any inquiries regarding our privacy practices or your data, our legal concierge is available for consultation.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to="/contact" className="px-8 py-4 bg-primary text-on-primary font-label tracking-wider rounded-md transition-all hover:opacity-90 active:scale-95 uppercase">
            Email Concierge
          </Link>
          <a href="#" className="px-8 py-4 border border-outline text-primary font-label tracking-wider rounded-md transition-all hover:bg-surface-container-high active:scale-95 uppercase">
            Data Request Form
          </a>
        </div>
      </section>
    </main>
  );
}
