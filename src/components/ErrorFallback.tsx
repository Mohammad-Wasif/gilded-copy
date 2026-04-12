import { ArrowRight } from 'lucide-react';

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

/**
 * A user-friendly error fallback with optional retry button.
 */
export const ErrorFallback = ({
  title = 'Something went wrong',
  message = 'We couldn\'t load this content. Please try again.',
  onRetry
}: ErrorFallbackProps) => (
  <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
    <span className="material-symbols-outlined text-6xl text-primary/20 mb-6">cloud_off</span>
    <h3 className="font-headline text-xl text-on-surface mb-2">{title}</h3>
    <p className="text-on-surface-variant text-sm max-w-md mb-6">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 font-label font-bold uppercase tracking-widest text-xs hover:bg-primary/90 transition-all group rounded-sm"
      >
        Try Again
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </button>
    )}
  </div>
);
