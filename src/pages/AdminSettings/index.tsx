import React from 'react';

export default function AdminSettings() {
  return (
    <>
<div className="space-y-8">
<div>
<h1 className="text-3xl md:text-4xl font-headline text-primary mb-2">Store Configuration</h1>
<p className="text-on-surface-variant font-body">Manage Hindustan Embroidery brand details, shipping protocols, and digital storefront settings.</p>
</div>
<div className="space-y-12">
{/* Section 1: Store Information */}
<section className="bg-surface-container-low rounded-xl p-8 relative overflow-hidden group">
{/* Subtle decorative accent */}
<div className="absolute -right-10 -top-10 w-40 h-40 bg-surface-container-lowest rounded-full opacity-50 mix-blend-overlay pointer-events-none"></div>
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
<h2 className="text-2xl font-headline text-primary">Store Information</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
{/* Store Name */}
<div className="space-y-2">
<label className="block text-sm font-label text-on-surface-variant font-medium">Store Name</label>
<input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-surface transition-colors bg-transparent" type="text" value="Hindustan Embroidery" />
</div>
{/* Official Email */}
<div className="space-y-2">
<label className="block text-sm font-label text-on-surface-variant font-medium">Official Email</label>
<input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-surface transition-colors bg-transparent" type="email" value="contact@hindustanembroidery.com" />
</div>
{/* Phone Number */}
<div className="space-y-2">
<label className="block text-sm font-label text-on-surface-variant font-medium">Phone Number</label>
<div className="flex items-center gap-2">
<span className="text-on-surface-variant/70 border-b border-outline-variant/50 py-2">+91</span>
<input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-surface transition-colors bg-transparent" type="tel" value="98765 43210" />
</div>
</div>
{/* Studio Address */}
<div className="space-y-2 md:col-span-2 mt-2">
<label className="block text-sm font-label text-on-surface-variant font-medium">Studio Address</label>
<textarea className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-surface transition-colors bg-transparent resize-none" rows={2}>14, Heritage Weavers Lane, Craft District
Mumbai, Maharashtra 400001</textarea>
</div>
</div>
</section>
{/* Section 2: Shipping & Delivery */}
<section className="bg-surface-container-low rounded-xl p-8">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
<h2 className="text-2xl font-headline text-primary">Shipping &amp; Delivery</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div className="space-y-6">
{/* Flat Rate */}
<div className="space-y-2">
<label className="block text-sm font-label text-on-surface-variant font-medium">Standard Flat Rate Shipping (₹)</label>
<input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-surface transition-colors bg-transparent" type="number" value="250" />
</div>
{/* Free Shipping Threshold */}
<div className="space-y-2">
<label className="block text-sm font-label text-on-surface-variant font-medium">Free Shipping Threshold (₹)</label>
<input className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-surface transition-colors bg-transparent text-primary font-semibold" type="number" value="2000" />
<p className="text-xs text-on-surface-variant/70 mt-1">Orders above this amount will qualify for complimentary shipping.</p>
</div>
</div>
{/* Courier Partners (Bento style selection) */}
<div className="space-y-3">
<label className="block text-sm font-label text-on-surface-variant font-medium mb-3">Supported Courier Partners</label>
<div className="grid grid-cols-2 gap-3">
<label className="cursor-pointer relative">
<input defaultChecked className="peer sr-only" type="checkbox" />
<div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 transition-all peer-checked:border-primary peer-checked:bg-surface peer-checked:shadow-sm">
<div className="flex justify-between items-center mb-2">
<span className="font-body font-medium text-sm">BlueDart</span>
<span className="material-symbols-outlined text-primary text-sm opacity-0 peer-checked:opacity-100" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
</div>
<p className="text-xs text-on-surface-variant">Premium Air</p>
</div>
</label>
<label className="cursor-pointer relative">
<input defaultChecked className="peer sr-only" type="checkbox" />
<div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 transition-all peer-checked:border-primary peer-checked:bg-surface peer-checked:shadow-sm">
<div className="flex justify-between items-center mb-2">
<span className="font-body font-medium text-sm">Delhivery</span>
<span className="material-symbols-outlined text-primary text-sm opacity-0 peer-checked:opacity-100" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
</div>
<p className="text-xs text-on-surface-variant">Standard Ground</p>
</div>
</label>
<label className="cursor-pointer relative">
<input className="peer sr-only" type="checkbox" />
<div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 transition-all peer-checked:border-primary peer-checked:bg-surface peer-checked:shadow-sm opacity-70 hover:opacity-100">
<div className="flex justify-between items-center mb-2">
<span className="font-body font-medium text-sm">FedEx</span>
<span className="material-symbols-outlined text-primary text-sm opacity-0 peer-checked:opacity-100" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
</div>
<p className="text-xs text-on-surface-variant">International</p>
</div>
</label>
</div>
</div>
</div>
</section>
{/* Section 3: Tax & Currency & Section 4: Social Media (Bento Grid Layout) */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
{/* Tax & Currency */}
<section className="bg-surface-container-low rounded-xl p-8 flex flex-col justify-between">
<div>
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
<h2 className="text-2xl font-headline text-primary">Tax &amp; Currency</h2>
</div>
<div className="space-y-6">
<div className="space-y-2">
<label className="block text-sm font-label text-on-surface-variant font-medium">Default Currency</label>
<select className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-2 font-body text-on-surface transition-colors bg-transparent appearance-none">
<option value="INR">INR (₹) - Indian Rupee</option>
<option value="USD">USD ($) - US Dollar</option>
<option value="EUR">EUR (€) - Euro</option>
</select>
</div>
<div className="space-y-2 mt-4">
<label className="block text-sm font-label text-on-surface-variant font-medium mb-3">GST Configuration</label>
<div className="flex gap-4">
<label className="flex items-center gap-2 cursor-pointer group">
<div className="relative flex items-center">
<input className="peer sr-only" name="gst" type="radio" value="12" />
<div className="w-4 h-4 rounded-full border border-outline-variant peer-checked:border-primary flex items-center justify-center transition-colors">
<div className="w-2 h-2 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity"></div>
</div>
</div>
<span className="font-body text-sm text-on-surface group-hover:text-primary transition-colors">12%</span>
</label>
<label className="flex items-center gap-2 cursor-pointer group">
<div className="relative flex items-center">
<input defaultChecked className="peer sr-only" name="gst" type="radio" value="18" />
<div className="w-4 h-4 rounded-full border border-outline-variant peer-checked:border-primary flex items-center justify-center transition-colors">
<div className="w-2 h-2 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity"></div>
</div>
</div>
<span className="font-body text-sm text-on-surface group-hover:text-primary transition-colors">18%</span>
</label>
</div>
</div>
</div>
</div>
</section>
{/* Social Media Integration */}
<section className="bg-surface-container-low rounded-xl p-8">
<div className="flex items-center gap-3 mb-6">
<span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
<h2 className="text-2xl font-headline text-primary">Social Channels</h2>
</div>
<div className="space-y-5">
<div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/10">
<span className="text-on-surface-variant font-medium text-sm w-24">Instagram</span>
<input className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-1 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40" type="text" value="@hindustanembroidery" />
</div>
<div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/10">
<span className="text-on-surface-variant font-medium text-sm w-24">Pinterest</span>
<input className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-1 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40" type="text" value="pinterest.com/hindustanembroidery" />
</div>
<div className="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/10">
<span className="text-on-surface-variant font-medium text-sm w-24">WhatsApp</span>
<input className="flex-1 bg-transparent border-none focus:ring-0 px-2 py-1 font-body text-sm text-on-surface placeholder:text-on-surface-variant/40" type="tel" value="+91 98765 43210" />
</div>
</div>
</section>
</div>
</div>

    </div>
    </>
  );
}
