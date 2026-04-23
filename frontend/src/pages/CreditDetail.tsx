import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { creditService } from '../services/credit.service';
import { formatBRL, formatDate } from '../lib/cn';

export function CreditDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: credit, isLoading } = useQuery({
    queryKey: ['credit', id],
    queryFn: () => creditService.get(id!),
    enabled: !!id,
  });

  const pay = useMutation({
    mutationFn: (installmentNo: number) => creditService.payInstallment(id!, installmentNo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['credit', id] });
      qc.invalidateQueries({ queryKey: ['credits'] });
    },
  });

  if (isLoading || !credit) {
    return (
      <AppLayout>
        <div className="card animate-pulse h-96" />
      </AppLayout>
    );
  }

  const paidCount = credit.payments.filter((p) => p.status === 'paid').length;
  const totalPaid = credit.payments
    .filter((p) => p.status === 'paid')
    .reduce((a, p) => a + p.amount, 0);
  const progress = (paidCount / credit.installments) * 100;

  return (
    <AppLayout>
      <Link
        to="/app/credito"
        className="inline-flex items-center gap-2 text-nan-gray hover:text-nan-dark text-sm mb-4"
      >
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-semibold text-nan-gray">
              CRÉDITO #{credit.id.substring(0, 8).toUpperCase()}
            </div>
            <div className="font-display text-4xl font-extrabold mt-1">
              {formatBRL(credit.approvedAmount || credit.requestedAmount)}
            </div>
            <div className="text-xs text-nan-gray mt-1">
              Solicitado em {formatDate(credit.requestedAt)}
            </div>
          </div>
          <span
            className={
              credit.status === 'paid'
                ? 'badge-info'
                : credit.status === 'denied'
                ? 'badge-danger'
                : 'badge-success'
            }
          >
            {credit.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-100">
          <div>
            <div className="text-xs text-nan-gray">Taxa mensal</div>
            <div className="font-display font-bold">{credit.monthlyRate}%</div>
          </div>
          <div>
            <div className="text-xs text-nan-gray">Parcelas</div>
            <div className="font-display font-bold">
              {paidCount}/{credit.installments}
            </div>
          </div>
          <div>
            <div className="text-xs text-nan-gray">Pago</div>
            <div className="font-display font-bold">{formatBRL(totalPaid)}</div>
          </div>
          <div>
            <div className="text-xs text-nan-gray">Total</div>
            <div className="font-display font-bold">{formatBRL(credit.totalAmount || 0)}</div>
          </div>
        </div>

        <div className="mt-2">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-nan-primary transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="heading-lg mb-4">Parcelas</h2>
        <div className="space-y-2">
          {credit.payments.map((p) => {
            const isPaid = p.status === 'paid';
            const isOverdue =
              p.status === 'pending' && new Date(p.dueDate) < new Date();
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isPaid
                    ? 'bg-green-50 border-green-100'
                    : isOverdue
                    ? 'bg-red-50 border-red-100'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isPaid
                        ? 'bg-green-200 text-green-700'
                        : isOverdue
                        ? 'bg-red-200 text-red-700'
                        : 'bg-gray-200 text-nan-gray'
                    }`}
                  >
                    {isPaid ? (
                      <CheckCircle2 size={18} />
                    ) : isOverdue ? (
                      <AlertCircle size={18} />
                    ) : (
                      <Clock size={18} />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">
                      Parcela {p.installmentNo}/{credit.installments}
                    </div>
                    <div className="text-xs text-nan-gray">
                      Vence {formatDate(p.dueDate)}
                      {p.paidAt && ` · Pago ${formatDate(p.paidAt)}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-mono font-bold">{formatBRL(p.amount)}</div>
                  {!isPaid && (
                    <button
                      onClick={() => pay.mutate(p.installmentNo)}
                      disabled={pay.isPending}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Pagar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
