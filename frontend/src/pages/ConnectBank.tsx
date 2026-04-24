import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Check,
  Loader2,
  Unplug,
  Plug,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { openFinanceService } from '../services/openfinance.service';
import { apiError } from '../services/api';
import { formatDate } from '../lib/cn';

export function ConnectBankPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [consentCategories, setConsentCategories] = useState<Set<string>>(
    new Set(['transactions', 'balance'])
  );
  const [error, setError] = useState('');

  const { data: institutions = [] } = useQuery({
    queryKey: ['institutions'],
    queryFn: openFinanceService.listInstitutions,
  });

  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: openFinanceService.listConnections,
  });

  const { data: consents = [] } = useQuery({
    queryKey: ['consents'],
    queryFn: openFinanceService.listConsents,
  });

  const grantMutation = useMutation({
    mutationFn: (categories: string[]) => openFinanceService.grantConsents(categories),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consents'] }),
  });

  const connectMutation = useMutation({
    mutationFn: (id: string) => openFinanceService.connect(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections'] });
      qc.invalidateQueries({ queryKey: ['score'] });
      navigate('/app/score');
    },
    onError: (err) => setError(apiError(err)),
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => openFinanceService.disconnect(id),
    onMutate: (id) => {
      // Remove imediatamente do cache para a UI atualizar sem esperar o servidor
      qc.setQueryData<typeof connections>(['connections'], (old = []) =>
        old.filter((c) => c.id !== id)
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['connections'] });
      qc.invalidateQueries({ queryKey: ['score'] });
    },
    onError: () => {
      // Em caso de falha, restaura a lista buscando do servidor
      qc.invalidateQueries({ queryKey: ['connections'] });
    },
  });

  async function handleConnect() {
    if (!selectedBank) return;
    setError('');
    // garante consentimentos antes de conectar
    await grantMutation.mutateAsync(Array.from(consentCategories));
    await connectMutation.mutateAsync(selectedBank);
  }

  function toggleCategory(cat: string, required: boolean) {
    if (required) return;
    const next = new Set(consentCategories);
    if (next.has(cat)) next.delete(cat);
    else next.add(cat);
    setConsentCategories(next);
  }

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="heading-xl">Conectar conta bancária</h1>
        <p className="text-nan-gray mt-1">
          Via Open Finance — seguro, regulado pelo Banco Central e você no controle.
        </p>
      </div>

      {connections.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-display font-bold text-lg mb-3">Contas conectadas</h2>
          <div className="space-y-2">
            {connections.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-nan-primary-light text-nan-primary rounded-lg flex items-center justify-center">
                    <Plug size={18} />
                  </div>
                  <div>
                    <div className="font-semibold">{c.institution}</div>
                    <div className="text-xs text-nan-gray">
                      Desde {formatDate(c.connectedAt)} ·{' '}
                      {c._count?.transactions ?? 0} transações
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => disconnectMutation.mutate(c.id)}
                  className="text-sm text-red-600 hover:underline flex items-center gap-1"
                >
                  <Unplug size={14} /> Desconectar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showConsent ? (
        <div className="card">
          <h2 className="font-display font-bold text-lg mb-4">Escolha seu banco</h2>
          {error && (
            <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {institutions.map((inst) => {
              const already = connections.some((c) => c.institution === inst.name);
              const selected = selectedBank === inst.id;
              return (
                <button
                  key={inst.id}
                  onClick={() => !already && setSelectedBank(inst.id)}
                  disabled={already}
                  className={`p-4 border-2 rounded-xl text-left transition-all ${
                    already
                      ? 'opacity-40 cursor-not-allowed border-gray-200'
                      : selected
                      ? 'border-nan-primary bg-nan-primary-light'
                      : 'border-gray-200 hover:border-nan-primary'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white mb-2"
                    style={{ backgroundColor: inst.color }}
                  >
                    {inst.name[0]}
                  </div>
                  <div className="font-semibold text-sm">{inst.name}</div>
                  {already && <div className="text-xs text-nan-gray mt-1">Já conectado</div>}
                </button>
              );
            })}
          </div>

          <button
            disabled={!selectedBank}
            onClick={() => setShowConsent(true)}
            className="btn-primary w-full mt-6"
          >
            Continuar →
          </button>

          <div className="mt-6 pt-6 border-t border-gray-100 flex items-start gap-3 text-xs text-nan-gray">
            <Lock size={14} className="flex-shrink-0 mt-0.5" />
            <p>
              Esta é uma demonstração do fluxo Open Finance. Os dados bancários são gerados
              de forma simulada e determinística a partir do seu CPF para fins de
              hackathon.
            </p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <Shield className="text-nan-primary" size={28} />
            <div>
              <h2 className="font-display font-bold text-lg">Consentimento Open Finance</h2>
              <p className="text-sm text-nan-gray">
                Você decide exatamente o que vai compartilhar.
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {consents.map((c) => (
              <label
                key={c.category}
                className={`block p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  consentCategories.has(c.category)
                    ? 'border-nan-primary bg-nan-primary-light'
                    : 'border-gray-200'
                } ${c.required ? 'opacity-100' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={consentCategories.has(c.category)}
                    onChange={() => toggleCategory(c.category, c.required)}
                    disabled={c.required}
                    className="mt-1 h-4 w-4 text-nan-primary rounded"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{c.label}</span>
                      {c.required && (
                        <span className="text-xs bg-nan-accent/20 text-nan-accent px-2 py-0.5 rounded-full font-semibold">
                          Obrigatório
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-nan-gray mt-0.5">{c.description}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 mb-5">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-amber-900">
              <strong>Decisão automatizada:</strong> seu score será calculado por um
              algoritmo. A decisão é sempre explicada e você pode contestar a qualquer
              momento (LGPD Art. 20).
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowConsent(false)}
              className="btn-ghost flex-1"
              disabled={connectMutation.isPending}
            >
              Voltar
            </button>
            <button
              onClick={handleConnect}
              disabled={connectMutation.isPending}
              className="btn-primary flex-1"
            >
              {connectMutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <Check size={18} /> Autorizar e conectar
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
