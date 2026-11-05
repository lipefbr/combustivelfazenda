"use client";

import { useState } from "react";
import { useApi } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Droplets,
  History,
} from "lucide-react";
import { AdminDataTable, type Column } from "@/components/admin/data-table";
import {
  maintenanceStatus,
  formatBRL,
  formatDate,
  formatNumber,
} from "@/lib/constants";

type Maintenance = {
  id: string;
  equipment?: { id: string; name: string } | null;
  company?: { id: string; name: string } | null;
  itemName: string;
  cost: number;
  readingAtMaintenance: number;
  shopOrResponsible?: string | null;
  notes?: string | null;
  photo?: string | null;
  maintenanceDate: string;
  companyId: string;
};

type Alert = {
  id: string;
  type: string;
  level: string;
  title: string;
  message: string;
  company?: { id: string; name: string } | null;
  equipment?: { id: string; name: string } | null;
  reservoir?: { id: string; name: string } | null;
  createdAt: string;
};

export default function AdminMaintenancesPage() {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [tab, setTab] = useState("history");

  const { data: companiesData } = useApi<{ companies: any[] }>(
    "/api/admin/companies"
  );

  const apiPath =
    companyFilter !== "all"
      ? `/api/admin/maintenances?companyId=${companyFilter}`
      : "/api/admin/maintenances";

  const { data, loading, error } = useApi<{ maintenances: Maintenance[] }>(
    apiPath
  );
  const { data: alertsData, loading: alertsLoading } = useApi<{ alerts: Alert[] }>(
    "/api/alerts"
  );

  const maintenances = data?.maintenances || [];
  const alerts = alertsData?.alerts || [];

  const maintenanceAlerts = alerts.filter((a) => a.type === "maintenance");
  const stockAlerts = alerts.filter((a) => a.type === "stock");

  const columns: Column<Maintenance>[] = [
    {
      key: "company",
      header: "Empresa",
      sortable: true,
      sortValue: (m) => m.company?.name || "",
      cell: (m) => (
        <span className="text-sm font-medium truncate">
          {m.company?.name || "—"}
        </span>
      ),
    },
    {
      key: "equipment",
      header: "Equipamento",
      sortable: true,
      sortValue: (m) => m.equipment?.name || "",
      cell: (m) => (
        <span className="text-sm font-medium truncate">
          {m.equipment?.name || "—"}
        </span>
      ),
    },
    {
      key: "itemName",
      header: "Item",
      sortable: true,
      sortValue: (m) => m.itemName,
      cell: (m) => <span className="text-sm">{m.itemName}</span>,
    },
    {
      key: "maintenanceDate",
      header: "Data",
      sortable: true,
      sortValue: (m) => new Date(m.maintenanceDate).getTime(),
      cell: (m) => (
        <span className="text-sm">{formatDate(m.maintenanceDate)}</span>
      ),
    },
    {
      key: "cost",
      header: "Custo",
      sortable: true,
      sortValue: (m) => m.cost,
      cell: (m) => (
        <span className="text-sm font-semibold">{formatBRL(m.cost)}</span>
      ),
    },
    {
      key: "readingAtMaintenance",
      header: "Leitura",
      cell: (m) => (
        <span className="text-sm">
          {formatNumber(m.readingAtMaintenance, 0)}
        </span>
      ),
    },
    {
      key: "shopOrResponsible",
      header: "Responsável",
      cell: (m) => (
        <span className="text-sm text-muted-foreground">
          {m.shopOrResponsible || "—"}
        </span>
      ),
    },
    {
      key: "notes",
      header: "Observações",
      cell: (m) => (
        <span className="text-xs text-muted-foreground line-clamp-2 max-w-xs">
          {m.notes || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Manutenções & Alertas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Histórico de manutenções realizadas e alertas globais (estoque baixo,
          manutenções vencidas/próximas).
        </p>
      </div>

      {/* Resumo de alertas */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Alertas manutenção</p>
              <p className="text-xl font-bold">{maintenanceAlerts.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Manutenções vencidas
              </p>
              <p className="text-xl font-bold">
                {maintenanceAlerts.filter((a) => a.level === "danger").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-sky-500">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Droplets className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estoques baixos</p>
              <p className="text-xl font-bold">{stockAlerts.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Realizadas (total)</p>
              <p className="text-xl font-bold">{maintenances.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-1.5" /> Histórico
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-1.5" /> Alertas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card className="p-4">
            <AdminDataTable
              columns={columns}
              rows={maintenances}
              loading={loading}
              error={error}
              searchFields={(m) =>
                `${m.itemName} ${m.equipment?.name || ""} ${m.company?.name || ""} ${m.shopOrResponsible || ""}`
              }
              searchPlaceholder="Buscar por item, equipamento, empresa..."
              filters={[
                {
                  label: "Empresa",
                  value: companyFilter,
                  onChange: setCompanyFilter,
                  options: (companiesData?.companies || []).map((c) => ({
                    value: c.id,
                    label: c.name,
                  })),
                },
              ]}
              emptyMessage="Nenhuma manutenção registrada."
              pageSize={25}
            />
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-600" />
                Alertas de manutenção ({maintenanceAlerts.length})
              </h3>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900">
                    <TableHead>Empresa</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : maintenanceAlerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        Nenhum alerta de manutenção ativo.
                      </TableCell>
                    </TableRow>
                  ) : (
                    maintenanceAlerts.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-sm font-medium">
                          {a.company?.name || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.equipment?.name || "—"}
                        </TableCell>
                        <TableCell className="text-sm">{a.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              a.level === "danger" ? "destructive" : "secondary"
                            }
                          >
                            {a.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {a.message}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(a.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Droplets className="h-5 w-5 text-sky-600" />
                Alertas de estoque baixo ({stockAlerts.length})
              </h3>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-900">
                    <TableHead>Empresa</TableHead>
                    <TableHead>Reservatório</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockAlerts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        Nenhum alerta de estoque ativo.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stockAlerts.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-sm font-medium">
                          {a.company?.name || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {a.reservoir?.name || "—"}
                        </TableCell>
                        <TableCell className="text-sm">{a.title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              a.level === "danger" ? "destructive" : "secondary"
                            }
                          >
                            {a.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {a.message}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(a.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
