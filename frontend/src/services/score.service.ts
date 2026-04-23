import { api } from './api';

export interface ScoreComponents {
  regularityScore: number;
  volumeScore: number;
  behaviorScore: number;
  paymentScore: number;
  alternativeScore: number;
}

export type Decision = 'approved' | 'review' | 'waiting' | 'denied';

export interface ScoreResult {
  score: number;
  components?: ScoreComponents;
  regularityScore?: number;
  volumeScore?: number;
  behaviorScore?: number;
  paymentScore?: number;
  alternativeScore?: number;
  creditLimit: number;
  decision: Decision;
  explanationText: string;
  averageMonthlyIncome?: number;
  suggestedRate?: number;
  computedAt?: string;
  calculatedAt?: string;
  fromHistory?: boolean;
}

export const scoreService = {
  async calculate(): Promise<ScoreResult> {
    const { data } = await api.post<ScoreResult>('/score/calculate');
    return data;
  },

  async current(): Promise<ScoreResult> {
    const { data } = await api.get<ScoreResult>('/score/current');
    return data;
  },

  async history() {
    const { data } = await api.get('/score/history');
    return data;
  },
};

export function normalizeComponents(r: ScoreResult): ScoreComponents {
  if (r.components) return r.components;
  return {
    regularityScore: r.regularityScore ?? 0,
    volumeScore: r.volumeScore ?? 0,
    behaviorScore: r.behaviorScore ?? 0,
    paymentScore: r.paymentScore ?? 0,
    alternativeScore: r.alternativeScore ?? 0,
  };
}
