import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FuelGest — Gestão de Combustível e Manutenção de Frota",
  description:
    "Plataforma SaaS para gestão de combustível, abastecimento e manutenção de frota e máquinas pesadas. Para fazendas, usinas, construtoras, transportadoras e prefeituras.",
  keywords: [
    "gestão de combustível",
    "controle de frota",
    "abastecimento",
    "manutenção preventiva",
    "horímetro",
    "hodômetro",
    "agronegócio",
    "construção civil",
    "transportadoras",
  ],
  authors: [{ name: "FuelGest" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "FuelGest — Gestão de Combustível e Manutenção de Frota",
    description:
      "Controle total do combustível e da manutenção da sua frota pelo celular, no campo.",
    siteName: "FuelGest",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "FuelGest",
    description: "Gestão de combustível e manutenção de frota.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jakarta.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
