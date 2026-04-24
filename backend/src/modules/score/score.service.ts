import { prisma } from '../../shared/config/prisma';
import type { Transaction } from '@prisma/client';

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
  components: ScoreComponents;
  creditLimit: number;
  decision: Decision;
  explanationText: string;
  averageMonthlyIncome: number;
  suggestedRate: number;
  computedAt: Date;
}

const WEIGHTS = {
  regularityScore: 0.30,
  volumeScore: 0.25,
  behaviorScore: 0.20,
  paymentScore: 0.15,
  alternativeScore: 0.10,
} as const;

const DIM_LABELS: Record<keyof ScoreComponents, string> = {
  regularityScore: 'Regularidade de Renda',
  volumeScore: 'Volume de Movimentação',
  behaviorScore: 'Comportamento de Gastos',
  paymentScore: 'Histórico de Pagamentos',
  alternativeScore: 'Dados Alternativos',
};

const WEAKNESS_MSG: Record<keyof ScoreComponents, string> = {
  regularityScore: 'irregularidade nas entradas de renda',
  volumeScore: 'volume de movimentação abaixo do esperado',
  behaviorScore: 'desequilíbrio entre entradas e saídas',
  paymentScore: 'histórico com transações problemáticas',
  alternativeScore: 'baixa consistência de atividade financeira',
};

export class ScoreService {
  async calculate(userId: string, persist: boolean = true): Promise<ScoreResult> {
    const connections = await prisma.bankConnection.findMany({
      where: { userId, status: 'active' },
      include: { transactions: true },
    });

    const transactions = connections.flatMap((c) => c.transactions);

    if (transactions.length === 0) {
      const result = this.noDataResult();
      if (persist) {
        await prisma.scoreHistory.create({
          data: {
            userId,
            score: 0,
            regularityScore: 0,
            volumeScore: 0,
            behaviorScore: 0,
            paymentScore: 0,
            alternativeScore: 0,
            creditLimit: 0,
            decision: 'denied',
            explanationText: result.explanationText,
          },
        });
      }
      return result;
    }

    const components = this.computeComponents(transactions);
    const rawScore = this.weightedScore(components);
    // Ajuste de tendência: score cai se os últimos 3 scores do usuário mostram queda (Entrevista 7 — Head de Risco)
    const trendMultiplier = await this.getTrendMultiplier(userId);
    const score = Math.round(rawScore * trendMultiplier);
    const avgIncome = this.averageMonthlyIncome(transactions);
    const creditLimit = this.calculateCreditLimit(score, avgIncome);
    const decision = this.makeDecision(score);
    const suggestedRate = this.calculateRate(score);
    const explanationText = this.generateExplanation(components, decision, score);

    if (persist) {
      await prisma.scoreHistory.create({
        data: {
          userId,
          score,
          ...components,
          creditLimit,
          decision,
          explanationText,
        },
      });
    }

    return {
      score,
      components,
      creditLimit,
      decision,
      explanationText,
      averageMonthlyIncome: avgIncome,
      suggestedRate,
      computedAt: new Date(),
    };
  }

  async getCurrent(userId: string) {
    const latest = await prisma.scoreHistory.findFirst({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
    });
    return latest;
  }

  async getHistory(userId: string, limit: number = 12) {
    return prisma.scoreHistory.findMany({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      take: limit,
    });
  }

