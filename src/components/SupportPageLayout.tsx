import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

type SupportPageLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  children: ReactNode;
};

export function SupportPageLayout({
  eyebrow,
  title,
  description,
  accent,
  children,
}: SupportPageLayoutProps) {
  return (
    <div className="bg-surface text-on-surface">
      <section className="border-b border-outline-variant/15 bg-surface-container-low">
        <div className="mx-auto grid max-w-screen-2xl gap-12 px-8 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:py-24">
          <div className="space-y-6">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.38em] text-on-surface-variant/65">
              {eyebrow}
            </span>
            <h1 className="max-w-3xl font-headline text-5xl italic leading-tight text-primary lg:text-6xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-on-surface-variant lg:text-lg">
              {description}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-outline-variant/15 bg-surface-container-lowest p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-on-surface-variant/60">
                Need a hand?
              </p>
              <p className="mt-4 text-sm leading-7 text-on-surface-variant">
                Reach the atelier team for product guidance, order support, and wholesale coordination.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary"
              >
                Contact support
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className={`rounded-[1.75rem] p-6 text-on-primary ${accent}`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/70">
                Quick note
              </p>
              <p className="mt-4 text-sm leading-7 text-white/88">
                These pages are written to support customers, collaborators, and internal teams with clear reference information.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-8 py-16 lg:py-20">{children}</section>
    </div>
  );
}
