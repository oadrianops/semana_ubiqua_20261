import { prisma } from '../../shared/config/prisma';
import { AppError } from '../../shared/middleware/error.middleware';
import {
  generateMockTransactions,
  detectCircularTransactions,
  SUPPORTED_INSTITUTIONS,
} from './mock-data.generator';

export class OpenFinanceService {
  listInstitutions() {
    return SUPPORTED_INSTITUTIONS;
  }

  async getConnections(userId: string) {
    return prisma.bankConnection.findMany({
      where: { userId, status: 'active' },
      include: { _count: { select: { transactions: true } } },
      orderBy: { connectedAt: 'desc' },
    });
  }

  async connect(userId: string, institutionId: string) {
    const institution = SUPPORTED_INSTITUTIONS.find((i) => i.id === institutionId);
    if (!institution) {
      throw new AppError('Instituição não suportada', 400);
    }

    // Requer consentimentos
    const consents = await prisma.consent.findMany({
      where: { userId, granted: true },
    });
    const hasRequired = ['transactions', 'balance'].every((cat) =>
      consents.some((c) => c.category === cat)
    );
    if (!hasRequired) {
      throw new AppError(
        'Consentimento explícito necessário para transações e saldo (LGPD/Open Finance)',
        403
      );
    }

    const existing = await prisma.bankConnection.findFirst({
      where: { userId, institution: institution.name, status: 'active' },
    });
    if (existing) {
      throw new AppError('Conta já conectada', 409);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Usuário não encontrado', 404);

    const connection = await prisma.bankConnection.create({
      data: {
        userId,
        institution: institution.name,
        status: 'active',
      },
    });

    const mockTxs = generateMockTransactions(user.cpf, { months: 3 });
    const marked = detectCircularTransactions(mockTxs);

    await prisma.transaction.createMany({
      data: marked.map((t) => ({
        connectionId: connection.id,
        date: t.date,
        amount: t.amount,
        description: t.description,
        category: t.category,
        isCircular: t.isCircular || false,
      })),
    });

    return {
      connection,
      transactionsImported: marked.length,
      circularDetected: marked.filter((t) => t.isCircular).length,
    };
  }

  async disconnect(userId: string, connectionId: string) {
    const conn = await prisma.bankConnection.findFirst({
      where: { id: connectionId, userId },
    });
    if (!conn) throw new AppError('Conexão não encontrada', 404);

    await prisma.bankConnection.update({
      where: { id: connectionId },
      data: { status: 'disconnected' },
    });
    return { success: true };
  }

  async getTransactions(userId: string, limit: number = 100) {
    const connections = await prisma.bankConnection.findMany({
      where: { userId },
      select: { id: true, institution: true },
    });
    const ids = connections.map((c) => c.id);

    const transactions = await prisma.transaction.findMany({
      where: { connectionId: { in: ids } },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return {
      total: transactions.length,
      transactions,
      summary: this.summarize(transactions),
    };
  }

  private summarize(transactions: Array<{ amount: number; isCircular: boolean }>) {
    const income = transactions
      .filter((t) => t.amount > 0)
      .reduce((a, t) => a + t.amount, 0);
    const expenses = Math.abs(
      transactions.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0)
    );
    return {
      totalIncome: Math.round(income * 100) / 100,
      totalExpenses: Math.round(expenses * 100) / 100,
      netFlow: Math.round((income - expenses) * 100) / 100,
      circularFlags: transactions.filter((t) => t.isCircular).length,
    };
  }
}

export const openFinanceService = new OpenFinanceService();
