import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      {/* Mascot Logo */}
      <div className="text-center mb-6">
        {/* Pixel Character */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="w-full h-full bg-primary border-4 border-primary-dark rounded-lg flex items-center justify-center"
            style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
          >
            <span className="text-5xl animate-pixel-bounce">⚽</span>
          </div>
          {/* Decorative Ball */}
          <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-accent border-2 border-accent-dark rounded-full flex items-center justify-center"
            style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
          >
            <span className="text-sm">🏃</span>
          </div>
        </div>
        
        {/* Title with 3D Effect */}
        <h1 className="font-pixel text-2xl text-primary mb-1 relative"
          style={{
            textShadow: '2px 2px 0 hsl(var(--primary-dark)), 3px 3px 0 hsl(var(--pixel-shadow))'
          }}
        >
          우리의풋살
        </h1>
        <p className="font-pixel text-xs text-muted-foreground tracking-wider">Our Futsal</p>
      </div>

      {/* Auth Card - Rounded with Thick Borders */}
      <div className="w-full max-w-sm bg-card border-4 border-border-dark rounded-2xl overflow-hidden"
        style={{ 
          boxShadow: '6px 6px 0 hsl(var(--pixel-shadow) / 0.3)',
        }}
      >
        {/* Tab Switch */}
        <div className="flex">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={cn(
              'flex-1 py-4 font-pixel text-[11px] transition-colors flex items-center justify-center gap-2',
              mode === 'signup'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-muted'
            )}
          >
            <UserPlus size={16} />
            <span>회원가입</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={cn(
              'flex-1 py-4 font-pixel text-[11px] transition-colors flex items-center justify-center gap-2',
              mode === 'login'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-muted'
            )}
          >
            <LogIn size={16} />
            <span>로그인</span>
          </button>
        </div>

        <div className="p-6">
          {/* Step Indicator (only for signup) */}
          {mode === 'signup' && (
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary border-2 border-primary-dark flex items-center justify-center font-pixel text-[10px] text-primary-foreground"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  1
                </div>
                <span className="font-pixel text-[9px] text-primary">계정 생성</span>
              </div>
              <div className="w-6 h-0.5 bg-border-dark" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-muted border-2 border-border-dark flex items-center justify-center font-pixel text-[10px] text-muted-foreground"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
                >
                  2
                </div>
                <span className="font-pixel text-[9px] text-muted-foreground">프로필 설정</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="flex items-center gap-1.5 font-pixel text-[10px] text-foreground mb-2">
                <Mail size={12} />
                <span>이메일</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className={cn(
                  'w-full px-4 py-3 bg-muted border-2 border-border-dark rounded-xl font-body text-sm',
                  'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                  'placeholder:text-muted-foreground/60',
                  errors.email && 'border-destructive focus:border-destructive'
                )}
                style={{ boxShadow: 'inset 2px 2px 4px hsl(var(--pixel-shadow) / 0.1)' }}
                autoComplete="email"
              />
              {errors.email && (
                <p className="font-pixel text-[8px] text-destructive mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="flex items-center gap-1.5 font-pixel text-[10px] text-foreground mb-2">
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
                    'w-full px-4 py-3 pr-12 bg-muted border-2 border-border-dark rounded-xl font-body text-sm',
                    'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                    'placeholder:text-muted-foreground/60',
                    errors.password && 'border-destructive focus:border-destructive'
                  )}
                  style={{ boxShadow: 'inset 2px 2px 4px hsl(var(--pixel-shadow) / 0.1)' }}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                <label className="flex items-center gap-1.5 font-pixel text-[10px] text-foreground mb-2">
                  <Lock size={12} />
                  <span>비밀번호 확인</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    'w-full px-4 py-3 bg-muted border-2 border-border-dark rounded-xl font-body text-sm',
                    'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
                    'placeholder:text-muted-foreground/60',
                    errors.confirmPassword && 'border-destructive focus:border-destructive'
                  )}
                  style={{ boxShadow: 'inset 2px 2px 4px hsl(var(--pixel-shadow) / 0.1)' }}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="font-pixel text-[8px] text-destructive mt-1.5">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-4 font-pixel text-[11px] text-primary-foreground',
                'bg-primary border-3 border-primary-dark rounded-xl',
                'flex items-center justify-center gap-2',
                'transition-all duration-100',
                'hover:brightness-110',
                'active:translate-x-0.5 active:translate-y-0.5',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
              style={{
                boxShadow: '4px 4px 0 hsl(var(--primary-dark)), inset 0 2px 0 hsl(0 0% 100% / 0.2)'
              }}
            >
              {isLoading ? (
                <span className="animate-pulse">처리 중...</span>
              ) : mode === 'signup' ? (
                <>
                  <UserPlus size={16} />
                  <span>회원가입</span>
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>로그인</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="font-pixel text-[9px] text-muted-foreground hover:text-primary transition-colors"
            >
              {mode === 'signup' ? (
                <>이미 계정이 있으신가요? <span className="text-primary underline">로그인</span></>
              ) : (
                <>계정이 없으신가요? <span className="text-primary underline">회원가입</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Diamonds */}
      <div className="flex justify-center gap-3 mt-6">
        <span className="text-primary animate-pixel-pulse text-lg">◆</span>
        <span className="text-accent animate-pixel-pulse text-lg" style={{ animationDelay: '0.3s' }}>◆</span>
        <span className="text-primary animate-pixel-pulse text-lg" style={{ animationDelay: '0.6s' }}>◆</span>
      </div>

      {/* Back Link */}
      <Link 
        to="/" 
        className="mt-5 flex items-center gap-2 font-pixel text-[10px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        <span>홈으로 돌아가기</span>
      </Link>
    </div>
  );
}
