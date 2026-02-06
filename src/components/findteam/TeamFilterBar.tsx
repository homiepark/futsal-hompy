import { cn } from '@/lib/utils';

interface FilterDropdownProps {
  label: string;
  options: string[];
  className?: string;
}

function FilterDropdown({ label, options, className }: FilterDropdownProps) {
  return (
    <div className={cn("relative", className)}>
      <select 
        className="appearance-none bg-card border-2 border-border-dark px-3 py-2 pr-8 font-body text-sm rounded-none cursor-pointer
                   focus:outline-none focus:border-primary
                   shadow-[2px_2px_0_hsl(var(--pixel-shadow))]"
        defaultValue=""
      >
        <option value="" disabled>{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-foreground">
        ▼
      </div>
    </div>
  );
}

export function TeamFilterBar() {
  const genderOptions = ['남성', '여성', '혼성'];
  const regionOptions = ['서울', '경기', '부산', '인천', '대구', '대전', '광주'];
  const levelOptions = ['S', 'A', 'B', 'C (초급)'];
  const dayTypeOptions = ['평일', '주말'];
  const timeOfDayOptions = ['오전', '오후'];
  const hourOptions = ['6시', '7시', '8시', '9시', '10시', '11시', '12시'];

  return (
    <div className="bg-secondary/50 p-4 border-y-4 border-border-dark">
      <div className="flex flex-wrap gap-2">
        <FilterDropdown label="성별" options={genderOptions} />
        <FilterDropdown label="지역" options={regionOptions} />
        <FilterDropdown label="실력" options={levelOptions} />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="font-body text-sm text-muted-foreground flex items-center">⏰ 훈련 일정:</span>
        <FilterDropdown label="요일" options={dayTypeOptions} />
        <FilterDropdown label="시간대" options={timeOfDayOptions} />
        <FilterDropdown label="시각" options={hourOptions} />
      </div>
    </div>
  );
}
