/**
 * 프로필에 저장된 경력 + 입력 시점부터 경과한 시간을 합산하여 현재 경력을 계산
 */
export function calculateCurrentExperience(
  savedYears: number,
  savedMonths: number,
  experienceSetAt: string | null | undefined
): { years: number; months: number } {
  if (!experienceSetAt) {
    return { years: savedYears, months: savedMonths };
  }

  const setDate = new Date(experienceSetAt);
  const now = new Date();

  // 경과 개월 수 계산
  const elapsedMonths =
    (now.getFullYear() - setDate.getFullYear()) * 12 +
    (now.getMonth() - setDate.getMonth());

  if (elapsedMonths <= 0) {
    return { years: savedYears, months: savedMonths };
  }

  const totalMonths = savedYears * 12 + savedMonths + elapsedMonths;
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
  };
}

/**
 * 경력을 읽기 좋은 문자열로 변환
 */
export function formatExperience(years: number, months: number): string {
  if (years > 0 && months > 0) return `${years}년 ${months}개월`;
  if (years > 0) return `${years}년`;
  if (months > 0) return `${months}개월`;
  return '입문';
}
