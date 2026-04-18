/**
 * Mastery Adapter for kidpen.space
 * Scales difficulty based on pyBKT mastery tracking
 */

export interface MasteryData {
  subjectId: string;
  topicId: string;
  masteryLevel: number; // 0-1
  attempts: number;
  avgResponseTime: number;
  errorPattern?: string[];
}

export interface DifficultyConfig {
  questionComplexity: 'basic' | 'intermediate' | 'advanced';
  hintFrequency: 'high' | 'medium' | 'low';
  scaffoldLevel: number; // 1-5
  timeLimit?: number;
  allowCalculator: boolean;
}

const SUBJECT_DIFFICULTY_MAP = {
  math: {
    basic: ['คำนวณ', 'บวก', 'ลบ', 'คูณ', 'หาร', 'พื้นฐาน'],
    intermediate: ['แก้สมการ', 'หาค่า', 'คำนวณซับซ้อน'],
    advanced: ['พิสูจน์', 'วิเคราะห์', 'ประยุกต์'],
  },
  physics: {
    basic: ['กำหนดการ', 'ระบุ', 'จำ'],
    intermediate: ['คำนวณ', 'อธิบายกลไก'],
    advanced: ['วิเคราะห์', 'ออกแบบ', 'ประเมิน'],
  },
  chemistry: {
    basic: ['ระบุ', 'จัด', 'รู้จัก'],
    intermediate: ['เขียนสมการ', 'ทำนาย', 'คำนวณ'],
    advanced: ['สังเคราะห์', 'วิเคราะห์', 'ประยุกต์'],
  },
  biology: {
    basic: ['ระบุ', 'อธิบาย', 'จำ'],
    intermediate: ['เปรียบเทียบ', 'อธิบายกระบวนการ'],
    advanced: ['วิเคราะห์', 'ประเมิน', 'ออกแบบ'],
  },
} as const;

export function adaptDifficultyToMastery(
  masteryData: MasteryData,
  baseDifficulty: DifficultyConfig
): DifficultyConfig {
  const { masteryLevel, avgResponseTime } = masteryData;
  const responsePenalty = avgResponseTime > 60 ? 0.1 : avgResponseTime > 120 ? 0.2 : 0;

  const adjustedMastery = Math.max(0, masteryLevel - responsePenalty);

  let newComplexity: DifficultyConfig['questionComplexity'];
  let newHintFrequency: DifficultyConfig['hintFrequency'];
  let newScaffoldLevel: number;

  if (adjustedMastery < 0.3) {
    newComplexity = 'basic';
    newHintFrequency = 'high';
    newScaffoldLevel = 5;
  } else if (adjustedMastery < 0.5) {
    newComplexity = 'basic';
    newHintFrequency = 'high';
    newScaffoldLevel = 4;
  } else if (adjustedMastery < 0.7) {
    newComplexity = 'intermediate';
    newHintFrequency = 'medium';
    newScaffoldLevel = 3;
  } else if (adjustedMastery < 0.85) {
    newComplexity = 'intermediate';
    newHintFrequency = 'low';
    newScaffoldLevel = 2;
  } else {
    newComplexity = 'advanced';
    newHintFrequency = 'low';
    newScaffoldLevel = 1;
  }

  return {
    ...baseDifficulty,
    questionComplexity: newComplexity,
    hintFrequency: newHintFrequency,
    scaffoldLevel: newScaffoldLevel,
  };
}

export function getKeywordsForComplexity(
  subject: keyof typeof SUBJECT_DIFFICULTY_MAP,
  complexity: DifficultyConfig['questionComplexity']
): string[] {
  return SUBJECT_DIFFICULTY_MAP[subject]?.[complexity] ?? SUBJECT_DIFFICULTY_MAP.math.basic;
}

export function estimateMasteryFromPerformance(
  correctCount: number,
  totalAttempts: number,
  avgTimeSeconds: number
): number {
  if (totalAttempts === 0) return 0;

  const accuracy = correctCount / totalAttempts;
  const timeFactor = Math.min(1, 60 / Math.max(1, avgTimeSeconds));

  const rawMastery = accuracy * 0.7 + timeFactor * 0.3;
  return Math.min(1, Math.max(0, rawMastery));
}

export function shouldIncreaseDifficulty(
  currentMastery: number,
  lastThreeCorrect: boolean[]
): boolean {
  if (lastThreeCorrect.length < 3) return false;
  
  const recentCorrect = lastThreeCorrect.slice(-3).filter(Boolean).length;
  return recentCorrect === 3 && currentMastery < 0.85;
}

export function shouldDecreaseDifficulty(
  currentMastery: number,
  recentMistakes: number
): boolean {
  return recentMistakes >= 2 && currentMastery > 0.3;
}

export interface pyBKTParams {
  prior: number;
  learnA: number; // Learning rate
  guess: number;  // Probability of guessing correctly
  slip: number;   // Probability of making a mistake despite knowing
}

export const DEFAULT_BKT_PARAMS: Record<string, pyBKTParams> = {
  default: { prior: 0.5, learnA: 0.2, guess: 0.1, slip: 0.1 },
  math: { prior: 0.4, learnA: 0.15, guess: 0.15, slip: 0.1 },
  science: { prior: 0.35, learnA: 0.1, guess: 0.2, slip: 0.15 },
};

export function calculateBKTMastery(
  params: pyBKTParams,
  observedCorrect: boolean,
  previousMastery: number
): number {
  const { learnA, guess, slip } = params;

  const P = previousMastery; // P(K=1|R, params, prev)
  const PG = guess; // P(G)
  const PS = slip;  // P(S)

  // Update mastery using BKT formula
  let newMastery: number;

  if (observedCorrect) {
    const numerator = P * (1 - PS);
    const denominator = P * (1 - PS) + (1 - P) * PG;
    newMastery = numerator / denominator;
  } else {
    const numerator = P * PS;
    const denominator = P * PS + (1 - P) * (1 - PG);
    newMastery = numerator / denominator;
  }

  // Apply learning factor
  const learnedMastery = newMastery + learnA * (1 - newMastery);
  
  return Math.min(1, Math.max(0, learnedMastery));
}

export function calculateMasteryTrajectory(
  initialMastery: number,
  targetMastery: number,
  params: pyBKTParams
): number[] {
  const trajectory: number[] = [initialMastery];
  let current = initialMastery;

  while (current < targetMastery && trajectory.length < 100) {
    current = calculateBKTMastery(params, true, current);
    trajectory.push(current);
  }

  return trajectory;
}

export function getRecommendedQuestionsForMastery(
  masteryLevel: number,
  subject: keyof typeof SUBJECT_DIFFICULTY_MAP
): {
  count: number;
  difficulty: string;
  timeEstimate: number;
} {
  if (masteryLevel < 0.3) {
    return {
      count: 3,
      difficulty: 'basic',
      timeEstimate: 15,
    };
  } else if (masteryLevel < 0.6) {
    return {
      count: 5,
      difficulty: 'intermediate',
      timeEstimate: 25,
    };
  } else if (masteryLevel < 0.85) {
    return {
      count: 7,
      difficulty: 'mixed',
      timeEstimate: 35,
    };
  } else {
    return {
      count: 10,
      difficulty: 'advanced',
      timeEstimate: 45,
    };
  }
}