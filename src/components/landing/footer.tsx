"use client";

import Link from "next/link";
import { Fuel, Mail, Phone, MessageCircle, Instagram, Facebook, Linkedin } from "lucide-react";

export function Footer({ whatsapp, email, instagram, facebook, linkedin }: {
  whatsapp?: string;
  email?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}) {
  const wpp = whatsapp || "5511999999999";
  const mail = email || "contato@fuelgest.com";

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                <Fuel className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">
                Fuel<span className="text-emerald-400">Gest</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 mb-4 max-w-xs">
              Gestão inteligente de combustível e manutenção para frotas e
              máquinas pesadas.
            </p>
            <div className="flex gap-3">
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 hover:bg-emerald-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 hover:bg-emerald-600 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 hover:bg-emerald-600 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#recursos" className="hover:text-emerald-400">Recursos</a></li>
              <li><a href="#como-funciona" className="hover:text-emerald-400">Como funciona</a></li>
              <li><a href="#relatorios" className="hover:text-emerald-400">Relatórios</a></li>
              <li><a href="#planos" className="hover:text-emerald-400">Planos</a></li>
              <li><a href="#faq" className="hover:text-emerald-400">Perguntas frequentes</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Acesso</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/app/login" className="hover:text-emerald-400">Entrar</Link></li>
              <li><Link href="/app/cadastro" className="hover:text-emerald-400">Criar conta</Link></li>
              <li><Link href="/admin/login" className="hover:text-emerald-400">Painel Admin</Link></li>
              <li><a href="#termos" className="hover:text-emerald-400">Termos de uso</a></li>
              <li><a href="#privacidade" className="hover:text-emerald-400">Privacidade</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                <a href={`mailto:${mail}`} className="hover:text-emerald-400">{mail}</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <a
                  href={`https://wa.me/${wpp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>+55 (11) 99999-9999</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-slate-400">
            © {new Date().getFullYear()} FuelGest. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#termos" className="hover:text-emerald-400">Termos</a>
            <a href="#privacidade" className="hover:text-emerald-400">Privacidade</a>
            <a href="/admin/login" className="hover:text-emerald-400">Admin</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppButton({ phone }: { phone?: string }) {
  const wpp = phone || "5511999999999";
  return (
    <a
      href={`https://wa.me/${wpp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl animate-pulse-ring transition-colors"
      aria-label="Falar no WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
