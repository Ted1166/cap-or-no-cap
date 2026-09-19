import type { Category, DailyResponse, Guess, GuessResult, RoundData } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8787";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Request to ${path} failed`);
  return data as T;
}

export function fetchRound(category: Category): Promise<RoundData> {
  return request<RoundData>(`/api/round?category=${category}`);
}

export function submitGuess(roundId: string, guess: Guess): Promise<GuessResult> {
  return request<GuessResult>("/api/guess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roundId, guess }),
  });
}

export function fetchDaily(): Promise<DailyResponse> {
  return request<DailyResponse>("/api/daily");
}