  private computeComponents(transactions: Transaction[]): ScoreComponents {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const recent = transactions.filter((t) => new Date(t.date) >= ninetyDaysAgo);

    const incomes = recent.filter((t) => t.amount > 0);
    const expenses = recent.filter((t) => t.amount < 0);

    const monthlyIncomes = this.groupByMonth(incomes);
    const regularityScore = this.regularityFromMonthly(monthlyIncomes);

    const avgMonthlyIncome =
      monthlyIncomes.length > 0
        ? monthlyIncomes.reduce((a, b) => a + b, 0) / monthlyIncomes.length
        : 0;
    const volumeScore = Math.min(avgMonthlyIncome / 10000, 1);

    const totalIncome = incomes.reduce((a, t) => a + t.amount, 0);
    const totalExpenses = Math.abs(expenses.reduce((a, t) => a + t.amount, 0));
    const savingsRate = totalIncome > 0 ? Math.max(0, (totalIncome - totalExpenses) / totalIncome) : 0;
    const behaviorScore = Math.min(savingsRate * 2, 1);

    const bouncedCount = recent.filter(
      (t) =>
        t.description.toLowerCase().includes('devolvido') ||
        t.description.toLowerCase().includes('rejeitado') ||
        t.description.toLowerCase().includes('estornado')
    ).length;
    const circularCount = recent.filter((t) => t.isCircular).length;
    const paymentScore = Math.max(0, 1 - bouncedCount / 5 - circularCount / 10);

    const alternativeScore = this.calculateAlternativeScore(recent);

    return {
      regularityScore: round(regularityScore),
      volumeScore: round(volumeScore),
      behaviorScore: round(behaviorScore),
      paymentScore: round(paymentScore),
      alternativeScore: round(alternativeScore),
    };
  }

  private weightedScore(components: ScoreComponents): number {
    const raw = (Object.keys(WEIGHTS) as Array<keyof ScoreComponents>).reduce(
      (acc, key) => acc + components[key] * WEIGHTS[key],
      0
    );
    return Math.round(raw * 1000);
  }

  private regularityFromMonthly(monthly: number[]): number {
    if (monthly.length < 2) return 0.4;
    const mean = monthly.reduce((a, b) => a + b, 0) / monthly.length;
    if (mean <= 0) return 0;
    const variance = monthly.reduce((a, b) => a + (b - mean) ** 2, 0) / monthly.length;
    const cv = Math.sqrt(variance) / mean;
    return Math.max(0, Math.min(1, 1 - cv));
  }

  private averageMonthlyIncome(transactions: Transaction[]): number {
    const incomes = transactions.filter((t) => t.amount > 0);
    const monthly = this.groupByMonth(incomes);
    if (monthly.length === 0) return 0;
    return monthly.reduce((a, b) => a + b, 0) / monthly.length;
  }

  // Limites e decisões mais conservadores (Entrevista 7 — Head de Risco):
  // aprovação automática agora em 750 (antes 700); múltiplos de renda reduzidos.
  private calculateCreditLimit(score: number, avgIncome: number): number {
    if (score >= 850) return round(avgIncome * 3, 2);
    if (score >= 750) return round(avgIncome * 2.5, 2);
    if (score >= 550) return round(avgIncome * 1.2, 2);
    return 0;
  }

  private calculateRate(score: number): number {
    if (score >= 850) return 2.5;
    if (score >= 750) return 3.9;
    if (score >= 550) return 5.9;
    return 7.9;
  }

  private makeDecision(score: number): Decision {
    if (score >= 750) return 'approved';
    if (score >= 550) return 'review';
    if (score >= 300) return 'waiting';
    return 'denied';
  }

  /**
   * Aplica multiplicador de tendência temporal.
   * Se os últimos 3 scores mostram queda > 50 pts entre primeiro e último, penaliza em 5%.
   * Requisito da Entrevista 7 (Head de Risco): "que se ajuste ao comportamento ao longo do tempo".
   */
  private async getTrendMultiplier(userId: string): Promise<number> {
    const recent = await prisma.scoreHistory.findMany({
      where: { userId },
      orderBy: { calculatedAt: 'desc' },
      take: 3,
      select: { score: true },
    });
    if (recent.length < 3) return 1;
    // recent[0] é o mais novo; recent[2] é o mais antigo
    const drop = recent[2].score - recent[0].score;
    return drop > 50 ? 0.95 : 1;
  }

