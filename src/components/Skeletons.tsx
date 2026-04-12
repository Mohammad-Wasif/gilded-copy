/**
 * Reusable skeleton loading components for consistent CLS-free loading states.
 */

export const ProductCardSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="aspect-square bg-surface-container-high rounded-sm" />
    <div className="space-y-2 px-1">
      <div className="h-3 bg-surface-container-high rounded w-1/3" />
      <div className="h-5 bg-surface-container-high rounded w-3/4" />
      <div className="h-4 bg-surface-container-high rounded w-1/4 mt-2" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-96 bg-surface-container-high rounded-sm" />
  </div>
);

export const CategoryGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CategoryCardSkeleton key={i} />
    ))}
  </div>
);

export const ShopGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-16">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse space-y-4">
        <div className="aspect-[3/4] bg-surface-container-high rounded-sm" />
        <div className="space-y-2 px-1">
          <div className="h-3 bg-surface-container-high rounded w-1/3" />
          <div className="h-5 bg-surface-container-high rounded w-3/4" />
          <div className="flex justify-between pt-2">
            <div className="h-4 bg-surface-container-high rounded w-1/4" />
            <div className="h-3 bg-surface-container-high rounded w-1/5" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ProductDetailSkeleton = () => (
  <div className="max-w-screen-2xl mx-auto px-8 py-12 animate-pulse">
    <div className="h-4 bg-surface-container-high rounded w-48 mb-12" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div className="space-y-4">
        <div className="aspect-square bg-surface-container-high rounded-sm" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-20 h-20 bg-surface-container-high rounded-sm" />
          ))}
        </div>
      </div>
      <div className="space-y-6 py-4">
        <div className="h-3 bg-surface-container-high rounded w-1/4" />
        <div className="h-8 bg-surface-container-high rounded w-3/4" />
        <div className="h-4 bg-surface-container-high rounded w-full" />
        <div className="h-4 bg-surface-container-high rounded w-2/3" />
        <div className="h-10 bg-surface-container-high rounded w-1/3 mt-4" />
        <div className="h-14 bg-surface-container-high rounded w-full mt-8" />
      </div>
    </div>
  </div>
);

export const SidebarSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-5 bg-surface-container-high rounded w-2/3" />
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="h-4 bg-surface-container-high rounded w-full" />
    ))}
  </div>
);
