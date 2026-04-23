import { Link } from 'react-router-dom';
import {
  Check,
  Shield,
  Zap,
  BarChart3,
  Smartphone,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '../components/Logo';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-nan-dark hover:text-nan-primary"
            >
              Entrar
            </Link>
            <Link to="/cadastro" className="btn-primary text-sm py-2 px-4">
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-nan-primary-light to-white">
        <div className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-nan-primary-light text-nan-primary-dark rounded-full text-xs font-semibold mb-5">
              <Zap size={14} /> Aprovação em minutos via Pix
            </span>
            <h1 className="heading-hero mb-5 leading-tight">
              Seu <span className="text-nan-primary">trabalho</span>.<br />
              Seu <span className="text-nan-accent">crédito</span>.
            </h1>
            <p className="text-lg text-nan-gray mb-8 max-w-xl">
              Motorista, entregador, freelancer? O NanDesk usa Open Finance e análise
              comportamental para dar crédito justo a quem o banco tradicional não vê.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/cadastro" className="btn-primary text-base">
                Quero meu crédito <ArrowRight size={18} />
              </Link>
              <a href="#como-funciona" className="btn-secondary text-base">
                Como funciona
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-nan-gray">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-nan-primary" /> Dados protegidos
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-nan-primary" /> Consentimento LGPD
              </div>
            </div>
          </div>

          {/* Score card ilustração */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-nan-primary/20 to-nan-accent/20 blur-3xl rounded-full" />
            <div className="relative card shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-nan-gray font-semibold">SEU NANSCORE</div>
                  <div className="font-display text-5xl font-extrabold text-nan-primary">
                    782
                  </div>
                </div>
                <span className="badge-success">Aprovado</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Regularidade de Renda', value: 85 },
                  { label: 'Volume de Movimentação', value: 72 },
                  { label: 'Comportamento', value: 80 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-nan-gray">{item.label}</span>
                      <span className="font-mono font-bold">{item.value}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-nan-primary to-nan-primary-dark"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="text-xs text-nan-gray mb-1">Limite disponível</div>
                <div className="font-display text-2xl font-bold">R$ 4.200,00</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="heading-xl mb-4">
            35 milhões de autônomos no Brasil <br />
            <span className="text-nan-danger">sem acesso a crédito</span>
          </h2>
          <p className="text-nan-gray text-lg">
            Bancos exigem comprovante de renda formal. Mas motoristas de app, entregadores e
            freelancers têm renda real, todos os dias — só que invisível ao sistema tradicional.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🚫',
              title: 'Sem contracheque',
              desc: 'Bancos pedem comprovante formal que autônomos não têm',
            },
            {
              icon: '📉',
              title: 'Score zerado',
              desc: 'Análise tradicional ignora o fluxo de renda real',
            },
            {
              icon: '⏳',
              title: 'Aprovação lenta',
              desc: 'Burocracia afasta quem precisa de crédito agora',
            },
          ].map((item) => (
            <div key={item.title} className="card text-center">
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-display font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-nan-gray">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="bg-nan-dark text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-block px-3 py-1 bg-nan-accent/20 text-nan-accent rounded-full text-xs font-semibold mb-3">
              COMO FUNCIONA
            </span>
            <h2 className="heading-xl mb-4">Do cadastro ao Pix em 3 passos</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: Smartphone,
                title: 'Conecte sua conta',
                desc: 'Escolha seu banco e autorize o compartilhamento via Open Finance. Você escolhe exatamente o que compartilha.',
              },
              {
                step: '02',
                icon: BarChart3,
                title: 'Calculamos seu NanScore',
                desc: 'Analisamos 5 dimensões comportamentais em segundos. Você recebe uma explicação clara do resultado.',
              },
              {
                step: '03',
                icon: Zap,
                title: 'Receba via Pix',
                desc: 'Aprovação imediata? O valor cai na sua chave Pix em minutos. Parcelas a partir de 3x.',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <s.icon size={28} className="text-nan-accent" />
                  <span className="font-mono text-sm text-nan-accent font-bold">{s.step}</span>
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{s.title}</h3>
                <p className="text-sm text-white/70">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="heading-xl text-center mb-12">Por que o NanDesk é diferente</h2>
        <div className="grid md:grid-cols-2 gap-5">
          {[
            {
              title: 'Score explicável',
              desc: 'Toda decisão vem com justificativa clara. Você entende por que foi aprovado ou recusado — exigência da LGPD.',
            },
            {
              title: 'Dados alternativos',
              desc: 'Além de extratos, valorizamos sua atividade em plataformas de trabalho como Uber e iFood.',
            },
            {
              title: 'Limites dinâmicos',
              desc: 'Seu limite cresce com seu comportamento. Não há teto fixo herdado do banco tradicional.',
            },
            {
              title: 'Anti-fraude inteligente',
              desc: 'Detectamos contas duplicadas, transações circulares e padrões suspeitos para manter o ecossistema saudável.',
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-nan-primary-light text-nan-primary rounded-xl flex items-center justify-center">
                <Check size={20} strokeWidth={3} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-nan-gray">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-nan-primary to-nan-primary-dark text-white py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="heading-xl mb-4">Pronto para ter seu crédito?</h2>
          <p className="text-white/80 text-lg mb-8">
            Cadastro em 2 minutos. Sem envio de documentos. Aprovação baseada no que você
            realmente é.
          </p>
          <Link to="/cadastro" className="btn-accent text-base inline-flex">
            Criar conta gratuita <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-nan-gray">
            NanDesk · Hackathon Semana Ubíqua · UNAMA 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
