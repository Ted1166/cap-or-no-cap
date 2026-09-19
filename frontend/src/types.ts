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

export interface GuessResult {
  correct: boolean;
  hiddenValue: number;
  hiddenAsset: HiddenAssetPreview;
  explanation: string;
}

export interface DailyResponse {
  date: string;
  rounds: RoundData[];
}

export type Guess = "higher" | "lower";
