import { prisma } from '../../shared/config/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import { scoreService } from '../score/score.service';

export interface SimulateInput {
  amount: number;
  installments: number;
}

export interface SimulationResult {
  amount: number;
  installments: number;
  monthlyRate: number;
  installmentAmount: number;
  totalAmount: number;
  totalInterest: number;
  iof: number;
}

export class CreditService {
  async simulate(userId: string, input: SimulateInput): Promise<SimulationResult> {
    const score = await scoreService.calculate(userId, false);

    if (input.amount > score.creditLimit) {
      throw new AppError(
        `Valor solicitado (R$ ${input.amount}) excede o limite aprovado (R$ ${score.creditLimit})`,
        400
      );
    }

    if (input.amount < 200) {
      throw new AppError('Valor mínimo é R$ 200', 400);
    }

    if (![3, 6, 12, 18, 24].includes(input.installments)) {
      throw new AppError('Prazo deve ser 3, 6, 12, 18 ou 24 meses', 400);
    }

    const monthlyRate = score.suggestedRate / 100;
    const n = input.installments;
    // Price formula (amortização francesa)
    const installmentAmount =
      monthlyRate === 0
        ? input.amount / n
        : (input.amount * (monthlyRate * (1 + monthlyRate) ** n)) / ((1 + monthlyRate) ** n - 1);

    const totalAmount = installmentAmount * n;
    const totalInterest = totalAmount - input.amount;
    const iof = input.amount * 0.0038; // IOF fixo aproximado

    return {
      amount: input.amount,
      installments: n,
      monthlyRate: score.suggestedRate,
      installmentAmount: round(installmentAmount, 2),
      totalAmount: round(totalAmount, 2),
      totalInterest: round(totalInterest, 2),
      iof: round(iof, 2),
    };
  }

  async request(userId: string, input: SimulateInput & { pixKey?: string }) {
    const score = await scoreService.calculate(userId);

    if (score.decision === 'denied') {
      throw new AppError('Crédito negado no momento. ' + score.explanationText, 403);
    }

    if (input.amount > score.creditLimit) {
      throw new AppError('Valor excede o limite aprovado', 400);
    }

    // Rate limit: max 3 solicitações ativas por usuário
    const activeCount = await prisma.creditRequest.count({
      where: {
        userId,
        status: { in: ['pending', 'approved', 'active'] },
      },
    });
    if (activeCount >= 3) {
      throw new AppError('Limite de 3 solicitações ativas atingido', 429);
    }

    const simulation = await this.simulate(userId, input);

    const status = score.decision === 'approved' ? 'approved' : 'pending';
    const now = new Date();

    const request = await prisma.creditRequest.create({
      data: {
        userId,
        requestedAmount: input.amount,
        approvedAmount: status === 'approved' ? input.amount : null,
        installments: input.installments,
        monthlyRate: simulation.monthlyRate,
        totalAmount: simulation.totalAmount,
        status,
        scoreAtRequest: score.score,
        pixKey: input.pixKey,
        approvedAt: status === 'approved' ? now : null,
        disbursedAt: status === 'approved' ? now : null,
        payments: {
          create: Array.from({ length: input.installments }, (_, i) => ({
            installmentNo: i + 1,
            dueDate: addMonths(now, i + 1),
            amount: simulation.installmentAmount,
            status: 'pending',
          })),
        },
      },
      include: { payments: true },
    });

    return {
      ...request,
      explanation: score.explanationText,
      simulationPreview: simulation,
    };
  }

  async list(userId: string) {
    return prisma.creditRequest.findMany({
      where: { userId },
      include: {
        payments: {
          orderBy: { installmentNo: 'asc' },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async get(userId: string, requestId: string) {
    const request = await prisma.creditRequest.findFirst({
      where: { id: requestId, userId },
      include: {
        payments: {
          orderBy: { installmentNo: 'asc' },
        },
      },
    });
    if (!request) throw new AppError('Solicitação não encontrada', 404);
    return request;
  }

  async payInstallment(userId: string, requestId: string, installmentNo: number) {
    const request = await prisma.creditRequest.findFirst({
      where: { id: requestId, userId },
      include: { payments: true },
    });
    if (!request) throw new AppError('Solicitação não encontrada', 404);

    const payment = request.payments.find((p) => p.installmentNo === installmentNo);
    if (!payment) throw new AppError('Parcela não encontrada', 404);
    if (payment.status === 'paid') throw new AppError('Parcela já paga', 400);

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'paid', paidAt: new Date() },
    });

    // Se todas as parcelas pagas, marca crédito como pago
    const remaining = await prisma.payment.count({
      where: { creditRequestId: requestId, status: { not: 'paid' } },
    });
    if (remaining === 0) {
      await prisma.creditRequest.update({
        where: { id: requestId },
        data: { status: 'paid' },
      });
    }

    return updated;
  }
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function round(n: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

export const creditService = new CreditService();
