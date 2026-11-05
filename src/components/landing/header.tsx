"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Recursos", href: "#recursos" },
    { label: "Como funciona", href: "#como-funciona" },
    { label: "Relatórios", href: "#relatorios" },
    { label: "Planos", href: "#planos" },
    { label: "Perguntas", href: "#faq" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all",
        scrolled
          ? "bg-background/95 backdrop-blur shadow-sm border-b border-border/50"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
              <Fuel className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Fuel<span className="text-emerald-600">Gest</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <Link href="/app/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/app/cadastro">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Começar agora
              </Button>
            </Link>
          </div>

          <button
            className="lg:hidden p-2"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-2 text-base font-medium text-foreground hover:text-emerald-600"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-2">
              <Link href="/app/login" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  Entrar
                </Button>
              </Link>
              <Link href="/app/cadastro" onClick={() => setOpen(false)}>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Começar agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
