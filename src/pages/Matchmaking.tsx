import { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { PixelInput } from '@/components/ui/PixelInput';
import { PixelButton } from '@/components/ui/PixelButton';
import { PixelBadge } from '@/components/ui/PixelBadge';
import { TeamCard } from '@/components/matchmaking/TeamCard';

const mockTeams = [
  { name: 'FC 번개', region: '서울 강남', level: 'S' as const, members: 12, gender: '남성' as const, avgExperience: 8, hasProPlayer: true },
  { name: '선데이 풋살', region: '서울 마포', level: 'A' as const, members: 10, gender: '혼성' as const, avgExperience: 5, hasProPlayer: false },
  { name: '레이디스 FC', region: '경기 성남', level: 'B' as const, members: 15, gender: '여성' as const, avgExperience: 3, hasProPlayer: false },
  { name: '올드보이즈', region: '서울 송파', level: 'A' as const, members: 14, gender: '남성' as const, avgExperience: 12, hasProPlayer: true },
  { name: '위클리 킥', region: '인천 연수', level: 'C' as const, members: 8, gender: '혼성' as const, avgExperience: 2, hasProPlayer: false },
];

const regions = ['전체', '서울', '경기', '인천', '부산'];
const genders = ['전체', '남성', '여성', '혼성'];
const levels = ['전체', 'S', 'A', 'B', 'C'];

export default function Matchmaking() {
  const [selectedRegion, setSelectedRegion] = useState('전체');
  const [selectedGender, setSelectedGender] = useState('전체');
  const [selectedLevel, setSelectedLevel] = useState('전체');

  return (
    <div className="pb-20 px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-pixel text-xs text-foreground flex items-center gap-2 mb-4">
          <span className="text-primary">✦</span>
          스마트 매칭
        </h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <PixelInput placeholder="팀 이름으로 검색..." className="pl-10" />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div>
            <p className="font-pixel text-[8px] text-muted-foreground mb-2">지역</p>
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`pixel-badge ${
                    selectedRegion === region 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-pixel text-[8px] text-muted-foreground mb-2">성별</p>
            <div className="flex flex-wrap gap-2">
              {genders.map((gender) => (
                <button
                  key={gender}
                  onClick={() => setSelectedGender(gender)}
                  className={`pixel-badge ${
                    selectedGender === gender 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-pixel text-[8px] text-muted-foreground mb-2">레벨</p>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`pixel-badge ${
                    selectedLevel === level 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {level === '전체' ? level : `Lv.${level}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Level Legend */}
      <div className="bg-secondary p-3 border-2 border-border-dark shadow-pixel-sm mb-6">
        <p className="font-pixel text-[8px] text-foreground mb-2">📊 레벨 산정 기준</p>
        <div className="grid grid-cols-2 gap-2 font-body text-xs text-muted-foreground">
          <div><PixelBadge variant="level-s">S</PixelBadge> 프로/엘리트 + 10년+</div>
          <div><PixelBadge variant="level-a">A</PixelBadge> 경력 7년+ 또는 프로출신</div>
          <div><PixelBadge variant="level-b">B</PixelBadge> 경력 3-6년</div>
          <div><PixelBadge variant="level-c">C</PixelBadge> 경력 3년 미만</div>
        </div>
      </div>

      {/* Team List */}
      <div className="space-y-4">
        {mockTeams.map((team, index) => (
          <TeamCard key={index} {...team} />
        ))}
      </div>
    </div>
  );
}
