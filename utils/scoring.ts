export type Gender = 'Male' | 'Female';
export type ToothPosition = '1' | '2' | '3' | '4' | '5' | '6' | '7';
export type Stage = '0' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

// Example demirjian scoring map
// In a full implementation, these tables would properly correspond to Demirjian's exact values for the 7 mandibular teeth.
const maleScores: Record<ToothPosition, Record<Stage, number>> = {
  '1': { '0': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 3.4, 'E': 6.5, 'F': 9.5, 'G': 12.0, 'H': 14.5 },
  '2': { '0': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 3.3, 'E': 5.5, 'F': 8.5, 'G': 10.9, 'H': 13.0 },
  '3': { '0': 0, 'A': 0, 'B': 1.6, 'C': 2.0, 'D': 3.5, 'E': 6.0, 'F': 9.2, 'G': 12.1, 'H': 14.2 },
  '4': { '0': 0, 'A': 1.6, 'B': 1.9, 'C': 2.3, 'D': 2.9, 'E': 5.6, 'F': 9.4, 'G': 13.0, 'H': 15.0 },
  '5': { '0': 0, 'A': 1.6, 'B': 1.9, 'C': 2.3, 'D': 2.9, 'E': 5.6, 'F': 9.4, 'G': 13.0, 'H': 15.0 },
  '6': { '0': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 2.6, 'E': 5.4, 'F': 8.4, 'G': 11.2, 'H': 15.0 },
  '7': { '0': 0, 'A': 1.5, 'B': 2.6, 'C': 3.1, 'D': 4.1, 'E': 6.6, 'F': 9.6, 'G': 12.4, 'H': 14.0 },
};

const femaleScores: Record<ToothPosition, Record<Stage, number>> = {
  '1': { '0': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 3.4, 'E': 6.5, 'F': 9.5, 'G': 12.0, 'H': 14.5 },
  '2': { '0': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 3.3, 'E': 5.5, 'F': 8.5, 'G': 10.9, 'H': 13.0 },
  '3': { '0': 0, 'A': 0, 'B': 1.6, 'C': 2.0, 'D': 3.5, 'E': 6.0, 'F': 9.2, 'G': 12.1, 'H': 14.2 },
  '4': { '0': 0, 'A': 1.6, 'B': 1.9, 'C': 2.3, 'D': 2.9, 'E': 5.6, 'F': 9.4, 'G': 13.0, 'H': 15.0 },
  '5': { '0': 0, 'A': 1.6, 'B': 1.9, 'C': 2.3, 'D': 2.9, 'E': 5.6, 'F': 9.4, 'G': 13.0, 'H': 15.0 },
  '6': { '0': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 2.6, 'E': 5.4, 'F': 8.4, 'G': 11.2, 'H': 15.0 },
  '7': { '0': 0, 'A': 1.5, 'B': 2.6, 'C': 3.1, 'D': 4.1, 'E': 6.6, 'F': 9.6, 'G': 12.4, 'H': 14.0 },
};

// Simplified conversion table - converts total score to age in years (approximate for demo purposes).
// In production, this would match Demirjian percentile lookup tables exactly.
const convertScoreToAge = (score: number, gender: Gender): number => {
  // Rough mock implementation: Score range usually 0-100 mapped to age ~3-16
  if (score === 0) return 0;
  let baseAge = 3 + (score / 100) * 13; 
  if (gender === 'Female') {
    // Females mature faster
    baseAge *= 0.95;
  }
  return parseFloat(baseAge.toFixed(1));
};

export const calculateDentalAge = (
  stages: Record<ToothPosition, Stage>,
  gender: Gender
): { maturity_score: number; dental_age: number } => {
  let score = 0;
  const scoreTable = gender === 'Male' ? maleScores : femaleScores;

  for (const [tooth, stage] of Object.entries(stages) as [ToothPosition, Stage][]) {
    score += scoreTable[tooth][stage] || 0;
  }

  const dental_age = convertScoreToAge(score, gender);

  return {
    maturity_score: parseFloat(score.toFixed(1)),
    dental_age,
  };
};
