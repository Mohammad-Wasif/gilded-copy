import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';
import { Product } from '../../lib/types';
import { ProductGridSkeleton } from '../../components/Skeletons';
import { ErrorFallback } from '../../components/ErrorFallback';

const fallbackImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuAnqUSLjbRrKKwODC1aB1REM9ewPNxz0JbbIA5IhSdPcXNd06NbPrVsl8lQF9PNmy0SqKQloVKryaE-pt4sWqHP7zwBNxMfzaFJ8QhfT7DWuCVa15HdRYmrPKAuT09_TQ8iz9xjG7eV72-UYNrzEGLnOuTmjbyCsEHZhoqz8W2nECQ0hOeqVVQ-uwjy9QHcKzwrcqOruOxg3_gXR0f3hwcvzTM27dCIFJJCzpxjFduE9ctsypi-zGRvOhxmKTTF64vYjS1VSqq7hJs";

const BestSellers = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    api.catalog.getBestSellers().then(res => {
      if (res.success) setProducts(res.data);
    }).catch(() => setError('Failed to load best sellers')).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (error) return <ErrorFallback title="Couldn't load best sellers" message={error} onRetry={fetchData} />;
  if (loading) return <section className="py-24 bg-surface-container-low px-8"><div className="max-w-screen-2xl mx-auto"><div className="text-center mb-16"><div className="h-8 bg-surface-container-high rounded w-48 mx-auto mb-4 animate-pulse" /><div className="h-5 bg-surface-container-high rounded w-80 mx-auto animate-pulse" /></div><ProductGridSkeleton /></div></section>;

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
                    const cartItemObj = {
                      id: prod.id + '-' + (prod.variants?.[0]?.id || 'novariant'),
                      name: prod.name,
                      price: parseFloat(prod.variants?.[0]?.priceOverride || prod.basePrice),
                      quantity: 1,
                      image: primaryImage,
                      variant: prod.variants?.[0]?.title || 'Standard'
                    };
                    addToCart(cartItemObj);
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

export default BestSellers;
