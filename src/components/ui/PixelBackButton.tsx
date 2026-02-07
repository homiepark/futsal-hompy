import { ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { isMainTabRoute } from '@/hooks/useScrollRestoration';

interface PixelBackButtonProps {
  /** Custom click handler. If not provided, uses navigate(-1) */
  onClick?: () => void;
  /** Optional label text next to the arrow */
  label?: string;
  /** Button variant: 'orange' or 'green' */
  variant?: 'orange' | 'green';
  /** Additional CSS classes */
  className?: string;
  /** Force show even on main tabs (for custom use cases) */
  forceShow?: boolean;
}

export function PixelBackButton({ 
  onClick, 
  label,
  variant = 'orange',
  className,
  forceShow = false,
}: PixelBackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on main tab routes unless forced
  if (!forceShow && isMainTabRoute(location.pathname)) {
    return null;
  }

  const handleClick = () => {
    // Add a small visual feedback before navigating
    document.body.classList.add('page-transitioning-back');
    
    setTimeout(() => {
      if (onClick) {
        onClick();
      } else {
        navigate(-1);
      }
      
      // Remove class after navigation
      setTimeout(() => {
        document.body.classList.remove('page-transitioning-back');
      }, 50);
    }, 50);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'pixel-back-btn-styled',
        variant === 'orange' ? 'pixel-back-btn-orange' : 'pixel-back-btn-green',
        label && 'px-3 gap-1.5',
        className
      )}
      aria-label="뒤로 가기"
    >
      <ArrowLeft size={16} strokeWidth={3} />
      {label && (
        <span className="font-pixel text-[9px]">{label}</span>
      )}
    </button>
  );
}

// Smart back button that only shows on sub-pages
export function SmartBackButton(props: Omit<PixelBackButtonProps, 'forceShow'>) {
  return <PixelBackButton {...props} />;
}
