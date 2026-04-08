import { ArrowRight, CheckCircle2, Package, Star, Truck, Verified } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Category, Product, ShopApplication } from '../../lib/types';

const Hero = () => (
  <section className="relative h-[80vh] min-h-[600px] overflow-hidden bg-surface-container-low">
    <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
      <div className="relative group cursor-pointer overflow-hidden border-r border-outline-variant/10">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnt8Ye2zoDsaaisRu2UQ0n4lIcgohzlWPmOtAyzrUGl5CvqI9DnWGswxqd50eIrOk8LzxCjicoW13ipLbeLRbErk82cbQCdvm7pm8AaVoCFDg7MQMq1R28trSU8ohnfF-kQspFCl6dqQdxakqOgBHhpqd6cEQ_xbTBjI5rO658JnuIgcmOn3QPTaAHNll13FhnJMFVLpf6i-gqo3XcfHqmMXJxmeZI0hCvJEYrxQju8f6mV7inFqMeBXnST9_mlaI2esB-wSTFDF8"
          alt="Artisan Work"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors"></div>
        <div className="absolute bottom-16 left-12 max-w-md">
          <h2 className="font-headline text-5xl text-white mb-4 leading-tight">For the Solitary Craftsman</h2>
          <p className="font-body text-white/90 mb-8 text-lg">Curated kits and individual spools of the world's finest metallic threads.</p>
          <Link to="/shop" className="inline-block bg-primary text-on-primary px-8 py-3 font-medium tracking-wide editorial-shadow hover:bg-primary/90 transition-all">Shop Retail</Link>
        </div>
      </div>
      <div className="relative group cursor-pointer overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx3gAmfrhXT7j2TUARFxu-mMLfdnOWBSa95F8jzJC1ENr4l80EGK1iLy-BcdU2Nmw-ZjtnbjeAblFjdwObnAV5x7GJwObT2MRb7Gj8qol2rSYMwuWOdhhmDvtpoirFfyJO3ZFTQenumFc1x5eg2H4UUTGgxB9fTImsFRSc5N0NvMxLDbtRtJeM3OYxDZoPLisRT9_Z2-ST4Jgz6ecozzi6fdWtZIbfVJCguZsZ2tOkpmcR8MdEK7LM9_RwNkL5tPamGxL9J54ugIo"
          alt="Design House"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-secondary/30 group-hover:bg-secondary/20 transition-colors"></div>
        <div className="absolute bottom-16 left-12 max-w-md">
          <h2 className="font-headline text-5xl text-white mb-4 leading-tight">For the Design House</h2>
          <p className="font-body text-white/90 mb-8 text-lg">Wholesale access to bulk ordering and custom textile finishes.</p>
          <Link to="/" className="inline-block bg-tertiary-container text-on-primary px-8 py-3 font-medium tracking-wide editorial-shadow hover:bg-tertiary transition-all">Wholesale Inquiry</Link>
        </div>
      </div>
    </div>
  </section>
);

