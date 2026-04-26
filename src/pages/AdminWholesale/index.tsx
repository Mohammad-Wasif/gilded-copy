import React from 'react';

export default function AdminWholesale() {
  return (
    <>
<div className="space-y-8">
{/* Page Header */}
<div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
<div>
<h2 className="font-headline text-4xl text-primary font-medium tracking-tight mb-2">Wholesale Inquiries</h2>
<p className="font-body text-on-surface-variant text-base">Review B2B requests for Hindustan Embroidery materials, custom studio production, and boutique supply partnerships.</p>
</div>
<div className="flex space-x-4">
<button className="px-6 py-2 bg-surface-container-lowest text-primary font-body text-sm font-medium rounded-md ambient-shadow hover:bg-surface-container-low transition-colors ghost-border flex items-center">
<span className="material-symbols-outlined mr-2 text-sm">filter_list</span>
                        Filter
                    </button>
<button className="px-6 py-2 bg-gradient-to-r from-tertiary-fixed to-tertiary-fixed-dim text-on-tertiary-container font-body text-sm font-semibold rounded-md shadow-sm hover:opacity-90 transition-opacity flex items-center">
<span className="material-symbols-outlined mr-2 text-sm">download</span>
                        Export List
                    </button>
</div>
</div>
{/* Bento Grid Layout for Inquiries */}
<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
{/* Priority Inquiry Card (Spans 2 columns) */}
<div className="xl:col-span-2 bg-surface-container-lowest rounded-lg ambient-shadow p-8 relative overflow-hidden group">
<div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500"></div>
<div className="flex justify-between items-start mb-6 relative z-10">
<div>
<div className="flex items-center space-x-3 mb-2">
<span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-DEFAULT">High Priority</span>
<span className="text-on-surface-variant text-sm font-body">Received Today, 09:42 AM</span>
</div>
<h3 className="font-headline text-2xl text-on-surface">Maison de l'Esthétique</h3>
<p className="font-body text-on-surface-variant mt-1">Eleanor Vance, Purchasing Director</p>
</div>
<div className="text-right">
<p className="font-body text-sm text-on-surface-variant mb-1">Requested Qty</p>
<p className="font-headline text-3xl text-primary font-medium">500<span className="text-lg text-on-surface-variant ml-1">units</span></p>
</div>
</div>
<div className="bg-surface-container-low p-6 rounded-DEFAULT mb-8 ghost-border">
<h4 className="font-body text-sm font-bold text-on-surface uppercase tracking-wide mb-3">Product Interest</h4>
<div className="flex items-center space-x-4">
<div className="w-16 h-16 rounded-sm overflow-hidden bg-surface-dim">
<img alt="Zari embroidered silk fabric" className="w-full h-full object-cover" data-alt="close up of rich crimson silk fabric with intricate gold zari embroidery and small embedded stones" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkfWozdsVNdn3kxp4nVcyjgzno621kh79xtz88hyDuJoz20eU4kkdbWHIDMrE9W9hjTy8sbLHApBb5ho6jWeNGc05MHXFdvRlb0vMRqftaAOQ5rJ1zPeV_zg7RwrcviUYmGeIQMe75VlhwNiw8Ai1oy7lERkf1yqCg9NDWh34KADyDCpux9VSyV3mM2FNlVLB7AT8ye2Po6SdprxW8co-YFyW1fAg8mQbV2GITrr3OjVBrnP3ln9BQVewh_X8dXh_EW_fiNqQfrl8" />
</div>
<div>
<p className="font-headline text-lg text-on-surface">Crimson Zari Heirloom Collection</p>
<p className="font-body text-sm text-on-surface-variant">Custom bespoke detailing requested for boutique distribution.</p>
</div>
</div>
</div>
<div className="flex items-center space-x-4 relative z-10">
<button className="px-6 py-3 bg-primary text-on-primary rounded-md font-body text-sm font-semibold transition-colors hover:bg-primary-container">
                            Approve Partner
                        </button>
<button className="px-6 py-3 bg-surface-container-high text-on-surface rounded-md font-body text-sm font-medium transition-colors hover:bg-surface-container-highest ghost-border">
                            Contacted
                        </button>
<div className="flex-1"></div>
<button className="text-primary font-headline text-sm italic hover:text-primary-container flex items-center group/link">
                            View Inquiry Details
                            <span className="material-symbols-outlined ml-1 text-sm transition-transform group-hover/link:translate-x-1">arrow_forward</span>
</button>
</div>
</div>
{/* Standard Inquiry Card 1 */}
<div className="bg-surface-container-lowest rounded-lg ambient-shadow p-6 flex flex-col justify-between">
<div>
<div className="flex justify-between items-start mb-4">
<span className="text-on-surface-variant text-xs font-body">Oct 24, 2023</span>
<span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant text-xs font-bold uppercase tracking-wider rounded-DEFAULT">Pending</span>
</div>
<h3 className="font-headline text-xl text-on-surface mb-1">Lumina Silks &amp; Co.</h3>
<p className="font-body text-sm text-on-surface-variant mb-6">Marcus Thorne</p>
<div className="mb-6">
<p className="font-body text-xs text-on-surface-variant uppercase tracking-wide mb-1">Interest</p>
<p className="font-body text-base text-on-surface font-medium">Midnight Sapphire Stoles</p>
<p className="font-body text-sm text-on-surface-variant mt-2">Qty: <span className="font-bold text-on-surface">150 units</span></p>
</div>
</div>
<div className="flex flex-col space-y-3 mt-4 border-t border-surface-container-low pt-4">
<button className="w-full py-2 bg-surface-container-low text-on-surface rounded-md font-body text-sm font-medium hover:bg-surface-container-high transition-colors ghost-border">
                            Review Request
                        </button>
<button className="w-full text-primary font-body text-sm text-center hover:underline">
                            Mark as Contacted
                        </button>
</div>
</div>
{/* Standard Inquiry Card 2 */}
<div className="bg-surface-container-lowest rounded-lg ambient-shadow p-6 flex flex-col justify-between">
<div>
<div className="flex justify-between items-start mb-4">
<span className="text-on-surface-variant text-xs font-body">Oct 22, 2023</span>
<span className="px-2 py-1 bg-secondary-container/50 text-on-secondary-container text-xs font-bold uppercase tracking-wider rounded-DEFAULT">In Progress</span>
</div>
<h3 className="font-headline text-xl text-on-surface mb-1">The Artisan Collective</h3>
<p className="font-body text-sm text-on-surface-variant mb-6">Sarah Jenkins</p>
<div className="mb-6">
<p className="font-body text-xs text-on-surface-variant uppercase tracking-wide mb-1">Interest</p>
<p className="font-body text-base text-on-surface font-medium">Ivory Pearl Embellishments</p>
<p className="font-body text-sm text-on-surface-variant mt-2">Qty: <span className="font-bold text-on-surface">1000 units</span></p>
</div>
</div>
<div className="flex flex-col space-y-3 mt-4 border-t border-surface-container-low pt-4">
<button className="w-full py-2 bg-surface-container-low text-on-surface rounded-md font-body text-sm font-medium hover:bg-surface-container-high transition-colors ghost-border">
                            Review Request
                        </button>
<button className="w-full text-primary font-body text-sm text-center hover:underline">
                            Update Status
                        </button>
</div>
</div>
{/* Standard Inquiry Card 3 */}
<div className="bg-surface-container-lowest rounded-lg ambient-shadow p-6 flex flex-col justify-between">
<div>
<div className="flex justify-between items-start mb-4">
<span className="text-on-surface-variant text-xs font-body">Oct 20, 2023</span>
<span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant text-xs font-bold uppercase tracking-wider rounded-DEFAULT">Pending</span>
</div>
<h3 className="font-headline text-xl text-on-surface mb-1">Opal &amp; Gold Boutiques</h3>
<p className="font-body text-sm text-on-surface-variant mb-6">David Chen</p>
<div className="mb-6">
<p className="font-body text-xs text-on-surface-variant uppercase tracking-wide mb-1">Interest</p>
<p className="font-body text-base text-on-surface font-medium">Emerald Thread Collection</p>
<p className="font-body text-sm text-on-surface-variant mt-2">Qty: <span className="font-bold text-on-surface">250 units</span></p>
</div>
</div>
<div className="flex flex-col space-y-3 mt-4 border-t border-surface-container-low pt-4">
<button className="w-full py-2 bg-surface-container-low text-on-surface rounded-md font-body text-sm font-medium hover:bg-surface-container-high transition-colors ghost-border">
                            Review Request
                        </button>
<button className="w-full text-primary font-body text-sm text-center hover:underline">
                            Mark as Contacted
                        </button>
</div>
</div>
{/* Minimal List View for older inquiries (Span 1) */}
<div className="bg-surface-container-low rounded-lg p-6 xl:col-span-1 flex flex-col">
<h3 className="font-headline text-lg text-on-surface mb-6 border-b border-surface-dim pb-2">Archived Leads</h3>
<div className="space-y-6 flex-1">
<div className="group cursor-pointer">
<p className="font-body text-sm text-on-surface font-medium group-hover:text-primary transition-colors">Vanguard Textiles</p>
<p className="font-body text-xs text-on-surface-variant">Approved • Sep 15</p>
</div>
<div className="group cursor-pointer">
<p className="font-body text-sm text-on-surface font-medium group-hover:text-primary transition-colors">Heritage Craft Co.</p>
<p className="font-body text-xs text-on-surface-variant">Declined • Sep 02</p>
</div>
<div className="group cursor-pointer">
<p className="font-body text-sm text-on-surface font-medium group-hover:text-primary transition-colors">Silk Road Importers</p>
<p className="font-body text-xs text-on-surface-variant">Approved • Aug 28</p>
</div>
</div>
<button className="mt-6 text-on-surface-variant font-body text-sm text-left hover:text-primary transition-colors flex items-center">
                        View All Archives
                        <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
</button>
</div>
</div>

    </div>
    </>
  );
}
