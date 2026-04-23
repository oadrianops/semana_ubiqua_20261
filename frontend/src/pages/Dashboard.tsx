import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plug,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { ScoreGauge } from '../components/ScoreGauge';
import { scoreService } from '../services/score.service';
import { openFinanceService } from '../services/openfinance.service';
import { creditService } from '../services/credit.service';
import { useAuthStore } from '../store/auth';
import { formatBRL, formatDate } from '../lib/cn';

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: connections } = useQuery({
    queryKey: ['connections'],
    queryFn: openFinanceService.listConnections,
  });

  const hasConnection = (connections?.length ?? 0) > 0;

  const { data: score } = useQuery({
    queryKey: ['score', 'current'],
    queryFn: scoreService.current,
    enabled: hasConnection,
  });

  const { data: credits } = useQuery({
    queryKey: ['credits'],
    queryFn: creditService.list,
  });

  const activeCredits = credits?.filter((c) => ['approved', 'active'].includes(c.status));

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="heading-xl">Olá, {user?.name.split(' ')[0]} 👋</h1>
        <p className="text-nan-gray mt-1">
          Aqui está seu panorama financeiro no NanDesk.
        </p>
      </div>

      {!hasConnection ? (
        <div className="card bg-gradient-to-br from-nan-accent/10 to-nan-accent/5 border-nan-accent/30 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-nan-accent text-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Plug size={22} />
            </div>
            <div className="flex-1">
              <h2 className="heading-lg mb-2">Conecte seu banco para começar</h2>
              <p className="text-nan-gray mb-4">
                Para calcular seu NanScore e liberar crédito, precisamos conectar sua conta
                via Open Finance. Leva menos de 1 minuto.
              </p>
              <Link to="/app/conectar" className="btn-accent">
                Conectar agora <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="card text-center lg:col-span-1">
            <div className="text-xs font-semibold text-nan-gray mb-1">SEU NANSCORE</div>
            <ScoreGauge score={score?.score ?? 0} />
            <Link
              to="/app/score"
              className="text-sm text-nan-primary font-semibold mt-3 inline-flex items-center gap-1"
            >
              Ver detalhes <ArrowRight size={14} />
            </Link>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-nan-gray">
                  LIMITE DISPONÍVEL
                </span>
                <Zap size={16} className="text-nan-accent" />
              </div>
              <div className="font-display text-4xl font-extrabold text-nan-primary mb-2">
                {formatBRL(score?.creditLimit ?? 0)}
              </div>
              <p className="text-sm text-nan-gray mb-4">
                {score?.explanationText ||
                  'Sem dados suficientes para calcular seu limite.'}
              </p>
              {(score?.creditLimit ?? 0) > 0 && (
                <Link to="/app/credito" className="btn-primary">
                  Solicitar crédito <ArrowRight size={18} />
                </Link>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="card">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-nan-primary" />
                  <span className="text-xs font-semibold text-nan-gray">CONEXÕES</span>
                </div>
                <div className="text-2xl font-bold">{connections?.length ?? 0}</div>
                <p className="text-xs text-nan-gray">contas bancárias</p>
              </div>
              <div className="card">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={18} className="text-nan-primary" />
                  <span className="text-xs font-semibold text-nan-gray">CRÉDITOS</span>
                </div>
                <div className="text-2xl font-bold">{activeCredits?.length ?? 0}</div>
                <p className="text-xs text-nan-gray">ativos agora</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCredits && activeCredits.length > 0 && (
        <div className="card">
          <h2 className="heading-lg mb-4">Créditos em andamento</h2>
          <div className="space-y-3">
            {activeCredits.map((c) => {
              const paid = c.payments.filter((p) => p.status === 'paid').length;
              const next = c.payments.find((p) => p.status === 'pending');
              return (
                <Link
                  key={c.id}
                  to={`/app/credito/${c.id}`}
                  className="block p-4 border border-gray-100 rounded-xl hover:border-nan-primary transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-display font-bold text-lg">
                        {formatBRL(c.approvedAmount || c.requestedAmount)}
                      </div>
                      <div className="text-xs text-nan-gray">
                        {c.installments} parcelas · Score {c.scoreAtRequest}
                      </div>
                    </div>
                    <span
                      className={
                        c.status === 'approved' || c.status === 'active'
                          ? 'badge-success'
                          : 'badge-info'
                      }
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-nan-gray">
                      {paid}/{c.installments} pagas
                    </span>
                    {next && (
                      <span className="text-nan-primary font-semibold">
                        Próxima: {formatDate(next.dueDate)}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {hasConnection && (
        <div className="card mt-6 bg-nan-primary/5 border-nan-primary/20">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-nan-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Proteção LGPD</h3>
              <p className="text-sm text-nan-gray">
                Você pode revogar o compartilhamento a qualquer momento.{' '}
                <Link to="/app/conectar" className="text-nan-primary font-semibold">
                  Gerenciar consentimentos
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
