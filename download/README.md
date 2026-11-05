# FuelGest — Gestão de Combustível e Manutenção de Frota

Plataforma SaaS multiempresa para gestão de combustível, abastecimento e manutenção de frota e máquinas pesadas. Pensada para fazendas, usinas, construtoras, transportadoras e prefeituras.

**100% funcional** (não é só UI): multi-tenant com autenticação, schemas completos, APIs REST, painel admin, app móvel, relatórios em PDF/Excel/CSV, alertas de manutenção e estoque baixo, impersonação de empresas pelo Super Admin, e mais.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4** + **shadcn/ui** (New York)
- **Prisma ORM** (SQLite em desenvolvimento, PostgreSQL em produção)
- **Recharts** para gráficos
- **jsPDF + xlsx** para exportação
- **bcryptjs + JWT** para autenticação segura
- **Lucide** icons, **Sonner** toasts

## Funcionalidades

### App (gestor e operador)
- Dashboard com cards de estoque, litros do mês, custo e alertas
- Equipamentos: caminhão, veículo leve, máquina pesada, outro. Origem (fazenda/terceiros), controle por horímetro ou hodômetro, foto, valor, itens de manutenção por equipamento.
- Reservatórios: capacidade, nível atual, nível mínimo (litros ou %), alerta de estoque baixo.
- Entrada de combustível com foto da nota fiscal.
- Abastecimento em wizard de 5 etapas: origem (reservatório/posto) → equipamento + litros → leitura (horímetro/hodômetro) → serviço + observações → operador + confirmação. Cálculo automático de consumo (L/h ou km/L).
- Manutenções: alertas em 3 níveis (verde/amarelo/vermelho a partir de 90% do intervalo). Registro zera o contador do item.
- Despesas da frota (peças, serviços, pneus, outros) vinculadas a equipamento.
- Relatórios com filtros e exportação em PDF, Excel e CSV.
- Usuários da empresa (gestor).
- Mais: perfil, troca de senha, configurações da empresa.

### Landing page
- Hero com mockup de celular e cards flutuantes.
- Seções: problemas, recursos, como funciona, demo do app, relatórios (seção escura), segmentos, planos (com toggle mensal/anual), depoimentos, FAQ (acordeão), CTA final com formulário de lead, rodapé.
- Botão flutuante de WhatsApp (número configurável no admin).
- SEO completo (Open Graph, sitemap, dados estruturados).

### Painel Admin (Super Admin)
- Dashboard: empresas ativas, usuários, equipamentos, litros/mês, custo/mês, receita recorrente, leads novos, gráfico de consumo mensal (12 meses), top 10 empresas/equipamentos, cadastros por mês, alertas globais.
- Empresas: CRUD, status (teste, ativa, inadimplente, bloqueada), estender teste, trocar plano, **impersonação** com banner visível e log de auditoria.
- Usuários: lista global, criar, editar, resetar senha, ativar/bloquear.
- Equipamentos, abastecimentos, manutenções: visão global com filtros por empresa.
- Planos: CRUD com preços, limites (equipamentos/usuários), recursos, destaque.
- Leads: status (novo, contatado, em negociação, ganho, perdido), anotações, link WhatsApp, exportação.
- Conteúdo da landing: editar textos do hero, depoimentos, FAQ, número WhatsApp, redes sociais — sem mexer em código.
- Configurações: dados da plataforma, dias de teste, SMTP, integrações de pagamento, tipos de combustível padrão, itens de manutenção padrão, termos e privacidade.
- Logs de auditoria (login, criação/edição/exclusão, impersonação) com usuário, IP, data.

## Rotas

