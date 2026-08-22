import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/require-admin";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  await requireAdmin();

  return children;
}
