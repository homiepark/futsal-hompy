import { useEffect } from 'react';

/**
 * Locks body scroll when a modal/overlay is open.
 * Prevents background page from scrolling on mobile.
 * Uses overflow:hidden instead of position:fixed to avoid touch event issues on iOS.
 */
export function useBodyScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) return;

    const originalBody = document.body.style.overflow;
    const originalHtml = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBody;
      document.documentElement.style.overflow = originalHtml;
    };
  }, [isOpen]);
}
