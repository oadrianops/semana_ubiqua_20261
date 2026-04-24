import { prisma } from '../../shared/config/prisma';

export class FraudService {
  async getFlags(userId: string) {
    return prisma.fraudFlag.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Verifica correlação de device entre múltiplos usuários.
   * Retorna flags criadas.
   */
  async scanDuplicateDevices(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.deviceFingerprint) return [];

    const sameDevice = await prisma.user.findMany({
      where: {
        deviceFingerprint: user.deviceFingerprint,
        id: { not: userId },
      },
      select: { id: true, cpf: true },
    });

    if (sameDevice.length === 0) return [];

    const flag = await prisma.fraudFlag.create({
      data: {
        userId,
        type: 'duplicate_device',
        severity: sameDevice.length >= 3 ? 'high' : 'medium',
        details: {
          fingerprint: user.deviceFingerprint,
          relatedUsers: sameDevice.length,
        },
      },
    });
    return [flag];
  }

  /**
   * Verifica correlação por IP entre múltiplos usuários.
   * Requisito da Entrevista 8 (Segurança): identificar múltiplos cadastros
   * vindos do mesmo ponto de rede mesmo quando o fingerprint muda.
   */
  async scanDuplicateIPs(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.lastLoginIp) return [];

    const sameIp = await prisma.user.findMany({
      where: {
        lastLoginIp: user.lastLoginIp,
        id: { not: userId },
      },
      select: { id: true, cpf: true },
    });

    if (sameIp.length === 0) return [];

    const flag = await prisma.fraudFlag.create({
      data: {
        userId,
        type: 'duplicate_ip',
        severity: sameIp.length >= 3 ? 'medium' : 'low',
        details: {
          ip: user.lastLoginIp,
          relatedUsers: sameIp.length,
        },
      },
    });
    return [flag];
  }

  /**
   * Identifica padrões de renda circular em transações do usuário.
   */
  async scanCircularIncome(userId: string) {
    const connections = await prisma.bankConnection.findMany({
      where: { userId },
      select: { id: true },
    });
    const circularCount = await prisma.transaction.count({
      where: {
        connectionId: { in: connections.map((c) => c.id) },
        isCircular: true,
      },
    });

    if (circularCount === 0) return [];

    const flag = await prisma.fraudFlag.create({
      data: {
        userId,
        type: 'circular_income',
        severity: circularCount >= 5 ? 'high' : 'low',
        details: { occurrences: circularCount },
      },
    });
    return [flag];
  }

  async runFullScan(userId: string) {
    const [dupDevice, dupIp, circ] = await Promise.all([
      this.scanDuplicateDevices(userId),
      this.scanDuplicateIPs(userId),
      this.scanCircularIncome(userId),
    ]);
    return { flags: [...dupDevice, ...dupIp, ...circ] };
  }
}

export const fraudService = new FraudService();
