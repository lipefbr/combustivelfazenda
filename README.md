# ⛽ FuelGest

**Plataforma SaaS de gestão de combustível, abastecimento e manutenção de frota e máquinas pesadas.**

Multi-tenant (multiempresa) com isolamento total de dados. 100% funcional — não é só UI. PWA instalável no celular, funciona offline. Mobile-first.

Para **fazendas, usinas, construtoras, transportadoras e prefeituras**.

---

## 🚀 Acesso rápido

| Rota | Descrição |
|---|---|
| `/` | Landing page |
| `/app/cadastro` | Auto-cadastro de empresa (14 dias grátis) |
| `/app/login` | Login do gestor/operador |
| `/app/inicio` | Dashboard do app |
| `/admin/login` | Login do Super Admin |
| `/admin` | Painel admin completo |

## 🔐 Credenciais iniciais (após seed)

```
Super Admin:
  Email:    admin@fuelgest.com
  Senha:    FuelGest@Admin2026!
```

⚠ **Troque a senha no primeiro acesso.**

## 🛠️ Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (New York)
- **Prisma ORM** (SQLite em dev, PostgreSQL em produção)
- **Recharts** para gráficos
- **jsPDF + xlsx** para exportação
- **bcryptjs + JWT** para autenticação
- **PWA** — Service Worker, manifest, offline, instalável

## 📦 Instalação local

```bash
# Instalar dependências
bun install

# Aplicar schema ao banco
bun run db:push

# Rodar seed (cria Super Admin, planos, tipos de combustível, itens de manutenção)
bun run seed

# Iniciar dev server
bun run dev
# Acesse http://localhost:3000
```

## 🔧 Variáveis de ambiente

Crie um `.env` na raiz (use `.env.example` como referência):

```env
DATABASE_URL="file:./db/custom.db"           # dev (SQLite)
# DATABASE_URL="postgresql://USER:PASS@HOST:5432/fuelgest?schema=public"  # prod

JWT_SECRET="troque-por-uma-string-aleatoria-de-32-caracteres-minimo"
TRIAL_DAYS=14
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 🌐 Deploy na Lipe.host (Next.js + PostgreSQL)

1. **Crie o banco PostgreSQL** no painel da Lipe.host
2. **Faça upload do projeto** (ou conecte este repositório Git)
3. **Configure as variáveis de ambiente**:
   - `DATABASE_URL` — string PostgreSQL
   - `JWT_SECRET` — gere com `openssl rand -base64 32`
   - `TRIAL_DAYS=14`
4. **Ajuste o `datasource`** em `prisma/schema.prisma` para `postgresql`
5. **Comando de build**:
   ```bash
   bun install
   bun run db:generate
   bun run db:push   # ou: prisma migrate deploy
   bun run seed
   bun run build
   ```
6. **Start**: `bun .next/standalone/server.js`

## 📱 PWA (Progressive Web App)

Pode ser **instalado** no Android, iOS e Desktop Chrome/Edge, e funciona **parcialmente offline**.

- **Instalar (Android Chrome/Edge)**: apareceu banner "Instalar FuelGest" no canto inferior
- **Instalar (iOS Safari)**: toque em Compartilhar → "Adicionar à Tela de Início"
- **Service Worker** com cache inteligente (app shell + APIs + imagens)
- **Atalhos** no ícone instalado: Novo Abastecimento, Manutenções, Relatórios

## 📚 Documentação completa

👉 Veja **[`download/README.md`](download/README.md)** para detalhes completos:
- Rotas
- Perfis (Super Admin, Gestor, Operador)
- Funcionalidades do App e do Admin
- Estrutura do projeto
- Schema multi-tenant
- Segurança
- Variáveis de ambiente
- Deploy

## 🏗️ Estrutura principal

```
src/
├── app/                    # App Router (Next.js 16)
│   ├── page.tsx            # Landing page
│   ├── api/                # APIs REST (49 rotas)
│   ├── app/                # App do gestor/operador
│   └── admin/              # Painel admin (Super Admin)
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── landing/            # Componentes da landing
│   ├── app/                # AppShell, ImageUpload, States
│   ├── admin/              # AdminShell, DataTable
│   └── pwa/                # PWA: register-sw, install-prompt, apple-splash
├── lib/
│   ├── auth.ts             # JWT, hash senha, sessão
│   ├── db.ts               # Prisma Client
│   ├── constants.ts        # Tipos, labels, formatadores
│   ├── alerts.ts           # Geração de alertas
│   └── api-client.ts       # Cliente fetch
└── middleware.ts           # Proteção de rotas

prisma/schema.prisma        # Schema multi-tenant (22 modelos)
scripts/seed.ts             # Seed inicial
```

## 📊 Funcionalidades

### App (gestor/operador)
- Dashboard com cards (estoque, litros/mês, custo, alertas)
- Equipamentos: caminhão, veículo leve, máquina pesada, outro. Origem (fazenda/terceiros), controle por horímetro/hodômetro
- Reservatórios com alerta de estoque baixo
- Entrada de combustível com foto da nota
- **Wizard de abastecimento em 5 etapas** (reservatório ou posto externo)
- Manutenções com alertas em 3 níveis (verde/amarelo/vermelho)
- Despesas da frota
- Relatórios com exportação PDF/Excel/CSV
- Usuários da empresa (gestor)

### Painel Admin (Super Admin)
- Dashboard global com receita recorrente e top 10
- Empresas: CRUD, status, **impersonação** com banner visível
- Usuários, equipamentos, abastecimentos, manutenções (visão global)
- Planos (CRUD)
- Leads (do formulário da landing)
- Conteúdo da landing (editável sem código)
- Configurações da plataforma
- Logs de auditoria

## 🔒 Segurança

- Senha com hash bcrypt (10 rounds)
- Sessão JWT em cookie httpOnly (7 dias)
- Middleware protege todas as rotas /admin e /app
- Rate limit no login (5 tentativas / 5 minutos)
- Validação de entrada com Zod em todas as APIs
- Impersonação logada em `AuditLog` com IP e usuário

## 📝 Licença

Proprietária — FuelGest.

---

Feito com ☕ e 💚 para o agro e a indústria brasileira.
