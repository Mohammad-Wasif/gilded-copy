import { Verified, Star, Package, Truck } from 'lucide-react';

const features = [
  { icon: Verified, title: "Premium Quality Materials", desc: "Sourced from certified heritage suppliers to ensure lasting brilliance and durability." },
  { icon: Star, title: "Trusted by Designers", desc: "Preferred partner for leading bridal houses and international couture designers." },
  { icon: Package, title: "Bulk Orders Available", desc: "Scalable supply chain solutions for manufacturers and commercial workshops." },
  { icon: Truck, title: "Fast Delivery Across India", desc: "Reliable logistics network ensuring prompt arrival of your delicate materials." }
];

const WhyChooseUs = () => (
  <section className="bg-surface py-12 px-4 md:py-24 md:px-8 border-t border-outline-variant/10">
    <div className="max-w-screen-2xl mx-auto">
      <div className="text-center mb-20">
        <h2 className="font-headline text-3xl md:text-5xl text-primary leading-tight">Why Choose Hindustan Embroidery</h2>
        <div className="w-24 h-px bg-primary/20 mx-auto mt-6"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 text-center">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center mb-6">
              <f.icon className="text-4xl text-primary font-light" size={40} />
            </div>
            <div className="h-12 flex items-center justify-center">
              <h3 className="font-headline text-xl text-primary mb-3">{f.title}</h3>
            </div>
            <p className="font-body text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