const ApplicationSection = () => {
  const [apps, setApps] = useState<ShopApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.catalog.getShopByApplication().then(res => {
      if (res.success) setApps(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fallbackImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCYX_4krv5PS8efbT3ei2-aVf_rEtO3tHfZCN0Wkrt4WYIPEtwmNpAHKcnbqm-gR07n73pWotClOC11gjRvgygNAu9wXeeV9BJE_sZrACG55q5GINpcrtBeZLOxO2Ntp95SF_qk8Z88gdLAXsrQEiAm2A-2C6xg56YyTmRxwv1vkgkRpHXQhjHObhM9nSwMqQXuZ4E6hEFqvfJiaCpQvFqySkK85HZ9UMDFSYYKq5-C7muSvFEJJ56QZkhh13SueLnKkyjpYXKGs0E",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCjqVWNkaVWn3cPePcKjQOawU0S4rD7ad7H6-bloJgn3vDm6_h5LdpY_KoF-FZgYkvDNsHaCsRJOh5I0COYGNv2a1QKXJxNCle74C5LaXX8dIEJXSso_R6NSyuD3P_39l70rks1vwSN1OHxqeBkw-C9rLbr7o4fsriOb2PD1QGRseEBO6sZPFbR0sQwf1GeuPfjguqoVQC9bx6xF4U2A1bd5mYeeHR5O_cXLNzbaKyngAx2QHTEzugfW4WqL33xlef65z-AW9WwVaY",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCt2VVsK_20uUw0cMvuwaynPR4l_rIvl15meOoDZS955JLFmVqdlc_cQ3WfdvW3UgMO92onOKQazVM1mtVAbo6sBr5IqWxJHvQ_p6_KzFubPv0zFIlYrhUUeZOuv_LzERhmozgJoXXj9pmJ5ceZsto-aA7GT-eh_iRmm9_bhIZAxFd4uuDV6-J3E_caArTCKwRB_GhmF-Rvac69ZOzHiJfNeYNjV8CFFMyYGVfBmLT7M7FjW8cSAr791Su6vnJz5Fxw7rUZ5kZdtKA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDxWPQRgPraNT-evP5xaZoFFeTQz2QFJ8o_wGZHpC1FFw4GCUuXpRaqFDsukPBNMfjlmQ6eHBEofe9UAhx2XRpb6c-jwAPG2To3jMxP7CzU6W8kZGHF13MZr2rhtzaNo86JWcqWq6LRFaYpmNLCzgVmjmbk0fdpArQ71-sTzmmi0hLrvOWRqHFfYPP79u-UMzsCDyazd_FWxpyUQXvpEAiH9kPYaXxRtNIIVxAI8-qLRzTGqypzIbwZBZbtMsRBGt66LdigFnRds5g"
  ];

  if (loading) return <div className="py-24 text-center">Loading applications...</div>;

  return (
    <section className="py-24 px-8 max-w-screen-2xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-headline text-4xl text-primary mb-4">Shop by Application</h2>
        <p className="font-body text-on-surface-variant text-lg">Find materials based on your use case</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {apps.map((app, i) => (
          <Link to={`/shop?category=${app.slug}`} key={app.id} className="relative group h-96 overflow-hidden rounded-sm cursor-pointer editorial-shadow block">
            <img
              src={app.primaryImageUrl || fallbackImages[i % fallbackImages.length]}
              alt={app.applicationLabel || app.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <h3 className="font-headline text-2xl text-white mb-2">{app.applicationLabel || app.name}</h3>
              <p className="text-white/80 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{app.description || 'Discover materials suited for this field.'}</p>
              <span className="text-white font-semibold flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-300">
                Explore <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.catalog.getCategoryTree().then(res => {
      if (res.success) setCategories(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fallbackImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAnqUSLjbRrKKwODC1aB1REM9ewPNxz0JbbIA5IhSdPcXNd06NbPrVsl8lQF9PNmy0SqKQloVKryaE-pt4sWqHP7zwBNxMfzaFJ8QhfT7DWuCVa15HdRYmrPKAuT09_TQ8iz9xjG7eV72-UYNrzEGLnOuTmjbyCsEHZhoqz8W2nECQ0hOeqVVQ-uwjy9QHcKzwrcqOruOxg3_gXR0f3hwcvzTM27dCIFJJCzpxjFduE9ctsypi-zGRvOhxmKTTF64vYjS1VSqq7hJs",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCzpEQjBRESzWV-0VBOZGn7UB8xUJIXrTf0kj2HzEv0jxsHkRfaRmB1-BuTSvVFom6XkDkgqtwQejQ_BieG-FOIejfpIy8MFEc_sVYYeY0sseZAjEUvo1tQGcnA5QfGtjyjg0tn2pJrYWiNjLlp9J5PEvU14AkRCjfhU7SYUbzDxPLZnts-bYacZK-fpfdmp_xwOhfxTPkdh6W-1Q7jcs-C9CjcJ2Y6Tja5zu9l2T6iGGPTJz9xajOVAyr_r3XpC4KOqJpGB-XsjcE",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCx3gAmfrhXT7j2TUARFxu-mMLfdnOWBSa95F8jzJC1ENr4l80EGK1iLy-BcdU2Nmw-ZjtnbjeAblFjdwObnAV5x7GJwObT2MRb7Gj8qol2rSYMwuWOdhhmDvtpoirFfyJO3ZFTQenumFc1x5eg2H4UUTGgxB9fTImsFRSc5N0NvMxLDbtRtJeM3OYxDZoPLisRT9_Z2-ST4Jgz6ecozzi6fdWtZIbfVJCguZsZ2tOkpmcR8MdEK7LM9_RwNkL5tPamGxL9J54ugIo"
  ];

  if (loading) return <div className="py-24 text-center">Loading categories...</div>;

  return (
    <section className="py-24 px-8 max-w-screen-2xl mx-auto border-t border-outline-variant/10">
      <div className="text-center mb-16">
        <h2 className="font-headline text-5xl text-primary leading-tight">Shop by Category</h2>
        <div className="w-24 h-px bg-primary/20 mx-auto mt-6"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat, i) => {
          const subNames = cat.children?.map(c => c.name).slice(0, 3) || [];
          const remainingCount = Math.max(0, (cat._count?.children || 0) - subNames.length);
          
          return (
            <Link to={`/shop?category=${cat.slug}`} key={cat.id} className="relative group h-[400px] overflow-hidden bg-surface-container cursor-pointer block">
              <img
                src={cat.primaryImageUrl || fallbackImages[i % fallbackImages.length]}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors duration-500"></div>
              <div className="absolute bottom-8 left-8 right-8 transition-transform duration-500 group-hover:-translate-y-4">
                <h3 className="font-headline text-3xl text-white mb-2">{cat.name}</h3>
                {subNames.length > 0 && <p className="font-body text-white/70 text-sm">{subNames.join(", ")}{remainingCount > 0 ? `, +${remainingCount} more` : ''}</p>}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-white p-8 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <ul className="space-y-3">
                  {cat.children?.slice(0, 3).map((sub) => (
                    <li key={sub.id} className="flex items-center justify-between text-on-surface hover:text-primary transition-colors text-sm font-medium">
                      {sub.name} <ArrowRight size={14} />
                    </li>
                  ))}
                  {remainingCount > 0 && <li className="text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20 italic">Explore {remainingCount} more subcategories</li>}
                </ul>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

const BestSellers = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.catalog.getBestSellers().then(res => {
      if (res.success) setProducts(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fallbackImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuAnqUSLjbRrKKwODC1aB1REM9ewPNxz0JbbIA5IhSdPcXNd06NbPrVsl8lQF9PNmy0SqKQloVKryaE-pt4sWqHP7zwBNxMfzaFJ8QhfT7DWuCVa15HdRYmrPKAuT09_TQ8iz9xjG7eV72-UYNrzEGLnOuTmjbyCsEHZhoqz8W2nECQ0hOeqVVQ-uwjy9QHcKzwrcqOruOxg3_gXR0f3hwcvzTM27dCIFJJCzpxjFduE9ctsypi-zGRvOhxmKTTF64vYjS1VSqq7hJs";

  if (loading) return <div className="py-24 text-center">Loading best sellers...</div>;

  return (
    <section className="py-24 bg-surface-container-low px-8">
      <div className="max-w-screen-2xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-headline text-4xl text-primary mb-4">Best Sellers</h2>
          <p className="font-body text-on-surface-variant text-lg">Most popular materials trusted by our customers</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((prod) => {
            const primaryImage = prod.images?.find(img => img.isPrimary)?.imageUrl || prod.images?.[0]?.imageUrl || fallbackImage;
            return (
              <Link to={`/product/${prod.slug}`} key={prod.id} className="bg-surface p-4 editorial-shadow group block">
                <div className="relative aspect-[4/5] mb-4 overflow-hidden bg-surface-variant">
                  <img
                    src={primaryImage}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`absolute top-4 left-4 text-white text-[10px] px-3 py-1 uppercase tracking-widest font-bold ${prod.isFeatured ? 'bg-secondary' : 'bg-primary'}`}>
                    {prod.isFeatured ? 'Trending' : 'Best Seller'}
                  </span>
                </div>
                <h4 className="font-headline text-lg mb-1">{prod.name}</h4>
                <p className="text-primary font-bold mb-4">₹{prod.basePrice}</p>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    // Add to cart dummy function
                    const cartItemObj = {
                      id: prod.id + '-' + (prod.variants?.[0]?.id || 'novariant'),
                      productId: prod.id,
                      variantId: prod.variants?.[0]?.id || 'novariant',
                      name: prod.name,
                      price: parseFloat(prod.variants?.[0]?.priceOverride || prod.basePrice),
                      quantity: 1,
                      imageUrl: primaryImage,
                      variantTitle: prod.variants?.[0]?.title
                    };
                    addToCart(cartItemObj as any);
                  }}
                  className="w-full border border-primary text-primary py-2 text-sm font-semibold hover:bg-primary hover:text-white transition-colors"
                >
                  Add to Cart
                </button>
              </Link>
            )
          })}
        </div>
        <div className="text-center mt-16">
          <Link to="/shop" className="inline-block bg-primary text-on-primary px-10 py-4 font-semibold tracking-wide editorial-shadow hover:scale-[1.02] transition-transform">View All Products</Link>
        </div>
      </div>
    </section>
  );
};

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

const WhyChooseUs = () => {
  const features = [
    { icon: Verified, title: "Premium Quality Materials", desc: "Sourced from certified heritage suppliers to ensure lasting brilliance and durability." },
    { icon: Star, title: "Trusted by Designers", desc: "Preferred partner for leading bridal houses and international couture designers." },
    { icon: Package, title: "Bulk Orders Available", desc: "Scalable supply chain solutions for manufacturers and commercial workshops." },
    { icon: Truck, title: "Fast Delivery Across India", desc: "Reliable logistics network ensuring prompt arrival of your delicate materials." }
  ];

  return (
    <section className="bg-surface py-24 px-8 border-t border-outline-variant/10">
      <div className="max-w-screen-2xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-headline text-5xl text-primary leading-tight">Why Choose Hindustan Embroidery</h2>
          <div className="w-24 h-px bg-primary/20 mx-auto mt-6"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
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
};

export default function Home() {
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
