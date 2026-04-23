import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, DollarSign, Check, Zap, ArrowRight } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { creditService, type SimulationResult } from '../services/credit.service';
import { scoreService } from '../services/score.service';
import { apiError } from '../services/api';
import { formatBRL, formatDate } from '../lib/cn';

export function CreditPage() {
  const qc = useQueryClient();
  const [amount, setAmount] = useState(1000);
  const [installments, setInstallments] = useState(6);
  const [pixKey, setPixKey] = useState('');
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [error, setError] = useState('');
  const [lastRequestId, setLastRequestId] = useState<string | null>(null);

  const { data: score } = useQuery({
    queryKey: ['score', 'current'],
    queryFn: scoreService.current,
  });

  const { data: credits } = useQuery({
    queryKey: ['credits'],
    queryFn: creditService.list,
  });

  const maxLimit = score?.creditLimit ?? 0;

  useEffect(() => {
    if (maxLimit > 0 && amount > maxLimit) {
      setAmount(Math.min(maxLimit, 1000));
    }
  }, [maxLimit, amount]);

  const simulateMutation = useMutation({
    mutationFn: () => creditService.simulate(amount, installments),
    onSuccess: (data) => {
      setSimulation(data);
      setError('');
    },
    onError: (err) => setError(apiError(err)),
  });

  const requestMutation = useMutation({
    mutationFn: () => creditService.request({ amount, installments, pixKey }),
    onSuccess: (data) => {
      setLastRequestId(data.id);
      qc.invalidateQueries({ queryKey: ['credits'] });
      qc.invalidateQueries({ queryKey: ['score'] });
    },
    onError: (err) => setError(apiError(err)),
  });

  useEffect(() => {
    if (maxLimit > 0 && amount >= 200 && amount <= maxLimit) {
      const id = setTimeout(() => simulateMutation.mutate(), 300);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, installments, maxLimit]);

  if (maxLimit === 0) {
    return (
      <AppLayout>
        <div className="card text-center py-12 max-w-md mx-auto">
          <DollarSign size={48} className="mx-auto text-nan-gray mb-4" />
          <h2 className="heading-lg mb-2">Crédito ainda não disponível</h2>
          <p className="text-nan-gray mb-6">
            {score?.explanationText || 'Conecte seu banco para calcular seu NanScore.'}
          </p>
          <Link to="/app/conectar" className="btn-primary">
            Conectar banco
          </Link>
        </div>
      </AppLayout>
    );
  }

  if (lastRequestId) {
    return (
      <AppLayout>
        <div className="card max-w-md mx-auto text-center py-12 animate-slide-up">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} strokeWidth={3} />
          </div>
          <h2 className="heading-lg mb-2">Crédito aprovado! 🎉</h2>
          <p className="text-nan-gray mb-6">
            {formatBRL(amount)} foi liberado via Pix
            {pixKey ? ` para a chave ${pixKey}` : ''}.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to={`/app/credito/${lastRequestId}`} className="btn-primary">
              Ver detalhes <ArrowRight size={16} />
            </Link>
            <Link to="/app" className="btn-ghost">
              Voltar
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="heading-xl">Solicitar crédito</h1>
        <p className="text-nan-gray mt-1">
          Limite disponível:{' '}
          <strong className="text-nan-primary">{formatBRL(maxLimit)}</strong>
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h2 className="font-display font-bold text-lg mb-5">Valor e prazo</h2>

          <div className="mb-6">
            <label className="label">Valor desejado</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-nan-gray font-mono">
                R$
              </span>
              <input
                type="number"
                min={200}
                max={maxLimit}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="input pl-12 font-mono text-lg font-bold"
              />
            </div>
            <input
              type="range"
              min={200}
              max={maxLimit}
              step={50}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full mt-3 accent-nan-primary"
            />
            <div className="flex justify-between text-xs text-nan-gray mt-1">
              <span>R$ 200</span>
              <span>{formatBRL(maxLimit)}</span>
            </div>
          </div>

          <div className="mb-6">
            <label className="label">Número de parcelas</label>
            <div className="grid grid-cols-5 gap-2">
              {[3, 6, 12, 18, 24].map((n) => (
                <button
                  key={n}
                  onClick={() => setInstallments(n)}
                  className={`py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    installments === n
                      ? 'bg-nan-primary text-white'
                      : 'bg-gray-100 text-nan-gray hover:bg-gray-200'
                  }`}
                >
                  {n}x
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Chave Pix (opcional)</label>
            <input
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="CPF, email, celular ou chave aleatória"
              className="input"
            />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-nan-primary to-nan-primary-dark text-white">
          <h2 className="font-display font-bold text-lg mb-5">Simulação</h2>

          {simulateMutation.isPending ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin" />
            </div>
          ) : simulation ? (
            <div className="space-y-4 animate-fade-in">
              <div>
                <div className="text-xs text-white/70 mb-1">VALOR SOLICITADO</div>
                <div className="font-display text-3xl font-extrabold">
                  {formatBRL(simulation.amount)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                <div>
                  <div className="text-xs text-white/70">PARCELA</div>
                  <div className="font-display text-xl font-bold">
                    {formatBRL(simulation.installmentAmount)}
                  </div>
                  <div className="text-xs text-white/70">
                    por {simulation.installments} meses
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/70">TAXA</div>
                  <div className="font-display text-xl font-bold">
                    {simulation.monthlyRate}%
                  </div>
                  <div className="text-xs text-white/70">ao mês</div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/20 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Juros total</span>
                  <span className="font-mono font-bold">
                    {formatBRL(simulation.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">IOF</span>
                  <span className="font-mono font-bold">
                    {formatBRL(simulation.iof)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/20">
                  <span>Total a pagar</span>
                  <span className="font-mono font-bold">
                    {formatBRL(simulation.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-white/70">Ajuste valor e prazo para ver a simulação</p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <button
        onClick={() => requestMutation.mutate()}
        disabled={!simulation || requestMutation.isPending}
        className="btn-accent w-full text-base"
      >
        {requestMutation.isPending ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <>
            <Zap size={18} /> Solicitar crédito — liberação via Pix
          </>
        )}
      </button>

      {credits && credits.length > 0 && (
        <div className="mt-10">
          <h2 className="heading-lg mb-4">Meus créditos</h2>
          <div className="space-y-3">
            {credits.map((c) => (
              <Link
                key={c.id}
                to={`/app/credito/${c.id}`}
                className="card block hover:border-nan-primary transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-display font-bold text-xl">
                      {formatBRL(c.approvedAmount || c.requestedAmount)}
                    </div>
                    <div className="text-xs text-nan-gray">
                      {formatDate(c.requestedAt)} · {c.installments} parcelas · Score{' '}
                      {c.scoreAtRequest}
                    </div>
                  </div>
                  <span
                    className={
                      c.status === 'paid'
                        ? 'badge-info'
                        : c.status === 'denied'
                        ? 'badge-danger'
                        : 'badge-success'
                    }
                  >
                    {c.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
