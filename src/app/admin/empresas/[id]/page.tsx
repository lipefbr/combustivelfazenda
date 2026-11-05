"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  UserCog,
  Ban,
  CheckCircle2,
  CalendarPlus,
  Building2,
  Users,
  Truck,
  CreditCard,
  Receipt,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import {
  COMPANY_STATUS,
  CONTROL_TYPE_LABELS,
  EQUIPMENT_TYPE_LABELS,
  ORIGIN_LABELS,
  REFUEL_SOURCE_LABELS,
  formatBRL,
  formatDate,
  formatDateTime,
  formatNumber,
} from "@/lib/constants";

export default function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, loading, error, refetch } = useApi<{ company: any }>(
    `/api/admin/companies/${id}`
  );
  const { data: refData } = useApi<{ refuelings: any[] }>(
    `/api/admin/refuelings?companyId=${id}`
  );
  const { data: maintData } = useApi<{ maintenances: any[] }>(
    `/api/admin/maintenances?companyId=${id}`
  );
  const { data: plansData } = useApi<{ plans: any[] }>("/api/plans");

  const [impersonating, setImpersonating] = useState(false);
  const [extending, setExtending] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error || !data?.company) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600 mb-2">Empresa não encontrada.</p>
        <Button asChild>
          <Link href="/admin/empresas">Voltar</Link>
        </Button>
      </Card>
    );
  }

  const company = data.company;
  const users: any[] = company.users || [];
  const equipments: any[] = company.equipments || [];
  const reservoirs: any[] = company.reservoirs || [];
  const refuelings = refData?.refuelings || [];
  const maintenances = maintData?.maintenances || [];
  const subscription = company.subscription;
  const plan = company.plan;

  async function impersonate() {
    if (!confirm(`Entrar como gestor da empresa "${company.name}"?`)) return;
    setImpersonating(true);
    try {
      await apiFetch(`/api/admin/companies/${company.id}/impersonate`, {
        method: "POST",
      });
      toast.success(`Você está agora como: ${company.name}`);
      router.push("/app/inicio");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Erro ao impersonar");
    } finally {
      setImpersonating(false);
    }
  }

  async function setStatus(status: string) {
    try {
      await apiFetch(`/api/admin/companies/${company.id}`, {
        method: "PATCH",
        json: { status },
      });
      toast.success("Status atualizado.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    }
  }

  async function extendTrial() {
    const days = prompt("Quantos dias adicionar?", "14");
    if (!days) return;
    setExtending(true);
    try {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + Number(days));
      await apiFetch(`/api/admin/companies/${company.id}`, {
        method: "PATCH",
        json: {
          trialEndsAt: newDate.toISOString(),
          status: company.status === "blocked" ? "trial" : company.status,
        },
      });
      toast.success(`Teste estendido em ${days} dias.`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setExtending(false);
    }
  }

  async function changePlan(planId: string) {
    try {
      await apiFetch(`/api/admin/companies/${company.id}`, {
        method: "PATCH",
        json: { planId: planId || null },
      });
      toast.success("Plano atualizado.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/empresas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold truncate">{company.name}</h1>
            <Badge
              variant={
                company.status === "active"
                  ? "default"
                  : company.status === "trial"
                    ? "secondary"
                    : "destructive"
              }
            >
              {COMPANY_STATUS[company.status] || company.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {company.responsibleName} · {company.email}
          </p>
        </div>
      </div>

      {/* Ações rápidas */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={impersonate}
            disabled={impersonating}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            <UserCog className="h-4 w-4" />
            {impersonating ? "Entrando..." : "Entrar como gestor"}
          </Button>
          <Button
            onClick={extendTrial}
            disabled={extending}
            variant="outline"
            className="gap-2"
          >
            <CalendarPlus className="h-4 w-4 text-amber-600" />
            {extending ? "Estendendo..." : "Estender teste"}
          </Button>
          {company.status === "blocked" ? (
            <Button
              onClick={() => setStatus("active")}
              variant="outline"
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Ativar
            </Button>
          ) : (
            <Button
              onClick={() => setStatus("blocked")}
              variant="outline"
              className="gap-2"
            >
              <Ban className="h-4 w-4 text-red-600" />
              Bloquear
            </Button>
          )}
        </div>
      </Card>

      <Tabs defaultValue="dados">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="dados">Dados</TabsTrigger>
          <TabsTrigger value="usuarios">
            Usuários ({users.length})
          </TabsTrigger>
          <TabsTrigger value="equipamentos">
            Equipamentos ({equipments.length})
          </TabsTrigger>
          <TabsTrigger value="reservatorios">
            Reservatórios ({reservoirs.length})
          </TabsTrigger>
          <TabsTrigger value="abastecimentos">
            Abastec. ({company._count?.refuelings ?? 0})
          </TabsTrigger>
          <TabsTrigger value="manutencoes">
            Manut. ({company._count?.maintenances ?? 0})
          </TabsTrigger>
          <TabsTrigger value="consumo">Consumo</TabsTrigger>
          <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
        </TabsList>

        {/* Dados */}
        <TabsContent value="dados">
          <Card className="p-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow icon={Building2} label="Nome" value={company.name} />
              <InfoRow
                icon={Users}
                label="Responsável"
                value={company.responsibleName}
              />
              <InfoRow icon={Mail} label="E-mail" value={company.email} />
              <InfoRow
                icon={Phone}
                label="WhatsApp"
                value={company.whatsapp || "—"}
              />
              <InfoRow
                icon={Phone}
                label="Telefone"
                value={company.phone || "—"}
              />
              <InfoRow
                icon={FileText}
                label="Documento"
                value={company.document || "—"}
              />
              {company.address && (
                <InfoRow
                  icon={Building2}
                  label="Endereço"
                  value={`${company.address}${company.city ? ` — ${company.city}/${company.state || ""}` : ""}`}
                />
              )}
              <InfoRow
                icon={CalendarPlus}
                label="Teste até"
                value={
                  company.trialEndsAt
                    ? formatDate(company.trialEndsAt)
                    : "—"
                }
              />
              <InfoRow
                icon={CalendarPlus}
                label="Criada em"
                value={formatDate(company.createdAt)}
              />
            </div>
          </Card>
        </TabsContent>

        {/* Usuários */}
        <TabsContent value="usuarios">
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Último acesso</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {u.role === "manager" ? "Gestor" : "Operador"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.phone || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.active ? "default" : "destructive"}
                        >
                          {u.active ? "Ativo" : "Bloqueado"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Equipamentos */}
        <TabsContent value="equipamentos">
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Placa/Patrim.</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Controle</TableHead>
                  <TableHead>Leitura atual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum equipamento.
                    </TableCell>
                  </TableRow>
                ) : (
                  equipments.map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.name}</TableCell>
                      <TableCell>
                        {EQUIPMENT_TYPE_LABELS[e.type] || e.type}
                      </TableCell>
                      <TableCell className="text-sm">
                        {e.plate || e.assetNumber || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {ORIGIN_LABELS[e.origin] || e.origin}
                      </TableCell>
                      <TableCell className="text-sm">
                        {CONTROL_TYPE_LABELS[e.controlType] || e.controlType}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatNumber(e.currentReading, 0)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Reservatórios */}
        <TabsContent value="reservatorios">
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>Nome</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Nível atual</TableHead>
                  <TableHead>Mínimo</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservoirs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum reservatório.
                    </TableCell>
                  </TableRow>
                ) : (
                  reservoirs.map((r: any) => {
                    const minLiters =
                      r.minLevelType === "percent"
                        ? (r.capacity * r.minLevel) / 100
                        : r.minLevel;
                    const isLow = r.currentLevel < minLiters;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.fuelType}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatNumber(r.capacity, 0)} L
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatNumber(r.currentLevel, 0)} L
                        </TableCell>
                        <TableCell className="text-sm">
                          {r.minLevelType === "percent"
                            ? `${r.minLevel}%`
                            : `${formatNumber(r.minLevel, 0)} L`}
                        </TableCell>
                        <TableCell>
                          {isLow ? (
                            <Badge variant="destructive">Baixo</Badge>
                          ) : (
                            <Badge>OK</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Abastecimentos */}
        <TabsContent value="abastecimentos">
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>Data</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Litros</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Leitura</TableHead>
                  <TableHead>Operador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refuelings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum abastecimento.
                    </TableCell>
                  </TableRow>
                ) : (
                  refuelings.slice(0, 50).map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-sm">
                        {formatDateTime(r.refuelDate)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {r.equipment?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {REFUEL_SOURCE_LABELS[r.source] || r.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatNumber(r.liters, 1)} L
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatBRL(r.totalAmount)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatNumber(r.reading, 0)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.operatorName}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {refuelings.length > 50 && (
              <div className="p-3 text-center text-xs text-muted-foreground border-t">
                Mostrando 50 de {refuelings.length} registros.
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Manutenções */}
        <TabsContent value="manutencoes">
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>Data</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Leitura</TableHead>
                  <TableHead>Responsável</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma manutenção registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  maintenances.slice(0, 50).map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">
                        {formatDate(m.maintenanceDate)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {m.equipment?.name || "—"}
                      </TableCell>
                      <TableCell className="text-sm">{m.itemName}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatBRL(m.cost)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatNumber(m.readingAtMaintenance, 0)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.shopOrResponsible || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Consumo Mensal */}
        <TabsContent value="consumo">
          <Card className="p-5">
            <h3 className="font-bold text-lg mb-4">Consumo por equipamento</h3>
            <ConsumoPorEquipamento refuelings={refuelings} equipments={equipments} />
          </Card>
        </TabsContent>

        {/* Assinatura */}
        <TabsContent value="assinatura">
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600" />
                  Assinatura
                </h3>
                <p className="text-sm text-muted-foreground">
                  Status atual: {subscription?.status || "Sem assinatura"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={company.planId || "none"}
                  onChange={(e) =>
                    changePlan(e.target.value === "none" ? "" : e.target.value)
                  }
                >
                  <option value="none">Sem plano</option>
                  {(plansData?.plans || []).map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatBRL(p.monthlyPrice)}/mês
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {subscription ? (
              <div className="grid sm:grid-cols-3 gap-3">
                <InfoBox label="Ciclo" value={subscription.billingCycle} />
                <InfoBox
                  label="Valor"
                  value={formatBRL(subscription.amount)}
                />
                <InfoBox
                  label="Início"
                  value={formatDate(subscription.startsAt)}
                />
                <InfoBox
                  label="Próxima cobrança"
                  value={
                    subscription.currentEnd
                      ? formatDate(subscription.currentEnd)
                      : "—"
                  }
                />
                <InfoBox label="Método" value={subscription.paymentMethod || "—"} />
                <InfoBox
                  label="Status"
                  value={subscription.status}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Empresa sem assinatura ativa.
              </p>
            )}

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Receipt className="h-4 w-4" /> Pagamentos
              </h4>
              {subscription?.payments?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Vencimento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscription.payments.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-sm">
                          {formatDate(p.createdAt)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatBRL(p.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              p.status === "paid"
                                ? "default"
                                : p.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{p.method || "—"}</TableCell>
                        <TableCell>
                          {p.dueDate ? formatDate(p.dueDate) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum pagamento registrado.
                </p>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function ConsumoPorEquipamento({
  refuelings,
  equipments,
}: {
  refuelings: any[];
  equipments: any[];
}) {
  if (refuelings.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Sem abastecimentos.
      </p>
    );
  }

  const byEquip = new Map<string, { liters: number; cost: number }>();
  for (const r of refuelings) {
    const cur = byEquip.get(r.equipmentId) || { liters: 0, cost: 0 };
    cur.liters += r.liters;
    cur.cost += r.totalAmount;
    byEquip.set(r.equipmentId, cur);
  }

  const rows = Array.from(byEquip.entries())
    .map(([eqId, agg]) => {
      const eq = equipments.find((e) => e.id === eqId);
      return {
        eqId,
        name: eq?.name || "—",
        type: eq?.type,
        controlType: eq?.controlType,
        ...agg,
      };
    })
    .sort((a, b) => b.liters - a.liters);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Equipamento</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Litros</TableHead>
          <TableHead>Custo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.eqId}>
            <TableCell className="font-medium">{r.name}</TableCell>
            <TableCell className="text-sm">
              {r.type ? EQUIPMENT_TYPE_LABELS[r.type] || r.type : "—"}
            </TableCell>
            <TableCell className="font-medium">
              {formatNumber(r.liters, 0)} L
            </TableCell>
            <TableCell className="font-medium">{formatBRL(r.cost)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
