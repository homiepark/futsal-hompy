// Shared data constants for team creation and filtering
// This ensures perfect sync between Create Team form and Home Screen filters

// Region data with districts - used in both CreateTeam and AdvancedFilterBar
export const regionData: Record<string, string[]> = {
  '서울': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구'],
  '경기': ['고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '여주시', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
  '인천': ['계양구', '남동구', '동구', '미추홀구', '부평구', '서구', '연수구', '중구', '강화군', '옹진군'],
  '부산': ['강서구', '금정구', '기장군', '남구', '동구', '동래구', '부산진구', '북구', '사상구', '사하구', '서구', '수영구', '연제구', '영도구', '중구', '해운대구'],
  '대구': ['남구', '달서구', '달성군', '동구', '북구', '서구', '수성구', '중구'],
  '대전': ['대덕구', '동구', '서구', '유성구', '중구'],
  '광주': ['광산구', '남구', '동구', '북구', '서구'],
  '울산': ['남구', '동구', '북구', '울주군', '중구'],
  '세종': ['세종시'],
  '강원': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
  '충북': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시'],
  '충남': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
  '전북': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
  '전남': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
  '경북': ['경산시', '경주시', '고령군', '구미시', '군위군', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
  '경남': ['거제시', '거창군', '고성군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
  '제주': ['서귀포시', '제주시'],
};

export const regions = Object.keys(regionData);

// Gender options - DB uses 'male', 'female', 'mixed' values
export const genderOptions = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'mixed', label: '혼성' },
] as const;

export type GenderValue = typeof genderOptions[number]['value'];

// Level options with descriptions - used for team creation and filtering
export const levelOptions = [
  { 
    value: 'S', 
    label: 'S급', 
    desc: '압도적 전력의 군단',
    detail: '선수급 기술과 완벽한 전술을 갖춘 프로 지향 팀',
    icon: '🏆'
  },
  { 
    value: 'A', 
    label: 'A급', 
    desc: '지역구 강호',
    detail: '수준 높은 경기와 팽팽한 승부를 즐기는 베테랑 팀',
    icon: '⭐'
  },
  { 
    value: 'B', 
    label: 'B급', 
    desc: '안정적인 베테랑',
    detail: '탄탄한 기본기와 매너를 겸비한 실력파 팀',
    icon: '💪'
  },
  { 
    value: 'C', 
    label: 'C급', 
    desc: '성장하는 도전자',
    detail: '함께 배우며 성장하는 활기찬 루키 팀',
    icon: '🌟'
  },
] as const;

export type LevelValue = typeof levelOptions[number]['value'];

// Training days - DB uses Korean single characters
export const trainingDays = [
  { value: '월', label: '월' },
  { value: '화', label: '화' },
  { value: '수', label: '수' },
  { value: '목', label: '목' },
  { value: '금', label: '금' },
  { value: '토', label: '토' },
  { value: '일', label: '일' },
] as const;

export type DayValue = typeof trainingDays[number]['value'];

// Time options for training schedule
export const timeOptions = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return { value: `${hour}:00`, label: `${hour}:00` };
});

// Time slot options for filtering
export const timeSlotOptions = [
  { value: 'morning', label: '오전 (06-12시)', startHour: 6, endHour: 12 },
  { value: 'afternoon', label: '오후 (12-18시)', startHour: 12, endHour: 18 },
  { value: 'evening', label: '저녁 (18-24시)', startHour: 18, endHour: 24 },
] as const;

// Helper function to determine time slot from specific time
export function getTimeSlot(time: string): string | null {
  if (!time) return null;
  const hour = parseInt(time.split(':')[0], 10);
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 || hour < 6) return 'evening';
  return null;
}

// Helper to get gender label from value
export function getGenderLabel(value: string): string {
  return genderOptions.find(g => g.value === value)?.label || value;
}

// Helper to get level label from value
export function getLevelLabel(value: string): string {
  return levelOptions.find(l => l.value === value)?.label || `Lv.${value}`;
}
