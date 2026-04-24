# Pesquisa de Mercado — NanDesk

Levantamento de dados e contexto regulatório que embasa o NanDesk.

---

## O Problema: Exclusão Financeira dos Autônomos

### Números do Mercado

| Indicador | Dado | Fonte |
|-----------|------|-------|
| Trabalhadores autônomos no Brasil | ~35 milhões | IBGE PNAD 2024 |
| Sem conta bancária ativa | ~11 milhões | Banco Central, 2024 |
| Negados por bancos tradicionais | ~60% dos autônomos | Serasa Experian |
| Motoristas de app (Uber/99) | ~1,5 milhões | ANTT/estimativas |
| Entregadores (iFood/Rappi) | ~300 mil ativos | ABComm |
| Renda média motorista Uber | R$ 3.800–4.500/mês | pesquisa própria |

### Por que os bancos negam?

O sistema bancário tradicional usa critérios pensados para empregados CLT:

1. **Comprovante de renda** — exige holerite ou declaração de IR com renda formal
2. **Histórico de crédito** — Serasa/SPC medem inadimplência, não capacidade de pagamento
3. **Vínculo empregatício** — muitos produtos exigem CNPJ ativo ou 12+ meses na mesma empresa
4. **Score opaco** — o usuário não sabe por que foi negado (violação do Art. 20 da LGPD)

**Resultado**: um motorista que ganha R$ 4.000/mês de forma consistente há 2 anos é tratado como "sem renda" pelo sistema.

---

## Open Finance como Solução

### O que é Open Finance (BCB)

O Banco Central do Brasil regulamentou o Open Finance em 2020 (Resolução Conjunta nº 1/2020). É um ecossistema de compartilhamento de dados financeiros com consentimento do titular.

**Fases de implementação:**
- **Fase 1** (2021): Dados de produtos e serviços das instituições
- **Fase 2** (2021): Dados cadastrais e transacionais dos clientes (com consentimento)
- **Fase 3** (2021): Iniciação de pagamentos
- **Fase 4** (2022): Dados de câmbio, seguros e investimentos

### Como o NanDesk usa isso

Em vez de pedir comprovante de renda, o NanDesk solicita consentimento Open Finance do usuário para acessar:

- Extrato dos últimos 6–12 meses (padrão de entrada/saída)
- Frequência e regularidade das transações
- Saldo médio mantido na conta

Isso revela a **renda real** — não a formal — de forma regulatória, com consentimento granular revogável (LGPD Art. 7º e Art. 20).

---

## Análise da Concorrência

| Empresa | Foco | Diferencial | Limitação vs NanDesk |
|---------|------|-------------|----------------------|
| **Creditas** | Crédito com garantia | Taxas baixas | Exige imóvel/carro como garantia |
| **Neon** | Conta digital + crédito | App amigável | Score tradicional Serasa |
| **Nubank** | Cartão de crédito | UX excelente | Nega autônomos sem histórico |
| **Rebel** | Crédito pessoal | Taxa competitiva | Renda formal exigida |
| **SuperSim** | Microcrédito | Rápido | Taxas altas (sem score analítico) |
| **Finaê** | Microcrédito popular | Comunidade | Sem dados Open Finance |

**Vantagem NanDesk:**
- Único com score **explicável** baseado em Open Finance (LGPD-compliant)
- Critérios transparentes: o usuário sabe exatamente como melhorar seu score
- Liberação via **Pix** (sem necessidade de conta no banco emissor)

---

## Contexto Regulatório

### LGPD (Lei 13.709/2018)

O NanDesk foi desenhado para estar em conformidade:

| Artigo | Requisito | Como atendemos |
|--------|-----------|----------------|
| Art. 7º | Consentimento para tratamento de dados | Modal de consentimento granular por categoria |
| Art. 20 | Direito à explicação de decisões automatizadas | NanScore com texto explicativo em linguagem simples |
| Art. 18 | Direito à revogação de consentimento | Botão de revogação por categoria a qualquer momento |
| Art. 46 | Medidas de segurança | bcrypt + JWT + rate limiting + fingerprint hash |

### Resolução BCB 1/2020 (Open Finance)

Em produção, o NanDesk precisaria de:
1. Certificação como **Instituição Participante** do Open Finance Brasil
2. Registro no **Diretório de Participantes** do Open Finance
3. Implementação do protocolo **FAPI** (Financial-grade API)

Para o MVP/hackathon, usamos um mock determinístico por CPF que simula os dados com a mesma estrutura da API real.

---

## Personas Validadas

### João — Motorista Uber (perfil estável)
- 38 anos, ensino médio completo
- Renda: R$ 4.200/mês (6 dias/semana, ~10h/dia)
- Padrão: entradas diárias pequenas, distribuídas ao longo da semana
- Necessidade: crédito de R$ 3.000 para reforma do carro (manter renda)
- Negado em 3 bancos por "falta de comprovante"

### Maria — Entregadora iFood (perfil variável)
- 29 anos
- Renda: R$ 2.800/mês (sazonal, picos em fins de semana e datas comemorativas)
- Padrão: renda oscila 40–60% entre meses
- Necessidade: crédito de R$ 1.500 para comprar mochila térmica profissional
- Sem histórico de crédito formal

