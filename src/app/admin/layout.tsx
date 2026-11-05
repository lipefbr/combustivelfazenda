import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Exceção: /admin/login não exige AdminShell nem auth
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Server-side auth check — apenas super_admin
  try {
    await requireSuperAdmin();
  } catch {
    redirect("/admin/login");
  }

  return <AdminShell>{children}</AdminShell>;
}
