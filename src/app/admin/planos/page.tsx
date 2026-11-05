"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  CreditCard,
  Tag,
  Receipt,
} from "lucide-react";
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
import { formatBRL, formatDate } from "@/lib/constants";

type Plan = {
  id: string;
  name: string;
  description?: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  maxEquipments: number;
  maxUsers: number;
  features: string;
  highlighted: boolean;
  order: number;
  active: boolean;
};

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  maxUses: number;
  usesCount: number;
  expiresAt?: string | null;
  active: boolean;
};

export default function AdminPlansPage() {
  const { data, loading, error, refetch } = useApi<{ plans: Plan[] }>(
    "/api/admin/plans"
  );
  const { data: companiesData } = useApi<{ companies: any[] }>(
    "/api/admin/companies"
  );

  const [editTarget, setEditTarget] = useState<Plan | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);
  const [tab, setTab] = useState("plans");

  const plans = data?.plans || [];
  const companies = companiesData?.companies || [];

  // Assinaturas ativas (companies com subscription ativa)
  const activeSubs = companies
    .filter((c) => c.subscription?.status === "active")
    .map((c) => ({ ...c.subscription, company: c.name, plan: c.plan?.name }));

  // Vencimentos próximos (trialEndsAt até 14 dias)
  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 14);
  const expiring = companies.filter(
    (c) =>
      c.trialEndsAt &&
      new Date(c.trialEndsAt) >= now &&
      new Date(c.trialEndsAt) <= soon
  );

  async function deletePlan(p: Plan) {
    try {
      await apiFetch(`/api/admin/plans/${p.id}`, { method: "DELETE" });
      toast.success("Plano removido.");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Planos & Assinaturas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie planos, cupons, assinaturas e pagamentos.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="plans">
            <CreditCard className="h-4 w-4 mr-1.5" /> Planos
          </TabsTrigger>
          <TabsTrigger value="subs">
            <Receipt className="h-4 w-4 mr-1.5" /> Assinaturas ({activeSubs.length})
          </TabsTrigger>
          <TabsTrigger value="expiring">
            Vencimentos ({expiring.length})
          </TabsTrigger>
          <TabsTrigger value="coupons">
            <Tag className="h-4 w-4 mr-1.5" /> Cupons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                <Plus className="h-4 w-4" /> Novo plano
              </Button>
            </div>

            {loading ? (
              <Card className="p-4">Carregando...</Card>
            ) : error ? (
              <Card className="p-4 text-red-600">{error}</Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <Card
                    key={p.id}
                    className={`p-5 relative ${p.highlighted ? "ring-2 ring-emerald-500" : ""}`}
                  >
                    {p.highlighted && (
                      <Badge className="absolute top-3 right-3 bg-emerald-600 text-xs gap-1">
                        <Star className="h-3 w-3" /> Destaque
                      </Badge>
                    )}
                    <div className="mb-3">
                      <h3 className="font-bold text-lg">{p.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {p.description || "—"}
                      </p>
                    </div>
                    <div className="mb-3">
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatBRL(p.monthlyPrice)}
                        <span className="text-xs font-normal text-muted-foreground">
                          {" "}
                          /mês
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Anual: {formatBRL(p.yearlyPrice)}
                      </p>
                    </div>
                    <div className="text-sm space-y-1 mb-3">
                      <p>
                        <strong>{p.maxEquipments}</strong> equipamentos
                      </p>
                      <p>
                        <strong>{p.maxUsers}</strong> usuários
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      <p className="font-semibold mb-1">Recursos:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {parseFeatures(p.features).slice(0, 4).map((f, i) => (
                          <li key={i} className="truncate">
                            {f}
                          </li>
                        ))}
                        {parseFeatures(p.features).length > 4 && (
                          <li>+{parseFeatures(p.features).length - 4} mais</li>
                        )}
                      </ul>
                    </div>
                    <div className="flex items-center gap-2 justify-between border-t pt-3">
                      <Badge variant={p.active ? "default" : "secondary"}>
                        {p.active ? "Ativo" : "Inativo"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditTarget(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="subs">
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>Empresa</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Próx. cobrança</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeSubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Nenhuma assinatura ativa.
                    </TableCell>
                  </TableRow>
                ) : (
                  activeSubs.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">
                        {s.company}
                      </TableCell>
                      <TableCell>{s.plan || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {s.billingCycle === "yearly" ? "Anual" : "Mensal"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatBRL(s.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{s.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(s.startsAt)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {s.currentEnd ? formatDate(s.currentEnd) : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="expiring">
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>Empresa</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Plano atual</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Teste vence em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiring.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      Nenhum vencimento próximo (14 dias).
                    </TableCell>
                  </TableRow>
                ) : (
                  expiring.map((c: any) => {
                    const days = Math.ceil(
                      (new Date(c.trialEndsAt).getTime() - now.getTime()) /
                        (24 * 60 * 60 * 1000)
                    );
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.responsibleName}</TableCell>
                        <TableCell>{c.plan?.name || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{c.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              days <= 3
                                ? "text-red-600 font-semibold"
                                : "text-amber-600"
                            }
                          >
                            {days} dias ({formatDate(c.trialEndsAt)})
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="coupons">
          <CouponsManager />
        </TabsContent>
      </Tabs>

      {createOpen && (
        <PlanFormDialog
          onClose={() => setCreateOpen(false)}
          onSaved={() => {
            setCreateOpen(false);
            refetch();
          }}
        />
      )}

      {editTarget && (
        <PlanFormDialog
          plan={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            refetch();
          }}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plano?</AlertDialogTitle>
            <AlertDialogDescription>
              Excluir o plano <strong>{deleteTarget?.name}</strong>? Empresas
              vinculadas ficarão sem plano.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && deletePlan(deleteTarget)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function parseFeatures(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function PlanFormDialog({
  plan,
  onClose,
  onSaved,
}: {
  plan?: Plan;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    monthlyPrice: plan?.monthlyPrice ?? 0,
    yearlyPrice: plan?.yearlyPrice ?? 0,
    maxEquipments: plan?.maxEquipments ?? 10,
    maxUsers: plan?.maxUsers ?? 5,
    features: plan ? parseFeatures(plan.features).join("\n") : "",
    highlighted: plan?.highlighted ?? false,
    order: plan?.order ?? 0,
    active: plan?.active ?? true,
  });

  async function save() {
    if (!form.name) {
      toast.error("Defina um nome para o plano.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        monthlyPrice: Number(form.monthlyPrice),
        yearlyPrice: Number(form.yearlyPrice),
        maxEquipments: Number(form.maxEquipments),
        maxUsers: Number(form.maxUsers),
        order: Number(form.order),
        features: form.features.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      if (plan) {
        await apiFetch(`/api/admin/plans/${plan.id}`, {
          method: "PATCH",
          json: payload,
        });
        toast.success("Plano atualizado!");
      } else {
        await apiFetch(`/api/admin/plans`, { method: "POST", json: payload });
        toast.success("Plano criado!");
      }
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{plan ? "Editar plano" : "Novo plano"}</DialogTitle>
          <DialogDescription>
            Defina preço, limites e recursos do plano.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Preço mensal (R$)</Label>
              <Input
                type="number"
                value={form.monthlyPrice}
                onChange={(e) =>
                  setForm({ ...form, monthlyPrice: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Preço anual (R$)</Label>
              <Input
                type="number"
                value={form.yearlyPrice}
                onChange={(e) =>
                  setForm({ ...form, yearlyPrice: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Máx. equipamentos</Label>
              <Input
                type="number"
                value={form.maxEquipments}
                onChange={(e) =>
                  setForm({ ...form, maxEquipments: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Máx. usuários</Label>
              <Input
                type="number"
                value={form.maxUsers}
                onChange={(e) =>
                  setForm({ ...form, maxUsers: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div>
            <Label>Recursos (um por linha)</Label>
            <Textarea
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              rows={5}
              placeholder={"Até 5 equipamentos\nRelatórios completos\n..."}
            />
          </div>
          <div className="grid grid-cols-3 gap-3 items-end">
            <div>
              <Label>Ordem</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) =>
                  setForm({ ...form, order: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Switch
                checked={form.highlighted}
                onCheckedChange={(v) =>
                  setForm({ ...form, highlighted: v })
                }
              />
              <Label className="cursor-pointer">Destaque</Label>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Switch
                checked={form.active}
                onCheckedChange={(v) => setForm({ ...form, active: v })}
              />
              <Label className="cursor-pointer">Ativo</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// CRUD simples de cupons — armazena em PlatformSetting como JSON (sem API própria).
function CouponsManager() {
  const { data: settingsData } = useApi<{ settings: Record<string, string> }>(
    "/api/admin/settings"
  );
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Lê cupons da settings (armazenados como JSON)
  useEffect(() => {
    if (settingsData?.settings?.coupons_json) {
      try {
        setCoupons(JSON.parse(settingsData.settings.coupons_json));
      } catch {}
    }
    setLoading(false);
  }, [settingsData]);

  async function persist(newCoupons: Coupon[]) {
    setCoupons(newCoupons);
    try {
      await apiFetch(`/api/admin/settings`, {
        method: "PATCH",
        json: {
          settings: {
            coupons_json: JSON.stringify(newCoupons),
          },
        },
      });
      toast.success("Cupons salvos.");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar cupons");
    }
  }

  async function remove(c: Coupon) {
    if (!confirm(`Excluir cupom ${c.code}?`)) return;
    await persist(coupons.filter((x) => x.id !== c.id));
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Cupons de desconto para assinaturas.
        </p>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Plus className="h-4 w-4" /> Novo cupom
        </Button>
      </div>
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900">
              <TableHead>Código</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Expira</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  Nenhum cupom criado.
                </TableCell>
              </TableRow>
            ) : (
              coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-medium">
                    {c.code}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {c.type === "percent" ? "%" : "R$"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {c.type === "percent"
                      ? `${c.value}%`
                      : formatBRL(c.value)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.usesCount} / {c.maxUses}
                  </TableCell>
                  <TableCell className="text-sm">
                    {c.expiresAt ? formatDate(c.expiresAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.active ? "default" : "secondary"}>
                      {c.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTarget(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(c)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {createOpen && (
        <CouponFormDialog
          onClose={() => setCreateOpen(false)}
          onSave={async (data) => {
            const newCoupon: Coupon = {
              ...data,
              id: `cpn_${Date.now()}`,
              usesCount: 0,
            };
            await persist([...coupons, newCoupon]);
            setCreateOpen(false);
          }}
        />
      )}

      {editTarget && (
        <CouponFormDialog
          coupon={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={async (data) => {
            await persist(
              coupons.map((c) =>
                c.id === editTarget.id ? { ...c, ...data } : c
              )
            );
            setEditTarget(null);
          }}
        />
      )}
    </div>
  );
}

function CouponFormDialog({
  coupon,
  onClose,
  onSave,
}: {
  coupon?: Coupon;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [form, setForm] = useState({
    code: coupon?.code || "",
    type: coupon?.type || "percent",
    value: coupon?.value ?? 10,
    maxUses: coupon?.maxUses ?? 100,
    expiresAt: coupon?.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
    active: coupon?.active ?? true,
  });

  function save() {
    if (!form.code) {
      toast.error("Informe o código do cupom.");
      return;
    }
    onSave({
      ...form,
      value: Number(form.value),
      maxUses: Number(form.maxUses),
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{coupon ? "Editar cupom" : "Novo cupom"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>Código *</Label>
            <Input
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              placeholder="VERAO20"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tipo</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="percent">Percentual (%)</option>
                <option value="fixed">Valor fixo (R$)</option>
              </select>
            </div>
            <div>
              <Label>Valor</Label>
              <Input
                type="number"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Máx. usos</Label>
              <Input
                type="number"
                value={form.maxUses}
                onChange={(e) =>
                  setForm({ ...form, maxUses: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label>Expira em</Label>
              <Input
                type="date"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm({ ...form, expiresAt: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.active}
              onCheckedChange={(v) => setForm({ ...form, active: v })}
            />
            <Label>Ativo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={save}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
