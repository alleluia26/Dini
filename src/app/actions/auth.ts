"use server";

import { redirect } from "next/navigation";

import { createAdminSession, destroyCurrentAdminSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/client";
import { initialAdminSchema, loginSchema } from "@/lib/validation/auth";

export type LoginFormState = {
  message?: string;
};

export type InitialAdminFormState = {
  message?: string;
};

const invalidCredentialsMessage = "Invalid email or password.";
const initialAdminUnavailableMessage = "Initial administrator setup is unavailable.";

export async function createInitialAdmin(
  _previousState: InitialAdminFormState,
  formData: FormData,
): Promise<InitialAdminFormState> {
  const input = initialAdminSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirmation: formData.get("passwordConfirmation"),
  });

  if (!input.success) {
    return {
      message:
        input.error.issues[0]?.message ?? "Check the setup details and try again.",
    };
  }

  const passwordHash = await hashPassword(input.data.password);

  const initialAdmin = await prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw`SELECT 1 AS lock_acquired FROM pg_advisory_xact_lock(719204)`;

    const existingAdminCount = await transaction.adminUser.count();

    if (existingAdminCount > 0) {
      return null;
    }

    return transaction.adminUser.create({
      data: {
        email: input.data.email,
        name: input.data.name,
        passwordHash,
      },
      select: {
        id: true,
      },
    });
  });

  if (!initialAdmin) {
    return {
      message: initialAdminUnavailableMessage,
    };
  }

  await createAdminSession(initialAdmin.id);
  redirect("/admin");
}

export async function login(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const input = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!input.success) {
    return {
      message: invalidCredentialsMessage,
    };
  }

  const admin = await prisma.adminUser.findUnique({
    where: {
      email: input.data.email,
    },
    select: {
      active: true,
      id: true,
      passwordHash: true,
    },
  });

  if (!admin || !admin.active) {
    return {
      message: invalidCredentialsMessage,
    };
  }

  const passwordMatches = await verifyPassword(
    admin.passwordHash,
    input.data.password,
  ).catch(() => false);

  if (!passwordMatches) {
    return {
      message: invalidCredentialsMessage,
    };
  }

  await createAdminSession(admin.id);
  redirect("/admin");
}

export async function logout() {
  await destroyCurrentAdminSession();
  redirect("/admin/login");
}
