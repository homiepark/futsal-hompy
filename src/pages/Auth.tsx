import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import futsalMascot from '@/assets/futsal-mascot-pixel.png';

// Validation schemas
const emailSchema = z.string().email('올바른 이메일 형식이 아닙니다');
const passwordSchema = z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다');

type AuthMode = 'login' | 'signup';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    if (mode === 'signup' && password !== confirmPassword) {
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
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: '🎉 회원가입 완료!',
            description: '프로필을 설정해주세요.',
          });
          navigate('/profile-setup');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: '👋 환영합니다!',
            description: '로그인되었습니다.',
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = '오류가 발생했습니다';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = '이미 등록된 이메일입니다';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = '이메일 인증이 필요합니다';
      }

      toast({
        title: '오류',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrors({});
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-[#f8f6f0] flex flex-col items-center px-4 py-6">
      {/* Mascot and Logo Section */}
      <div className="text-center mb-4">
        {/* Mascot Character */}
        <div className="relative w-32 h-32 mx-auto mb-2">
          <img 
            src={futsalMascot} 
            alt="풋살 마스코트"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Logo Text - Same green as signup button */}
        <h1 
          className="font-pixel text-3xl font-bold relative inline-block"
          style={{
            color: 'hsl(142, 69%, 50%)',
            WebkitTextStroke: '1.5px hsl(142, 60%, 30%)',
            textShadow: '3px 3px 0 hsl(142, 60%, 30%)',
          }}
        >
          우리의풋살
        </h1>
        <p className="font-pixel text-xs text-[hsl(142,50%,40%)] mt-1 tracking-[0.2em]">Our Futsal</p>
      </div>

      {/* Auth Card - Matching the exact design */}
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
        {/* Tab Switch - Exact match */}
        <div className="flex">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={cn(
              'flex-1 py-3.5 font-pixel text-[11px] transition-all flex items-center justify-center gap-2',
              mode === 'signup'
                ? 'bg-primary text-primary-foreground'
                : 'bg-[#f0ebe0] text-[#8b7355] hover:bg-[#e8e3d8]'
            )}
            style={{
              borderBottom: mode === 'signup' ? 'none' : '2px solid hsl(30, 30%, 75%)',
            }}
          >
            <UserPlus size={14} />
            <span>회원가입</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={cn(
              'flex-1 py-3.5 font-pixel text-[11px] transition-all flex items-center justify-center gap-2',
              mode === 'login'
                ? 'bg-primary text-primary-foreground'
                : 'bg-[#f0ebe0] text-[#8b7355] hover:bg-[#e8e3d8]'
            )}
            style={{
              borderBottom: mode === 'login' ? 'none' : '2px solid hsl(30, 30%, 75%)',
            }}
          >
            <LogIn size={14} />
            <span>로그인</span>
          </button>
        </div>

        <div className="p-5 pt-4">
          {/* Step Indicator (only for signup) - Exact match */}
          {mode === 'signup' && (
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-7 h-7 bg-primary flex items-center justify-center font-pixel text-[10px] text-primary-foreground"
                  style={{ 
                    border: '2px solid hsl(142, 65%, 40%)',
                    boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)'
                  }}
                >
                  1
                </div>
                <span className="font-pixel text-[9px] text-primary">계정 생성</span>
              </div>
              <div className="w-8 h-[2px] bg-[#c4b8a4]" />
              <div className="flex items-center gap-1.5">
                <div 
                  className="w-7 h-7 bg-[#f0ebe0] flex items-center justify-center font-pixel text-[10px] text-[#8b7355]"
                  style={{ 
                    border: '2px solid hsl(30, 30%, 70%)',
                    boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.3)'
                  }}
                >
                  2
                </div>
                <span className="font-pixel text-[9px] text-[#8b7355]">프로필 설정</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="flex items-center gap-1.5 font-pixel text-[10px] text-[#5a4a3a] mb-2">
                <Mail size={12} />
                <span>이메일</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={cn(
                  'w-full px-4 py-3 bg-[#f5f2ea] text-[#5a4a3a] font-body text-sm',
                  'placeholder:text-[#a89880]',
                  'focus:outline-none focus:bg-[#f0ebe0]',
                  errors.email && 'border-destructive'
                )}
                style={{
                  border: '2px solid #d4c8b8',
                  borderRadius: '10px',
                }}
                autoComplete="email"
              />
              {errors.email && (
                <p className="font-pixel text-[8px] text-destructive mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="flex items-center gap-1.5 font-pixel text-[10px] text-[#5a4a3a] mb-2">
                <Lock size={12} />
                <span>비밀번호</span>
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
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
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

            {/* Confirm Password (signup only) */}
            {mode === 'signup' && (
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
            )}

            {/* Submit Button - Exact match */}
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
                <span className="animate-pulse">처리 중...</span>
              ) : mode === 'signup' ? (
                <>
                  <UserPlus size={15} />
                  <span>회원가입</span>
                  <ArrowRight size={15} />
                </>
              ) : (
                <>
                  <LogIn size={15} />
                  <span>로그인</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="font-pixel text-[9px] text-[#8b7355]"
            >
              {mode === 'signup' ? (
                <>이미 계정이 있으신가요? <span className="text-primary hover:underline">로그인</span></>
              ) : (
                <>계정이 없으신가요? <span className="text-primary hover:underline">회원가입</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Diamonds - Exact match */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <span className="text-primary text-lg">◆</span>
        <span className="text-accent text-lg">◆</span>
        <span className="text-primary text-lg">◆</span>
      </div>

      {/* Back Link - Exact match */}
      <Link 
        to="/" 
        className="mt-6 flex items-center gap-2 font-pixel text-[10px] text-[#8b7355] hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} />
        <span>홈으로 돌아가기</span>
      </Link>
    </div>
  );
}
