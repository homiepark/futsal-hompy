import { useState, useRef } from 'react';
import { ArrowLeft, Save, Camera, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelCard } from '@/components/ui/PixelCard';
import { cn } from '@/lib/utils';

// Futsal positions
const futsalPositions = [
  { id: 'pivo', label: '피보', emoji: '⚡', description: 'Pivot / Forward' },
  { id: 'ala', label: '아라', emoji: '💨', description: 'Winger' },
  { id: 'fixo', label: '픽소', emoji: '🛡️', description: 'Fixed / Defender' },
  { id: 'goleiro', label: '고레이로', emoji: '🧤', description: 'Goalkeeper' },
];

export default function MyProfile() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState({
    nickname: '풋살매니아',
    avatarUrl: '',
    yearsOfExperience: 3,
    isProElite: false,
    preferredPosition: 'ala',
  });

  const [myTeams] = useState([
    { id: '1', name: 'FC 불꽃', emblem: '🔥', role: 'admin' },
    { id: '2', name: '라이언즈 FC', emblem: '🦁', role: 'member' },
  ]);

  const getPositionLabel = (positionId: string) => {
    const position = futsalPositions.find(p => p.id === positionId);
    return position ? position.label : positionId;
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile({ ...profile, avatarUrl: url });
    }
  };

  return (
    <div className="pb-24 max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-primary border-b-4 border-primary-dark p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-8 h-8 bg-primary-foreground/20 border-2 border-primary-dark flex items-center justify-center">
            <ArrowLeft size={18} className="text-primary-foreground" />
          </Link>
          <h1 className="text-sm text-primary-foreground">내 프로필</h1>
        </div>
        <Link to="/messages" className="relative w-10 h-10 bg-primary-foreground/20 border-2 border-primary-dark flex items-center justify-center">
          <Mail size={20} className="text-primary-foreground" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent border border-accent-dark text-[10px] text-accent-foreground flex items-center justify-center">
            2
          </span>
        </Link>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card with Avatar */}
        <PixelCard className="flex flex-col items-center gap-4 py-6">
          {/* Avatar with Edit Button */}
          <div className="relative">
            <div 
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full bg-muted border-4 border-border-dark overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            >
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <span className="text-4xl">👤</span>
                </div>
              )}
            </div>
            <button 
              onClick={handleAvatarClick}
              className="absolute bottom-0 right-0 w-8 h-8 bg-accent border-2 border-accent-dark flex items-center justify-center shadow-[2px_2px_0_hsl(var(--pixel-shadow))]"
            >
              <Camera size={16} className="text-accent-foreground" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Nickname */}
          <div className="text-center">
            <input
              type="text"
              value={profile.nickname}
              onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
              className="text-lg text-foreground bg-transparent border-b-2 border-border focus:border-primary outline-none text-center w-full max-w-[200px]"
            />
            <p className="text-sm text-muted-foreground mt-1">
              경력 {profile.yearsOfExperience}년 · {getPositionLabel(profile.preferredPosition)}
            </p>
          </div>
        </PixelCard>

        {/* Position Selection */}
        <PixelCard>
          <h2 className="text-foreground mb-4 flex items-center gap-2">
            <span className="text-primary">⚽</span>
            포지션 선택
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {futsalPositions.map((pos) => (
              <button
                key={pos.id}
                onClick={() => setProfile({ ...profile, preferredPosition: pos.id })}
                className={cn(
                  'p-3 border-4 transition-all text-center',
                  profile.preferredPosition === pos.id
                    ? 'bg-primary border-primary-dark text-primary-foreground shadow-[0_0_12px_hsl(var(--primary))]'
                    : 'bg-secondary border-border-dark hover:border-primary'
                )}
              >
                <span className="text-xl block mb-1">{pos.emoji}</span>
                <span className="font-pixel text-[10px] block">{pos.label}</span>
                <span className="font-body text-[9px] text-muted-foreground block">{pos.description}</span>
              </button>
            ))}
          </div>
        </PixelCard>

        {/* Experience & Status */}
        <PixelCard>
          <h2 className="text-foreground mb-4 flex items-center gap-2">
            <span className="text-accent">📊</span>
            풋살 경력 정보
          </h2>

          {/* Years of Experience */}
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">
              풋살/축구 경력 (년)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfile({ ...profile, yearsOfExperience: Math.max(0, profile.yearsOfExperience - 1) })}
                className="w-10 h-10 bg-secondary border-4 border-border-dark text-lg shadow-[2px_2px_0_hsl(var(--pixel-shadow))] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_hsl(var(--pixel-shadow))]"
              >
                -
              </button>
              <div className="flex-1 h-10 bg-muted border-4 border-border-dark flex items-center justify-center text-sm">
                {profile.yearsOfExperience}년
              </div>
              <button
                onClick={() => setProfile({ ...profile, yearsOfExperience: profile.yearsOfExperience + 1 })}
                className="w-10 h-10 bg-secondary border-4 border-border-dark text-lg shadow-[2px_2px_0_hsl(var(--pixel-shadow))] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0_hsl(var(--pixel-shadow))]"
              >
                +
              </button>
            </div>
          </div>

          {/* Pro/Elite Status */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">
              프로/엘리트 선수 출신
            </label>
            <button
              onClick={() => setProfile({ ...profile, isProElite: !profile.isProElite })}
              className={cn(
                'w-full py-3 border-4 transition-all',
                profile.isProElite
                  ? 'bg-accent text-accent-foreground border-accent-dark shadow-[4px_4px_0_hsl(var(--accent-dark))]'
                  : 'bg-secondary text-secondary-foreground border-border-dark shadow-[4px_4px_0_hsl(var(--pixel-shadow))]'
              )}
            >
              {profile.isProElite ? '✓ 프로/엘리트 출신입니다' : '해당 없음'}
            </button>
          </div>
        </PixelCard>

        {/* My Teams Section */}
        <PixelCard>
          <h2 className="text-foreground mb-4 flex items-center gap-2">
            <span className="text-accent">🏆</span>
            내 팀 목록
          </h2>

          {myTeams.length > 0 ? (
            <div className="space-y-2">
              {myTeams.map((team) => (
                <div 
                  key={team.id}
                  className="flex items-center gap-3 p-3 bg-muted border-2 border-border-dark"
                >
                  <div className="w-10 h-10 bg-field-green border-2 border-border-dark flex items-center justify-center text-xl">
                    {team.emblem}
                  </div>
                  <div className="flex-1">
                    <p className="text-foreground">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {team.role === 'admin' ? '👑 관리자' : '👤 멤버'}
                    </p>
                  </div>
                  <Link 
                    to={`/team/${team.id}`}
                    className="px-3 py-1 bg-primary text-primary-foreground border-2 border-primary-dark text-xs"
                  >
                    보기
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>아직 소속된 팀이 없습니다</p>
              <Link to="/" className="text-primary text-sm mt-2 inline-block">
                팀 찾기 →
              </Link>
            </div>
          )}
        </PixelCard>

        {/* Save Button */}
        <PixelButton variant="primary" className="w-full flex items-center justify-center gap-2">
          <Save size={16} />
          <span>프로필 저장</span>
        </PixelButton>
      </div>
    </div>
  );
}
