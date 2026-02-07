import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PixelBackButtonProps {
  /** Custom click handler. If not provided, uses history.back() */
  onClick?: () => void;
  /** Optional label text next to the arrow */
  label?: string;
  /** Button variant: 'orange' or 'green' */
  variant?: 'orange' | 'green';
  /** Additional CSS classes */
  className?: string;
}

export function PixelBackButton({ 
  onClick, 
  label,
  variant = 'orange',
  className 
}: PixelBackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
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
