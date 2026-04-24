# NanDesk — Roteiro de Pitch (5 minutos)

Apresentação para o Hackathon Semana Ubíqua — UNAMA 2026  
Cenário: Open Finance

---

## Cronograma

| Tempo | Seção | Quem |
|-------|-------|------|
| 0:00 – 0:30 | Abertura: o problema | Apresentador 1 |
| 0:30 – 1:15 | A persona: João, o motorista | Apresentador 1 |
| 1:15 – 2:45 | Demo ao vivo | Apresentador 2 |
| 2:45 – 3:30 | NanScore: como funciona | Apresentador 2 |
| 3:30 – 4:00 | Diferenciais e segurança | Apresentador 1 |
| 4:00 – 4:30 | Stack e arquitetura | Apresentador 2 |
| 4:30 – 5:00 | Futuro e perguntas | Ambos |

---

## Script Completo

### 0:00 – 0:30 | Abertura

> "No Brasil, existem **35 milhões de trabalhadores autônomos**. Motoristas de app. Entregadores. Freelancers. Pessoas que trabalham todos os dias e têm renda real. Mas quando elas vão ao banco pedir um crédito simples… são negadas. Porque o banco não consegue *ver* essa renda."

*(pausa de 2 segundos)*

> "O NanDesk muda isso."

---

### 0:30 – 1:15 | A Persona

> "Deixa eu te apresentar o João. Ele tem 38 anos, dirige para a Uber há 3 anos, trabalha 10 horas por dia, 6 dias por semana, e ganha em média R$ 4.200 por mês de forma consistente."

> "O carro do João precisa de uma revisão de R$ 3.000. Sem o carro, ele não trabalha. Ele foi ao banco. Foi negado. Foi a uma fintech. Negado de novo. Motivo: *falta de comprovante de renda formal*."

> "O João tem renda. O banco é que não tem olhos para ver."

---

### 1:15 – 2:45 | Demo ao vivo

*(Abrir o browser em nandesk.com.br ou localhost:4173)*

**Passo 1 — Cadastro (30s)**
> "O João abre o NanDesk, faz um cadastro simples com CPF e dados básicos."

*(demonstrar cadastro ou login com joao@demo.com / demo123)*

**Passo 2 — Open Finance (30s)**
> "Aqui está o diferencial. Em vez de pedir holerite, o NanDesk pede para João *autorizar* o acesso aos dados bancários dele — isso é o Open Finance, regulamentado pelo Banco Central. João escolhe quais categorias compartilhar. Pode revogar a qualquer momento."

*(clicar em Conectar Banco → selecionar banco → aceitar consentimento)*

**Passo 3 — NanScore (30s)**
> "Em segundos, o algoritmo analisa o histórico de transações e calcula o NanScore — de 0 a 1000. O João tem 847 pontos."

*(clicar em Calcular Score)*

> "E o sistema explica em português claro por que esse é o score dele. Isso não é uma caixa preta — é um requisito da LGPD, artigo 20."

**Passo 4 — Crédito (30s)**
> "João pede R$ 3.000 em 6 parcelas. O sistema calcula as parcelas, mostra a taxa, e — aprovado. O dinheiro cai via Pix."

*(demonstrar simulação e solicitação)*

---

### 2:45 – 3:30 | NanScore

> "O NanScore avalia 5 dimensões do comportamento financeiro real do João:"

| Dimensão | O que mede | Peso |
|----------|-----------|------|
| Regularidade de Renda | João recebe todo dia? | 30% |
| Volume de Movimentação | Quanto ele movimenta? | 25% |
| Comportamento de Gastos | Ele poupa alguma coisa? | 20% |
| Histórico de Pagamentos | Teve transações problemáticas? | 15% |
| Dados Alternativos | Frequência, recência, padrão semanal, consistência de horário e tendência temporal | 10% |

> "E toda decisão tem uma explicação em linguagem simples. O João sabe exatamente o que fazer para melhorar o score dele."

> "O score ainda aprende com o tempo: se os últimos resultados do João estão caindo, o sistema reduz automaticamente o valor liberado — é mais conservador, menos inadimplência."

---

### 3:30 – 4:00 | Diferenciais

**1. Transparência**
> "Diferente do Serasa, o NanScore é explicável. O João sabe por que teve esse score e o que fazer para melhorar. Isso não é firula — é a LGPD Art. 20."

