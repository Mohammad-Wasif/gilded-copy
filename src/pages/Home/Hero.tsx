import { Link } from 'react-router-dom';

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

export default Hero;
