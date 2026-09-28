import type {
  Category,
  DailyResponse,
  Guess,
  GuessResult,
  LeaderboardEntry,
  Player,
  PulseSummary,
  RoundData,
} from "./types";
import { getPlayerId } from "./player";

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

export function submitGuess(roundId: string, guess: Guess, currentStreak: number): Promise<GuessResult> {
  return request<GuessResult>("/api/guess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roundId, guess, playerId: getPlayerId(), currentStreak }),
  });
}

export function fetchDaily(): Promise<DailyResponse> {
  return request<DailyResponse>("/api/daily");
}

export function fetchPulse(): Promise<PulseSummary> {
  return request<PulseSummary>("/api/pulse");
}

export function fetchLeaderboard(): Promise<{ leaderboard: LeaderboardEntry[] }> {
  return request("/api/leaderboard");
}

export function submitLeaderboardEntry(name: string, streak: number, category: string) {
  return request<{ leaderboard: LeaderboardEntry[] }>("/api/leaderboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, streak, category }),
  });
}

export function fetchPlayer(): Promise<Player> {
  return request<Player>(`/api/player/${getPlayerId()}`);
}
