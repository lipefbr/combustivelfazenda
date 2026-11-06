import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/pwa/register-sw";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { AppleSplashScreens } from "@/components/pwa/apple-splash";

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
  title: {
    default: "FuelGest — Gestão de Combustível e Manutenção de Frota",
    template: "%s · FuelGest",
  },
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
  applicationName: "FuelGest",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "FuelGest",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/icon-384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.svg"],
  },
  openGraph: {
    title: "FuelGest — Gestão de Combustível e Manutenção de Frota",
    description:
      "Controle total do combustível e da manutenção da sua frota pelo celular, no campo.",
    siteName: "FuelGest",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/icons/icon-512.png",
        width: 512,
        height: 512,
        alt: "FuelGest",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FuelGest",
    description: "Gestão de combustível e manutenção de frota.",
    images: ["/icons/icon-512.png"],
  },
  appLinks: {
    web: {
      url: "https://fuelgest.com",
      should_fallback: true,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10B981" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  minimumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="FuelGest" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
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
          <ServiceWorkerRegister />
          <InstallPrompt />
          <AppleSplashScreens />
        </ThemeProvider>
      </body>
    </html>
  );
}
