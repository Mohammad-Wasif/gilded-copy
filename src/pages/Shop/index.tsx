import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronDown, SearchX, ArrowLeft, ArrowRight, Search, X, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';
import { Category, Product } from '../../lib/types';
import { ShopGridSkeleton } from '../../components/Skeletons';
import { ErrorFallback } from '../../components/ErrorFallback';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Shop() {
  useDocumentTitle('Shop');
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('category') || '';
  const applicationSlug = searchParams.get('application') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sortBy, setSortBy] = useState('Bestselling');
  const [priceRange, setPriceRange] = useState(50000);
  const [debouncedPrice, setDebouncedPrice] = useState(50000);

  // New states for the requested features
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  // Load recently viewed
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Debounce the price slider so we don't fire API calls on every drag tick
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPrice(priceRange);
      searchParams.set('page', '1');
      setSearchParams(searchParams);
    }, 400);
    return () => clearTimeout(timer);
  }, [priceRange]);

  // Fetch Category Tree for Sidebar
  useEffect(() => {
    api.catalog.getCategoryTree().then(res => {
      if (res.success) setCategories(res.data);
    }).catch(() => {});
  }, []);

  // Fetch Products based on URL params
  useEffect(() => {
    setLoading(true);
    let fetchPromise;

    const sortParam = sortBy === 'Price: Low to High' ? 'price_asc' : 
                      sortBy === 'Price: High to Low' ? 'price_desc' : 
                      sortBy === 'Newest Arrival' ? 'newest' : '';

    const maxPriceParam = debouncedPrice < 50000 ? debouncedPrice : undefined;

    if (query) {
      fetchPromise = api.catalog.searchProducts(query, page, 12);
    } else if (categorySlug) {
      fetchPromise = api.catalog.getProductsByCategory(categorySlug, { page, limit: 12, sort: sortParam, maxPrice: maxPriceParam });
    } else {
      fetchPromise = api.catalog.getProducts({ page, limit: 12, sort: sortParam, maxPrice: maxPriceParam, application: applicationSlug });
    }

    fetchPromise.then(res => {
      if (res.success) {
        setProducts(res.data);
        if (res.meta?.pagination?.totalPages) {
           setTotalPages(res.meta.pagination.totalPages);
        } else {
           setTotalPages(1);
        }
      }
      setError(null);
    }).catch(() => setError('Failed to load products. Please try again.')).finally(() => setLoading(false));

  }, [query, categorySlug, applicationSlug, page, sortBy, debouncedPrice]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleCategoryClick = (slug: string) => {
    // Multi-select logic
    const currentSlugs = categorySlug ? categorySlug.split(',').filter(Boolean) : [];
    let newSlugs;
    if (currentSlugs.includes(slug)) {
      newSlugs = currentSlugs.filter(s => s !== slug);
    } else {
      newSlugs = [...currentSlugs, slug];
    }

    if (newSlugs.length > 0) {
      searchParams.set('category', newSlugs.join(','));
    } else {
      searchParams.delete('category');
    }
    
    searchParams.delete('q'); // Clear search when picking category
    searchParams.set('page', '1');
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setPriceRange(50000);
    setCategorySearchQuery('');
  };

  const hasActiveFilters = query || categorySlug || applicationSlug || priceRange < 50000;
  const activeCategorySlugs = categorySlug ? categorySlug.split(',').filter(Boolean) : [];

  // Filter categories based on search query
  const filteredCategories = categories.map(cat => {
    const term = categorySearchQuery.toLowerCase();
    const childrenMatch = cat.children?.filter(sub => sub.name.toLowerCase().includes(term)) || [];
    const catMatch = cat.name.toLowerCase().includes(term);
    if (!catMatch && childrenMatch.length === 0) return null;
    return {
      ...cat,
      children: childrenMatch.length > 0 ? childrenMatch : (catMatch ? cat.children : [])
    };
  }).filter(Boolean) as Category[];

  return (
    <div className="max-w-screen-2xl mx-auto px-8 py-12">
      {/* Breadcrumbs */}
      <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={10} />
          <span className="text-primary font-semibold">Shop</span>
          {query && (
            <>
              <ChevronRight size={10} />
              <span className="text-primary font-semibold">Search: {query}</span>
            </>
          )}
        </nav>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
             <X size={14} /> Clear All Filters
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-28 space-y-10">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline text-lg text-primary">Categories</h3>
              </div>
              
              {/* Category Search */}
              <div className="relative mb-6">
                 <input 
                   type="text" 
                   placeholder="Search categories..."
                   value={categorySearchQuery}
                   onChange={(e) => setCategorySearchQuery(e.target.value)}
                   className="w-full pl-9 pr-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
                 />
                 <Search size={16} className="absolute left-3 top-2.5 text-on-surface-variant/50" />
              </div>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {filteredCategories.map(cat => {
                   // If searching, keep details open if there's a match inside
                   const isSearching = categorySearchQuery.length > 0;
                   return (
                  <details key={cat.id} className="group" open={isSearching ? true : undefined}>
                    <summary 
                      className={`flex items-center justify-between list-none cursor-pointer text-sm font-medium hover:text-primary mb-2`}
                    >
                      <div className="flex items-center gap-2" onClick={(e) => {
                          e.preventDefault();
                          handleCategoryClick(cat.slug);
                        }}>
                         <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${activeCategorySlugs.includes(cat.slug) ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant/50'}`}>
                            {activeCategorySlugs.includes(cat.slug) && <CheckCircle2 size={12} />}
                         </div>
                         <span className={activeCategorySlugs.includes(cat.slug) ? 'text-primary' : ''}>{cat.name} <span className="text-on-surface-variant/60 text-xs font-normal">({cat._count?.products || 0})</span></span>
                      </div>
                      {cat.children && cat.children.length > 0 && (
                        <ChevronDown size={16} className="group-open:rotate-180 transition-transform text-on-surface-variant/50" />
                      )}
                    </summary>
                    {cat.children && cat.children.length > 0 && (
                      <ul className="mt-1 ml-6 space-y-2 text-sm text-on-surface-variant border-l-2 border-outline-variant/10 pl-3 py-1">
                        {cat.children.map(sub => (
                           <li 
                              key={sub.id} 
                              className={`flex items-center gap-2 cursor-pointer hover:text-primary transition-colors`}
                              onClick={() => handleCategoryClick(sub.slug)}
                           >
                              <div className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors ${activeCategorySlugs.includes(sub.slug) ? 'bg-primary border-primary text-on-primary' : 'border-outline-variant/50'}`}>
                                {activeCategorySlugs.includes(sub.slug) && <CheckCircle2 size={10} />}
                              </div>
                              <span className={activeCategorySlugs.includes(sub.slug) ? 'text-primary' : ''}>
                                {sub.name} <span className="text-on-surface-variant/60 text-xs">({sub._count?.products || 0})</span>
                              </span>
                           </li>
                        ))}
                      </ul>
                    )}
                  </details>
                )})}
              </div>
            </div>

            <div className="h-px bg-outline-variant/20"></div>

            <div>
              <h3 className="font-headline text-sm font-bold text-on-surface mb-6">Refine By Price</h3>
              
              {/* Price Range */}
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-tighter mb-4 text-on-surface-variant">Max Price: ₹{priceRange}</p>
                <input 
                  type="range" 
                  min="0" 
                  max="50000" 
                  step="500"
                  value={priceRange} 
                  onChange={(e) => setPriceRange(Number(e.target.value))} 
                  className="w-full accent-primary h-1 bg-surface-container-high rounded-full appearance-none cursor-pointer" 
                />
                <div className="flex justify-between mt-2 text-xs text-on-surface-variant">
                  <span>₹0</span>
                  <span>₹50000</span>
                </div>
              </div>

              {/* Price Presets */}
              <div className="flex flex-wrap gap-2 mt-4">
                 <button onClick={() => setPriceRange(1000)} className="text-[10px] bg-surface-container-low text-on-surface-variant hover:bg-surface-variant px-2.5 py-1.5 rounded-sm font-bold uppercase tracking-wider transition-colors">Under ₹1K</button>
                 <button onClick={() => setPriceRange(5000)} className="text-[10px] bg-surface-container-low text-on-surface-variant hover:bg-surface-variant px-2.5 py-1.5 rounded-sm font-bold uppercase tracking-wider transition-colors">Under ₹5K</button>
                 <button onClick={() => setPriceRange(50000)} className="text-[10px] bg-surface-container-low text-on-surface-variant hover:bg-surface-variant px-2.5 py-1.5 rounded-sm font-bold uppercase tracking-wider transition-colors">All Prices</button>
              </div>
            </div>

            {/* Recently Viewed Widget */}
            {recentlyViewed.length > 0 && (
              <>
                <div className="h-px bg-outline-variant/20"></div>
                <div>
                   <h3 className="font-headline text-sm font-bold text-on-surface mb-4">Recently Viewed</h3>
                   <div className="space-y-4">
                      {recentlyViewed.map(item => (
                         <Link to={`/product/${item.slug}`} key={item.slug} className="flex gap-3 group">
                            <div className="w-16 h-20 bg-surface-container-low flex-shrink-0 rounded-sm overflow-hidden">
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex flex-col py-1">
                               <p className="text-sm font-medium text-on-surface line-clamp-2 leading-snug group-hover:text-primary transition-colors">{item.name}</p>
                               <span className="text-xs font-bold text-on-surface-variant mt-1">₹{item.price}</span>
                            </div>
                         </Link>
                      ))}
                   </div>
                </div>
              </>
            )}

          </div>
        </aside>

        {/* Product Grid Section */}
        <section className="flex-1 min-h-[60vh]">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-6">
            <div>
              <h1 className="font-headline text-4xl text-primary mb-2">
                {query ? 'Search Results' : activeCategorySlugs.length > 0 ? 'Category Products' : applicationSlug ? 'Application Products' : 'Our Collection'}
              </h1>
              <p className="text-on-surface-variant font-body text-sm italic">
                {loading ? 'Loading...' : `Showing ${products.length} items`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Sort By:</label>
              <select 
                value={sortBy} 
                onChange={(e) => {
                  setSortBy(e.target.value);
                  searchParams.set('page', '1');
                  setSearchParams(searchParams);
                }} 
                className="bg-transparent border-none border-b border-outline-variant text-sm py-1 pr-8 focus:ring-0 focus:border-primary cursor-pointer font-medium"
              >
                <option>Bestselling</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrival</option>
              </select>
            </div>
          </div>

          {error ? (
             <ErrorFallback title="Couldn't load products" message={error} onRetry={() => {
               setError(null);
               setLoading(true);
               const sortParam = sortBy === 'Price: Low to High' ? 'price_asc' : sortBy === 'Price: High to Low' ? 'price_desc' : sortBy === 'Newest Arrival' ? 'newest' : '';
               const currentSlugs = categorySlug ? categorySlug : undefined;
               
               let fetchPromise;
               if (query) {
                 fetchPromise = api.catalog.searchProducts(query, page, 12);
               } else if (currentSlugs) {
                 fetchPromise = api.catalog.getProductsByCategory(currentSlugs, { page, limit: 12, sort: sortParam });
               } else {
                 fetchPromise = api.catalog.getProducts({ page, limit: 12, sort: sortParam, application: applicationSlug });
               }

               fetchPromise.then(res => { if (res.success) { setProducts(res.data); setError(null); }}).catch(() => setError('Still failing. Check your connection.')).finally(() => setLoading(false));
             }} />
          ) : loading ? (
             <ShopGridSkeleton />
          ) : products.length === 0 ? (
             <div className="text-center p-24 bg-surface-container-low rounded-md">
               <SearchX size={36} className="mb-4 opacity-50 mx-auto" />
               <h3 className="font-headline text-xl mb-2">No products found</h3>
               <p className="text-on-surface-variant">Try adjusting your filters or search query.</p>
               <button onClick={clearAllFilters} className="mt-6 text-primary font-bold underline underline-offset-4 tracking-wider">CLEAR FILTERS</button>
             </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
                {products.map((prod) => {
                  const primaryImage = prod.images?.find(img => img.isPrimary)?.imageUrl || prod.images?.[0]?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAZPQREz8-naJ4wWAOkwRk66GueD4ScXcmg8ufMnaqoESkmpPt0m1D0yOH_xJI0SKkvaL5rLRhUJ_P6PIa9DdkHY-i3CmQecruzfthvI66Kep5Sb2rAVZ4Sqc3jBqE8kDb1YHHhIIXV3JWmuWYyjIT9VTxXhBWN41wJPGRO6ZFCG4mJAOSay-Q6gQUzqtCTrKBnRwpo92i1k-k5TGiSs3byHQ--IYPtXiFSnuv40p1XSnvQmdTRbwkd6s2M9ky6AP4zqSbz5TUVsqs";
                  const price = parseFloat(prod.variants?.[0]?.priceOverride || prod.basePrice);
                  
                  return (
                  <Link to={`/product/${prod.slug}`} key={prod.id} className="group relative bg-surface-container-lowest p-4 block">
                    <div className="relative overflow-hidden aspect-[4/5] mb-6">
                      <img src={primaryImage} alt={prod.name} className="w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-700" />
                      {prod.isFeatured && (
                        <span className="absolute top-4 right-4 bg-tertiary text-on-tertiary text-[9px] font-bold px-3 py-1 uppercase tracking-widest">Featured</span>
                      )}
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          const cartItemObj = {
                            id: prod.id + '-' + (prod.variants?.[0]?.id || 'novariant'),
                            name: prod.name,
                            price: price,
                            quantity: 1,
                            image: primaryImage,
                            variant: prod.variants?.[0]?.title || 'Standard'
                          };
                          addToCart(cartItemObj);
                        }}
                        className="absolute bottom-4 left-4 right-4 bg-surface/90 backdrop-blur-md text-primary py-3 text-xs font-bold uppercase tracking-widest translate-y-12 group-hover:translate-y-0 transition-transform duration-500 hover:bg-primary hover:text-white transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                    <div className="space-y-2 px-1">
                      <p className="text-[10px] text-tertiary font-bold tracking-[0.2em] uppercase">{prod.category?.name || 'Store'}</p>
                      <h3 className="font-headline text-lg text-on-surface leading-snug">{prod.name}</h3>
                      <div className="flex justify-between items-center pt-2">
                        <p className="font-body text-base text-on-surface">₹{price.toFixed(2)}</p>
                        <span className="text-[10px] font-medium text-on-surface-variant/60">{prod.variants?.[0]?.title || 'Standard'}</span>
                      </div>
                    </div>
                  </Link>
                )})}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
              <div className="mt-24 flex items-center justify-center gap-8">
                <button 
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ArrowLeft size={14} />
                  Prev
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center text-sm font-bold transition-colors ${pageNum === page ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-low text-on-surface-variant'}`}
                      >
                        {pageNum.toString().padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
                >
                  Next
                  <ArrowRight size={14} />
                </button>
              </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
