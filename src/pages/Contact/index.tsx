import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

// ── Main Contact Page ─────────────────────────────────────────────────────────
export default function Contact() {
  useDocumentTitle('Contact Us');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'Bespoke Commission',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <>
      {/* ── Hero / Intro ──────────────────────────────────────── */}
      <section className="max-w-screen-2xl mx-auto px-8 pt-20 pb-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Left: info panel */}
          <div className="space-y-16">
            <div className="space-y-6">
              <span className="text-[10px] font-label uppercase tracking-[0.4em] text-on-surface-variant/60 block">
                Get in Touch
              </span>
              <h1 className="font-headline text-5xl lg:text-6xl text-primary leading-[1.1] italic">
                Inquiries &amp; Private<br />Appointments
              </h1>
              <div className="h-px w-16 bg-primary/20" />
              <p className="text-lg text-on-surface-variant leading-relaxed max-w-lg">
                Whether you are seeking a bespoke commission or have questions about our seasonal collections, our artisans are here to assist you in preserving heritage.
              </p>
            </div>

            {/* Studio details */}
            <div className="space-y-10">
              <div className="space-y-3">
                <h3 className="font-headline text-xl text-primary italic">The New Delhi Studio</h3>
                <p className="text-sm text-on-surface-variant leading-loose font-body">
                  B-42, First Floor, Okhla Phase III<br />
                  Industrial Estate, New Delhi 110020<br />
                  India
                </p>
                <a
                  href="mailto:concierge@hindstanembroidery.com"
                  className="text-sm text-primary hover:opacity-70 transition-opacity border-b border-primary/30 pb-0.5 inline-block font-headline italic"
                >
                  concierge@hindstanembroidery.com
                </a>
              </div>

              <div className="space-y-3 pt-8 border-t border-outline-variant/10">
                <h4 className="font-headline text-lg text-primary italic">Partner with us</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed font-body max-w-sm">
                  For luxury boutiques and global retail partnerships, explore our curated wholesale catalog.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-xs font-label font-bold uppercase tracking-widest text-primary group mt-2"
                >
                  Wholesale Inquiry
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right: contact form */}
          <div className="bg-surface-bright border border-outline-variant/10 shadow-sm p-10 lg:p-14 rounded-sm">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="text-primary" size={28} />
                </div>
                <h3 className="font-headline text-3xl text-primary italic">Message Sent</h3>
                <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
                  Thank you for reaching out. Our artisans will respond within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-7">
                <div>
                  <h3 className="font-headline text-3xl text-primary italic mb-2">Atelier Inquiry</h3>
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest font-label">
                    All fields are required
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant block">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="Aditi"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Sharma"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant block">
                    Subject of Inquiry
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm appearance-none cursor-pointer"
                  >
                    <option>Bespoke Commission</option>
                    <option>Wholesale Partnership</option>
                    <option>Collection Availability</option>
                    <option>Restoration Services</option>
                    <option>General Inquiry</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant block">
                    Your Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your vision or inquiry..."
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-on-primary py-4 font-label font-bold uppercase tracking-[0.25em] text-sm hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-3 group rounded-sm"
                >
                  Send Message
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Quote Banner ──────────────────────────────────────── */}
      <section className="mt-24 bg-primary py-24 px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <blockquote className="font-headline text-3xl lg:text-5xl text-on-primary italic leading-tight">
            "True luxury is found in the patience of the hand."
          </blockquote>
          <p className="text-on-primary/70 text-sm font-body max-w-xl mx-auto leading-relaxed">
            Our atelier is open for private consultations by appointment only. We welcome you to experience the tactile beauty of our heritage crafts first-hand.
          </p>
        </div>
      </section>
    </>
  );
}
