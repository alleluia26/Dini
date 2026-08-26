"use server";

import { createAdminSession } from "@/lib/auth/session";
import {
  clearSensitiveActionFailures,
  isSensitiveActionRateLimited,
  recordSensitiveActionFailure,
} from "@/lib/auth/sensitive-action-rate-limit";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { requireAdmin } from "@/lib/auth/require-admin";
import { prisma } from "@/lib/db/client";
import { changePasswordSchema, updateEmailSchema } from "@/lib/validation/auth";

export type AccountActionState = {
  fieldErrors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

const rateLimitedMessage = "Too many attempts. Please wait before trying again.";

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function validationErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[]> };
}): AccountActionState {
  return { fieldErrors: error.flatten().fieldErrors };
}

async function currentAdminForSensitiveChange() {
  const sessionAdmin = await requireAdmin();

  return prisma.adminUser.findFirst({
    where: {
      active: true,
      id: sessionAdmin.id,
    },
    select: {
      email: true,
      id: true,
      passwordHash: true,
    },
  });
}

async function currentPasswordMatches(
  admin: { id: string; passwordHash: string },
  password: string,
) {
  const key = `sensitive-account-change:${admin.id}`;

  if (isSensitiveActionRateLimited(key)) {
    return { rateLimited: true, valid: false };
  }

  const valid = await verifyPassword(admin.passwordHash, password).catch(() => false);

  if (!valid) recordSensitiveActionFailure(key);
  if (valid) clearSensitiveActionFailures(key);

  return { rateLimited: false, valid };
}

export async function updateAdminEmail(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const admin = await currentAdminForSensitiveChange();

  if (!admin) return { message: "Email cannot be updated." };

  const parsed = updateEmailSchema.safeParse({
    currentPassword: value(formData, "currentPassword"),
    email: value(formData, "email"),
  });

  if (!parsed.success) return validationErrors(parsed.error);

  const passwordCheck = await currentPasswordMatches(
    admin,
    parsed.data.currentPassword,
  );

  if (passwordCheck.rateLimited) return { message: rateLimitedMessage };
  if (!passwordCheck.valid) return { message: "Invalid current password." };
  if (parsed.data.email === admin.email) {
    return { message: "Enter a different email address." };
  }

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.adminUser.update({
        where: { id: admin.id },
        data: { email: parsed.data.email },
      });
      await transaction.adminSession.deleteMany({
        where: { userId: admin.id },
      });
    });

    await createAdminSession(admin.id);
    return { success: true, message: "Email address updated." };
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { message: "Email cannot be updated." };
    }

    return { message: "Email cannot be updated. Please try again." };
  }
}

export async function changeAdminPassword(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const admin = await currentAdminForSensitiveChange();

  if (!admin) return { message: "Password cannot be updated." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: value(formData, "currentPassword"),
    newPassword: value(formData, "newPassword"),
    passwordConfirmation: value(formData, "passwordConfirmation"),
  });

  if (!parsed.success) return validationErrors(parsed.error);

  const passwordCheck = await currentPasswordMatches(
    admin,
    parsed.data.currentPassword,
  );

  if (passwordCheck.rateLimited) return { message: rateLimitedMessage };
  if (!passwordCheck.valid) return { message: "Invalid current password." };

  const passwordIsUnchanged = await verifyPassword(
    admin.passwordHash,
    parsed.data.newPassword,
  ).catch(() => false);

  if (passwordIsUnchanged) {
    return { message: "Choose a password you have not used for this account." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  try {
    await prisma.$transaction(async (transaction) => {
      await transaction.adminUser.update({
        where: { id: admin.id },
        data: { passwordHash },
      });
      await transaction.adminSession.deleteMany({
        where: { userId: admin.id },
      });
    });

    await createAdminSession(admin.id);
    return {
      success: true,
      message: "Password updated. Your other sessions were signed out.",
    };
  } catch {
    return { message: "Password cannot be updated. Please try again." };
  }
}