### Pedro — Freelancer de Design (perfil irregular)
- 26 anos, superior incompleto
- Renda: R$ 3.500/mês (projetos esporádicos, pagamentos concentrados)
- Padrão: 2–3 entradas grandes/mês, gastos distribuídos
- Necessidade: R$ 800 para software anual (Adobe CC)
- Score Serasa: 320 (sem dívidas, mas sem histórico)

---

## Estimativa de Mercado Endereçável (TAM/SAM/SOM)

| Mercado | Tamanho | Critério |
|---------|---------|---------|
| **TAM** | 35 milhões de autônomos | Total do mercado potencial |
| **SAM** | ~8 milhões | Autônomos com smartphone + conta digital + Open Finance ativo |
| **SOM** | ~50.000 usuários | Alvo para 12 meses (cidade de Belém + capitais Norte/Nordeste) |

**Ticket médio**: R$ 1.800 por crédito  
**Revenue model**: spread sobre taxa de juros (2.5%–5.9% a.m.) + taxa de serviço 1.5%

---

## Entrevistas 7–12 — Achados Pós-Lançamento

Simulação do cenário *"a plataforma foi lançada e apareceram problemas reais"*. Cada entrevista traduzida em um requisito concreto do produto.

### 7. Head de Risco — Crise de Inadimplência

> "Estamos aprovando gente que não paga. O modelo está muito permissivo."

**Sintese:**
- Falta contexto comportamental (padrão de uso, horário, consistência de localização)
- Localização é sensível — precisa tratamento cuidadoso de privacidade
- Score deve ser mais conservador e se ajustar ao comportamento ao longo do tempo

**Impacto no NanDesk:**
- Threshold de aprovação subiu de **700 → 750**; faixa de revisão 550–749
- Múltiplos de renda reduzidos (3x → 2.5x na faixa alta; 1.5x → 1.2x na faixa média)
- `alternativeScore` passou a incluir **consistência de horário** (entropia de 4 turnos de 6h) — deriva de transações consentidas, sem GPS
- **Penalidade de tendência**: se os 3 últimos scores mostram queda > 50 pontos, aplica fator 0.95

### 8. Segurança — Fraude Ativa

> "Contas falsas sendo criadas em massa. Mesmo dispositivo, mesmo IP, às vezes mesmo CPF variando levemente."

**Síntese:**
- Correlação entre contas é essencial (device + IP + padrão)
- Renda circular: usuários movimentando valores artificialmente para inflar score

**Impacto no NanDesk:**
- Novo scan `duplicate_ip` em `fraud.service.ts` (complementa `duplicate_device`)
- `runFullScan` agora roda 3 varreduras em paralelo
- Renda circular já estava marcada (`isCircular: true`) — mantido e reforçado no `paymentScore`

### 9. Jurídico — Pressão de Usuários

> "Os usuários querem saber por que foram negados. Não conseguimos explicar."

**Síntese:**
- Explicação obrigatória, simples, não-técnica
- Exemplos aceitáveis: *"Seu histórico de movimentação indica instabilidade"*, *"Seu padrão de renda não é consistente"*
- IA pode ser usada, mas precisa justificar a decisão
- Dados novos (ex: localização) só com consentimento explícito

**Impacto no NanDesk:**
- `generateExplanation()` gera frases em PT-BR identificando a dimensão mais fraca
- Texto persistido em `ScoreHistory` para auditoria (LGPD Art. 20)
- Decisão explícita de **não usar GPS** — substituído por horário/dia-da-semana derivados do extrato consentido

### 10. Operação — Cobrança e Recuperação

> "Usuários param de pagar e a gente só descobre tarde. Precisamos de monitoramento pós-crédito."

**Síntese:**
- Alertas de risco antes do atraso
- Reavaliação periódica de score
- Suporte a negociação de dívida
- Automação com controle humano

**Impacto no NanDesk:**
- Novos endpoints `GET /api/credit/overdue` e `GET /api/credit/upcoming?days=N`
- Score pode ser recalculado sob demanda a qualquer momento; histórico imutável em `ScoreHistory`
- **Próximo passo**: notificação automática (WhatsApp/email) 3 dias antes do vencimento e no dia do atraso

### 11. Investidor — Escala

> "Queremos milhões de usuários e expansão para outros países. Regulação e dados mudam."

**Síntese:**
- Escala horizontal
- Arquitetura adaptável a outras jurisdições
- Dados locais (regulação LGPD/GDPR/LFPDPPP)

**Impacto no NanDesk:**
- Monolito modular com módulos prontos para extração
- Score Engine é o primeiro candidato a microserviço
- Consent engine é agnóstico de jurisdição (basta mapear categorias)
- Prisma + PostgreSQL suporta sharding por região no futuro

### 12. Parceiro — Plataforma de Delivery

> "Podemos fornecer indicadores processados, não dados brutos. Privacidade e estratégia."

**Síntese:**
- Acesso apenas a scores e métricas agregadas
- Trade-off: perda de granularidade × ganho de conformidade

**Impacto no NanDesk:**
- Dimensão `alternativeScore` desenhada para receber score externo pré-processado
- Arquitetura permite plugar novos provedores sem alterar o cálculo core

---

*Pesquisa compilada por Fernando Noronha — Hackathon Semana Ubíqua, UNAMA 2026*
