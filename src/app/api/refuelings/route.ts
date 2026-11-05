import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAuth, requireCompanyUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateConsumption, maintenanceStatus } from "@/lib/constants";
import { checkAlerts } from "@/lib/alerts";

const schema = z.object({
  equipmentId: z.string(),
  reservoirId: z.string().optional().nullable(),
  operatorName: z.string().optional(),
  source: z.enum(["reservoir", "external"]),
  externalStation: z.string().optional().nullable(),
  externalPricePerLiter: z.number().optional().nullable(),
  externalTotalAmount: z.number().optional().nullable(),
  externalInvoicePhoto: z.string().optional().nullable(),
  liters: z.number().positive(),
  fuelType: z.string(),
  pricePerLiter: z.number().optional().nullable(),
  totalAmount: z.number().optional().nullable(),
  reading: z.number(),
  previousReading: z.number().optional().nullable(),
  service: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  photo: z.string().optional().nullable(),
  refuelDate: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const equipmentId = searchParams.get("equipmentId");
    const operatorId = searchParams.get("operatorId");
    const source = searchParams.get("source");
    const reservoirId = searchParams.get("reservoirId");

    const where: any = {};
    if (user.role !== "super_admin") {
      where.companyId = user.companyId;
    } else {
      const companyId = searchParams.get("companyId");
      if (companyId) where.companyId = companyId;
    }

    if (startDate || endDate) {
      where.refuelDate = {};
      if (startDate) where.refuelDate.gte = new Date(startDate);
      if (endDate) where.refuelDate.lte = new Date(endDate);
    }
    if (equipmentId) where.equipmentId = equipmentId;
    if (operatorId) where.operatorId = operatorId;
    if (source) where.source = source;
    if (reservoirId) where.reservoirId = reservoirId;

    const refuelings = await db.refueling.findMany({
      where,
      include: {
        equipment: true,
        reservoir: true,
        operator: true,
      },
      orderBy: { refuelDate: "desc" },
      take: 500,
    });
    return NextResponse.json({ refuelings });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireCompanyUser();
    const body = await req.json();
    const data = schema.parse(body);

    // Valida equipamento
    const equipment = await db.equipment.findUnique({
      where: { id: data.equipmentId },
      include: { maintenanceItems: true },
    });
    if (!equipment || equipment.companyId !== user.companyId) {
      return NextResponse.json({ error: "Equipamento inválido" }, { status: 400 });
    }

    // Valida leitura >= última leitura
    const lastReading = equipment.currentReading;
    if (data.reading < lastReading) {
      return NextResponse.json(
        {
          error: `Leitura (${data.reading}) menor que a última registrada (${lastReading}). Confirme e tente novamente.`,
          lastReading,
        },
        { status: 400 }
      );
    }

    let reservoir = null;

    // Determina o preço por litro real (com fallbacks)
    // - Origem reservatório: usa pricePerLiter (ou externalPricePerLiter como fallback)
    // - Origem externa: usa externalPricePerLiter (ou pricePerLiter como fallback)
    let actualPricePerLiter: number =
      data.pricePerLiter ||
      data.externalPricePerLiter ||
      0;

    let actualTotalAmount: number =
      data.totalAmount ||
      data.externalTotalAmount ||
      data.liters * actualPricePerLiter;

    if (data.source === "reservoir" && data.reservoirId) {
      reservoir = await db.reservoir.findUnique({
        where: { id: data.reservoirId },
      });
      if (!reservoir || reservoir.companyId !== user.companyId) {
        return NextResponse.json({ error: "Reservatório inválido" }, { status: 400 });
      }
      if (reservoir.currentLevel < data.liters) {
        return NextResponse.json(
          {
            error: `Estoque insuficiente. Disponível: ${reservoir.currentLevel} L, necessário: ${data.liters} L.`,
          },
          { status: 400 }
        );
      }
      // Para reservatório, se não informou preço, usa preço médio do estoque (R$ 0 se vazio)
      if (!actualPricePerLiter) {
        actualPricePerLiter = data.pricePerLiter || 0;
        actualTotalAmount = data.totalAmount || data.liters * actualPricePerLiter;
      }
    } else if (data.source === "external") {
      // Para posto externo: prioriza externalPricePerLiter, fallback em pricePerLiter
      actualPricePerLiter =
        data.externalPricePerLiter || data.pricePerLiter || 0;
      actualTotalAmount =
        data.externalTotalAmount ||
        data.totalAmount ||
        data.liters * actualPricePerLiter;
    }

    const refuelDate = data.refuelDate ? new Date(data.refuelDate) : new Date();

    // Calcula consumo
    const consumption = calculateConsumption(
      lastReading,
      data.reading,
      data.liters,
      equipment.controlType as "hours" | "km"
    );

    // Cria abastecimento
    const refueling = await db.refueling.create({
      data: {
        companyId: user.companyId,
        equipmentId: data.equipmentId,
        reservoirId: data.source === "reservoir" ? data.reservoirId : null,
        operatorId: user.id,
        operatorName: data.operatorName || user.name,
        source: data.source,
        externalStation: data.source === "external" ? data.externalStation : null,
        externalPricePerLiter: data.source === "external" ? data.externalPricePerLiter : null,
        externalTotalAmount: data.source === "external" ? data.externalTotalAmount : null,
        externalInvoicePhoto: data.source === "external" ? data.externalInvoicePhoto : null,
        liters: data.liters,
        fuelType: data.fuelType,
        pricePerLiter: actualPricePerLiter,
        totalAmount: actualTotalAmount,
        reading: data.reading,
        previousReading: lastReading,
        consumption,
        service: data.service,
        notes: data.notes,
        photo: data.photo,
        refuelDate,
      },
    });

    // Atualiza leitura atual do equipamento
    await db.equipment.update({
      where: { id: data.equipmentId },
      data: { currentReading: data.reading },
    });

    // Se for do reservatório, desconta do estoque
    if (data.source === "reservoir" && reservoir) {
      const newLevel = reservoir.currentLevel - data.liters;
      await db.reservoir.update({
        where: { id: reservoir.id },
        data: { currentLevel: newLevel },
      });
    }

    // Reavalia alertas (manutenção + estoque)
    await checkAlerts(user.companyId);

    await db.auditLog.create({
      data: {
        userId: user.id,
        companyId: user.companyId,
        action: "create",
        entity: "refueling",
        entityId: refueling.id,
        details: `Abastecimento de ${data.liters} L em ${equipment.name}`,
      },
    });

    const full = await db.refueling.findUnique({
      where: { id: refueling.id },
      include: { equipment: true, reservoir: true, operator: true },
    });

    return NextResponse.json({ refueling: full });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireCompanyUser();
    const { id } = await params;
    const ref = await db.refueling.findUnique({
      where: { id },
      include: { reservoir: true, equipment: true },
    });
    if (!ref || ref.companyId !== user.companyId) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    // Se do reservatório, devolve litros
    if (ref.source === "reservoir" && ref.reservoirId) {
      const r = await db.reservoir.findUnique({ where: { id: ref.reservoirId } });
      if (r) {
        await db.reservoir.update({
          where: { id: r.id },
          data: { currentLevel: r.currentLevel + ref.liters },
        });
      }
    }

    await db.refueling.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
