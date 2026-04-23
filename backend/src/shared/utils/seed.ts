import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import {
  generateMockTransactions,
  detectCircularTransactions,
} from '../../modules/openfinance/mock-data.generator';

async function seed() {
  console.log('🌱 Semeando banco de dados...');

  const demoUsers = [
    {
      cpf: '12345678909',
      name: 'João Silva (Motorista Uber)',
      email: 'joao@demo.com',
      phone: '91988887777',
      password: 'demo123',
      profile: 'stable' as const,
    },
    {
      cpf: '98765432100',
      name: 'Maria Santos (Entregadora iFood)',
      email: 'maria@demo.com',
      phone: '91977776666',
      password: 'demo123',
      profile: 'variable' as const,
    },
    {
      cpf: '11122233396',
      name: 'Pedro Costa (Freelancer)',
      email: 'pedro@demo.com',
      phone: '91966665555',
      password: 'demo123',
      profile: 'irregular' as const,
    },
  ];

  for (const u of demoUsers) {
    const existing = await prisma.user.findUnique({ where: { cpf: u.cpf } });
    if (existing) {
      console.log(`  · Usuário ${u.email} já existe, pulando`);
      continue;
    }

    const passwordHash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.create({
      data: {
        cpf: u.cpf,
        name: u.name,
        email: u.email,
        phone: u.phone,
        passwordHash,
      },
    });

    // Consentimentos
    await prisma.consent.createMany({
      data: ['transactions', 'balance', 'profile', 'alternative'].map((cat) => ({
        userId: user.id,
        category: cat,
        granted: true,
        grantedAt: new Date(),
      })),
    });

    // Conexão bancária
    const connection = await prisma.bankConnection.create({
      data: {
        userId: user.id,
        institution: 'Nubank',
        status: 'active',
      },
    });

    const txs = detectCircularTransactions(
      generateMockTransactions(u.cpf, { months: 3, profile: u.profile })
    );

    await prisma.transaction.createMany({
      data: txs.map((t) => ({
        connectionId: connection.id,
        date: t.date,
        amount: t.amount,
        description: t.description,
        category: t.category,
        isCircular: t.isCircular || false,
      })),
    });

    console.log(`  ✓ ${u.name} — ${txs.length} transações`);
  }

  console.log('✅ Seed concluído!');
  console.log('\nCredenciais de demo:');
  demoUsers.forEach((u) => {
    console.log(`  ${u.email} / ${u.password}`);
  });
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
