export type Category = "crypto" | "derivatives" | "dex" | "rwa";

export interface Field {
  key: string;
  label: string;
}

export interface ShownAsset {
  id: string;
  name: string;
  symbol: string;
  value: number;
}

export interface HiddenAssetPreview {
  name: string;
  symbol: string;
}

export interface RoundData {
  roundId: string;
  category: Category;
  field: Field;
  shown: ShownAsset;
  hiddenAsset: HiddenAssetPreview;
}

export interface Difficulty {
  pct: number;
  label: string;
}

export interface GuessResult {
  correct: boolean;
  hiddenValue: number;
  hiddenAsset: HiddenAssetPreview;
  explanation: string;
  difficulty: Difficulty;
  rating: number | null;
  ratingDelta: number | null;
}

export interface DailyResponse {
  date: string;
  rounds: RoundData[];
}

export interface PulseCategoryStat {
  played: number;
  accuracy: number;
}

export interface PulseSummary {
  totalRounds: number;
  overallAccuracy: number;
  categories: Record<string, PulseCategoryStat>;
}

export interface LeaderboardEntry {
  name: string;
  streak: number;
  category: string;
  at: string;
}

export interface Player {
  id: string;
  rating: number;
  gamesPlayed: number;
  correctCount: number;
  bestStreak: number;
}

export type Guess = "higher" | "lower";
