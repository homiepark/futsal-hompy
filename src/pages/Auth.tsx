import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { PixelCard } from '@/components/ui/PixelCard';
import { PixelButton } from '@/components/ui/PixelButton';
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

    // Email validation
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    // Password validation
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }

    // Confirm password for signup
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
          // Redirect to profile setup
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
      {/* Logo/Title */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-primary border-4 border-primary-dark flex items-center justify-center"
          style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
        >
          <span className="text-4xl">⚽</span>
        </div>
        <h1 className="font-pixel text-lg text-primary mb-1">우리의풋살</h1>
        <p className="font-pixel text-xs text-muted-foreground">Our Futsal</p>
      </div>

      {/* Auth Card */}
      <PixelCard className="w-full max-w-sm">
        {/* Tab Switch */}
        <div className="flex mb-6 border-3 border-border-dark overflow-hidden"
          style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
        >
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={cn(
              'flex-1 py-3 font-pixel text-[10px] uppercase transition-colors',
              mode === 'signup'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-muted'
            )}
          >
            <UserPlus size={14} className="inline mr-1" />
            회원가입
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={cn(
              'flex-1 py-3 font-pixel text-[10px] uppercase transition-colors border-l-2 border-border-dark',
              mode === 'login'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-muted'
            )}
          >
            <LogIn size={14} className="inline mr-1" />
            로그인
          </button>
        </div>

        {/* Step Indicator (only for signup) */}
        {mode === 'signup' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary border-3 border-primary-dark flex items-center justify-center font-pixel text-[10px] text-primary-foreground"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                1
              </div>
              <span className="font-pixel text-[9px] text-primary">계정 생성</span>
            </div>
            <div className="w-8 h-1 bg-border-dark" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted border-3 border-border-dark flex items-center justify-center font-pixel text-[10px] text-muted-foreground"
                style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow))' }}
              >
                2
              </div>
              <span className="font-pixel text-[9px] text-muted-foreground">프로필 설정</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block font-pixel text-[10px] text-foreground mb-2">
              <Mail size={12} className="inline mr-1" />
              이메일
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className={cn(
                'w-full pixel-input',
                errors.email && 'border-destructive focus:border-destructive'
              )}
              autoComplete="email"
            />
            {errors.email && (
              <p className="font-pixel text-[8px] text-destructive mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block font-pixel text-[10px] text-foreground mb-2">
              <Lock size={12} className="inline mr-1" />
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  'w-full pixel-input pr-10',
                  errors.password && 'border-destructive focus:border-destructive'
                )}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="font-pixel text-[8px] text-destructive mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password (signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block font-pixel text-[10px] text-foreground mb-2">
                <Lock size={12} className="inline mr-1" />
                비밀번호 확인
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={cn(
                  'w-full pixel-input',
                  errors.confirmPassword && 'border-destructive focus:border-destructive'
                )}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="font-pixel text-[8px] text-destructive mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <PixelButton
            type="submit"
            variant={mode === 'signup' ? 'primary' : 'accent'}
            size="lg"
            disabled={isLoading}
            className="w-full py-4 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              '처리 중...'
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
              </>
            )}
          </PixelButton>
        </form>

        {/* Toggle Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="font-pixel text-[9px] text-muted-foreground hover:text-primary transition-colors"
          >
            {mode === 'signup' ? (
              <>이미 계정이 있으신가요? <span className="text-primary">로그인</span></>
            ) : (
              <>계정이 없으신가요? <span className="text-primary">회원가입</span></>
            )}
          </button>
        </div>
      </PixelCard>

      {/* Decorative Elements */}
      <div className="flex justify-center gap-2 mt-6">
        <span className="text-primary animate-pixel-pulse">◆</span>
        <span className="text-accent animate-pixel-pulse" style={{ animationDelay: '0.3s' }}>◆</span>
        <span className="text-primary animate-pixel-pulse" style={{ animationDelay: '0.6s' }}>◆</span>
      </div>

      {/* Skip Link (for testing) */}
      <Link 
        to="/" 
        className="mt-4 font-pixel text-[9px] text-muted-foreground hover:text-foreground transition-colors"
      >
        ← 홈으로 돌아가기
      </Link>
    </div>
  );
}
