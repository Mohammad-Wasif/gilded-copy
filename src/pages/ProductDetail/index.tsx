import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Minus, Plus, Briefcase, CheckCircle2, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';
import { Product, ProductVariant } from '../../lib/types';
import NotFound from '../NotFound';
import { ProductDetailSkeleton } from '../../components/Skeletons';
import { ErrorFallback } from '../../components/ErrorFallback';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useDocumentTitle(product?.name || 'Product Details');
  
  // Selection states
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'Details' | 'Specifications' | 'Shipping'>('Details');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    
    setLoading(true);
    setError(false);
    // Fetch product details
    api.catalog.getProductBySlug(slug).then(res => {
      if (res.success && res.data) {
        setProduct(res.data);
        if (res.data.variants && res.data.variants.length > 0) {
          setSelectedVariant(res.data.variants[0]);
        }
        
        // Save to recently viewed
        try {
          const stored = localStorage.getItem('recentlyViewed');
          let viewed = stored ? JSON.parse(stored) : [];
          // Remove if it's already in the list
          viewed = viewed.filter((p: any) => p.slug !== res.data.slug);
          // Add to front
          const primaryImage = res.data.images?.find((img: any) => img.isPrimary)?.imageUrl || res.data.images?.[0]?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAZPQREz8-naJ4wWAOkwRk66GueD4ScXcmg8ufMnaqoESkmpPt0m1D0yOH_xJI0SKkvaL5rLRhUJ_P6PIa9DdkHY-i3CmQecruzfthvI66Kep5Sb2rAVZ4Sqc3jBqE8kDb1YHHhIIXV3JWmuWYyjIT9VTxXhBWN41wJPGRO6ZFCG4mJAOSay-Q6gQUzqtCTrKBnRwpo92i1k-k5TGiSs3byHQ--IYPtXiFSnuv40p1XSnvQmdTRbwkd6s2M9ky6AP4zqSbz5TUVsqs";
          
          viewed.unshift({
            name: res.data.name,
            slug: res.data.slug,
            price: res.data.basePrice,
            image: primaryImage
          });
          // Keep only last 3
          localStorage.setItem('recentlyViewed', JSON.stringify(viewed.slice(0, 3)));
        } catch (e) {}
        
        // Fetch related products based on category
        if (res.data.category?.slug) {
           api.catalog.getProductsByCategory(res.data.category.slug, { limit: 4 }).then(relatedRes => {
              if (relatedRes.success) {
                // filter out the current product
                setRelatedProducts(relatedRes.data.filter(p => p.id !== res.data?.id).slice(0, 4));
              }
           }).catch(() => {});
        }
      } else {
        setProduct(null);
      }
    }).catch(() => {
      setError(true);
      setProduct(null);
    }).finally(() => {
      setLoading(false);
      window.scrollTo(0, 0);
    });
  }, [slug]);

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error) {
    return <ErrorFallback title="Couldn't load product" message="We had trouble fetching this product. The server may be offline." onRetry={() => { setLoading(true); setError(false); api.catalog.getProductBySlug(slug!).then(res => { if (res.success && res.data) setProduct(res.data); }).catch(() => setError(true)).finally(() => setLoading(false)); }} />;
  }

  if (!product) {
    return <NotFound />;
  }

  const currentPrice = selectedVariant?.priceOverride ? parseFloat(selectedVariant.priceOverride) : parseFloat(product.basePrice);
  const comparePrice = product.compareAtPrice ? parseFloat(product.compareAtPrice) : null;
  const isOutOfStock = (selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity) <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const cartItemObj = {
      id: product.id + '-' + (selectedVariant?.id || 'novariant'),
      name: product.name,
      price: currentPrice,
      quantity: quantity,
      image: product.images?.[activeImageIndex]?.imageUrl || product.images?.[0]?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAZPQREz8-naJ4wWAOkwRk66GueD4ScXcmg8ufMnaqoESkmpPt0m1D0yOH_xJI0SKkvaL5rLRhUJ_P6PIa9DdkHY-i3CmQecruzfthvI66Kep5Sb2rAVZ4Sqc3jBqE8kDb1YHHhIIXV3JWmuWYyjIT9VTxXhBWN41wJPGRO6ZFCG4mJAOSay-Q6gQUzqtCTrKBnRwpo92i1k-k5TGiSs3byHQ--IYPtXiFSnuv40p1XSnvQmdTRbwkd6s2M9ky6AP4zqSbz5TUVsqs",
      variant: selectedVariant?.title || 'Standard'
    };
    addToCart(cartItemObj);
  };

