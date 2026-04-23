# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão do Projeto

**NanDesk** — plataforma de crédito alternativo para trabalhadores autônomos (motoristas Uber, entregadores iFood, freelancers), usando Open Finance e análise comportamental para um score explicável chamado **NanScore**.

Construído para o **Hackathon Semana Ubíqua — UNAMA 2026** (cenário Open Finance). Deploy em `nandesk.com.br` via Coolify.

## Comandos Essenciais

### Desenvolvimento com Docker (recomendado)
```bash
docker compose up -d --build          # sobe postgres + backend + frontend
docker compose logs -f backend        # acompanhar logs
docker compose down                   # parar tudo

# Popular o banco com usuários de demonstração
cd backend && DATABASE_URL="postgresql://nandesk:nandesk_dev@localhost:5432/nandesk" \
  npx tsx src/shared/utils/seed.ts
```

### Backend (Node + Express + TS)
```bash
cd backend
npm install
npx prisma db push                 # sincroniza schema (usa db push, não migrations)
npx prisma generate                # gera cliente Prisma
npm run dev                        # dev server com tsx watch (porta 3001)
npm run build                      # compila TS + gera Prisma client
npm run start                      # roda dist/server.js
npm run db:seed                    # popular usuários demo
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev                        # dev server porta 5173 com proxy /api → :3001
npm run build                      # build estático em dist/
npm run preview                    # serve dist/ localmente em 4173
npm run lint                       # tsc --noEmit (typecheck only)
```

### Verificação rápida de saúde
```bash
curl http://localhost:3001/health
curl http://localhost:4173/
```

## Arquitetura

**Padrão:** Monolito modular — cada módulo de negócio isolado em pasta própria com `*.service.ts`, `*.controller.ts`, `*.routes.ts`. Facilita migração futura para microserviços sem refatoração drástica.

**Fluxo de dados do usuário:**
1. Cadastro → device fingerprint gravado → JWT emitido
2. Conectar banco → consentimento LGPD granular → mock de transações é gerado determinísticamente a partir do CPF
3. Recalcular score → 5 dimensões ponderadas (regularidade 30% + volume 25% + comportamento 20% + pagamentos 15% + dados alternativos 10%) × 1000
4. Solicitar crédito → validação de limite → criação de parcelas (amortização Price) → status `approved` se score ≥ 700, senão `pending`

### Backend (Express + TS + Prisma)

- **`modules/auth/`** — registro/login/me. Rate limit agressivo (5 cadastros/h, 10 logins/15min). Device fingerprint via hash SHA-256 de headers. `authService.register()` também cria `FraudFlag` se detectar fingerprint duplicado.
- **`modules/openfinance/`** — `mock-data.generator.ts` é **determinístico** (mesmo CPF → mesmas transações). Perfis: `stable` / `variable` / `irregular` inferidos pelo hash MD5 do CPF. Detecção de transações circulares (entrada + saída do mesmo valor em <24h). **Consentimento obrigatório** para `transactions` e `balance` antes de conectar — `connect()` rejeita com 403 se faltar.
- **`modules/score/`** — core do NanScore. `weightedScore()` aplica os pesos fixos. `generateExplanation()` pega a dimensão mais fraca e gera texto humano — isso é **requisito LGPD Art. 20**, não opcional. Taxa sugerida varia: 2.5% (score ≥850) até 7.9% (score <500).
- **`modules/credit/`** — simulação usa fórmula **Price** (amortização francesa). `request()` recomputa score no momento (não usa cache) — score é fonte de verdade. Cria N parcelas via `prisma.payment.createMany`.
- **`modules/fraud/`** — scans independentes: `scanDuplicateDevices`, `scanCircularIncome`. Intencionalmente simples para hackathon.

### Frontend (React 18 + Vite 6)

- **Zustand com persist** para auth (`store/auth.ts`) — sobrevive a refresh.
- **TanStack Query** para todos os requests — cache de 30s padrão, invalidação manual após mutations.
- **Axios interceptor** injeta JWT e faz logout automático em 401 (`services/api.ts`).
- **Design system** centrado em Tailwind com classes utilitárias em `index.css` (`.btn-primary`, `.card`, `.badge-*`). Paleta: verde-azulado `#0D9F75` (primary) + âmbar `#EF9F27` (accent).
- **`ScoreGauge`** usa SVG com `strokeDasharray` para animação do arco — cores muda com score.
- **Proxy dev:** `vite.config.ts` redireciona `/api/*` para `localhost:3001` (ajustável via `VITE_API_PROXY`).

### Banco de dados (PostgreSQL 16 + Prisma)

Schema em `backend/prisma/schema.prisma`. Uso de **`prisma db push`** em vez de migrations (mais simples para hackathon; para produção séria, converter para `prisma migrate`).

Modelos principais:
- `User` — CPF único, `deviceFingerprint`, `lastLoginIp`
- `Consent` — unique por `(userId, category)`, categorias em `CONSENT_CATEGORIES`
- `BankConnection` + `Transaction` — com flag `isCircular`
- `ScoreHistory` — log imutável de todo cálculo de score para auditoria
- `CreditRequest` + `Payment` — parcelas criadas no momento do pedido
- `FraudFlag` — JSON com detalhes específicos de cada tipo

**Relações:** todas com `onDelete: Cascade` — deletar `User` remove tudo associado.

## Convenções e armadilhas

- **`@types/express` precisa ser v4.x**, não v5.x (Express em si é v4.21). V5 quebra a tipagem de `req.params`.
- **`ignoreDeprecations: "5.0"`** no `tsconfig.json` para TypeScript 5.x — não use "6.0" (não reconhecido em 5.x).
- **Seed** (`src/shared/utils/seed.ts`) depende de `tsx`, que não está na imagem de produção (que usa `npm ci --omit=dev`). Rode do host ou ajuste Dockerfile se precisar rodar dentro do container em prod.
- **Score é recalculado a cada `/api/credit/request`** — sem cache. Isso garante decisão sempre baseada em dados atuais mas pode ser otimizado com Redis no futuro.
- **Explicações em português** — mensagens ao usuário são em PT-BR (é requisito: público autônomo brasileiro). Não traduza para inglês.
- **LGPD é lei, não sugestão** — a explicabilidade do score e o consentimento granular **são features, não devem ser removidos** por "simplificação". O jurídico na entrevista foi explícito.
- **CPFs de demo** usam validador real — se inventar um CPF manualmente, precisa passar em `isValidCpf()` (dígitos verificadores corretos).

## Deploy

Ver `DEPLOY.md` para passos no Coolify. Resumo:
- `docker-compose.prod.yml` é o compose para Coolify (usa `expose` em vez de `ports`, labels `coolify.managed=true`)
- Frontend build precisa de `VITE_API_URL` como **build arg** (não runtime env), porque Vite injeta no bundle
- Domínios: `nandesk.com.br` → frontend:4173, `api.nandesk.com.br` → backend:3001
- SSL via Let's Encrypt é automático via Traefik do Coolify

## Referências cruzadas

- Roteiro do pitch e critérios de avaliação: seção final do `README.md`
- Documento de entrega (visão geral + arquitetura + score + decisões + limitações): `README.md` serve como documento da solução expandido
- Entrevistas do hackathon: mencionadas no `README.md` — decisões técnicas refletem diretamente os requisitos levantados (ex: score explicável do Jurídico, anti-fraude do Segurança, limites dinâmicos do Head de Risco)
