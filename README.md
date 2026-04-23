# NanDesk — Crédito Alternativo para Autônomos

> **Seu trabalho. Seu crédito.**
> 
> Plataforma de microcrédito para trabalhadores autônomos (motoristas de app, entregadores, freelancers) que usa **Open Finance + análise comportamental** para gerar um score explicável e liberar crédito via Pix.

**Hackathon Semana Ubíqua — UNAMA 2026 | Cenário: Open Finance**

🌐 Produção: [nandesk.com.br](https://nandesk.com.br)

---

## 🎯 O Problema

No Brasil, **35 milhões de trabalhadores autônomos** têm renda real mas são invisíveis para o sistema de crédito tradicional. Bancos exigem:

- Comprovante de renda formal (contracheque)
- Histórico bancário estruturado
- Documentação extensa

**Mas um motorista de app ganha R$ 4.000/mês de forma consistente — só que o banco não vê isso.**

---

## 💡 A Solução

O **NanDesk** usa:

1. **Open Finance** — acesso autorizado aos dados bancários reais
2. **Análise comportamental** — regularidade, volume, padrão de gastos
3. **NanScore** — score explicável de 0 a 1000 baseado em 5 dimensões
4. **Liberação via Pix** — crédito aprovado cai na conta em minutos
5. **Anti-fraude** — device fingerprinting, detecção de renda circular, correlação de contas

Tudo com **consentimento LGPD explícito** e **decisões auditáveis**.

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     nandesk.com.br                          │
│                                                             │
│  ┌────────────────────┐      ┌─────────────────────────┐   │
│  │  Frontend (React)  │◄────►│  Backend (Node + TS)    │   │
│  │  Vite + Tailwind   │ HTTP │  Express + Zod          │   │
│  │  React Query       │      │                         │   │
│  │  Recharts          │      │  ┌─────────────────┐   │   │
│  └────────────────────┘      │  │ Auth Module     │   │   │
│                              │  │ Open Finance    │   │   │
│                              │  │ Score Engine    │   │   │
│                              │  │ Credit          │   │   │
│                              │  │ Fraud           │   │   │
│                              │  └────────┬────────┘   │   │
│                              └───────────┼─────────────┘   │
│                                          │                 │
│                              ┌───────────▼─────────────┐   │
│                              │  PostgreSQL 16          │   │
│                              │  via Prisma ORM         │   │
│                              └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Padrão arquitetural:** Monolito Modular  
**Justificativa:** O CTO na entrevista disse *"comecem simples, mas pensem em evoluir"*. Cada módulo é isolado em pasta própria (`auth`, `openfinance`, `score`, `credit`, `fraud`), facilitando migração futura para microserviços se necessário.

### Principais Componentes

| Componente | Responsabilidade |
|-----------|------------------|
| **Auth** | Cadastro/login com CPF, JWT, rate limit, device fingerprint |
| **Open Finance** | Mock determinístico de dados bancários, consentimento LGPD por categoria |
| **Score Engine** | Cálculo do NanScore, explicabilidade, limite dinâmico |
| **Credit** | Simulação Price, solicitação, parcelas, Pix |
| **Fraud** | Detecção de contas duplicadas por device/IP, renda circular |

---

## 🧮 Modelo de Score (NanScore)

**Faixa:** 0 a 1000 pontos  
**Fórmula ponderada:**

```
NanScore = (
  Regularidade_Renda       × 0.30  +
  Volume_Movimentação      × 0.25  +
  Comportamento_Gastos     × 0.20  +
  Histórico_Pagamentos     × 0.15  +
  Dados_Alternativos       × 0.10
) × 1000
```

### As 5 Dimensões

| Dimensão | O que mede | Peso |
|----------|-----------|------|
| **Regularidade de Renda** | Coeficiente de variação das entradas mensais. Menor variação = mais previsível = score maior | 30% |
| **Volume de Movimentação** | Renda média mensal normalizada (escala até R$ 10k) | 25% |
| **Comportamento de Gastos** | Taxa de poupança (entrada - saída) / entrada | 20% |
| **Histórico de Pagamentos** | Penaliza transações devolvidas, estornadas e circulares | 15% |
| **Dados Alternativos** | Consistência de atividade (frequência, recência, distribuição semanal) | 10% |

### Regras de Decisão

| NanScore | Decisão | Limite de Crédito | Taxa Mensal |
|----------|---------|------------------|-------------|
| 850-1000 | ✅ Aprovado automático | Até 3x renda mensal | 2.5% |
| 700-849 | ✅ Aprovado automático | Até 3x renda mensal | 3.9% |
| 500-699 | 🔁 Aprovado em revisão | Até 1.5x renda mensal | 5.9% |
| 300-499 | 🔄 Lista de espera | — | — |
| 0-299 | ❌ Negado | — | — |

### Explicabilidade (LGPD Art. 20)

Toda decisão gera uma explicação humana. Exemplo real do sistema:

> *"Seu NanScore é 642. Notamos histórico com transações problemáticas. Seu crédito está disponível com limite reduzido — mantenha sua movimentação ativa para melhorar nas próximas avaliações."*

O sistema identifica automaticamente a dimensão mais fraca e traduz em linguagem acessível.

---

## 🔐 Segurança e Anti-Fraude

Com base nas entrevistas com o time de segurança e jurídico:

| Mecanismo | Implementação |
|-----------|---------------|
| **Device fingerprint** | Hash SHA-256 de user-agent + headers + resolução |
| **Rate limiting** | 10 logins/15min, 5 cadastros/hora, 3 solicitações/24h |
| **Detecção de renda circular** | Marca transações com entrada+saída iguais em <24h |
| **Flag de device duplicado** | Alerta se mesmo fingerprint em múltiplas contas |
| **JWT + bcrypt** | Tokens com expiração, senhas com salt rounds 10 |
| **Consentimento granular** | Por categoria, revogável a qualquer momento |
| **Minimização de dados** | Só armazenamos o necessário; dados brutos são agregados |

---

## 🛠️ Stack Tecnológica

### Backend
- **Runtime:** Node.js 22
- **Framework:** Express 4.21
- **Linguagem:** TypeScript 5.7
- **ORM:** Prisma 5.22
- **Banco:** PostgreSQL 16
- **Auth:** jsonwebtoken + bcryptjs
- **Validação:** Zod 3.24
- **Segurança:** Helmet, CORS, express-rate-limit

### Frontend
- **Framework:** React 18 + Vite 6
- **Linguagem:** TypeScript 5.7
- **Estilos:** Tailwind CSS 3.4
- **Estado:** Zustand 5
- **Data fetching:** TanStack Query 5
- **Formulários:** React Hook Form + Zod
- **Gráficos:** Recharts 2.15
- **Ícones:** Lucide React

### Infraestrutura
- **Containerização:** Docker + Docker Compose
- **Deploy:** Coolify em VPS Oracle Cloud
- **Domínio:** nandesk.com.br (SSL via Let's Encrypt)

### Decisões Técnicas e Trade-offs

| Decisão | Trade-off |
|---------|-----------|
| Monolito modular em vez de microserviços | ✅ Velocidade de desenvolvimento  ❌ Migração futura exige trabalho |
| Mock determinístico de Open Finance | ✅ Demo consistente sem dependência externa  ❌ Não reflete variações reais do BCB |
| Score por regras em vez de ML | ✅ 100% explicável (LGPD)  ❌ Menor capacidade de encontrar padrões não óbvios |
| `prisma db push` em vez de migrations | ✅ Deploy simples  ❌ Não rastreável em histórico |
| JWT stateless (sem Redis) | ✅ Menos infra  ❌ Impossível invalidar token específico |

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Docker + Docker Compose
- (opcional) Node 22+ para rodar fora do container

### Via Docker (recomendado)

```bash
git clone https://github.com/oadrianops/semana_ubiqua_20261.git nandesk
cd nandesk
docker compose up -d --build
```

Aguarde ~30 segundos para o build terminar. Depois:

```bash
# Popular o banco com 3 usuários de demonstração
docker compose exec backend sh -c "DATABASE_URL=\$DATABASE_URL npx tsx --eval 'require(\"./dist\")' 2>/dev/null; npx prisma db seed" 2>/dev/null || \
  (cd backend && DATABASE_URL="postgresql://nandesk:nandesk_dev@localhost:5432/nandesk" npx tsx src/shared/utils/seed.ts)
```

Acesse:
- 🖥 Frontend: http://localhost:4173
- 🔌 API: http://localhost:3001
- 💾 Postgres: localhost:5432

### Credenciais de demo

| Email | Senha | Perfil |
|-------|-------|--------|
| joao@demo.com | demo123 | Motorista Uber (renda estável) |
| maria@demo.com | demo123 | Entregadora iFood (renda variável) |
| pedro@demo.com | demo123 | Freelancer (renda irregular) |

### Rodar sem Docker

```bash
# Backend
cd backend
npm install
cp .env.example .env           # ajuste DATABASE_URL
npx prisma db push
npx tsx src/shared/utils/seed.ts
npm run dev                    # porta 3001

# Frontend (em outro terminal)
cd frontend
npm install
npm run dev                    # porta 5173
```

---

## 📡 API Reference

Todas as rotas autenticadas esperam header `Authorization: Bearer <jwt>`.

### Auth
- `POST /api/auth/register` — cadastro (CPF, nome, email, phone, password)
- `POST /api/auth/login` — login (email, password)
- `GET /api/auth/me` — perfil do usuário autenticado

### Open Finance
- `GET /api/openfinance/institutions` — bancos disponíveis
- `GET /api/openfinance/connections` — conexões do usuário
- `POST /api/openfinance/connect` — conectar (`{ institutionId }`)
- `DELETE /api/openfinance/connections/:id` — desconectar
- `GET /api/openfinance/transactions` — transações importadas + sumário
- `GET /api/openfinance/consents` — consentimentos atuais
- `POST /api/openfinance/consents` — conceder (`{ categories: [] }`)
- `DELETE /api/openfinance/consents/:category` — revogar

### Score
- `POST /api/score/calculate` — calcular NanScore agora
- `GET /api/score/current` — último score computado
- `GET /api/score/history` — histórico de 12 últimos

### Credit
- `POST /api/credit/simulate` — simular (`{ amount, installments }`)
- `POST /api/credit/request` — solicitar crédito
- `GET /api/credit/requests` — listar
- `GET /api/credit/requests/:id` — detalhes
- `POST /api/credit/requests/:id/pay` — pagar parcela

### Fraud
- `GET /api/fraud/flags` — flags do usuário
- `POST /api/fraud/scan` — executar scan completo

---

## 🧪 Verificação end-to-end

```bash
# 1. Health check
curl http://localhost:3001/health
# → {"status":"ok","service":"nandesk-backend","version":"1.0.0"}

# 2. Login
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@demo.com","password":"demo123"}' | jq -r .token)

# 3. Calcular score
curl -X POST http://localhost:3001/api/score/calculate \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Simular crédito
curl -X POST http://localhost:3001/api/credit/simulate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":2000,"installments":6}' | jq
```

---

## ⚠️ Limitações conhecidas

- **Mock Open Finance** — Dados bancários são gerados localmente. Integração real com BCB exigiria autorização regulatória.
- **Sem Pix real** — Liberação é simbólica (status + timestamp).
- **Score baseado em regras** — Sem ML. Funciona bem para MVP mas tende a ser menos preciso que um modelo treinado.
- **Fraude básica** — Sem análise de grafos complexos nem modelos ML de fraude.
- **Sem cobrança automatizada** — Pagamento é manual (botão "Pagar") no dashboard.
- **Recálculo manual de score** — Não há recálculo automático agendado.

## 🔮 Melhorias futuras

- Integração real com PFAs (Provedores de Serviços de Iniciação/Agregação)
- Modelo de ML explicável (ex: XGBoost + SHAP values para manter auditabilidade)
- Cobrança automatizada + sistema de renegociação
- Reavaliação de score programática (cron diário)
- Dashboard admin com métricas de portfólio e alertas
- Integração real com APIs de plataformas (Uber, iFood, 99) quando disponíveis
- Split em microserviços quando volume justificar (começar por Score Engine)

---

## 📂 Estrutura do repositório

```
nandesk/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # Cadastro, login, JWT
│   │   │   ├── openfinance/    # Integração + consentimentos
│   │   │   ├── score/          # Motor NanScore
│   │   │   ├── credit/         # Simulação e solicitação
│   │   │   └── fraud/          # Anti-fraude
│   │   ├── shared/
│   │   │   ├── config/         # env, prisma client
│   │   │   ├── middleware/     # auth, error handler
│   │   │   └── utils/          # cpf, fingerprint, seed
│   │   └── server.ts
│   ├── prisma/schema.prisma
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/              # Landing, Login, Dashboard, Score, Credit
│   │   ├── components/         # Logo, Gauge, Breakdown, Layout
│   │   ├── services/           # API clients
│   │   ├── store/              # Zustand (auth)
│   │   └── lib/                # helpers (formatters, fingerprint)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml          # dev
├── docker-compose.prod.yml     # Coolify
├── DEPLOY.md                   # instruções de deploy
└── README.md                   # este arquivo
```

---

## 👥 Pitch (5 min) — roteiro

1. **0:00–0:30** — Problema: 35M de autônomos sem crédito
2. **0:30–1:00** — Persona: João, motorista Uber, ganha R$ 4k/mês mas banco nega
3. **1:00–2:30** — Demo: cadastro → conectar banco → NanScore → solicitar Pix
4. **2:30–3:30** — NanScore: 5 dimensões, explicabilidade, LGPD-compliant
5. **3:30–4:00** — Diferenciais: velocidade, anti-fraude, transparência
6. **4:00–4:30** — Stack: React/Node/Postgres/Docker em monolito modular evolutivo
7. **4:30–5:00** — Futuro: ML explicável, integração real BCB, expansão

---

## 👥 Equipe

| Nome | Papel |
|------|-------|
| [Adriano] | Desenvolvimento Backend — Score Engine, Open Finance, Fraud |
| [Fernando] | Desenvolvimento Frontend — UI/UX, Dashboard, Landing Page |
| [Erick] | Pesquisa & Documentação — Análise de mercado, Pitch, Arquitetura |

---

## 📄 Licença

MIT — use, modifique, distribua livremente.

---

*NanDesk — Hackathon Semana Ubíqua, UNAMA 2026*
