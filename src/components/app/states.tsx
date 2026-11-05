"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaHref,
  ctaLabel,
}: {
  icon: any;
  title: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 mb-4">
        <Icon className="h-7 w-7 text-emerald-600" />
      </div>
      <p className="font-semibold mb-1">{title}</p>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {description}
        </p>
      )}
      {ctaHref && ctaLabel && (
        <Link href={ctaHref} className="mt-4 inline-block">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {ctaLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}

export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      <div className="h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mr-3" />
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-center py-12 text-red-600">
      <p className="font-semibold mb-1">Erro ao carregar dados</p>
      <p className="text-sm">{message}</p>
    </div>
  );
}
