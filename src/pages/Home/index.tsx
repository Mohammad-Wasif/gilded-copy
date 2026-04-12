import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import Hero from './Hero';
import CategorySection from './CategorySection';
import ApplicationSection from './ApplicationSection';
import BestSellers from './BestSellers';
import WholesaleSection from './WholesaleSection';
import WhyChooseUs from './WhyChooseUs';

export default function Home() {
  useDocumentTitle('');
  return (
    <>
      <Hero />
      <CategorySection />
      <ApplicationSection />
      <BestSellers />
      <WholesaleSection />
      <WhyChooseUs />
      <section className="py-32 text-center bg-surface">
        <div className="max-w-2xl mx-auto px-8">
          <h2 className="font-headline text-4xl text-primary mb-6">Ready to start your next masterpiece?</h2>
          <p className="text-on-surface-variant mb-12 text-lg">Join 5,000+ artisans and design houses sourcing the world's most exquisite materials.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="bg-primary text-on-primary px-10 py-4 font-semibold tracking-wide editorial-shadow hover:scale-[1.02] transition-transform">Create Account</Link>
            <Link to="/" className="border border-primary text-primary px-10 py-4 font-semibold tracking-wide hover:bg-primary/5 transition-colors">Request Catalog</Link>
          </div>
        </div>
      </section>
    </>
  );
}
