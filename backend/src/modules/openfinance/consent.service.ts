import { prisma } from '../../shared/config/prisma';
import { AppError } from '../../shared/middleware/error.middleware';

export const CONSENT_CATEGORIES = {
  transactions: {
    label: 'Histórico de Transações',
    description: 'Entradas e saídas dos últimos 90 dias',
    required: true,
  },
  balance: {
    label: 'Saldo Bancário',
    description: 'Saldo atual das contas conectadas',
    required: true,
  },
  profile: {
    label: 'Dados de Perfil',
    description: 'Nome e informações cadastrais',
    required: false,
  },
  alternative: {
    label: 'Dados Alternativos',
    description: 'Frequência de atividade em plataformas de trabalho',
    required: false,
  },
};

export class ConsentService {
  async list(userId: string) {
    const consents = await prisma.consent.findMany({ where: { userId } });
    return Object.entries(CONSENT_CATEGORIES).map(([key, meta]) => {
      const c = consents.find((x) => x.category === key);
      return {
        category: key,
        ...meta,
        granted: c?.granted || false,
        grantedAt: c?.grantedAt,
        revokedAt: c?.revokedAt,
      };
    });
  }

  async grant(userId: string, categories: string[]) {
    const valid = Object.keys(CONSENT_CATEGORIES);
    for (const cat of categories) {
      if (!valid.includes(cat)) {
        throw new AppError(`Categoria inválida: ${cat}`, 400);
      }
    }

    const now = new Date();
    const results = await Promise.all(
      categories.map((cat) =>
        prisma.consent.upsert({
          where: { userId_category: { userId, category: cat } },
          create: {
            userId,
            category: cat,
            granted: true,
            grantedAt: now,
          },
          update: {
            granted: true,
            grantedAt: now,
            revokedAt: null,
          },
        })
      )
    );
    return results;
  }

  async revoke(userId: string, category: string) {
    const consent = await prisma.consent.findUnique({
      where: { userId_category: { userId, category } },
    });
    if (!consent) throw new AppError('Consentimento não encontrado', 404);

    await prisma.consent.update({
      where: { id: consent.id },
      data: { granted: false, revokedAt: new Date() },
    });
    return { success: true };
  }
}

export const consentService = new ConsentService();
