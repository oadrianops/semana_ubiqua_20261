# Deploy do NanDesk no Coolify

Guia passo-a-passo para deployar o NanDesk em uma VPS com [Coolify](https://coolify.io) já instalado, usando o domínio `nandesk.com.br`.

## Pré-requisitos

- VPS com Coolify instalado e acessível
- Domínio `nandesk.com.br` com DNS apontando para o IP da VPS
- Projeto versionado em um repositório Git acessível (GitHub/GitLab)

## DNS — Registros necessários

Configure no seu provedor de DNS (Registro.br, Cloudflare, etc.):

| Tipo | Nome | Valor |
|------|------|-------|
| A | `@` | IP_DA_VPS |
| A | `www` | IP_DA_VPS |
| A | `api` | IP_DA_VPS |

> O Coolify usa Traefik e Let's Encrypt automaticamente — basta o DNS resolver.

## Passos no Coolify

### 1. Push do código para GitHub

```bash
cd /path/to/nandesk
git init
git add .
git commit -m "feat: NanDesk MVP para hackathon Semana Ubíqua"
git branch -M main
git remote add origin https://github.com/oadrianops/semana_ubiqua_20261.git
git push -u origin main
```

### 2. Criar o recurso no Coolify

1. Acesse seu painel Coolify
2. **New Resource** → **Docker Compose (Empty)** OU **Public Repository**
3. Aponte para o repositório
4. Branch: `main`
5. Build pack: **Docker Compose**
6. Docker compose file: `docker-compose.prod.yml`

### 3. Variáveis de ambiente

Configure no Coolify UI (aba *Environment*):

```env
POSTGRES_DB=nandesk
POSTGRES_USER=nandesk
POSTGRES_PASSWORD=<GERE_UM_PASSWORD_FORTE>
JWT_SECRET=<GERE_UM_SECRET_DE_PELO_MENOS_32_CHARS>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://nandesk.com.br
VITE_API_URL=https://api.nandesk.com.br/api
```

Gere secrets rápidos:
```bash
openssl rand -base64 32   # para JWT_SECRET e POSTGRES_PASSWORD
```

### 4. Configurar domínios

Na aba **Domains** do Coolify, para cada serviço:

| Serviço | Domínio | Porta |
|---------|---------|-------|
| `frontend` | https://nandesk.com.br | 4173 |
| `backend` | https://api.nandesk.com.br | 3001 |

O Coolify emitirá SSL via Let's Encrypt automaticamente.

### 5. Deploy

Clique em **Deploy**. O Coolify irá:
1. Clonar o repositório
2. Build das 3 imagens (postgres, backend, frontend)
3. Subir os containers
4. Rotear o tráfego via Traefik
5. Emitir certificados SSL

Primeira build leva ~3-5 minutos. Acompanhe pelos logs.

### 6. Popular o banco (uma vez)

Após o primeiro deploy, execute o seed via terminal do container (disponível no Coolify UI):

```bash
cd backend
npm install tsx   # só uma vez — imagem prod não tem tsx
DATABASE_URL=$DATABASE_URL npx tsx src/shared/utils/seed.ts
```

Ou via psql direto:
```bash
docker exec -it $(docker ps -qf name=postgres) psql -U nandesk -d nandesk
```

> Alternativa: remova/ajuste o seed — para um hackathon é aceitável deixar os usuários demo no primeiro deploy manual.

### 7. Verificação

```bash
curl https://api.nandesk.com.br/health
# {"status":"ok","service":"nandesk-backend",...}

curl -I https://nandesk.com.br
# HTTP/2 200
```

Acesse `https://nandesk.com.br` no navegador — a landing page deve carregar e o login deve funcionar.

## Debug comum

| Sintoma | Diagnóstico |
|---------|-------------|
| Frontend carrega mas login falha | Verifique `VITE_API_URL` no build args — precisa estar no momento do build, não runtime |
| `CORS error` no console | `CORS_ORIGIN` no backend deve incluir `https://nandesk.com.br` |
| `JWT malformed` | `JWT_SECRET` mudou entre deploys — usuários existentes precisam fazer login novamente |
| 502 Bad Gateway | Backend ainda subindo (primeira vez roda `prisma db push`, leva ~10s) |
| Postgres não inicia | Volume `postgres_data` com permissão errada — no Coolify, delete o recurso e recrie |

## Atualizações

```bash
git push origin main
```

O Coolify detecta o push (se webhook configurado) e redeploya automaticamente. Ou clique em **Redeploy** no painel.

## Backup do banco

```bash
docker exec nandesk-postgres pg_dump -U nandesk nandesk > backup-$(date +%F).sql
```
