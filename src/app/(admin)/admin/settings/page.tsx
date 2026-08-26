import { AdminShell } from "@/components/admin/admin-shell";
import { AccountSecuritySettings } from "@/components/admin/account-security-settings";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/client";

export default async function SettingsPage() {
  const admin = await requireAdmin();
  const [settings, currentAdmin] = await Promise.all([
    prisma.restaurantSettings.findUnique({
      where: { id: "default" },
    }),
    prisma.adminUser.findUnique({
      where: { id: admin.id },
      select: { email: true },
    }),
  ]);
  return (
    <AdminShell>
      <section className="mx-auto max-w-4xl space-y-8">
        <header>
          <p className="text-sm font-extrabold tracking-[0.12em] text-[var(--color-brand-red)]">
            HOTEL SETTINGS
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
            Public menu settings
          </h1>
          <p className="mt-3 text-[var(--color-muted)]">
            Only add confirmed hotel details. Nothing is published until you enable the
            public menu.
          </p>
        </header>
        <SettingsForm settings={settings} />
        {currentAdmin?.email ? (
          <AccountSecuritySettings currentEmail={currentAdmin.email} />
        ) : null}
      </section>
    </AdminShell>
  );
}
