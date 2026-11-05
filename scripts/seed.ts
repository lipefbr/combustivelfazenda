/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const STRONG_PASSWORD = "FuelGest@Admin2026!";

async function main() {
  console.log("Iniciando seed do FuelGest...\n");

  // 1. Configurações iniciais
  const defaultSettings: Record<string, string> = {
    platform_name: "FuelGest",
    platform_logo: "/logo.svg",
    primary_color: "#10B981",
    secondary_color: "#0F172A",
    accent_color: "#F59E0B",
    trial_days: "14",
    contact_email: "contato@fuelgest.com",
    contact_whatsapp: "5511999999999",
    social_instagram: "https://instagram.com/fuelgest",
    social_facebook: "https://facebook.com/fuelgest",
    social_linkedin: "https://linkedin.com/company/fuelgest",
    payment_provider: "asaas",
    payment_api_key: "",
    smtp_host: "",
    smtp_port: "587",
    smtp_user: "",
    smtp_password: "",
    smtp_from: "contato@fuelgest.com",
    terms_url: "/termos",
    privacy_url: "/privacidade",
  };
  for (const [key, value] of Object.entries(defaultSettings)) {
    await db.platformSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("Configuracoes da plataforma");

  // 2. Tipos de combustivel
  const fuelTypes = ["Diesel S10", "Diesel S500", "Gasolina", "Etanol", "ARLA 32"];
  for (let i = 0; i < fuelTypes.length; i++) {
    await db.fuelType.upsert({
      where: { name: fuelTypes[i] },
      update: {},
      create: { name: fuelTypes[i], order: i, active: true },
    });
  }
  console.log("Tipos de combustivel padrao");

  // 3. Itens de manutencao padrao
  const maintenanceItems = [
    { name: "Troca de oleo do motor", interval: 250, control: "hours" },
    { name: "Filtro de oleo", interval: 250, control: "hours" },
    { name: "Filtro de combustivel", interval: 500, control: "hours" },
    { name: "Filtro de ar", interval: 500, control: "hours" },
    { name: "Graxa", interval: 100, control: "hours" },
    { name: "Correia", interval: 1000, control: "hours" },
    { name: "Revisao geral", interval: 2000, control: "hours" },
  ];
  for (let i = 0; i < maintenanceItems.length; i++) {
    const item = maintenanceItems[i];
    await db.maintenanceItemTemplate.upsert({
      where: { name: item.name },
      update: {},
      create: {
        name: item.name,
        defaultInterval: item.interval,
        controlType: item.control,
        order: i,
        active: true,
      },
    });
  }
  console.log("Itens de manutencao padrao");

  // 4. Planos
  const plans = [
    {
      name: "Basico",
      description: "Para pequenas operacoes comecarem com o pe direito",
      monthlyPrice: 149,
      yearlyPrice: 1490,
      maxEquipments: 5,
      maxUsers: 2,
      features: JSON.stringify([
        "Ate 5 equipamentos",
        "Ate 2 usuarios",
        "Controle de abastecimento",
        "Reservatorios e estoque",
        "Alertas de manutencao",
        "Relatorios basicos",
      ]),
      highlighted: false,
      order: 1,
    },
    {
      name: "Profissional",
      description: "O mais escolhido para fazendas e construtoras medias",
      monthlyPrice: 349,
      yearlyPrice: 3490,
      maxEquipments: 25,
      maxUsers: 8,
      features: JSON.stringify([
        "Ate 25 equipamentos",
        "Ate 8 usuarios",
        "Tudo do Basico",
        "Relatorios completos (PDF/Excel)",
        "Equipamentos de terceiros",
        "Despesas da frota",
        "Suporte prioritario",
      ]),
      highlighted: true,
      order: 2,
    },
    {
      name: "Empresarial",
      description: "Para grandes operacoes e multiplas unidades",
      monthlyPrice: 899,
      yearlyPrice: 8990,
      maxEquipments: 999,
      maxUsers: 50,
      features: JSON.stringify([
        "Equipamentos e usuarios ilimitados",
        "Tudo do Profissional",
        "Integracoes com pagamento",
        "API de integracao",
        "Gerente de conta dedicado",
        "Treinamento personalizado",
        "SLA garantido",
      ]),
      highlighted: false,
      order: 3,
    },
  ];
  for (const plan of plans) {
    await db.plan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }
  console.log("Planos (Basico, Profissional, Empresarial)");

  // 5. Conteudo da landing
  const landingSections: Record<string, any> = {
    hero: {
      title: "Controle total do combustivel e da manutencao da sua frota",
      subtitle:
        "Registre entrada, abastecimento e manutencao em poucos toques, pelo celular, no campo. Menos desperdicio, mais rastreabilidade.",
      primary_cta: "Comecar agora",
      secondary_cta: "Ver como funciona",
    },
    cta_final: {
      title: "Pronto para assumir o controle da sua frota?",
      subtitle: "Comece hoje com 14 dias gratis. Sem cartao de credito.",
      button: "Criar minha conta",
    },
  };
  for (const [section, content] of Object.entries(landingSections)) {
    await db.landingContent.upsert({
      where: { section },
      update: {},
      create: { section, content: JSON.stringify(content) },
    });
  }
  console.log("Conteudo da landing page");

  // 6. Depoimentos de exemplo
  const testimonials = [
    {
      name: "Joao Pereira",
      company: "Fazenda Sao Joao",
      role: "Proprietario",
      content:
        "Reduzimos o desperdicio de diesel em 18% em tres meses. Os alertas de manutencao nos poupam de quebras caras.",
      rating: 5,
      order: 1,
    },
    {
      name: "Carla Mendes",
      company: "Construtora Horizonte",
      role: "Gerente de Frota",
      content:
        "O controle por horimetro resolveu um problema antigo com as maquinas pesadas. Hoje sei exatamente quando trocar o oleo.",
      rating: 5,
      order: 2,
    },
    {
      name: "Ricardo Alves",
      company: "Prefeitura de Boa Vista",
      role: "Secretario de Transportes",
      content:
        "Os relatorios em PDF facilitaram a prestacao de contas. A plataforma e simples para os operadores no campo.",
      rating: 5,
      order: 3,
    },
  ];
  for (const t of testimonials) {
    const existing = await db.testimonial.findFirst({
      where: { name: t.name, company: t.company },
    });
    if (!existing) {
      await db.testimonial.create({ data: t });
    }
  }
  console.log("Depoimentos de exemplo");

  // 7. Super Admin
  const passwordHash = await bcrypt.hash(STRONG_PASSWORD, 10);
  const adminEmail = "admin@fuelgest.com";

  await db.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "super_admin", forcePasswordChange: true },
    create: {
      name: "Super Admin FuelGest",
      email: adminEmail,
      passwordHash,
      role: "super_admin",
      forcePasswordChange: true,
      active: true,
      companyId: null,
    },
  });
  console.log("Super Admin criado");

  // 8. Leads de exemplo
  const sampleLeads = [
    {
      name: "Marcos Troller",
      company: "Agro Troller Ltda",
      whatsapp: "5511987654321",
      email: "marcos@agrotroller.com.br",
      equipmentCount: 8,
      message: "Tenho 5 tratores e 3 caminhoes, quero entender o plano Profissional.",
      status: "new",
      source: "landing",
    },
    {
      name: "Fernanda Costa",
      company: "Caminhoes Costa",
      whatsapp: "5511912345678",
      email: "fernanda@caminhoescosta.com.br",
      equipmentCount: 22,
      message: "Operacao de transporte, 22 caminhoes. Interesse no Empresarial.",
      status: "contacted",
      source: "landing",
    },
  ];
  for (const lead of sampleLeads) {
    const existing = await db.lead.findFirst({ where: { email: lead.email } });
    if (!existing) {
      await db.lead.create({ data: lead });
    }
  }
  console.log("Leads de exemplo");

  console.log("\nSeed concluido!\n");
  console.log("===========================================");
  console.log("  CREDENCIAIS DO SUPER ADMIN:");
  console.log("===========================================");
  console.log(`  Email:    ${adminEmail}`);
  console.log(`  Senha:    ${STRONG_PASSWORD}`);
  console.log("===========================================");
  console.log("  Troque a senha no primeiro acesso!");
  console.log("===========================================");
}

main()
  .catch((e) => {
    console.error("Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
