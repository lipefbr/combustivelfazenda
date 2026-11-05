# FuelGest — Contexto para Subagentes

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui (New York)
- Prisma ORM (SQLite em dev, PostgreSQL em produção)
- Tema verde esmeralda (primary emerald-500 ~ #10B981)
- Lucide icons

## Convenções
- Cores: use `bg-emerald-600`, `text-emerald-600`, etc. (não azul/indigo)
- Botões principais: `bg-emerald-600 hover:bg-emerald-700`
- Botões de ação (CTA): `bg-amber-500 hover:bg-amber-600 text-white`
- Cards: `<Card className="p-5">` (componente shadcn/ui já existe)
- Formatação: `formatBRL`, `formatNumber`, `formatDate`, `formatDateTime` de `@/lib/constants`
- Constantes: `EQUIPMENT_TYPE_LABELS`, `CONTROL_TYPE_LABELS`, `ORIGIN_LABELS`, `REFUEL_SOURCE_LABELS` em `@/lib/constants`

## Cliente de API (client-side)
```tsx
import { apiFetch, apiUpload, apiDownload } from "@/lib/api-client";

// GET
const data = await apiFetch<any>("/api/equipments");

// POST com JSON
await apiFetch("/api/equipments", { method: "POST", json: {...} });

// PATCH/DELETE similar
await apiFetch("/api/equipments/123", { method: "PATCH", json: {...} });
await apiFetch("/api/equipments/123", { method: "DELETE" });

// Upload de imagem
const { url } = await apiUpload("/api/upload", file, "equipments");

// Download de arquivo (PDF/Excel/CSV)
await apiDownload("/api/reports/export?format=pdf&type=summary");
```

## Hook useApi (client-side data fetching)
```tsx
import { useApi } from "@/hooks/use-session";
const { data, error, loading, refetch } = useApi<any>("/api/dashboard");
```

## Sessão atual (no client)
```tsx
import { useApi } from "@/hooks/use-session";
const { data: session } = useApi<{ user: any }>("/api/auth/me");
// session.user.role: "manager" | "operator" | "super_admin"
// session.user.companyId, session.user.companyName, session.user.name
```

## Sessão atual (no server)
```tsx
import { getSession, requireAuth, requireCompanyUser, requireManager, requireSuperAdmin } from "@/lib/auth";
const session = await getSession();
const user = await requireAuth(); // throws UNAUTHORIZED
```

## APIs disponíveis (todas em /api)

### Públicas (sem auth)
- GET `/api/plans` → `{ plans: Plan[] }`
- GET `/api/landing` → `{ content, testimonials, settings }`
- POST `/api/leads` → `{ lead }` (campos: name, company?, whatsapp?, email?, equipmentCount?, message?)

### Auth
- POST `/api/auth/login` (json: email, password) → `{ user }`
- POST `/api/auth/register` (json: companyName, responsibleName, email, whatsapp, password, phone?, document?) → `{ user, company }`
- POST `/api/auth/logout` → `{ ok: true }`
- GET `/api/auth/me` → `{ user, impersonatedBy? }`
- POST `/api/auth/change-password` (json: currentPassword, newPassword)
- POST `/api/auth/unimpersonate` (encerra impersonação)
- POST `/api/upload` (FormData: file, subdir="equipments"|"invoices"|"refuelings"|"maintenance") → `{ url }`

### App (empresa autenticada)
- GET `/api/dashboard` → `{ cards, reservoirs, recentRefuelings, maintenanceAlerts, alerts, consumptions }`
  - cards: `{ totalStock, litersMonth, costMonth, activeAlertsCount, equipmentCount, reservoirCount }`
- GET/PATCH `/api/company` → `{ company }` (campos: name, responsibleName, whatsapp, phone, document, address, city, state, zipCode)
- GET `/api/equipments` (query: origin, type) → `{ equipments: Equipment[] }`
- POST `/api/equipments` (json: name, type, plate?, assetNumber?, value?, photo?, notes?, origin, ownerName?, controlType, initialReading, maintenanceItems?)
  - types: "truck" | "light_vehicle" | "heavy_machine" | "other"
  - controlType: "hours" | "km"
  - origin: "company" | "third_party"
  - maintenanceItems: array de { name, interval, lastReading }
- GET/PATCH/DELETE `/api/equipments/[id]`
- GET `/api/reservoirs` → `{ reservoirs: Reservoir[] }`
- POST `/api/reservoirs` (json: name, capacity, fuelType, currentLevel?, minLevel?, minLevelType?)
  - minLevelType: "liters" | "percent"
- GET/PATCH/DELETE `/api/reservoirs/[id]` (GET retorna com fuelEntries e refuelings)
- GET `/api/fuel-entries` (query: reservoirId) → `{ entries }`
- POST `/api/fuel-entries` (json: reservoirId, liters, pricePerLiter, totalAmount?, supplier?, invoiceNumber?, invoicePhoto?, entryDate?, notes?)
- GET `/api/refuelings` (query: startDate, endDate, equipmentId, operatorId, source, reservoirId, companyId[admin]) → `{ refuelings }`
- POST `/api/refuelings` (json: equipmentId, reservoirId?, operatorName?, source, externalStation?, externalPricePerLiter?, externalTotalAmount?, externalInvoicePhoto?, liters, fuelType, pricePerLiter, totalAmount?, reading, service?, notes?, photo?, refuelDate?)
  - source: "reservoir" | "external"
- DELETE `/api/refuelings/[id]`
- GET `/api/maintenances` (query: equipmentId) → `{ maintenances }`
- POST `/api/maintenances` (json: equipmentId, itemId?, itemName, cost, readingAtMaintenance, shopOrResponsible?, notes?, photo?, maintenanceDate?)
- DELETE `/api/maintenances/[id]`
- GET `/api/expenses` (query: equipmentId) → `{ expenses }`
- POST `/api/expenses` (json: equipmentId?, category, description, amount, expenseDate?)
  - categories: "peças" | "serviços" | "pneus" | "outros"
- DELETE `/api/expenses/[id]`
- GET `/api/alerts` → `{ alerts }` (active alerts da empresa)
- GET `/api/notifications` → `{ notifications }`
- PATCH `/api/notifications/[id]` (mark as read)
- GET `/api/users` (manager) → `{ users }`
- POST `/api/users` (manager) (json: name, email, password, phone?, role) → `{ user }`
  - role: "manager" | "operator"
- PATCH/DELETE `/api/users/[id]` (manager)
- GET `/api/reports/summary` (query: startDate, endDate, equipmentId, operatorId, source, reservoirId, origin)
  → `{ summary, consumptionByEquipment, byOperator, maintenancePending, maintenanceDone, byReservoir, companyEquipment, thirdPartyEquipment, refuelings, entries, expenses }`
- GET `/api/reports/export` (query: format=csv|xlsx|pdf, type=summary|consumption|refuelings|entries|maintenance, + filtros)
  → binário do arquivo

### Admin (Super Admin)
- GET `/api/admin/dashboard` → `{ cards, monthlyData, topCompanies, topEquipments, registrationData, alerts }`
- GET `/api/admin/companies` (query: status, search) → `{ companies }`
- POST `/api/admin/companies` (json: name, responsibleName, email, whatsapp?, phone?, document?, status, planId?, managerPassword?)
- GET/PATCH/DELETE `/api/admin/companies/[id]` (campos: name, responsibleName, email, whatsapp, phone, document, status, planId, trialEndsAt)
- POST `/api/admin/companies/[id]/impersonate` (entra como gestor da empresa)
- GET `/api/admin/users` → `{ users }` (todos usuários)
- POST `/api/admin/users` (json: name, email, password, phone?, role, companyId?)
- PATCH/DELETE `/api/admin/users/[id]`
- GET `/api/admin/equipments` (query: companyId) → `{ equipments }`
- GET `/api/admin/refuelings` (query: companyId) → `{ refuelings }`
- GET `/api/admin/maintenances` (query: companyId) → `{ maintenances }`
- GET/POST `/api/admin/plans` → `{ plans }`
- PATCH/DELETE `/api/admin/plans/[id]`
- GET `/api/admin/leads` → `{ leads }`
- PATCH `/api/admin/leads/[id]` (json: status, notes)
- GET/PATCH `/api/admin/content` (body: { section, content })
- GET/POST `/api/admin/testimonials`
- PATCH/DELETE `/api/admin/testimonials/[id]`
- GET/PATCH `/api/admin/settings` (body: { settings: {...}, fuelTypes: [...], maintenanceItems: [...] })
- GET `/api/admin/logs` → `{ logs }`

## Tipos de dados principais

```typescript
type Company = {
  id, name, slug, responsibleName, email, whatsapp, phone?, document?, address?, city?, state?, zipCode?,
  status: "trial" | "active" | "overdue" | "blocked",
  trialEndsAt?, planId?, createdAt
};

type User = {
  id, name, email, phone?, role: "super_admin" | "manager" | "operator",
  active, lastLoginAt?, companyId?, createdAt
};

type Equipment = {
  id, name, type: "truck" | "light_vehicle" | "heavy_machine" | "other",
  plate?, assetNumber?, value?, photo?, notes?,
  origin: "company" | "third_party", ownerName?,
  controlType: "hours" | "km",
  initialReading, currentReading, active, maintenanceItems[]
};

type Reservoir = {
  id, name, capacity, fuelType, currentLevel, minLevel, minLevelType: "liters" | "percent", notes?, active
};

type Refueling = {
  id, equipmentId, reservoirId?, operatorId, operatorName,
  source: "reservoir" | "external",
  externalStation?, externalPricePerLiter?, externalTotalAmount?, externalInvoicePhoto?,
  liters, fuelType, pricePerLiter, totalAmount, reading, previousReading?, consumption?,
  service?, notes?, photo?, refuelDate
};

type Maintenance = {
  id, equipmentId, itemId?, itemName, cost, readingAtMaintenance, shopOrResponsible?,
  notes?, photo?, maintenanceDate
};

type Expense = {
  id, equipmentId?, category, description, amount, expenseDate
};

type Alert = {
  id, companyId, equipmentId?, reservoirId?, type: "maintenance" | "stock" | "system",
  level: "info" | "warning" | "danger", title, message, status: "active" | "dismissed"
};

type Plan = {
  id, name, description?, monthlyPrice, yearlyPrice, maxEquipments, maxUsers,
  features: string (JSON string), highlighted, order, active
};
```

## Componentes shadcn/ui disponíveis
Todos os componentes em `src/components/ui/` já estão instalados:
- button, input, label, textarea, select, badge, card, dialog, alert-dialog, sheet, drawer
- tabs, accordion, table, pagination, separator, switch, checkbox, radio-group, slider
- toast, sonner (toasts), tooltip, popover, dropdown-menu, avatar, calendar
- form (react-hook-form), command (command palette), sidebar, breadcrumb
- chart (recharts), progress, skeleton, scroll-area, etc.

## Componentes customizados
- `src/components/app/shell.tsx` — AppShell (sidebar + topbar + bottom nav para o /app)
- `src/components/landing/*` — seções da landing page

## Helpers de formatação (em @/lib/constants)
```typescript
formatBRL(1234.56) // "R$ 1.234,56"
formatNumber(1234.56, 2) // "1.234,56"
formatDate(date) // "05/11/2026"
formatDateTime(date) // "05/11/2026 14:30"
calculateConsumption(prev, current, liters, controlType) // L/h ou km/L
maintenanceStatus(lastReading, currentReading, interval) // { level, percent, remaining }
```

## Mapa de constantes (em @/lib/constants)
```typescript
EQUIPMENT_TYPE_LABELS = { truck: "Caminhão", light_vehicle: "Veículo leve", heavy_machine: "Máquina pesada", other: "Outro" }
CONTROL_TYPE_LABELS = { hours: "Horímetro (horas)", km: "Hodômetro (km)" }
ORIGIN_LABELS = { company: "Da fazenda/empresa", third_party: "De terceiros" }
REFUEL_SOURCE_LABELS = { reservoir: "Reservatório da fazenda", external: "Posto externo" }
COMPANY_STATUS = { trial: "Em teste", active: "Ativa", overdue: "Inadimplente", blocked: "Bloqueada" }
LEAD_STATUS = { new: "Novo", contacted: "Contatado", negotiating: "Em negociação", won: "Ganho", lost: "Perdido" }
DEFAULT_MAINTENANCE_ITEMS = [...]
DEFAULT_FUEL_TYPES = ["Diesel S10", "Diesel S500", "Gasolina", "Etanol", "ARLA 32"]
```

## Notas importantes
1. Sempre use `relative paths` em fetch (não `localhost` ou domínio absoluto).
2. Para páginas server, use `getSession()` ou `requireXxx()` para checar auth.
3. Para páginas client, use `useApi()` para buscar dados.
4. Use `<Toaster />` para notificações — `import { toast } from "sonner"; toast.success("msg")`.
5. Layout do /app já existe com `<AppShell>` (sidebar + bottom nav).
6. Para admin layout, criar shell separado com sidebar escuro.

## O que já está construído
- `src/app/page.tsx` (landing page completa)
- `src/app/app/login/page.tsx`, `src/app/app/cadastro/page.tsx`, `src/app/app/inicio/page.tsx`
- `src/app/app/layout.tsx` (com `<AppShell>`)
- Todas as APIs REST em `src/app/api/`
- Schema Prisma completo, seed, helpers de auth
