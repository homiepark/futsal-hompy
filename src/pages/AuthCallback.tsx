import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/auth');
        return;
      }

      // 프로필이 있고 닉네임이 설정되어 있으면 홈으로
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('user_id', user.id)
        .single();

      if (profile && profile.nickname && profile.nickname.trim() !== '') {
        navigate('/');
      } else {
        navigate('/profile-setup');
      }
    };

    checkProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-primary border-4 border-primary-dark flex items-center justify-center animate-pixel-pulse"
          style={{ boxShadow: '4px 4px 0 hsl(var(--pixel-shadow))' }}
        >
          <span className="text-2xl">⚽</span>
        </div>
        <p className="font-pixel text-xs text-muted-foreground">로그인 확인 중...</p>
      </div>
    </div>
  );
}
