"use client";

import { Star, Quote } from "lucide-react";

export function Testimonials({ items }: { items: any[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-20 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-sm font-medium mb-4">
            Depoimentos
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Quem usa, recomenda
          </h2>
          <p className="text-muted-foreground text-lg">
            Resultados reais de quem já controla a frota com o FuelGest.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t: any, i: number) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-card border border-border hover:border-emerald-200 hover:shadow-lg transition-all"
            >
              <Quote className="h-8 w-8 text-emerald-200 mb-3" />
              <p className="text-foreground text-sm leading-relaxed mb-4 italic">
                “{t.content}”
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.role} {t.company && `· ${t.company}`}
                  </p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className="h-3 w-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
