import type { ScoreComponents } from '../services/score.service';

const DIM_META: Record<keyof ScoreComponents, { label: string; desc: string; weight: number }> = {
  regularityScore: {
    label: 'Regularidade de Renda',
    desc: 'Consistência das entradas ao longo dos meses',
    weight: 30,
  },
  volumeScore: {
    label: 'Volume de Movimentação',
    desc: 'Renda média mensal total',
    weight: 25,
  },
  behaviorScore: {
    label: 'Comportamento de Gastos',
    desc: 'Equilíbrio entre entradas e saídas',
    weight: 20,
  },
  paymentScore: {
    label: 'Histórico de Pagamentos',
    desc: 'Ausência de transações problemáticas',
    weight: 15,
  },
  alternativeScore: {
    label: 'Dados Alternativos',
    desc: 'Atividade em plataformas de trabalho',
    weight: 10,
  },
};

export function ScoreBreakdown({ components }: { components: ScoreComponents }) {
  return (
    <div className="space-y-4">
      {(Object.keys(DIM_META) as Array<keyof ScoreComponents>).map((key) => {
        const meta = DIM_META[key];
        const value = components[key];
        const pct = Math.round(value * 100);
        return (
          <div key={key} className="animate-slide-up">
            <div className="flex items-baseline justify-between mb-1.5">
              <div>
                <div className="font-semibold text-sm">{meta.label}</div>
                <div className="text-xs text-nan-gray">
                  {meta.desc} · peso {meta.weight}%
                </div>
              </div>
              <div className="font-mono text-sm font-bold text-nan-primary">{pct}/100</div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-nan-primary to-nan-primary-dark rounded-full transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
