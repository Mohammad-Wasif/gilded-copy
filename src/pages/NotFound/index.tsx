import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-surface">
      <Compass size={120} className="text-primary/20 mb-6" />
      <h1 className="font-headline text-5xl text-primary mb-4">404 - Page Not Found</h1>
      <p className="font-body text-on-surface-variant text-lg mb-8 max-w-md mx-auto">
        We couldn't find the page you were looking for. It might have been moved or doesn't exist.
      </p>
      <Link 
        to="/" 
        className="bg-primary text-on-primary px-8 py-4 font-semibold hover:bg-primary/90 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
}
