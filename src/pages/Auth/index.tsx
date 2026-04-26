import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Github, Loader2 } from 'lucide-react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { authClient } from '../../lib/auth-client';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useDocumentTitle(isLogin ? 'Sign In' : 'Create Account');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) {
          setError(error.message || 'Invalid email or password');
          return;
        }
      } else {
        const { error } = await authClient.signUp.email({ email, password, name });
        if (error) {
          setError(error.message || 'Failed to create account');
          return;
        }
      }
      navigate('/');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row font-body selection:bg-primary/10">
      {/* Visual Side: Heritage & Artisanship */}
      <div className="h-[35vh] lg:h-auto lg:w-1/2 relative overflow-hidden bg-primary order-2 lg:order-1">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnqUSLjbRrKKwODC1aB1REM9ewPNxz0JbbIA5IhSdPcXNd06NbPrVsl8lQF9PNmy0SqKQloVKryaE-pt4sWqHP7zwBNxMfzaFJ8QhfT7DWuCVa15HdRYmrPKAuT09_TQ8iz9xjG7eV72-UYNrzEGLnOuTmjbyCsEHZhoqz8W2nECQ0hOeqVVQ-uwjy9QHcKzwrcqOruOxg3_gXR0f3hwcvzTM27dCIFJJCzpxjFduE9ctsypi-zGRvOhxmKTTF64vYjS1VSqq7hJs"
          alt="Artisan at work"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 grayscale scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary/90 via-primary/40 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-end p-12 lg:p-20 text-on-primary">
          <div className="max-w-md space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full border border-on-primary/20 bg-on-primary/5 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.3em]">
              Heritage Atelier
            </div>
            <h2 className="font-headline text-3xl lg:text-5xl xl:text-6xl italic leading-[1.1]">The Craft of Identity.</h2>
            <p className="text-sm md:text-lg opacity-90 leading-relaxed font-light">
              Join a community dedicated to the preservation of heritage needlework and bespoke luxury. Access exclusive collections and artisanal resources.
            </p>
            <div className="pt-4 md:pt-8 hidden lg:flex items-center gap-12 border-t border-on-primary/10">
              <div>
                <p className="text-3xl font-headline italic">5k+</p>
                <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Global Artisans</p>
              </div>
              <div>
                <p className="text-3xl font-headline italic">120</p>
                <p className="text-[10px] uppercase tracking-widest opacity-60 mt-1">Heritage Threads</p>
              </div>
            </div>
          </div>
        </div>
        {/* Logo Overlay */}
        <div className="absolute top-12 left-12 lg:hidden">
          <Link to="/" className="text-2xl font-headline italic text-on-primary tracking-tight decoration-none">
            Hindustan Embroidery
          </Link>
        </div>
      </div>

      {/* Form Side */}
      <div className="lg:w-1/2 bg-surface-bright flex flex-col order-1 lg:order-2">
        <header className="p-12 hidden lg:block">
          <Link to="/" className="text-2xl font-headline italic text-primary tracking-tight inline-block hover:opacity-80 transition-opacity">
            Hindustan Embroidery
          </Link>
        </header>

        <main className="flex-1 flex flex-col justify-center px-6 md:px-8 lg:px-24 py-10 md:py-20 max-w-2xl mx-auto w-full">
          <div className="space-y-10 animate-fade-in">
            <div className="space-y-4">
              <h1 className="font-headline text-4xl text-primary leading-tight">
                {isLogin ? 'Welcome back to the Atelier' : 'Begin your Creative Journey'}
              </h1>
              <p className="text-on-surface-variant font-body">
                {isLogin ? 'Sign in to access your curated collections and orders.' : 'Create an account to join our global community of designers.'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-sm text-sm border border-red-100 flex items-center gap-2 animate-fade-in">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleAuth}>
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!isLogin}
                      className="w-full bg-white border border-outline-variant/30 px-12 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm"
                      placeholder="Alexander McQueen"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white border border-outline-variant/30 px-12 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between px-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Password</label>
                  {isLogin && (
                    <Link to="#" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Forgot Password?</Link>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full bg-white border border-outline-variant/30 px-12 py-4 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-on-primary py-4 font-headline uppercase tracking-[0.2em] font-semibold flex items-center justify-center gap-3 editorial-shadow group disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:enabled:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In to Atelier' : 'Create My Account'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/20"></div></div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest bg-surface-bright px-4 text-on-surface-variant/40 font-bold">Or continue with</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 px-4 py-3 border border-outline-variant/30 bg-white hover:bg-surface-container-lowest transition-all text-sm font-medium rounded-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-3 px-4 py-3 border border-outline-variant/30 bg-white hover:bg-surface-container-lowest transition-all text-sm font-medium rounded-sm">
                <Github size={20} />
                GitHub
              </button>
            </div>

            <div className="text-center pt-8">
              <p className="text-sm text-on-surface-variant">
                {isLogin ? "Don't have an account yet?" : "Already a member of the atelier?"}{' '}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-bold hover:underline transition-all underline-offset-4"
                >
                  {isLogin ? 'Join the community' : 'Sign in to your account'}
                </button>
              </p>
            </div>
          </div>
        </main>

        <footer className="p-12 text-[10px] text-on-surface-variant/40 flex flex-wrap justify-center lg:justify-start gap-8 font-label tracking-widest border-t border-outline-variant/10">
          <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link to="/shipping-returns" className="hover:text-primary transition-colors">Shipping & Returns</Link>
          <Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
          <span className="lg:ml-auto">&copy; {new Date().getFullYear()} Hindustan Embroidery Atelier. All Rights Reserved.</span>
        </footer>
      </div>
    </div>
  );
}