**2. Anti-fraude em 3 camadas**
> "Correlacionamos contas por **device**, por **IP** e detectamos **renda circular** — quando alguém tenta inflar o extrato enviando dinheiro para si mesmo. Três scans rodam em paralelo a cada solicitação."

**3. Monitoramento pós-crédito**
> "Não acaba na liberação. A API já entrega parcelas vencidas e parcelas a vencer nos próximos 7 dias — base para alerta antes do atraso e para a operação agir antes da inadimplência virar problema."

**4. LGPD by design**
> "Consentimento granular por categoria. Revogação a qualquer momento. Minimização de dados: não armazenamos transações brutas, só agregados. E nada de GPS — usamos só o que o usuário já autorizou."

---

### 4:00 – 4:30 | Stack e Arquitetura

> "O NanDesk é um monolito modular — decisão consciente para hackathon, mas preparado para evoluir. Cada módulo (auth, open finance, score, crédito, fraude) pode ser extraído como microserviço quando o volume justificar. O Score Engine é o primeiro candidato quando escalarmos para milhões."

- **Backend**: Node.js 22 + Express + Prisma + PostgreSQL
- **Frontend**: React 18 + Vite + Tailwind
- **Infra**: Docker + Coolify na VPS Oracle Cloud
- **Domínio**: nandesk.com.br com SSL automático
- **Escala internacional**: consent engine agnóstico de jurisdição (LGPD → GDPR → LFPDPPP)

---

### 4:30 – 5:00 | Futuro e Encerramento

> "Nos próximos 12 meses, com integração real ao ecossistema Open Finance Brasil e um modelo de ML explicável com XGBoost + SHAP values — mantendo a auditabilidade que a LGPD exige."

> "O João não precisa de um banco tradicional. Ele precisa de um sistema que *veja* a renda dele. É isso que o NanDesk faz."

> "**NanDesk. Seu trabalho. Seu crédito.**"

---

## Perguntas Esperadas e Respostas

**"Vocês têm integração real com o Open Finance BCB?"**
> Ainda não — para produção precisaríamos de certificação como Instituição Participante (FAPI). No MVP usamos mock determinístico por CPF. A arquitetura foi desenhada para trocar o mock pela integração real sem refatoração.

**"Como garantem que os dados não vão ser usados para outra coisa?"**
> Consentimento granular revogável (LGPD Art. 7º). Não armazenamos transações brutas, só agregados. Toda decisão é auditável (LGPD Art. 20). Os dados de score ficam em posse do usuário.

**"A taxa de 5.9% ao mês não é muito alta?"**
> Para o perfil de risco do usuário com score 500-699, essa taxa é competitiva com o mercado de microcrédito informal (que chega a 15-20%/mês). O objetivo é melhorar progressivamente o score e cair na faixa de 2.5-3.9%.

**"O que diferencia de um banco digital como Nubank?"**
> O Nubank usa score Serasa/Boa Vista, que ignora renda de autônomo. O NanDesk usa dados comportamentais do próprio extrato do usuário via Open Finance. João com 3 anos de Uber e R$ 4k/mês seria negado no Nubank e aprovado aqui.

**"E se o modelo começar a aprovar gente que não paga?"**
> É exatamente o cenário que modelamos (Entrevista 7 — Head de Risco). Subimos o threshold de aprovação de 700 para 750, reduzimos os múltiplos de renda e adicionamos **penalidade de tendência**: se o score do usuário vem caindo, o sistema se auto-ajusta para baixo. Mais conservador, sem perder transparência.

**"E se criarem várias contas para driblar o score?"**
> Três scans simultâneos (Entrevista 8 — Segurança): device fingerprint, IP e renda circular. Qualquer correlação gera `FraudFlag` com severity automática — visível no dashboard admin.

**"E o pós-crédito? Como vocês sabem se o usuário está indo mal?"**
> `GET /api/credit/overdue` e `GET /api/credit/upcoming` já entregam parcelas vencidas e a vencer (Entrevista 10 — Operação). A base para notificação pré-vencimento e cobrança está pronta; o próximo passo é plugar o canal (WhatsApp/email).

---

*Roteiro preparado por [Nome do Integrante] — Hackathon Semana Ubíqua, UNAMA 2026*
