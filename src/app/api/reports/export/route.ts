import { NextRequest, NextResponse } from "next/server";
import { requireCompanyUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { maintenanceStatus, formatBRL } from "@/lib/constants";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function GET(req: NextRequest) {
  try {
    const user = await requireCompanyUser();
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "csv"; // csv | xlsx | pdf
    const type = searchParams.get("type") || "summary"; // summary | consumption | refuelings | entries | maintenance
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const equipmentId = searchParams.get("equipmentId");
    const operatorId = searchParams.get("operatorId");
    const source = searchParams.get("source");
    const reservoirId = searchParams.get("reservoirId");
    const origin = searchParams.get("origin");

    // Filtros comuns
    const refWhere: any = { companyId: user.companyId };
    if (startDate || endDate) {
      refWhere.refuelDate = {};
      if (startDate) refWhere.refuelDate.gte = new Date(startDate);
      if (endDate) refWhere.refuelDate.lte = new Date(endDate);
    }
    if (equipmentId) refWhere.equipmentId = equipmentId;
    if (operatorId) refWhere.operatorId = operatorId;
    if (source) refWhere.source = source;
    if (reservoirId) refWhere.reservoirId = reservoirId;
    if (origin === "company" || origin === "third_party") {
      refWhere.equipment = { origin };
    }

    const entryWhere: any = { companyId: user.companyId };
    if (startDate || endDate) {
      entryWhere.entryDate = {};
      if (startDate) entryWhere.entryDate.gte = new Date(startDate);
      if (endDate) entryWhere.entryDate.lte = new Date(endDate);
    }
    if (reservoirId) entryWhere.reservoirId = reservoirId;

    let rows: any[] = [];
    let title = "Relatório FuelGest";
    let sheetName = "Relatório";

    if (type === "consumption") {
      title = "Consumo por Equipamento";
      sheetName = "Consumo";
      const refuelings = await db.refueling.findMany({
        where: refWhere,
        include: { equipment: true, operator: true },
      });
      const byEquip = new Map();
      for (const r of refuelings) {
        const key = r.equipmentId;
        if (!byEquip.has(key)) {
          byEquip.set(key, {
            equipamento: r.equipment.name,
            tipo: r.equipment.type,
            origem: r.equipment.origin,
            controle: r.equipment.controlType,
            litros: 0,
            custo: 0,
            leituras: 0,
            consumos: [] as number[],
            abastecimentos: 0,
          });
        }
        const item = byEquip.get(key);
        item.litros += r.liters;
        item.custo += r.totalAmount;
        item.leituras += 1;
        item.abastecimentos += 1;
        if (r.consumption != null) item.consumos.push(r.consumption);
      }
      for (const item of byEquip.values()) {
        const avg =
          item.consumos.length > 0
            ? item.consumos.reduce((a: number, b: number) => a + b, 0) /
              item.consumos.length
            : 0;
        rows.push({
          Equipamento: item.equipamento,
          Tipo: item.tipo,
          Origem: item.origem,
          Controle: item.controle === "hours" ? "Horas" : "Km",
          Litros: item.litros.toFixed(2),
          Custo: formatBRL(item.custo),
          Abastecimentos: item.abastecimentos,
          "Consumo Médio": avg.toFixed(2),
          "Unidade Consumo": item.controle === "hours" ? "L/h" : "km/L",
        });
      }
    } else if (type === "refuelings") {
      title = "Abastecimentos";
      sheetName = "Abastecimentos";
      const refuelings = await db.refueling.findMany({
        where: refWhere,
        include: { equipment: true, operator: true, reservoir: true },
        orderBy: { refuelDate: "desc" },
      });
      for (const r of refuelings) {
        rows.push({
          Data: new Date(r.refuelDate).toLocaleString("pt-BR"),
          Equipamento: r.equipment.name,
          Placa: r.equipment.plate || "",
          Origem:
            r.source === "reservoir"
              ? r.reservoir?.name || "Reservatório"
              : `Posto: ${r.externalStation || ""}`,
          "Litros (L)": r.liters.toFixed(2),
          "Preço/L": formatBRL(r.pricePerLiter),
          "Valor Total": formatBRL(r.totalAmount),
          "Leitura": r.reading,
          "Operador": r.operatorName,
          "Serviço": r.service || "",
          "Consumo": r.consumption != null ? r.consumption.toFixed(2) : "",
          "Notas": r.notes || "",
        });
      }
    } else if (type === "entries") {
      title = "Entradas de Combustível";
      sheetName = "Entradas";
      const entries = await db.fuelEntry.findMany({
        where: entryWhere,
        include: { reservoir: true },
        orderBy: { entryDate: "desc" },
      });
      for (const e of entries) {
        rows.push({
          Data: new Date(e.entryDate).toLocaleDateString("pt-BR"),
          Reservatório: e.reservoir.name,
          "Litros (L)": e.liters.toFixed(2),
          "Preço/L": formatBRL(e.pricePerLiter),
          "Valor Total": formatBRL(e.totalAmount),
          Fornecedor: e.supplier || "",
          Nota: e.invoiceNumber || "",
        });
      }
    } else if (type === "maintenance") {
      title = "Manutenções Realizadas e Pendentes";
      sheetName = "Manutenções";
      const equipments = await db.equipment.findMany({
        where: { companyId: user.companyId },
        include: { maintenanceItems: true },
      });
      const maintenanceDone = await db.maintenance.findMany({
        where: { companyId: user.companyId },
        include: { equipment: true, performedBy: true },
        orderBy: { maintenanceDate: "desc" },
      });
      // Pendentes
      for (const e of equipments) {
        for (const item of e.maintenanceItems) {
          const status = maintenanceStatus(
            item.lastReading,
            e.currentReading,
            item.interval
          );
          if (status.level !== "ok") {
            rows.push({
              Equipamento: e.name,
              Item: item.name,
              Status:
                status.level === "danger" ? "Vencido" : "Próximo do vencimento",
              Intervalo: `${item.interval} ${
                e.controlType === "hours" ? "h" : "km"
              }`,
              "Última Leitura": item.lastReading,
              "Leitura Atual": e.currentReading,
              "Restante": `${status.remaining.toFixed(0)} ${
                e.controlType === "hours" ? "h" : "km"
              }`,
              "Data Realização": "—",
              "Custo": "—",
              Responsável: "—",
            });
          }
        }
      }
      // Realizadas
      for (const m of maintenanceDone) {
        rows.push({
          Equipamento: m.equipment.name,
          Item: m.itemName,
          Status: "Realizada",
          Intervalo: "—",
          "Última Leitura": "—",
          "Leitura Atual": m.readingAtMaintenance,
          "Restante": "—",
          "Data Realização": new Date(m.maintenanceDate).toLocaleDateString("pt-BR"),
          "Custo": formatBRL(m.cost),
          Responsável: m.shopOrResponsible || m.performedBy?.name || "",
        });
      }
    } else {
      // summary
      title = "Resumo Geral";
      sheetName = "Resumo";
      const refuelings = await db.refueling.findMany({
        where: refWhere,
        include: { equipment: true, operator: true },
      });
      const totalLiters = refuelings.reduce((s, r) => s + r.liters, 0);
      const totalCost = refuelings.reduce((s, r) => s + r.totalAmount, 0);

      rows.push({
        Indicador: "Total de abastecimentos",
        Valor: refuelings.length.toString(),
      });
      rows.push({
        Indicador: "Total de litros",
        Valor: totalLiters.toFixed(2),
      });
      rows.push({
        Indicador: "Custo total",
        Valor: formatBRL(totalCost),
      });
      rows.push({
        Indicador: "Período",
        Valor: `${startDate || "Início"} a ${endDate || "Hoje"}`,
      });

      // Por operador
      const byOp = new Map();
      for (const r of refuelings) {
        const op = r.operatorName;
        if (!byOp.has(op)) byOp.set(op, { litros: 0, custo: 0, count: 0 });
        const item = byOp.get(op);
        item.litros += r.liters;
        item.custo += r.totalAmount;
        item.count += 1;
      }
      rows.push({ Indicador: "", Valor: "" });
      rows.push({ Indicador: "Por Operador", Valor: "" });
      for (const [op, item] of byOp.entries()) {
        rows.push({
          Indicador: op,
          Valor: `${item.litros.toFixed(1)} L | ${formatBRL(item.custo)} | ${item.count} abast.`,
        });
      }
    }

    // Exporta
    if (format === "xlsx") {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
      return new NextResponse(buf, {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="fuelgest-${type}.xlsx"`,
        },
      });
    }

    if (format === "pdf") {
      const doc = new jsPDF({ orientation: "landscape" });
      doc.setFontSize(16);
      doc.text(`${title} — FuelGest`, 14, 15);
      doc.setFontSize(10);
      doc.text(
        `Empresa: ${user.companyName || ""} | Gerado em ${new Date().toLocaleString(
          "pt-BR"
        )}`,
        14,
        22
      );

      const columns =
        rows.length > 0 ? Object.keys(rows[0]) : ["Sem dados"];
      const data = rows.map((r) => Object.values(r).map((v) => String(v ?? "")));

      autoTable(doc, {
        head: [columns],
        body: data,
        startY: 28,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [16, 185, 129] },
      });

      const buf = doc.output("arraybuffer");
      return new NextResponse(buf, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="fuelgest-${type}.pdf"`,
        },
      });
    }

    // CSV (padrão)
    if (rows.length === 0) {
      return new NextResponse("Sem dados para o período informado.", {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="fuelgest-${type}.csv"`,
        },
      });
    }
    const cols = Object.keys(rows[0]);
    const escape = (v: any) => {
      const s = String(v ?? "");
      if (s.includes(";") || s.includes("\n") || s.includes('"')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };
    const csv = [
      cols.join(";"),
      ...rows.map((r) => cols.map((c) => escape(r[c])).join(";")),
    ].join("\n");

    return new NextResponse("\uFEFF" + csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="fuelgest-${type}.csv"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