const images: import('../../lib/types').ProductImage[] = product.images?.length > 0 
                 ? product.images 
                 : [{ imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZPQREz8-naJ4wWAOkwRk66GueD4ScXcmg8ufMnaqoESkmpPt0m1D0yOH_xJI0SKkvaL5rLRhUJ_P6PIa9DdkHY-i3CmQecruzfthvI66Kep5Sb2rAVZ4Sqc3jBqE8kDb1YHHhIIXV3JWmuWYyjIT9VTxXhBWN41wJPGRO6ZFCG4mJAOSay-Q6gQUzqtCTrKBnRwpo92i1k-k5TGiSs3byHQ--IYPtXiFSnuv40p1XSnvQmdTRbwkd6s2M9ky6AP4zqSbz5TUVsqs", altText: product.name, isPrimary: true }];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-12">
      <nav className="mb-6 md:mb-12 flex items-center gap-2 text-xs font-label uppercase tracking-widest text-on-surface-variant/60">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={10} />
        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <ChevronRight size={10} />
        {product.category && (
           <>
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-primary transition-colors">{product.category.name}</Link>
            <ChevronRight size={10} />
           </>
        )}
        <span className="text-on-surface">{product.name}</span>
      </nav>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Image Gallery */}
        <div className="lg:col-span-7 grid grid-cols-12 gap-4">
          <div className="hidden md:block md:col-span-2 space-y-4">
            {images.slice(0, 4).map((img, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`aspect-square bg-surface-container-low p-2 rounded-sm cursor-pointer transition-colors ${activeImageIndex === idx ? 'ring-2 ring-primary ring-offset-2' : 'hover:bg-surface-container-high'}`}
              >
                <img src={img.imageUrl} alt={img.altText || product.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="col-span-12 md:col-span-10 relative">
            <div className="bg-surface-container-low rounded-sm overflow-hidden aspect-[4/5] flex items-center justify-center">
              <img src={images[activeImageIndex].imageUrl} alt={images[activeImageIndex].altText || product.name} className="w-full h-full object-cover scale-105 transform translate-x-4 translate-y-4" />
            </div>
            {product.isFeatured && (
               <div className="absolute -bottom-8 -left-8 bg-surface-container-lowest p-6 shadow-xl shadow-on-surface/5 hidden md:block max-w-[240px]">
                 <p className="font-headline italic text-primary text-sm">"The reflection of pure excellence adds an ethereal glow to every stitch."</p>
               </div>
            )}
            
            {/* Mobile dots indicator */}
            <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.slice(0, 4).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${activeImageIndex === idx ? 'bg-primary' : 'bg-outline-variant/50'}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-5 space-y-8">
          <header className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-label uppercase tracking-[0.2em] text-on-surface-variant">{product.category?.name || 'Collection'}</span>
              <span className="text-xs font-label text-on-surface-variant/50">SKU: {selectedVariant?.sku || product.sku}</span>
            </div>
            <h1 className="font-headline text-2xl md:text-4xl lg:text-5xl text-primary leading-tight">{product.name}</h1>
            
            {product.shortDescription && (
              <p className="text-on-surface-variant font-body">{product.shortDescription}</p>
            )}
          </header>

          <div className="space-y-6">
            <div className="flex items-baseline gap-4">
              <span className="text-2xl md:text-3xl font-body font-semibold text-on-surface">₹{currentPrice.toFixed(2)}</span>
              {comparePrice && comparePrice > currentPrice && (
                <span className="text-sm text-on-surface-variant/60 line-through">₹{comparePrice.toFixed(2)}</span>
              )}
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant">Select Variation</label>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((v) => (
                  <button 
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`py-3 px-4 text-sm font-medium rounded-md transition-colors border ${selectedVariant?.id === v.id ? 'border-primary bg-surface-container-lowest text-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary'}`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
            )}
            
            <div className="text-sm">
                {isOutOfStock ? (
                   <span className="text-error font-medium">Out of Stock</span>
                ) : (
                   <span className="text-tertiary font-medium">In Stock ({(selectedVariant ? selectedVariant.stockQuantity : product.stockQuantity)} units available)</span>
                )}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <div className="flex gap-4">
              <div className="flex items-center border border-outline-variant/30 rounded-md">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-surface-container-low transition-colors"
                  disabled={isOutOfStock}
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center font-body">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 hover:bg-surface-container-low transition-colors"
                  disabled={isOutOfStock}
                >
                  <Plus size={14} />
                </button>
              </div>
              <button 
                onClick={handleAddToCart} 
                disabled={isOutOfStock}
                className={`flex-1 text-on-primary py-4 rounded-md font-semibold tracking-wide transition-all ${isOutOfStock ? 'bg-outline-variant cursor-not-allowed' : 'bg-primary hover:opacity-90 active:scale-[0.98]'}`}
              >
                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          </div>

          {/* Wholesale Box */}
          <div className="bg-surface-container-low p-6 rounded-md space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Briefcase size={22} className="text-primary" />
              <h4 className="font-bold text-sm uppercase tracking-wider">Wholesale Advantage</h4>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Buying in bulk for your business? Apply for a <Link to="/contact" className="underline font-semibold">Wholesale Account</Link> for exclusive pricing on orders over 5kg.
            </p>
          </div>
        </div>
      </section>

      {/* Product Description Tabs */}
      <section className="mt-24 border-t border-outline-variant/20 pt-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-12 border-b border-outline-variant/10 mb-12 overflow-x-auto no-scrollbar">
            {['Details', 'Specifications', 'Shipping'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-6 font-headline text-lg px-2 transition-colors border-b-2 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant/60 hover:text-on-surface'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
            {activeTab === 'Details' && (
              <>
              <div className="space-y-6">
                <h3 className="font-headline text-2xl text-on-surface">Product Details</h3>
                <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {product.description || product.shortDescription || 'No details provided.'}
                </p>
              </div>
              <div className="bg-surface-container-low p-8 rounded-sm">
                <h3 className="font-headline text-xl text-primary mb-6">Material Highlights</h3>
                <ul className="space-y-4 text-sm">
                  {['Premium Craftsmanship', 'Quality Assured Material', 'Tested for Durability', 'Curated for Excellence'].map(highlight => (
                  <li key={highlight} className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-tertiary" />
                    <span className="text-on-surface">{highlight}</span>
                  </li>
                  ))}
                </ul>
              </div>
              </>
            )}
            
            {activeTab === 'Specifications' && (
               <div className="col-span-full bg-surface-container-lowest p-8 border border-outline-variant/10 rounded-sm">
                  <h3 className="font-headline text-2xl text-primary mb-6">Technical Specs</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                        <span className="text-on-surface-variant">Variant:</span>
                        <span className="font-semibold">{selectedVariant?.title || 'Standard'}</span>
                     </div>
                     <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                        <span className="text-on-surface-variant">SKU:</span>
                        <span className="font-semibold">{selectedVariant?.sku || product.sku}</span>
                     </div>
                     {selectedVariant?.color && (
                     <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                        <span className="text-on-surface-variant">Color:</span>
                        <span className="font-semibold">{selectedVariant.color}</span>
                     </div>
                     )}
                     {selectedVariant?.size && (
                     <div className="flex justify-between border-b border-outline-variant/10 pb-2">
                        <span className="text-on-surface-variant">Size/Weight:</span>
                        <span className="font-semibold">{selectedVariant.size}</span>
                     </div>
                     )}
                  </div>
               </div>
            )}
            
             {activeTab === 'Shipping' && (
               <div className="col-span-full space-y-4">
                  <h3 className="font-headline text-2xl text-on-surface">Shipping & Returns</h3>
                  <p className="text-on-surface-variant">We partner with reliable logistics providers to ensure fast delivery. Free shipping on wholesale orders over $500.</p>
                  <p className="text-on-surface-variant">For international shipping, standard timeline is 7-14 business days depending on customs.</p>
                  <Link to="/shipping-returns" className="text-primary font-bold underline mt-4 inline-block">Read our full return policy</Link>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
      <section className="mt-24">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">Similar Choices</span>
            <h2 className="font-headline text-3xl text-on-surface">You may also like</h2>
          </div>
          {product.category && (
            <Link to={`/shop?category=${product.category.slug}`} className="text-sm font-label uppercase tracking-widest text-primary font-bold hover:underline decoration-primary underline-offset-8">View Collection</Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
          {relatedProducts.map((relProduct) => {
            const primaryImage = relProduct.images?.find(img => img.isPrimary)?.imageUrl || relProduct.images?.[0]?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAZPQREz8-naJ4wWAOkwRk66GueD4ScXcmg8ufMnaqoESkmpPt0m1D0yOH_xJI0SKkvaL5rLRhUJ_P6PIa9DdkHY-i3CmQecruzfthvI66Kep5Sb2rAVZ4Sqc3jBqE8kDb1YHHhIIXV3JWmuWYyjIT9VTxXhBWN41wJPGRO6ZFCG4mJAOSay-Q6gQUzqtCTrKBnRwpo92i1k-k5TGiSs3byHQ--IYPtXiFSnuv40p1XSnvQmdTRbwkd6s2M9ky6AP4zqSbz5TUVsqs";
            return (
            <div className="group" key={relProduct.id}>
              <Link to={`/product/${relProduct.slug}`} className="block bg-surface-container-lowest aspect-square rounded-sm overflow-hidden mb-4 relative">
                <img src={primaryImage} alt={relProduct.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <button 
                     onClick={(e) => {
                       e.preventDefault();
                       addToCart({
                          id: relProduct.id + '-novariant',
                          name: relProduct.name,
                          price: parseFloat(relProduct.basePrice),
                          quantity: 1,
                          image: primaryImage,
                          variant: 'Standard'
                       });
                     }}
                     className="bg-surface-container-lowest p-3 shadow-lg rounded-full text-primary hover:bg-primary hover:text-on-primary transition-colors"
                  >
                    <ShoppingCart size={22} />
                  </button>
                </div>
              </Link>
              <div className="space-y-1">
                <Link to={`/product/${relProduct.slug}`}>
                  <h4 className="font-headline text-lg group-hover:text-primary transition-colors">{relProduct.name}</h4>
                </Link>
                <p className="text-on-surface-variant/60 text-sm">{relProduct.category?.name || 'Collection'}</p>
                <p className="font-body font-semibold pt-2 text-on-surface">₹{parseFloat(relProduct.basePrice).toFixed(2)}</p>
              </div>
            </div>
          )})}
        </div>
      </section>
      )}
    </div>
  );
}
