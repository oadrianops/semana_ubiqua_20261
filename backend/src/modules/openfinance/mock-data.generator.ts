import crypto from 'crypto';

export interface MockTransaction {
  date: Date;
  amount: number;
  description: string;
  category: string;
  isCircular?: boolean;
}

// Seed determinístico por CPF para demo consistente
function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

export interface ProfileOptions {
  months?: number;
  profile?: 'stable' | 'variable' | 'irregular';
}

const PROFILES = {
  stable: {
    dailyMin: 150,
    dailyMax: 350,
    offDayChance: 0.1,
    weekendBoost: 1.2,
  },
  variable: {
    dailyMin: 80,
    dailyMax: 280,
    offDayChance: 0.15,
    weekendBoost: 1.4,
  },
  irregular: {
    dailyMin: 30,
    dailyMax: 400,
    offDayChance: 0.35,
    weekendBoost: 1.0,
  },
};

function inferProfile(cpf: string): keyof typeof PROFILES {
  const hash = crypto.createHash('md5').update(cpf).digest();
  const bucket = hash[0] % 10;
  if (bucket < 5) return 'stable';
  if (bucket < 8) return 'variable';
  return 'irregular';
}

export function generateMockTransactions(
  cpf: string,
  options: ProfileOptions = {}
): MockTransaction[] {
  const months = options.months ?? 3;
  const profileKey = options.profile ?? inferProfile(cpf);
  const profile = PROFILES[profileKey];
  const rand = seededRandom(cpf);

  const transactions: MockTransaction[] = [];
  const now = new Date();
  const platforms = ['Uber Parceiros', 'iFood Entregador', '99 Corridas', 'Rappi Parceiro'];
  const platform = platforms[Math.floor(rand() * platforms.length)];

  const totalDays = months * 30;

  for (let day = totalDays; day >= 0; day--) {
    const date = new Date(now.getTime() - day * 86400000);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (rand() < profile.offDayChance) continue;

    const baseIncome = profile.dailyMin + rand() * (profile.dailyMax - profile.dailyMin);
    const multiplier = isWeekend ? profile.weekendBoost : 1;
    const dailyIncome = baseIncome * multiplier;

    // Fragmentar em 2-6 corridas/dia
    const rides = 2 + Math.floor(rand() * 5);
    const perRide = dailyIncome / rides;
    for (let i = 0; i < rides; i++) {
      const rideDate = new Date(date);
      rideDate.setHours(8 + Math.floor(rand() * 14), Math.floor(rand() * 60));
      transactions.push({
        date: rideDate,
        amount: parseFloat((perRide + (rand() - 0.5) * 20).toFixed(2)),
        description: `Pix recebido - ${platform}`,
        category: 'income',
      });
    }

    // Combustível (alto consumo)
    if (rand() > 0.3) {
      transactions.push({
        date: new Date(date.setHours(7, 30)),
        amount: -(40 + rand() * 100),
        description: 'Combustível - Posto Shell',
        category: 'transport',
      });
    }

    // Alimentação
    if (rand() > 0.4) {
      transactions.push({
        date: new Date(date.setHours(12, Math.floor(rand() * 60))),
        amount: -(15 + rand() * 35),
        description: rand() > 0.5 ? 'iFood - Restaurante' : 'Padaria Local',
        category: 'food',
      });
    }
  }

  // Gastos fixos mensais
  for (let m = 0; m < months; m++) {
    const aluguelDate = new Date(now.getFullYear(), now.getMonth() - m, 5);
    if (aluguelDate > new Date(now.getTime() - totalDays * 86400000)) {
      transactions.push({
        date: aluguelDate,
        amount: -(600 + rand() * 400),
        description: 'Aluguel mensal',
        category: 'housing',
      });
    }
    const internetDate = new Date(now.getFullYear(), now.getMonth() - m, 10);
    if (internetDate > new Date(now.getTime() - totalDays * 86400000)) {
      transactions.push({
        date: internetDate,
        amount: -(80 + rand() * 60),
        description: 'Internet - Operadora',
        category: 'bills',
      });
    }
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * Detecta transações circulares (entrada e saída do mesmo valor em <24h)
 * — indicador de tentativa de inflar score artificialmente.
 */
export function detectCircularTransactions(
  txs: MockTransaction[]
): MockTransaction[] {
  const marked = [...txs];
  for (let i = 0; i < marked.length; i++) {
    const tx = marked[i];
    if (tx.amount <= 0) continue;
    const targetAmount = -tx.amount;

    for (let j = 0; j < marked.length; j++) {
      if (i === j) continue;
      const other = marked[j];
      const diffHours = Math.abs(tx.date.getTime() - other.date.getTime()) / 3600000;
      if (diffHours < 24 && Math.abs(other.amount - targetAmount) < 1) {
        marked[i] = { ...tx, isCircular: true };
        marked[j] = { ...other, isCircular: true };
        break;
      }
    }
  }
  return marked;
}

export const SUPPORTED_INSTITUTIONS = [
  { id: 'nubank', name: 'Nubank', color: '#8A05BE' },
  { id: 'bradesco', name: 'Bradesco', color: '#CC092F' },
  { id: 'itau', name: 'Itaú', color: '#EC7000' },
  { id: 'bb', name: 'Banco do Brasil', color: '#FFF300' },
  { id: 'caixa', name: 'Caixa Econômica', color: '#1E5BA5' },
  { id: 'inter', name: 'Inter', color: '#FF7A00' },
  { id: 'c6', name: 'C6 Bank', color: '#1B1B1B' },
  { id: 'santander', name: 'Santander', color: '#EC0000' },
];
