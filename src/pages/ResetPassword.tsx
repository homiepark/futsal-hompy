import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import futsalMascot from '@/assets/mascot-pixel-style.png';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const passwordSchema = z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다');

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if user has a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        toast({
          title: '세션 만료',
          description: '비밀번호 재설정 링크가 만료되었습니다. 다시 시도해주세요.',
          variant: 'destructive',
        });
        navigate('/forgot-password');
      }
    };

    checkSession();
  }, [navigate, toast]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        title: '오류',
        description: '비밀번호 변경에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/auth');
  };

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-[#f8f6f0] flex items-center justify-center">
        <p className="font-pixel text-[10px] text-[#8b7355]">세션 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex flex-col items-center px-4 py-6">
      {/* Mascot and Logo Section */}
      <div className="text-center mb-4">
        <div className="relative w-28 h-28 mx-auto mb-2">
          <img 
            src={futsalMascot} 
            alt="풋살 마스코트"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Logo Text */}
        <div className="flex justify-center items-center gap-0 mb-1">
          <span 
            className="font-pixel text-2xl font-bold"
            style={{
              color: '#FF8C00',
              WebkitTextStroke: '2px #8B4513',
              textShadow: '3px 3px 0 #8B4513',
              letterSpacing: '2px',
            }}
          >
            우리
          </span>
          <span 
            className="font-pixel text-2xl font-bold"
            style={{
              color: '#FFFFFF',
              WebkitTextStroke: '2px #4A4A4A',
              textShadow: '3px 3px 0 #4A4A4A',
            }}
          >
            의
          </span>
          <span 
            className="font-pixel text-2xl font-bold"
            style={{
              color: '#22C55E',
              WebkitTextStroke: '2px #14532D',
              textShadow: '3px 3px 0 #14532D',
              letterSpacing: '2px',
            }}
          >
            풋살
          </span>
        </div>
        <p className="font-pixel text-xs text-[#22C55E] tracking-[0.3em]">Our Futsal</p>
      </div>

      {/* Card */}
      <div 
        className="w-full max-w-sm bg-[#fdfcf8] overflow-hidden"
        style={{ 
          border: '4px solid hsl(30, 45%, 65%)',
          borderRadius: '16px',
          boxShadow: `
            6px 6px 0 hsl(30, 35%, 55%),
            inset 0 0 0 2px hsl(40, 50%, 92%)
          `,
        }}
      >
        {/* Header */}
        <div 
          className="py-3.5 bg-primary text-center"
          style={{
            borderBottom: '3px solid hsl(142, 65%, 35%)',
          }}
        >
          <h1 className="font-pixel text-[12px] text-primary-foreground flex items-center justify-center gap-2">
            <Lock size={14} />
            새 비밀번호 설정
          </h1>
        </div>

        <div className="p-5">
          {/* Description */}
          <p className="font-pixel text-[9px] text-[#6b5c4a] text-center mb-5 leading-relaxed">
            새로운 비밀번호를 입력해주세요.<br />
            최소 6자 이상이어야 합니다.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Input */}
            <div>
              <label className="flex items-center gap-1.5 font-pixel text-[10px] text-[#5a4a3a] mb-2">
                <Lock size={12} />
                <span>새 비밀번호</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full px-4 py-3 pr-12 bg-[#f5f2ea] text-[#5a4a3a] font-body text-sm',
                    'placeholder:text-[#a89880]',
                    'focus:outline-none focus:bg-[#f0ebe0]',
                    errors.password && 'border-destructive'
                  )}
                  style={{
                    border: '2px solid #d4c8b8',
                    borderRadius: '10px',
                  }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a89880] hover:text-[#5a4a3a] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="font-pixel text-[8px] text-destructive mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="flex items-center gap-1.5 font-pixel text-[10px] text-[#5a4a3a] mb-2">
                <Lock size={12} />
                <span>비밀번호 확인</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  'w-full px-4 py-3 bg-[#f5f2ea] text-[#5a4a3a] font-body text-sm',
                  'placeholder:text-[#a89880]',
                  'focus:outline-none focus:bg-[#f0ebe0]',
                  errors.confirmPassword && 'border-destructive'
                )}
                style={{
                  border: '2px solid #d4c8b8',
                  borderRadius: '10px',
                }}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="font-pixel text-[8px] text-destructive mt-1.5">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3.5 font-pixel text-[12px] text-white',
                'flex items-center justify-center gap-2',
                'transition-all duration-100',
                'hover:brightness-110',
                'active:translate-y-0.5',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
              style={{
                background: 'linear-gradient(180deg, hsl(142, 69%, 55%) 0%, hsl(142, 69%, 45%) 100%)',
                border: '3px solid hsl(142, 65%, 35%)',
                borderRadius: '10px',
                boxShadow: '0 4px 0 hsl(142, 60%, 30%), inset 0 1px 0 hsl(142, 70%, 65%)',
              }}
            >
              {isLoading ? (
                <span className="animate-pulse">변경 중...</span>
              ) : (
                <>
                  <Check size={14} />
                  <span>비밀번호 변경</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Decorative Diamonds */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <span className="text-primary text-lg">◆</span>
        <span className="text-accent text-lg">◆</span>
        <span className="text-primary text-lg">◆</span>
      </div>

      {/* Back Link */}
      <Link 
        to="/" 
        className="mt-6 flex items-center gap-2 font-pixel text-[10px] text-[#8b7355] hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} />
        <span>홈으로 돌아가기</span>
      </Link>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={handleSuccessClose}>
        <DialogContent 
          className="max-w-xs p-0 border-0 bg-transparent"
          style={{ boxShadow: 'none' }}
        >
          <div 
            className="bg-[#fdfcf8] p-6 text-center"
            style={{ 
              border: '4px solid hsl(30, 45%, 65%)',
              borderRadius: '16px',
              boxShadow: `
                6px 6px 0 hsl(30, 35%, 55%),
                inset 0 0 0 2px hsl(40, 50%, 92%)
              `,
            }}
          >
            {/* Success Icon */}
            <div 
              className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-primary"
              style={{
                border: '3px solid hsl(142, 65%, 35%)',
                borderRadius: '12px',
                boxShadow: '4px 4px 0 hsl(142, 60%, 30%)',
              }}
            >
              <Check size={32} className="text-white" />
            </div>
            
            <h2 className="font-pixel text-[14px] text-primary mb-3">
              비밀번호 변경 완료!
            </h2>
            <p className="font-pixel text-[9px] text-[#6b5c4a] leading-relaxed mb-4">
              새 비밀번호로 변경되었습니다.<br />
              다시 로그인해주세요.
            </p>
            
            <button
              onClick={handleSuccessClose}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-6 py-2.5 font-pixel text-[11px] text-white',
                'transition-all duration-100',
                'hover:brightness-110',
                'active:translate-y-0.5'
              )}
              style={{
                background: 'linear-gradient(180deg, hsl(142, 69%, 55%) 0%, hsl(142, 69%, 45%) 100%)',
                border: '3px solid hsl(142, 65%, 35%)',
                borderRadius: '10px',
                boxShadow: '0 4px 0 hsl(142, 60%, 30%), inset 0 1px 0 hsl(142, 70%, 65%)',
              }}
            >
              로그인하러 가기
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