  private generateExplanation(
    components: ScoreComponents,
    decision: Decision,
    score: number
  ): string {
    const entries = Object.entries(components) as [keyof ScoreComponents, number][];
    const [weakestKey] = entries.sort((a, b) => a[1] - b[1])[0];
    const [strongestKey] = entries.sort((a, b) => b[1] - a[1])[0];

    const strength = DIM_LABELS[strongestKey];
    const weakness = WEAKNESS_MSG[weakestKey];

    switch (decision) {
      case 'approved':
        return `Parabéns! Seu NanScore de ${score} demonstra um perfil financeiro sólido. Destaque positivo: ${strength}. Seu crédito foi pré-aprovado e pode ser liberado via Pix.`;
      case 'review':
        return `Seu NanScore é ${score}. Notamos ${weakness}. Seu crédito está disponível com limite reduzido — mantenha sua movimentação ativa para melhorar nas próximas avaliações.`;
      case 'waiting':
        return `Seu NanScore é ${score}. O principal ponto de atenção foi ${weakness}. Continue usando o app para que possamos reavaliar em 30 dias.`;
      case 'denied':
        return `No momento não foi possível aprovar o crédito. O fator principal foi ${weakness}. Recomendamos aguardar 60 dias de movimentação para nova avaliação.`;
    }
  }

  private groupByMonth(transactions: Transaction[]): number[] {
    const byMonth: Record<string, number> = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      byMonth[key] = (byMonth[key] || 0) + t.amount;
    });
    return Object.values(byMonth);
  }

  private calculateAlternativeScore(transactions: Transaction[]): number {
    // Consistência de atividade (frequência + recência)
    const frequency = Math.min(transactions.length / 90, 1); // 1 tx/dia em 90 dias = max
    const recency = transactions.length > 0 ? 0.8 : 0;

    // Consistência de dia da semana (atividade distribuída é melhor)
    const dayDist: Record<number, number> = {};
    transactions.forEach((t) => {
      const d = new Date(t.date).getDay();
      dayDist[d] = (dayDist[d] || 0) + 1;
    });
    const activeDays = Object.keys(dayDist).length;
    const dayConsistency = activeDays / 7;

    // Consistência de horário (Entrevista 7 — Head de Risco):
    // horários concentrados em um turno indicam rotina de trabalho (bom);
    // horários totalmente aleatórios indicam inconsistência (ruim).
    // Calculamos a entropia normalizada sobre 4 turnos de 6h e invertemos.
    const hourBuckets = [0, 0, 0, 0]; // 0-6, 6-12, 12-18, 18-24
    transactions.forEach((t) => {
      const h = new Date(t.date).getHours();
      hourBuckets[Math.floor(h / 6)]++;
    });
    const hourConsistency = this.hourConsistencyScore(hourBuckets);

    return (frequency + recency + dayConsistency + hourConsistency) / 4;
  }

  /**
   * Converte distribuição em 4 turnos de 6h em score 0..1.
   * 1 = atividade concentrada em poucos turnos (rotina consistente).
   * 0 = atividade totalmente espalhada (padrão errático).
   */
  private hourConsistencyScore(buckets: number[]): number {
    const total = buckets.reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    const probs = buckets.map((c) => c / total).filter((p) => p > 0);
    // Entropia de Shannon normalizada (máx = log2(4) = 2)
    const entropy = -probs.reduce((acc, p) => acc + p * Math.log2(p), 0);
    const normalized = entropy / 2;
    return 1 - normalized;
  }

  private noDataResult(): ScoreResult {
    return {
      score: 0,
      components: {
        regularityScore: 0,
        volumeScore: 0,
        behaviorScore: 0,
        paymentScore: 0,
        alternativeScore: 0,
      },
      creditLimit: 0,
      decision: 'denied',
      explanationText:
        'Nenhum dado financeiro conectado. Conecte sua conta bancária via Open Finance para calcular seu NanScore.',
      averageMonthlyIncome: 0,
      suggestedRate: 0,
      computedAt: new Date(),
    };
  }
}

function round(n: number, decimals: number = 4): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

export const scoreService = new ScoreService();
