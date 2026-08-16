import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateMenuManagement() {
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/menu-items");
  revalidatePath("/admin/settings");
  revalidatePath("/menu");
}
