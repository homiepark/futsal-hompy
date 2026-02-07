import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const scrollPositions = new Map<string, number>();

export function useScrollRestoration() {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);

  // Save scroll position before leaving
  useEffect(() => {
    const handleScroll = () => {
      scrollPositions.set(location.pathname + location.search, window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      // Save final position on unmount
      scrollPositions.set(location.pathname + location.search, window.scrollY);
    };
  }, [location.pathname, location.search]);

  // Restore scroll position when returning
  useEffect(() => {
    const key = location.pathname + location.search;
    const savedPosition = scrollPositions.get(key);
    
    if (savedPosition !== undefined && prevPathRef.current !== null) {
      // Small delay to ensure content is rendered
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition);
      });
    } else {
      // New page, scroll to top
      window.scrollTo(0, 0);
    }
    
    prevPathRef.current = location.pathname;
  }, [location.pathname, location.search]);
}

// Utility to check if we should show back button
const MAIN_TAB_ROUTES = ['/', '/my-team', '/matchmaking', '/schedule', '/courts'];

export function isMainTabRoute(pathname: string): boolean {
  return MAIN_TAB_ROUTES.includes(pathname);
}
