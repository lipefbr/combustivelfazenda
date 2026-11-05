"use client";

import {
  Fuel,
  Wrench,
  FileText,
  BarChart3,
  Droplet,
  Truck,
  Camera,
  MapPin,
  User,
  FileSpreadsheet,
} from "lucide-react";

export function Problems() {
  const items = [
    {
      icon: Fuel,
      title: "Combustível sem controle",
      desc: "Você sabe exatamente quantos litros entraram e para onde foram? Na maioria das operações, não.",
    },
    {
      icon: Wrench,
      title: "Manutenção esquecida",
      desc: "Troca de óleo, filtros, graxa... quando ninguém lembra, a máquina para no pior momento.",
    },
    {
      icon: FileText,
      title: "Notas perdidas",
      desc: "Cupom de posto em envelope, foto de nota no celular de cada um. No fim do mês, nada bate.",
    },
    {
      icon: BarChart3,
      title: "Falta de relatório",
      desc: "Consumo por equipamento? Custo por operador? Manutenções pendentes? Sem sistema, é planilha.",
    },
  ];
  return (
    <section className="py-20 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Problemas que você enfrenta todos os dias
          </h2>
          <p className="text-muted-foreground text-lg">
            Se a sua operação ainda depende de caderno, planilha e memória,
            você está perdendo dinheiro sem perceber.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-card border border-border hover:border-emerald-200 hover:shadow-lg transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 mb-4">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Features() {
  const items = [
    {
      icon: Camera,
      title: "Entrada com foto da nota",
      desc: "Anexe a foto da nota fiscal de cada compra de combustível. Tudo arquivado e rastreável.",
    },
    {
      icon: Droplet,
      title: "Controle de reservatórios",
      desc: "Cadastre reservatórios com capacidade e nível mínimo. Alerta de estoque baixo automático.",
    },
    {
      icon: Truck,
      title: "Abastecimento em 2 modos",
      desc: "Direto do reservatório da fazenda ou de posto externo. Em ambos, registro completo.",
    },
    {
      icon: MapPin,
      title: "Horímetro ou hodômetro",
      desc: "Máquinas por horas, veículos por km. Você escolhe o controle de cada equipamento.",
    },
    {
      icon: Wrench,
      title: "Alertas de manutenção",
      desc: "Troca de óleo, filtros, graxa — alerta amarelo aos 90% do intervalo, vermelho ao vencer.",
    },
    {
      icon: User,
      title: "Operador identificado",
      desc: "Cada abastecimento registra o operador logado. Pode ser editado na confirmação.",
    },
    {
      icon: Truck,
      title: "Da fazenda e de terceiros",
      desc: "Equipamentos próprios ou de terceiros — controle tudo, com relatórios separados.",
    },
    {
      icon: FileSpreadsheet,
      title: "Relatórios PDF e Excel",
      desc: "Exporte consumos, abastecimentos, entradas e manutenções em PDF ou Excel com filtros.",
    },
  ];
  return (
    <section id="recursos" className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block rounded-full bg-emerald-100 text-emerald-700 px-3 py-1 text-sm font-medium mb-4">
            Recursos completos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Tudo o que você precisa, no celular ou no computador
          </h2>
          <p className="text-muted-foreground text-lg">
            Da entrada de combustível à manutenção preventiva —FuelGest cobre
            toda a operação.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-emerald-300 hover:shadow-xl transition-all"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-4 group-hover:scale-110 transition-transform">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      n: 1,
      title: "Cadastre equipamentos e reservatórios",
      desc: "Informe nome, placa, patrimônio, valor e itens de manutenção de cada equipamento.",
    },
    {
      n: 2,
      title: "Registre a compra e a nota",
      desc: "Entrada de combustível com litros, valor, fornecedor e foto da nota fiscal.",
    },
    {
      n: 3,
      title: "Abasteça em poucos toques",
      desc: "Selecione o equipamento, informe os litros e a leitura. Operador já vem do login.",
    },
    {
      n: 4,
      title: "Receba alertas e relatórios",
      desc: "Manutenções vencidas, estoque baixo, consumo por equipamento — tudo no painel.",
    },
  ];
  return (
    <section id="como-funciona" className="py-20 sm:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-sm font-medium mb-4">
            Como funciona
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Comece a usar em 4 passos
          </h2>
          <p className="text-muted-foreground text-lg">
            Em menos de 10 minutos sua operação está no sistema.
          </p>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-emerald-200" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-white border-4 border-emerald-500 text-emerald-600 font-bold text-3xl mb-4 mx-auto z-10">
                  {step.n}
                </div>
                <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
