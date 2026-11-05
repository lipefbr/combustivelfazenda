"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/hooks/use-session";
import { apiFetch } from "@/lib/api-client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  Plus,
  Trash2,
  Save,
  Settings,
  Mail,
  CreditCard,
  Fuel,
  Wrench,
  FileText,
  Palette,
} from "lucide-react";

export default function AdminSettingsPage() {
  const { data, loading, error, refetch } = useApi<{
    settings: Record<string, string>;
    fuelTypes: any[];
    maintenanceItems: any[];
  }>("/api/admin/settings");

  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<Record<string, string>>({});
  const [fuelTypes, setFuelTypes] = useState<any[]>([]);
  const [maintenanceItems, setMaintenanceItems] = useState<any[]>([]);

  useEffect(() => {
    if (data?.settings) setSettings(data.settings);
    if (data?.fuelTypes) setFuelTypes(data.fuelTypes);
    if (data?.maintenanceItems) setMaintenanceItems(data.maintenanceItems);
  }, [data]);

  function updateSetting(key: string, value: string) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  async function saveAll() {
    setSaving(true);
    try {
      await apiFetch(`/api/admin/settings`, {
        method: "PATCH",
        json: {
          settings,
          fuelTypes: fuelTypes.map((ft, i) => ({
            ...(ft.id ? { id: ft.id } : {}),
            name: ft.name,
            active: ft.active,
            order: i,
          })),
          maintenanceItems: maintenanceItems.map((mi, i) => ({
            ...(mi.id ? { id: mi.id } : {}),
            name: mi.name,
            defaultInterval: Number(mi.defaultInterval),
            controlType: mi.controlType,
            active: mi.active,
            order: i,
          })),
        },
      });
      toast.success("Configurações salvas!");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Erro");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Card className="p-4">Carregando configurações...</Card>;
  }
  if (error) {
    return <Card className="p-4 text-red-600">Erro: {error}</Card>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Configurações</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ajustes globais da plataforma FuelGest.
          </p>
        </div>
        <Button
          onClick={saveAll}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar tudo"}
        </Button>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-1.5" /> Geral
          </TabsTrigger>
          <TabsTrigger value="visual">
            <Palette className="h-4 w-4 mr-1.5" /> Visual
          </TabsTrigger>
          <TabsTrigger value="smtp">
            <Mail className="h-4 w-4 mr-1.5" /> E-mail/SMTP
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-1.5" /> Pagamentos
          </TabsTrigger>
          <TabsTrigger value="fuel">
            <Fuel className="h-4 w-4 mr-1.5" /> Combustíveis
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="h-4 w-4 mr-1.5" /> Manutenção
          </TabsTrigger>
          <TabsTrigger value="legal">
            <FileText className="h-4 w-4 mr-1.5" /> Termos
          </TabsTrigger>
        </TabsList>

        {/* Geral */}
        <TabsContent value="general">
          <Card className="p-5 space-y-4 max-w-2xl">
            <h3 className="font-bold">Dados da plataforma</h3>
            <div>
              <Label>Nome da plataforma</Label>
              <Input
                value={settings.platform_name || ""}
                onChange={(e) =>
                  updateSetting("platform_name", e.target.value)
                }
              />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input
                value={settings.platform_logo || ""}
                onChange={(e) =>
                  updateSetting("platform_logo", e.target.value)
                }
                placeholder="/logo.svg"
              />
            </div>
            <div>
              <Label>Dias de teste grátis</Label>
              <Input
                type="number"
                value={settings.trial_days || "14"}
                onChange={(e) => updateSetting("trial_days", e.target.value)}
              />
            </div>
          </Card>
        </TabsContent>

        {/* Visual */}
        <TabsContent value="visual">
          <Card className="p-5 space-y-4 max-w-2xl">
            <h3 className="font-bold">Cores da marca</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <ColorField
                label="Cor primária"
                value={settings.primary_color || ""}
                onChange={(v) => updateSetting("primary_color", v)}
              />
              <ColorField
                label="Cor secundária"
                value={settings.secondary_color || ""}
                onChange={(v) => updateSetting("secondary_color", v)}
              />
              <ColorField
                label="Cor de destaque"
                value={settings.accent_color || ""}
                onChange={(v) => updateSetting("accent_color", v)}
              />
            </div>
          </Card>
        </TabsContent>

        {/* SMTP */}
        <TabsContent value="smtp">
          <Card className="p-5 space-y-4 max-w-2xl">
            <h3 className="font-bold">Configurações de E-mail (SMTP)</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>SMTP Host</Label>
                <Input
                  value={settings.smtp_host || ""}
                  onChange={(e) =>
                    updateSetting("smtp_host", e.target.value)
                  }
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label>SMTP Porta</Label>
                <Input
                  value={settings.smtp_port || ""}
                  onChange={(e) =>
                    updateSetting("smtp_port", e.target.value)
                  }
                  placeholder="587"
                />
              </div>
              <div>
                <Label>SMTP Usuário</Label>
                <Input
                  value={settings.smtp_user || ""}
                  onChange={(e) =>
                    updateSetting("smtp_user", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>SMTP Senha</Label>
                <Input
                  type="password"
                  value={settings.smtp_password || ""}
                  onChange={(e) =>
                    updateSetting("smtp_password", e.target.value)
                  }
                  placeholder="••••••"
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Remetente (e-mail)</Label>
                <Input
                  value={settings.smtp_from || ""}
                  onChange={(e) =>
                    updateSetting("smtp_from", e.target.value)
                  }
                  placeholder="contato@fuelgest.com"
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Pagamentos */}
        <TabsContent value="payments">
          <Card className="p-5 space-y-4 max-w-2xl">
            <h3 className="font-bold">Integrações de Pagamento</h3>
            <div>
              <Label>Provedor</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={settings.payment_provider || ""}
                onChange={(e) =>
                  updateSetting("payment_provider", e.target.value)
                }
              >
                <option value="">Nenhum</option>
                <option value="asaas">Asaas</option>
                <option value="stripe">Stripe</option>
                <option value="mercadopago">Mercado Pago</option>
                <option value="pix">PIX Manual</option>
              </select>
            </div>
            <div>
              <Label>API Key</Label>
              <Input
                type="password"
                value={settings.payment_api_key || ""}
                onChange={(e) =>
                  updateSetting("payment_api_key", e.target.value)
                }
                placeholder="$..."
              />
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">WhatsApp de cobrança</h4>
              <Input
                value={settings.contact_whatsapp || ""}
                onChange={(e) =>
                  updateSetting("contact_whatsapp", e.target.value)
                }
                placeholder="5511999999999"
              />
            </div>
          </Card>
        </TabsContent>

        {/* Combustíveis */}
        <TabsContent value="fuel">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Tipos de combustível padrão</h3>
              <Button
                onClick={() =>
                  setFuelTypes([
                    ...fuelTypes,
                    { name: "", active: true, order: fuelTypes.length },
                  ])
                }
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Novo
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>Nome</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fuelTypes.map((ft, i) => (
                  <TableRow key={ft.id || `new-${i}`}>
                    <TableCell>
                      <Input
                        value={ft.name}
                        onChange={(e) => {
                          const n = [...fuelTypes];
                          n[i] = { ...ft, name: e.target.value };
                          setFuelTypes(n);
                        }}
                        className="h-9"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={ft.active}
                        onCheckedChange={(v) => {
                          const n = [...fuelTypes];
                          n[i] = { ...ft, active: v };
                          setFuelTypes(n);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setFuelTypes(fuelTypes.filter((_, j) => j !== i))
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {fuelTypes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-6 text-center text-muted-foreground">
                      Nenhum tipo cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Manutenção */}
        <TabsContent value="maintenance">
          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Itens de manutenção padrão</h3>
              <Button
                onClick={() =>
                  setMaintenanceItems([
                    ...maintenanceItems,
                    {
                      name: "",
                      defaultInterval: 250,
                      controlType: "hours",
                      active: true,
                      order: maintenanceItems.length,
                    },
                  ])
                }
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Novo
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-900">
                  <TableHead>Item</TableHead>
                  <TableHead>Intervalo</TableHead>
                  <TableHead>Controle</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceItems.map((mi, i) => (
                  <TableRow key={mi.id || `new-${i}`}>
                    <TableCell>
                      <Input
                        value={mi.name}
                        onChange={(e) => {
                          const n = [...maintenanceItems];
                          n[i] = { ...mi, name: e.target.value };
                          setMaintenanceItems(n);
                        }}
                        className="h-9"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={mi.defaultInterval}
                        onChange={(e) => {
                          const n = [...maintenanceItems];
                          n[i] = {
                            ...mi,
                            defaultInterval: Number(e.target.value),
                          };
                          setMaintenanceItems(n);
                        }}
                        className="h-9 w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                        value={mi.controlType}
                        onChange={(e) => {
                          const n = [...maintenanceItems];
                          n[i] = { ...mi, controlType: e.target.value };
                          setMaintenanceItems(n);
                        }}
                      >
                        <option value="hours">Horas</option>
                        <option value="km">Km</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={mi.active}
                        onCheckedChange={(v) => {
                          const n = [...maintenanceItems];
                          n[i] = { ...mi, active: v };
                          setMaintenanceItems(n);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setMaintenanceItems(
                            maintenanceItems.filter((_, j) => j !== i)
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {maintenanceItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                      Nenhum item cadastrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Legal */}
        <TabsContent value="legal">
          <Card className="p-5 space-y-4 max-w-2xl">
            <h3 className="font-bold">Termos e Links</h3>
            <div>
              <Label>URL dos Termos de Uso</Label>
              <Input
                value={settings.terms_url || ""}
                onChange={(e) => updateSetting("terms_url", e.target.value)}
                placeholder="/termos"
              />
            </div>
            <div>
              <Label>URL da Política de Privacidade</Label>
              <Input
                value={settings.privacy_url || ""}
                onChange={(e) =>
                  updateSetting("privacy_url", e.target.value)
                }
                placeholder="/privacidade"
              />
            </div>
            <div>
              <Label>E-mail de contato</Label>
              <Input
                value={settings.contact_email || ""}
                onChange={(e) =>
                  updateSetting("contact_email", e.target.value)
                }
                placeholder="contato@fuelgest.com"
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value || "#10B981"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 rounded border border-input cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#10B981"
          className="flex-1"
        />
      </div>
    </div>
  );
}
