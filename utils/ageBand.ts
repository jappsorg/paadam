export type AgeBand = 'k1' | '23' | '45';

export function getAgeBand(grade: string): AgeBand {
  if (grade === 'K' || grade === '1') return 'k1';
  if (grade === '2' || grade === '3') return '23';
  return '45';
}
