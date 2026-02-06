import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import futsalMascot from '@/assets/mascot-pixel-style.png';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PixelEnvelopeIcon } from '@/components/ui/PixelEnvelopeIcon';

const emailSchema = z.string().email('올바른 이메일 형식이 아닙니다');

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setError(emailResult.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: '오류',
        description: '비밀번호 재설정 이메일 발송에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          className="py-3.5 bg-accent text-center"
          style={{
            borderBottom: '3px solid hsl(30, 45%, 60%)',
          }}
        >
          <h1 className="font-pixel text-[12px] text-accent-foreground flex items-center justify-center gap-2">
            <Mail size={14} />
            비밀번호 찾기
          </h1>
        </div>

        <div className="p-5">
          {/* Description */}
          <p className="font-pixel text-[9px] text-[#6b5c4a] text-center mb-5 leading-relaxed">
            가입할 때 사용한 이메일을 입력하시면<br />
            비밀번호 재설정 링크를 보내드립니다.
          </p>

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
                  error && 'border-destructive'
                )}
                style={{
                  border: '2px solid #d4c8b8',
                  borderRadius: '10px',
                }}
                autoComplete="email"
              />
              {error && (
                <p className="font-pixel text-[8px] text-destructive mt-1.5">{error}</p>
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
                background: 'linear-gradient(180deg, hsl(30, 80%, 55%) 0%, hsl(30, 80%, 45%) 100%)',
                border: '3px solid hsl(30, 70%, 35%)',
                borderRadius: '10px',
                boxShadow: '0 4px 0 hsl(30, 60%, 30%), inset 0 1px 0 hsl(30, 80%, 65%)',
              }}
            >
              {isLoading ? (
                <span className="animate-pulse">발송 중...</span>
              ) : (
                <>
                  <Send size={14} />
                  <span>비밀 편지 발송</span>
                </>
              )}
            </button>
          </form>

          {/* Back to login link */}
          <div className="mt-4 text-center">
            <Link
              to="/auth"
              className="font-pixel text-[9px] text-[#8b7355] hover:text-primary transition-colors"
            >
              로그인으로 돌아가기
            </Link>
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
        className="mt-6 flex items-center gap-2 font-pixel text-[10px] text-[#8b7355] hover:text-primary transition-colors"
      >
        <ArrowLeft size={14} />
        <span>홈으로 돌아가기</span>
      </Link>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
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
            {/* Pixel Envelope Icon */}
            <div className="flex justify-center mb-4">
              <PixelEnvelopeIcon size={64} />
            </div>
            
            <h2 className="font-pixel text-[14px] text-primary mb-3">
              비밀 편지 발송 완료!
            </h2>
            <p className="font-pixel text-[9px] text-[#6b5c4a] leading-relaxed mb-4">
              비밀 편지가 발송되었습니다!<br />
              메일함을 확인해주세요.
            </p>
            
            <Link
              to="/auth"
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
              로그인으로 돌아가기
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
