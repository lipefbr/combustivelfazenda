// Helpers de constante / tipos compartilhados
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  MANAGER: "manager",
  OPERATOR: "operator",
} as const;

export const EQUIPMENT_TYPES = {
  TRUCK: "truck",
  LIGHT_VEHICLE: "light_vehicle",
  HEAVY_MACHINE: "heavy_machine",
  OTHER: "other",
} as const;

export const EQUIPMENT_TYPE_LABELS: Record<string, string> = {
  truck: "Caminhão",
  light_vehicle: "Veículo leve",
  heavy_machine: "Máquina pesada",
  other: "Outro",
};

export const CONTROL_TYPES = {
  HOURS: "hours",
  KM: "km",
} as const;

export const CONTROL_TYPE_LABELS: Record<string, string> = {
  hours: "Horímetro (horas)",
  km: "Hodômetro (km)",
};

export const ORIGIN_TYPES = {
  COMPANY: "company",
  THIRD_PARTY: "third_party",
} as const;

export const ORIGIN_LABELS: Record<string, string> = {
  company: "Da fazenda/empresa",
  third_party: "De terceiros",
};

export const REFUEL_SOURCE = {
  RESERVOIR: "reservoir",
  EXTERNAL: "external",
} as const;

export const REFUEL_SOURCE_LABELS: Record<string, string> = {
  reservoir: "Reservatório da fazenda",
  external: "Posto externo",
};

export const ALERT_LEVELS = {
  OK: "ok",
  WARNING: "warning",
  DANGER: "danger",
} as const;

export const COMPANY_STATUS: Record<string, string> = {
  trial: "Em teste",
  active: "Ativa",
  overdue: "Inadimplente",
  blocked: "Bloqueada",
};

export const LEAD_STATUS: Record<string, string> = {
  new: "Novo",
  contacted: "Contatado",
  negotiating: "Em negociação",
  won: "Ganho",
  lost: "Perdido",
};

export const PLAN_DEFAULTS = {
  trialDays: 14,
  defaultSuperAdminEmail: "admin@fuelgest.com",
};

// Itens de manutenção padrão (auto-aplicados no cadastro de equipamento)
export const DEFAULT_MAINTENANCE_ITEMS = [
  { name: "Troca de óleo do motor", defaultInterval: 250, controlType: "hours" },
  { name: "Filtro de óleo", defaultInterval: 250, controlType: "hours" },
  { name: "Filtro de combustível", defaultInterval: 500, controlType: "hours" },
  { name: "Filtro de ar", defaultInterval: 500, controlType: "hours" },
  { name: "Graxa", defaultInterval: 100, controlType: "hours" },
  { name: "Correia", defaultInterval: 1000, controlType: "hours" },
  { name: "Revisão geral", defaultInterval: 2000, controlType: "hours" },
];

// Tipos de combustível padrão
export const DEFAULT_FUEL_TYPES = [
  "Diesel S10",
  "Diesel S500",
  "Gasolina",
  "Etanol",
  "ARLA 32",
];

// Formatação em BRL
export function formatBRL(value: number | null | undefined): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumber(value: number | null | undefined, digits = 0): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

// Cálculo de consumo: L/hora ou km/L
export function calculateConsumption(
  previousReading: number,
  currentReading: number,
  liters: number,
  controlType: "hours" | "km"
): number | null {
  const delta = currentReading - previousReading;
  if (delta <= 0 || liters <= 0) return null;
  if (controlType === "hours") {
    return liters / delta; // L/hora
  } else {
    return delta / liters; // km/L
  }
}

// Status de manutenção: ok | warning | danger
export function maintenanceStatus(
  lastReading: number,
  currentReading: number,
  interval: number
): { level: "ok" | "warning" | "danger"; percent: number; remaining: number } {
  const elapsed = currentReading - lastReading;
  const percent = Math.min(100, (elapsed / interval) * 100);
  const remaining = Math.max(0, interval - elapsed);

  if (elapsed >= interval) {
    return { level: "danger", percent, remaining: 0 };
  }
  if (percent >= 90) {
    return { level: "warning", percent, remaining };
  }
  return { level: "ok", percent, remaining };
}
