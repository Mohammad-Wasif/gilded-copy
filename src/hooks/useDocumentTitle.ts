import { useEffect } from 'react';

const BASE_TITLE = 'Hindustan Embroidery';

/**
 * Sets the document title on mount and resets it on unmount.
 * @param title - Page-specific title. Will be formatted as "title | Hindustan Embroidery".
 *                Pass empty string to use just the base title.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
