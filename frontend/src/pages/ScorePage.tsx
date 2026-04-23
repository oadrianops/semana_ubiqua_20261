import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { RefreshCw, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ScoreGauge } from '../components/ScoreGauge';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { scoreService, normalizeComponents } from '../services/score.service';
import { openFinanceService } from '../services/openfinance.service';
import { formatBRL, formatDate } from '../lib/cn';

export function ScorePage() {
  const qc = useQueryClient();

  const { data: score, isLoading } = useQuery({
    queryKey: ['score', 'current'],
    queryFn: scoreService.current,
  });

  const { data: txData } = useQuery({
    queryKey: ['transactions'],
    queryFn: openFinanceService.transactions,
  });

  const recalc = useMutation({
    mutationFn: scoreService.calculate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['score'] }),
  });

  if (isLoading) {
    return (
      <AppLayout>
        <div className="card animate-pulse h-96" />
      </AppLayout>
    );
  }

  const components = score ? normalizeComponents(score) : null;

  // agrupa transações por dia para o gráfico
  const chartData = (() => {
    if (!txData?.transactions) return [];
    const byDay: Record<string, { date: string; income: number; expense: number }> = {};
    txData.transactions.forEach((t) => {
      const key = new Date(t.date).toISOString().split('T')[0];
      byDay[key] = byDay[key] || { date: key, income: 0, expense: 0 };
      if (t.amount > 0) byDay[key].income += t.amount;
      else byDay[key].expense += Math.abs(t.amount);
    });
    return Object.values(byDay)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        }),
        income: Math.round(d.income),
        expense: Math.round(d.expense),
      }));
  })();

  const decisionBadge =
    score?.decision === 'approved'
      ? 'badge-success'
      : score?.decision === 'review'
      ? 'badge-info'
      : score?.decision === 'waiting'
      ? 'badge-warning'
      : 'badge-danger';

  const decisionText = {
    approved: 'Aprovado',
    review: 'Em análise',
    waiting: 'Em espera',
    denied: 'Negado',
  }[score?.decision || 'denied'];

  return (
    <AppLayout>
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="heading-xl">Seu NanScore</h1>
          <p className="text-nan-gray mt-1">
            Análise comportamental baseada em 5 dimensões ponderadas
          </p>
        </div>
        <button
          onClick={() => recalc.mutate()}
          disabled={recalc.isPending}
          className="btn-secondary text-sm"
        >
          <RefreshCw
            size={16}
            className={recalc.isPending ? 'animate-spin' : ''}
          />
          Recalcular
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="card text-center">
          <ScoreGauge score={score?.score ?? 0} />
          <div className="mt-3">
            <span className={decisionBadge}>{decisionText}</span>
          </div>
        </div>

        <div className="lg:col-span-2 card">
          <div className="flex items-center gap-2 text-nan-gray text-xs font-semibold mb-2">
            <Zap size={14} /> RECOMENDAÇÃO DO SISTEMA
          </div>
          <p className="text-nan-dark mb-4 leading-relaxed">
            {score?.explanationText}
          </p>

          {(score?.creditLimit ?? 0) > 0 && (
            <div className="p-4 bg-nan-primary-light rounded-xl mb-4">
              <div className="text-xs text-nan-primary-dark font-semibold mb-1">
                LIMITE APROVADO
              </div>
              <div className="font-display text-3xl font-extrabold text-nan-primary">
                {formatBRL(score?.creditLimit ?? 0)}
              </div>
              {score?.suggestedRate && (
                <div className="text-xs text-nan-gray mt-1">
                  Taxa sugerida: {score.suggestedRate}% ao mês
                </div>
              )}
            </div>
          )}

          {(score?.creditLimit ?? 0) > 0 && (
            <Link to="/app/credito" className="btn-primary">
              Solicitar crédito agora →
            </Link>
          )}
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="heading-lg mb-5">Como seu score é calculado</h2>
        {components && <ScoreBreakdown components={components} />}

        <div className="mt-6 pt-6 border-t border-gray-100 grid sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-nan-gray font-semibold">RENDA MÉDIA</div>
            <div className="font-display text-xl font-bold">
              {formatBRL(score?.averageMonthlyIncome ?? 0)}
            </div>
            <div className="text-xs text-nan-gray">por mês</div>
          </div>
          <div>
            <div className="text-xs text-nan-gray font-semibold">TRANSAÇÕES</div>
            <div className="font-display text-xl font-bold">{txData?.total ?? 0}</div>
            <div className="text-xs text-nan-gray">nos últimos 90 dias</div>
          </div>
          <div>
            <div className="text-xs text-nan-gray font-semibold">ÚLTIMA ANÁLISE</div>
            <div className="font-display text-xl font-bold">
              {formatDate(score?.computedAt || score?.calculatedAt || new Date())}
            </div>
            <div className="text-xs text-nan-gray">hoje</div>
          </div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-lg">Movimentação recente</h2>
            <TrendingUp className="text-nan-primary" size={20} />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9F75" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0D9F75" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" fontSize={11} stroke="#6B7280" />
              <YAxis fontSize={11} stroke="#6B7280" />
              <Tooltip
                formatter={(v: number) => formatBRL(v)}
                contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#0D9F75"
                strokeWidth={2}
                fill="url(#incomeGrad)"
                name="Entradas"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#EF4444"
                strokeWidth={2}
                fill="url(#expenseGrad)"
                name="Saídas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {(txData?.summary.circularFlags ?? 0) > 0 && (
        <div className="card mt-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-amber-600" size={20} />
            <div>
              <h3 className="font-bold">Transações circulares detectadas</h3>
              <p className="text-sm text-nan-gray">
                {txData?.summary.circularFlags} transações com padrão de entrada/saída
                idêntica em menos de 24h. Isso pode indicar inflacionamento artificial de
                renda e impacta seu score.
              </p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
