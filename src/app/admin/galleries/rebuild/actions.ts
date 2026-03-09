"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminServerClient, isAllowedAdminEmail } from "@/lib/supabase/admin-server";
import {
  sanitizeCategory,
  listWorkPhotographyCategories,
  listCategoryImageFiles,
  clearCategoryFolders,
  processUploadToWorkPhotography,
  type ProcessWorkPhotographyResult,
} from "@/lib/work-photography-rebuild";
import {
  getCategoriesInOrder,
  getCategoryPhotoFilenamesInOrder,
  saveCategoriesOrder,
  saveCategoryPhotoOrder,
} from "@/lib/work-photography-order";

async function ensureAdmin() {
  const supabase = await createAdminServerClient();
  if (!supabase) throw new Error("Auth no configurado");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAllowedAdminEmail(user.email ?? undefined)) {
    redirect("/admin/login");
  }
}

export async function rebuildListCategories(): Promise<string[]> {
  await ensureAdmin();
  return listWorkPhotographyCategories();
}

export async function rebuildListCategoryFiles(category: string): Promise<{ thumb: string[]; large: string[] }> {
  await ensureAdmin();
  if (!category?.trim()) return { thumb: [], large: [] };
  return listCategoryImageFiles(category);
}

export async function rebuildSanitizeCategory(name: string): Promise<string> {
  await ensureAdmin();
  return sanitizeCategory(name);
}

export type RebuildClearResult = { removed: number; errors: string[] };

export async function rebuildClearCategory(category: string): Promise<RebuildClearResult> {
  await ensureAdmin();
  if (!category?.trim()) return { removed: 0, errors: ["Categoría vacía"] };
  const result = clearCategoryFolders(category);
  revalidatePath("/admin/galleries/rebuild");
  revalidatePath("/es/photography");
  revalidatePath("/en/photography");
  return result;
}

export async function rebuildProcessGallery(formData: FormData): Promise<ProcessWorkPhotographyResult> {
  await ensureAdmin();
  const categoryRaw = formData.get("category") as string | null;
  const rebuild = formData.get("rebuild") === "true";
  const category = sanitizeCategory(categoryRaw?.trim() ?? "");
  if (!category) {
    return { processed: 0, failed: 0, generatedNames: [], errors: ["Categoría vacía"] };
  }

  const files: Array<{ name: string; buffer: Buffer }> = [];
  for (const [, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      const buffer = Buffer.from(await value.arrayBuffer());
      files.push({ name: value.name || "image", buffer });
    }
  }

  const result = await processUploadToWorkPhotography(category, files, { rebuild });
  revalidatePath("/admin/galleries/rebuild");
  revalidatePath("/es/photography");
  revalidatePath("/en/photography");
  return result;
}

// —— Orden de categorías y fotos (work/photography) ——

export async function orderGetCategories(): Promise<string[]> {
  await ensureAdmin();
  return getCategoriesInOrder();
}

export async function orderGetCategoryPhotos(category: string): Promise<string[]> {
  await ensureAdmin();
  if (!category?.trim()) return [];
  return getCategoryPhotoFilenamesInOrder(category);
}

export async function orderSaveCategoriesOrder(slugs: string[]): Promise<void> {
  await ensureAdmin();
  saveCategoriesOrder(slugs);
  revalidatePath("/admin/galleries/rebuild/order");
  revalidatePath("/es/photography");
  revalidatePath("/en/photography");
}

export async function orderSaveCategoryPhotoOrder(category: string, filenames: string[]): Promise<void> {
  await ensureAdmin();
  if (!category?.trim()) return;
  saveCategoryPhotoOrder(category, filenames);
  revalidatePath("/admin/galleries/rebuild/order");
  revalidatePath("/es/photography");
  revalidatePath("/en/photography");
}