- `/` — landing page
- `/app/cadastro` — auto-cadastro de empresa (plano de teste 14 dias)
- `/app/login` — login do gestor/operador
- `/app/inicio` — dashboard
- `/app/equipamentos` — equipamentos
- `/app/equipamentos/[id]` — detalhe do equipamento
- `/app/abastecimentos` — histórico de abastecimentos
- `/app/abastecimentos/novo` — wizard de novo abastecimento
- `/app/estoque` — reservatórios
- `/app/estoque/entrada` — entrada de combustível
- `/app/manutencoes` — manutenções e alertas
- `/app/despesas` — despesas
- `/app/relatorios` — relatórios com filtros e exportação
- `/app/usuarios` — usuários da empresa (gestor)
- `/app/mais` — perfil, configurações, sair
- `/app/alertas` — central de alertas
- `/admin/login` — login do Super Admin
- `/admin` — dashboard
- `/admin/empresas` — empresas (CRUD + impersonação)
- `/admin/empresas/[id]` — detalhe da empresa
- `/admin/usuarios` — usuários globais
- `/admin/equipamentos` — equipamentos globais
- `/admin/abastecimentos` — abastecimentos globais
- `/admin/manutencoes` — manutenções globais
- `/admin/planos` — planos (CRUD)
- `/admin/leads` — leads
- `/admin/conteudo` — conteúdo da landing
- `/admin/configuracoes` — configurações da plataforma
- `/admin/logs` — logs de auditoria
- `/admin/perfil` — perfil do Super Admin

## Credenciais iniciais (seed)

```
Super Admin:
  Email:    admin@fuelgest.com
  Senha:    FuelGest@Admin2026!
```

⚠ **Troque a senha no primeiro acesso** (o sistema marca `forcePasswordChange: true`).

## Variáveis de ambiente

Crie um arquivo `.env` na raiz (use `.env.example` como referência):

```env
# Banco de dados (SQLite em dev, PostgreSQL em produção)
DATABASE_URL="file:./db/custom.db"           # dev
# DATABASE_URL="postgresql://USER:PASS@HOST:5432/fuelgest?schema=public"  # prod

# Segredo JWT (mínimo 32 caracteres — gere um forte em produção)
JWT_SECRET="troque-por-uma-string-aleatoria-de-32-caracteres-minimo"

# Dias de teste do plano trial
TRIAL_DAYS=14

# (opcional) Configurações de SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="contato@fuelgest.com"

# (opcional) Integração de pagamento (Asaas ou Mercado Pago)
PAYMENT_PROVIDER=asaas
PAYMENT_API_KEY=

# (opcional) URL base do app (para links em e-mails)
NEXT_PUBLIC_APP_URL=https://seu-dominio.lipe.host
```

## Deploy na Lipe.host (Next.js + PostgreSQL)

1. **Crie o banco PostgreSQL** no painel da Lipe.host e copie a string de conexão.

2. **Faça upload do projeto** (ou conecte seu repositório Git) — Lipe.host detecta Next.js automaticamente.

3. **Configure as variáveis de ambiente** no painel da Lipe.host:
   - `DATABASE_URL` — string PostgreSQL (`postgresql://user:pass@host:5432/fuelgest?schema=public`)
   - `JWT_SECRET` — gere com `openssl rand -base64 32`
   - `TRIAL_DAYS=14`

4. **Ajuste o `datasource` no `prisma/schema.prisma`** para PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

5. **Comando de build** (Lipe.host costuma detectar `next build`):
   ```bash
   bun install
   bun run db:generate
   bun run db:push        # ou: prisma migrate deploy (em produção)
   bun run seed           # cria Super Admin, planos, tipos de combustível, itens de manutenção
   bun run build
   ```

6. **Comando de start**:
   ```bash
   bun .next/standalone/server.js
   # ou: npm start
   ```

7. **Acesse**:
   - Site público: `https://seu-dominio.lipe.host/`
   - Admin: `https://seu-dominio.lipe.host/admin/login`
   - Faça login com `admin@fuelgest.com` / `FuelGest@Admin2026!`
   - **Troque a senha no primeiro acesso.**

## Desenvolvimento local

```bash
# Instalar dependências
bun install

# Aplicar schema ao banco
bun run db:push

# Rodar seed (cria Super Admin, planos, etc.)
bun run seed

# Iniciar dev server
bun run dev
# Acesse http://localhost:3000
```

## Scripts

| Script | Descrição |
|---|---|
| `bun run dev` | Inicia o dev server (Next.js + Turbopack) |
| `bun run build` | Build de produção (standalone) |
| `bun run start` | Inicia o server de produção (após build) |
| `bun run lint` | ESLint |
| `bun run db:push` | Aplica schema ao banco (sem migrations) |
| `bun run db:generate` | Regenera o Prisma Client |
| `bun run db:migrate` | Cria/aplica migrations (PostgreSQL) |
| `bun run db:reset` | Reseta o banco (cuidado: apaga dados) |
| `bun run seed` | Popula o banco com dados iniciais |

