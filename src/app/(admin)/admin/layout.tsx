import { requireAdmin } from "@/lib/auth/require-admin";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireAdmin();

  return children;
}
