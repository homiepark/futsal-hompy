import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, LogIn, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import logoAuth from '@/assets/logo-auth.png';

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
  const [isSocialLoading, setIsSocialLoading] = useState(false);
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
            data: { display_name: email.split('@')[0] },
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
          // Check if profile is complete
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('user_id', data.user.id)
            .single();

          if (!profile?.nickname) {
            navigate('/profile-setup');
          } else {
            toast({
              title: '👋 환영합니다!',
              description: '로그인되었습니다.',
            });
            navigate('/');
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);

      let errorMessage = '오류가 발생했습니다';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다';
      } else if (error.message?.includes('User already registered')) {
        errorMessage = '이미 등록된 이메일입니다. 로그인해주세요!';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = '이메일 인증이 필요합니다. 받은편지함을 확인해주세요.';
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

  const handleKakaoLogin = async () => {
    setIsSocialLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/profile-setup`,
          scopes: 'profile_nickname profile_image',
        },
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Kakao login error:', error);
      toast({
        title: '카카오 로그인 오류',
        description: '카카오 로그인에 실패했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
      setIsSocialLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setErrors({});
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-6">
      {/* Logo Section */}
      <div className="text-center mb-6">
        <img
          src={logoAuth}
          alt="우리의 풋살 - Our Futsal"
          className="h-24 mx-auto"
        />
      </div>

      {/* Auth Card */}
      <div
        className="w-full max-w-sm bg-card overflow-hidden border-4 border-border-dark"
        style={{
          boxShadow: '6px 6px 0 hsl(var(--pixel-shadow))',
        }}
      >
        {/* Tab Switch */}
        <div className="flex">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={cn(
              'flex-1 py-3.5 font-pixel text-[11px] transition-all flex items-center justify-center gap-2',
              mode === 'signup'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-muted'
            )}
            style={{
              borderBottom: mode === 'signup' ? 'none' : '2px solid hsl(var(--border-dark))',
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
                : 'bg-secondary text-muted-foreground hover:bg-muted'
            )}
            style={{
              borderBottom: mode === 'login' ? 'none' : '2px solid hsl(var(--border-dark))',
            }}
          >
            <LogIn size={14} />
            <span>로그인</span>
          </button>
        </div>

        <div className="p-5 pt-4">
          {/* Step Indicator (only for signup) */}
          {mode === 'signup' && (
            <div className="flex items-center justify-center gap-2 mb-5">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-7 h-7 bg-primary flex items-center justify-center font-pixel text-[10px] text-primary-foreground border-2 border-primary-dark"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.5)' }}
                >
                  1
                </div>
                <span className="font-pixel text-[9px] text-primary">계정 생성</span>
              </div>
              <div className="w-8 h-[2px] bg-border-dark/30" />
              <div className="flex items-center gap-1.5">
                <div
                  className="w-7 h-7 bg-secondary flex items-center justify-center font-pixel text-[10px] text-muted-foreground border-2 border-border-dark"
                  style={{ boxShadow: '2px 2px 0 hsl(var(--pixel-shadow) / 0.3)' }}
                >
                  2
                </div>
                <span className="font-pixel text-[9px] text-muted-foreground">프로필 설정</span>
              </div>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-2 mb-4">
            {/* Kakao Login */}
            <button
              type="button"
              onClick={handleKakaoLogin}
              disabled={isSocialLoading}
              className="w-full py-3 flex items-center justify-center gap-2 font-pixel text-[10px] transition-all hover:brightness-105 active:translate-y-0.5 disabled:opacity-60"
              style={{
                background: '#FEE500',
                color: '#191919',
                border: '3px solid #E5CC00',
                boxShadow: '0 3px 0 #C7B100',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#191919">
                <path d="M12 3C6.48 3 2 6.48 2 10.5c0 2.58 1.72 4.84 4.3 6.12-.19.71-.69 2.57-.79 2.97-.12.49.18.48.38.35.15-.1 2.45-1.66 3.44-2.34.87.13 1.77.2 2.67.2 5.52 0 10-3.48 10-7.8S17.52 3 12 3z"/>
              </svg>
              <span>{isSocialLoading ? '연결 중...' : '카카오로 시작하기'}</span>
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-[2px] bg-border" />
            <span className="font-pixel text-[8px] text-muted-foreground">또는 이메일로</span>
            <div className="flex-1 h-[2px] bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="email@example.com"
                className={cn(
                  'w-full pixel-input',
                  errors.email && 'border-destructive'
                )}
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
                  placeholder="6자 이상"
                  className={cn(
                    'w-full pixel-input pr-12',
                    errors.password && 'border-destructive'
                  )}
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
                  placeholder="비밀번호 재입력"
                  className={cn(
                    'w-full pixel-input',
                    errors.confirmPassword && 'border-destructive'
                  )}
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
              className="w-full py-3.5 bg-primary text-primary-foreground font-pixel text-[12px] flex items-center justify-center gap-2 border-3 border-primary-dark transition-all hover:brightness-110 active:translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                boxShadow: '0 4px 0 hsl(var(--primary-dark)), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
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
          <div className="mt-4 text-center space-y-2">
            <button
              type="button"
              onClick={toggleMode}
              className="font-pixel text-[9px] text-muted-foreground block w-full"
            >
              {mode === 'signup' ? (
                <>이미 계정이 있으신가요? <span className="text-primary hover:underline">로그인</span></>
              ) : (
                <>계정이 없으신가요? <span className="text-primary hover:underline">회원가입</span></>
              )}
            </button>

            {/* Forgot Password Link - only show in login mode */}
            {mode === 'login' && (
              <Link
                to="/forgot-password"
                className="font-pixel text-[9px] text-accent hover:text-accent-dark transition-colors block"
              >
                비밀번호를 잊으셨나요?
              </Link>
            )}
          </div>
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
        className="mt-6 flex items-center gap-2 font-pixel text-[10px] text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} />
        <span>홈으로 돌아가기</span>
      </Link>
    </div>
  );
}