## Estrutura do projeto

```
src/
├── app/                        # App Router (Next.js 16)
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout (fontes, ThemeProvider, Toaster)
│   ├── api/                    # APIs REST
│   │   ├── auth/               # login, logout, register, me, change-password, unimpersonate
│   │   ├── dashboard/          # Dashboard da empresa
│   │   ├── company/            # Dados da empresa atual
│   │   ├── equipments/         # CRUD de equipamentos
│   │   ├── reservoirs/         # CRUD de reservatórios
│   │   ├── fuel-entries/       # Entradas de combustível
│   │   ├── refuelings/         # Abastecimentos
│   │   ├── maintenances/      # Manutenções
│   │   ├── expenses/           # Despesas
│   │   ├── alerts/             # Alertas
│   │   ├── notifications/      # Notificações
│   │   ├── users/              # Usuários da empresa (gestor)
│   │   ├── reports/            # Relatórios + exportação PDF/Excel/CSV
│   │   ├── plans/              # Planos (público)
│   │   ├── landing/            # Conteúdo da landing (público)
│   │   ├── leads/              # Criação pública de leads
│   │   ├── upload/             # Upload de imagens
│   │   └── admin/              # APIs do painel admin (super_admin)
│   ├── app/                    # App do gestor/operador
│   │   ├── login/
│   │   ├── cadastro/
│   │   ├── inicio/
│   │   ├── equipamentos/
│   │   ├── abastecimentos/     # lista + novo (wizard 5 etapas)
│   │   ├── estoque/             # lista + entrada
│   │   ├── manutencoes/
│   │   ├── despesas/
│   │   ├── relatorios/
│   │   ├── usuarios/
│   │   ├── mais/
│   │   └── alertas/
│   └── admin/                  # Painel admin (super_admin)
│       ├── login/
│       ├── (dashboard, empresas, usuarios, equipamentos, abastecimentos, manutencoes,
│       │  planos, leads, conteudo, configuracoes, logs, perfil)
├── components/
│   ├── ui/                     # shadcn/ui
│   ├── landing/                # Componentes da landing
│   ├── app/                    # AppShell, ImageUpload, States, ImpersonationBanner
│   └── admin/                  # AdminShell, DataTable
├── lib/
│   ├── auth.ts                 # JWT, hash senha, sessão, helpers
│   ├── db.ts                   # Prisma Client singleton
│   ├── constants.ts            # Tipos, labels, formatadores
│   ├── alerts.ts               # Geração de alertas (estoque/manutenção)
│   ├── upload.ts               # Upload de imagens
│   └── api-client.ts           # Cliente fetch para o browser
├── hooks/
│   └── use-session.ts          # useApi + useSession hooks
└── middleware.ts               # Proteção de rotas

prisma/
└── schema.prisma               # Schema multi-tenant completo

scripts/
└── seed.ts                     # Seed (Super Admin, planos, tipos combustível, itens manutenção)
```

## Segurança

- Senha com hash bcrypt (10 rounds).
- Sessão JWT em cookie httpOnly (7 dias).
- Middleware protege todas as rotas `/admin/*` e `/app/*` (exceto login/cadastro).
- APIs admin validam `requireSuperAdmin()` em cada handler.
- APIs da empresa validam `requireCompanyUser()` ou `requireManager()`.
- Rate limit no login (5 tentativas / 5 minutos).
- Validação de entrada com Zod.
- Impersonação logada em `AuditLog` com IP e usuário.
- Upload de imagens com validação de tipo e tamanho (máx 10MB).

## Multi-tenant

- Cada empresa tem `companyId` em todos os registros (equipamentos, abastecimentos, manutenções, despesas, etc).
- Todas as queries filtram por `companyId` (exceto super_admin no painel admin).
- Os dados de cada empresa são totalmente isolados.
- O Super Admin pode "entrar como" qualquer gestor de empresa (impersonação) — fica visível no `/app` com banner e é logado em auditoria.

## Licença

Proprietária — FuelGest.
