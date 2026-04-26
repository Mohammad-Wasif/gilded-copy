import React from 'react';
import { Edit2, MapPin, Building2, Plus, Trash2 } from 'lucide-react';
import { authClient } from '../../lib/auth-client';

const Profile = () => {
  const { data: session } = authClient.useSession();

  return (
    <div className="max-w-5xl mx-auto space-y-16 px-4 lg:px-8 py-12">
      {/* Header Section */}
      <header className="space-y-4">
        <div className="inline-block px-3 py-1 bg-tertiary-container/20 text-tertiary rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
          Account Management
        </div>
        <h1 className="text-5xl font-serif text-primary tracking-tight">Profile Settings</h1>
        <p className="text-on-surface-variant font-body max-w-xl">
          Refine your personal details and manage the heritage of your digital presence within the atelier.
        </p>
      </header>

      {/* Profile Picture Upload */}
      <section className="bg-surface-container-low p-8 rounded-lg flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden shadow-xl border-4 border-surface-container-lowest bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl uppercase">
            {session?.user?.name ? session.user.name.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'G'}
          </div>
          <button className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center">
            <Edit2 size={16} />
          </button>
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-serif text-xl text-on-surface">Artisan Portrait</h3>
          <p className="text-on-surface-variant text-sm font-body">
            Upload a high-resolution image to represent your craftsmanship within our community. PNG or JPG, max 5MB.
          </p>
          <button className="text-primary text-sm font-bold underline underline-offset-4 decoration-outline-variant hover:text-surface-tint transition-colors">
            Update Avatar
          </button>
        </div>
      </section>

      {/* Personal Details Form */}
      <section className="space-y-10">
        <div className="flex items-center gap-4">
          <h2 className="font-serif text-2xl text-on-surface">Personal Information</h2>
          <div className="h-[1px] flex-grow bg-outline-variant/30"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Full Name</label>
            <input 
              className="w-full bg-surface-container-low border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-3 text-on-surface font-body transition-all placeholder:text-outline/40" 
              type="text" 
              defaultValue={session?.user?.name || "Alistair Vance"}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Email Address</label>
            <input 
              className="w-full bg-surface-container-low border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-3 text-on-surface font-body transition-all" 
              type="email" 
              defaultValue={session?.user?.email || "alistair.v@gildedheirloom.com"}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Phone Number</label>
            <input 
              className="w-full bg-surface-container-low border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-3 text-on-surface font-body transition-all" 
              type="tel" 
              defaultValue="+44 20 7946 0123"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Timezone</label>
            <select className="w-full bg-surface-container-low border-0 border-b border-outline-variant/50 focus:border-primary focus:ring-0 px-0 py-3 text-on-surface font-body transition-all appearance-none">
              <option>GMT (London, United Kingdom)</option>
              <option>EST (New York, USA)</option>
              <option>IST (New Delhi, India)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="bg-primary text-on-primary px-8 py-3 rounded-md text-sm font-bold hover:shadow-lg transition-all active:scale-95">
            Save Changes
          </button>
        </div>
      </section>

      {/* Saved Addresses Section (Bento Grid) */}
      <section className="space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl text-on-surface">Saved Addresses</h2>
          <button className="text-primary text-sm font-bold flex items-center gap-2 hover:opacity-70">
            <MapPin size={16} /> Add New
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Address Card 1 (Primary) */}
          <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <div className="bg-tertiary text-on-tertiary px-2 py-1 rounded-sm text-[8px] font-bold uppercase tracking-widest">
                Primary Studio
              </div>
            </div>
            <div className="space-y-4">
              <MapPin className="text-tertiary" size={32} />
              <div className="space-y-1">
                <h4 className="font-serif text-lg">Main Atelier</h4>
                <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                  14 Savile Row, Mayfair<br/>
                  London, W1S 3JN<br/>
                  United Kingdom
                </p>
              </div>
              <div className="pt-4 flex gap-4">
                <button className="text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Edit</button>
                <button className="text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:text-error transition-colors">Remove</button>
              </div>
            </div>
          </div>
          {/* Address Card 2 (Secondary) */}
          <div className="bg-surface-container-low p-8 rounded-lg relative flex flex-col justify-between group">
            <div className="space-y-4">
              <Building2 className="text-outline" size={32} />
              <div className="space-y-1">
                <h4 className="font-serif text-lg">Design Studio</h4>
                <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                  Unit 4, The Custard Factory<br/>
                  Birmingham, B9 4AA
                </p>
              </div>
            </div>
            <div className="pt-4 flex gap-4">
              <button className="text-on-surface-variant text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Edit</button>
            </div>
          </div>
          {/* Address Card 3 (Tertiary CTA) */}
          <div className="bg-surface-container-low/50 p-8 rounded-lg border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center space-y-3 group cursor-pointer hover:bg-surface-container-low transition-all">
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-outline group-hover:text-primary transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Add Warehouse</span>
          </div>
        </div>
      </section>

      {/* Footer Accents */}
      <section className="pt-16 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between gap-8">
        <div className="space-y-4 max-w-sm">
          <div className="text-primary font-serif text-xl">The Security Promise</div>
          <p className="text-on-surface-variant text-sm font-body">
            Your personal data is encrypted using 256-bit protocols, ensuring your heirloom designs and details remain private.
          </p>
        </div>
        <div className="flex items-end">
          <button className="flex items-center gap-2 text-error font-bold text-sm hover:underline underline-offset-4 active:scale-95 transition-transform">
            <Trash2 size={16} /> Delete Account
          </button>
        </div>
      </section>
    </div>
  );
};

export default Profile;
