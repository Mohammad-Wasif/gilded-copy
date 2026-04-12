import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { ShopApplication } from '../../lib/types';
import { CategoryGridSkeleton } from '../../components/Skeletons';
import { ErrorFallback } from '../../components/ErrorFallback';

const fallbackImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYX_4krv5PS8efbT3ei2-aVf_rEtO3tHfZCN0Wkrt4WYIPEtwmNpAHKcnbqm-gR07n73pWotClOC11gjRvgygNAu9wXeeV9BJE_sZrACG55q5GINpcrtBeZLOxO2Ntp95SF_qk8Z88gdLAXsrQEiAm2A-2C6xg56YyTmRxwv1vkgkRpHXQhjHObhM9nSwMqQXuZ4E6hEFqvfJiaCpQvFqySkK85HZ9UMDFSYYKq5-C7muSvFEJJ56QZkhh13SueLnKkyjpYXKGs0E",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCjqVWNkaVWn3cPePcKjQOawU0S4rD7ad7H6-bloJgn3vDm6_h5LdpY_KoF-FZgYkvDNsHaCsRJOh5I0COYGNv2a1QKXJxNCle74C5LaXX8dIEJXSso_R6NSyuD3P_39l70rks1vwSN1OHxqeBkw-C9rLbr7o4fsriOb2PD1QGRseEBO6sZPFbR0sQwf1GeuPfjguqoVQC9bx6xF4U2A1bd5mYeeHR5O_cXLNzbaKyngAx2QHTEzugfW4WqL33xlef65z-AW9WwVaY",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCt2VVsK_20uUw0cMvuwaynPR4l_rIvl15meOoDZS955JLFmVqdlc_cQ3WfdvW3UgMO92onOKQazVM1mtVAbo6sBr5IqWxJHvQ_p6_KzFubPv0zFIlYrhUUeZOuv_LzERhmozgJoXXj9pmJ5ceZsto-aA7GT-eh_iRmm9_bhIZAxFd4uuDV6-J3E_caArTCKwRB_GhmF-Rvac69ZOzHiJfNeYNjV8CFFMyYGVfBmLT7M7FjW8cSAr791Su6vnJz5Fxw7rUZ5kZdtKA",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDxWPQRgPraNT-evP5xaZoFFeTQz2QFJ8o_wGZHpC1FFw4GCUuXpRaqFDsukPBNMfjlmQ6eHBEofe9UAhx2XRpb6c-jwAPG2To3jMxP7CzU6W8kZGHF13MZr2rhtzaNo86JWcqWq6LRFaYpmNLCzgVmjmbk0fdpArQ71-sTzmmi0hLrvOWRqHFfYPP79u-UMzsCDyazd_FWxpyUQXvpEAiH9kPYaXxRtNIIVxAI8-qLRzTGqypzIbwZBZbtMsRBGt66LdigFnRds5g"
];

const ApplicationSection = () => {
  const [apps, setApps] = useState<ShopApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.catalog.getShopByApplication().then(res => {
      if (res.success) setApps(res.data);
    }).catch(() => setError('Failed to load applications')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error) return <ErrorFallback title="Couldn't load applications" message={error} onRetry={fetchData} />;
  if (loading) return <section className="py-24 px-8 max-w-screen-2xl mx-auto"><div className="text-center mb-16"><div className="h-8 bg-surface-container-high rounded w-64 mx-auto mb-4 animate-pulse" /><div className="h-5 bg-surface-container-high rounded w-80 mx-auto animate-pulse" /></div><CategoryGridSkeleton /></section>;

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

export default ApplicationSection;
