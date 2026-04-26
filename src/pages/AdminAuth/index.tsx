import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck, User2 } from 'lucide-react';
import { isAdminUser } from '../../lib/admin-auth';
import { authClient } from '../../lib/auth-client';

export default function AdminAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session?.user && isAdminUser(session.user)) {
      navigate('/admin', { replace: true });
    }
  }, [navigate, session]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email({
        email: identifier.trim(),
        password,
      });

      if (error) {
        setErrorMessage(error.message || 'Invalid admin credentials.');
        return;
      }

      const sessionResult = await authClient.getSession();
      const adminUser = sessionResult.data?.user;

      if (!isAdminUser(adminUser)) {
        await authClient.signOut();
        setErrorMessage('Forbidden: this account does not have admin access.');
        return;
      }

      const redirectTarget = location.state?.from && location.state.from.startsWith('/admin')
        ? location.state.from
        : '/admin';

      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setErrorMessage('Unable to sign in right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-primary text-on-primary">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,224,136,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_35%)]" />
          <div className="absolute inset-y-0 right-0 hidden w-px bg-white/10 lg:block" />

          <div className="relative flex h-full flex-col justify-between px-8 py-10 sm:px-12 lg:px-16 lg:py-14">
            <div className="flex items-center justify-between">
              <Link to="/" className="font-headline text-2xl italic tracking-tight text-on-primary">
                Hindustan Embroidery
              </Link>
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.32em]">
                Admin Console
              </span>
            </div>

            <div className="max-w-xl space-y-8 py-16 lg:py-24">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.3em] text-white/80">
                <ShieldCheck size={16} />
                Restricted access only
              </div>

              <div className="space-y-5">
                <h1 className="font-headline text-5xl italic leading-tight sm:text-6xl">
                  Secure access for the atelier operations team.
                </h1>
                <p className="max-w-lg text-base leading-8 text-white/78 sm:text-lg">
                  Manage inventory, review orders, coordinate fulfillment, and monitor store health from a dedicated administrative entry point designed for internal staff.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Order queue', value: '128' },
                  { label: 'Pending reviews', value: '09' },
                  { label: 'Access policy', value: 'MFA' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
                    <p className="font-headline text-3xl italic">{item.value}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.24em] text-white/65">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 text-sm text-white/72 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/12 bg-black/10 p-5 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">Security note</p>
                <p className="mt-3 leading-7">
                  Use your assigned admin credentials only. Shared logins and customer credentials should never be used here.
                </p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-black/10 p-5 backdrop-blur-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/58">Support</p>
                <p className="mt-3 leading-7">
                  If you are locked out, contact the operations lead before requesting a password reset.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-surface px-6 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-xl rounded-4xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-[0_24px_60px_rgba(26,28,26,0.08)] sm:p-10">
            <div className="mb-10 space-y-4">
              <div className="inline-flex items-center gap-3 rounded-full bg-surface-container-low px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
                <ShieldCheck size={16} />
                Admin sign in
              </div>
              <div className="space-y-3">
                <h2 className="font-headline text-4xl text-primary">Welcome back</h2>
                <p className="max-w-md text-sm leading-7 text-on-surface-variant">
                  Sign in to access the internal dashboard. This route is intended for administrators, warehouse staff, and approved support managers.
                </p>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="admin-identifier" className="px-1 text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                  Work Email or Admin ID
                </label>
                <div className="relative">
                  <User2 className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/55" size={18} />
                  <input
                    id="admin-identifier"
                    type="text"
                    placeholder="admin@hindustanembroidery.com"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    className="w-full rounded-2xl border border-outline-variant/30 bg-surface px-12 py-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label htmlFor="admin-password" className="text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
                    Password
                  </label>
                  <button type="button" className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary transition hover:opacity-80">
                    Reset access
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/55" size={18} />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-outline-variant/30 bg-surface px-12 py-4 pr-14 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 transition hover:text-primary"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-2xl border border-error/30 bg-error-container px-4 py-3 text-sm font-medium text-on-error-container">
                  {errorMessage}
                </div>
              )}

              <div className="flex flex-col gap-4 rounded-2xl bg-surface-container-low p-4 text-sm text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20" defaultChecked />
                  <span>Keep this device trusted for 12 hours</span>
                </label>
                <span className="text-[11px] uppercase tracking-[0.24em] text-primary">MFA enforced</span>
              </div>

              <button
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-4 text-sm font-semibold uppercase tracking-[0.24em] text-on-primary transition hover:bg-primary/92 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Signing In...' : 'Access Admin Panel'}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="mt-8 border-t border-outline-variant/20 pt-6">
              <p className="text-sm leading-7 text-on-surface-variant">
                Looking for the customer sign-in instead?{' '}
                <Link to="/login" className="font-semibold text-primary transition hover:opacity-80">
                  Open the storefront auth page
                </Link>
                .
              </p>

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
