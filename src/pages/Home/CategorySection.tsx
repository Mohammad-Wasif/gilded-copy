import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Category } from '../../lib/types';
import { CategoryGridSkeleton } from '../../components/Skeletons';
import { ErrorFallback } from '../../components/ErrorFallback';

const fallbackImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAnqUSLjbRrKKwODC1aB1REM9ewPNxz0JbbIA5IhSdPcXNd06NbPrVsl8lQF9PNmy0SqKQloVKryaE-pt4sWqHP7zwBNxMfzaFJ8QhfT7DWuCVa15HdRYmrPKAuT09_TQ8iz9xjG7eV72-UYNrzEGLnOuTmjbyCsEHZhoqz8W2nECQ0hOeqVVQ-uwjy9QHcKzwrcqOruOxg3_gXR0f3hwcvzTM27dCIFJJCzpxjFduE9ctsypi-zGRvOhxmKTTF64vYjS1VSqq7hJs",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCzpEQjBRESzWV-0VBOZGn7UB8xUJIXrTf0kj2HzEv0jxsHkRfaRmB1-BuTSvVFom6XkDkgqtwQejQ_BieG-FOIejfpIy8MFEc_sVYYeY0sseZAjEUvo1tQGcnA5QfGtjyjg0tn2pJrYWiNjLlp9J5PEvU14AkRCjfhU7SYUbzDxPLZnts-bYacZK-fpfdmp_xwOhfxTPkdh6W-1Q7jcs-C9CjcJ2Y6Tja5zu9l2T6iGGPTJz9xajOVAyr_r3XpC4KOqJpGB-XsjcE",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCx3gAmfrhXT7j2TUARFxu-mMLfdnOWBSa95F8jzJC1ENr4l80EGK1iLy-BcdU2Nmw-ZjtnbjeAblFjdwObnAV5x7GJwObT2MRb7Gj8qol2rSYMwuWOdhhmDvtpoirFfyJO3ZFTQenumFc1x5eg2H4UUTGgxB9fTImsFRSc5N0NvMxLDbtRtJeM3OYxDZoPLisRT9_Z2-ST4Jgz6ecozzi6fdWtZIbfVJCguZsZ2tOkpmcR8MdEK7LM9_RwNkL5tPamGxL9J54ugIo"
];

const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.catalog.getCategoryTree().then(res => {
      if (res.success) setCategories(res.data);
    }).catch(() => setError('Failed to load categories')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error) return <ErrorFallback title="Couldn't load categories" message={error} onRetry={fetchData} />;
  if (loading) return <section className="py-24 px-8 max-w-screen-2xl mx-auto"><div className="text-center mb-16"><div className="h-8 bg-surface-container-high rounded w-48 mx-auto mb-4 animate-pulse" /><div className="h-5 bg-surface-container-high rounded w-72 mx-auto animate-pulse" /></div><CategoryGridSkeleton count={3} /></section>;

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

export default CategorySection;
