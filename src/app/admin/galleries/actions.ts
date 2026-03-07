"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminServerClient, isAllowedAdminEmail } from "@/lib/supabase/admin-server";
import {
  listGalleries,
  getGalleryById,
  getGalleryBySectionSlug,
  createGallery,
  updateGallery,
  listGalleryItems,
  updateGalleryItemSortOrder,
  updateGalleryItemVisibility,
  updateGalleryItemFeatured,
  updateGalleryItemAlt,
  deleteGalleryItem,
  deleteGallery,
} from "@/lib/galleries/db";
import { rebuildGalleryFromDisk, processUploadedFiles } from "@/lib/galleries/rebuild";
import { ensureGalleryDirs } from "@/lib/galleries/fs";
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

export async function galleriesList() {
  await ensureAdmin();
  return listGalleries();
}

export async function galleryGetById(id: number) {
  await ensureAdmin();
  return getGalleryById(id);
}

export async function galleryGetBySectionSlug(section: string, slug: string) {
  await ensureAdmin();
  return getGalleryBySectionSlug(section, slug);
}

export async function galleryGetItems(galleryId: number) {
  await ensureAdmin();
  return listGalleryItems(galleryId, false);
}

export async function galleryCreate(section: string, slug: string, title: string) {
  await ensureAdmin();
  const existing = getGalleryBySectionSlug(section, slug);
  if (existing) throw new Error("Ya existe una galería con ese section/slug");
  ensureGalleryDirs(section, slug);
  const g = createGallery(section, slug, title);
  revalidatePath("/admin/galleries");
  revalidatePath("/admin/galleries/[section]/[slug]");
  return g;
}

export async function galleryUpdate(id: number, data: { title?: string }) {
  await ensureAdmin();
  updateGallery(id, data);
  revalidatePath("/admin/galleries");
  revalidatePath("/admin/galleries/[section]/[slug]");
}

export async function galleryRebuild(galleryId: number) {
  await ensureAdmin();
  const result = await rebuildGalleryFromDisk(galleryId);
  revalidatePath("/admin/galleries");
  revalidatePath("/admin/galleries/[section]/[slug]");
  return result;
}

export async function galleryUploadFiles(galleryId: number, formData: FormData) {
  await ensureAdmin();
  const files: Array<{ name: string; buffer: Buffer }> = [];
  const entries = formData.entries();
  for (const [, value] of entries) {
    if (value instanceof File && value.size > 0) {
      const buffer = Buffer.from(await value.arrayBuffer());
      files.push({ name: value.name || "image", buffer });
    }
  }
  const result = await processUploadedFiles(galleryId, files);
  revalidatePath("/admin/galleries");
  revalidatePath("/admin/galleries/[section]/[slug]");
  return result;
}

export async function galleryReorderItems(galleryId: number, itemIds: number[]) {
  await ensureAdmin();
  itemIds.forEach((id, index) => updateGalleryItemSortOrder(id, index));
  revalidatePath("/admin/galleries/[section]/[slug]");
}

export async function galleryItemSetVisible(itemId: number, isVisible: boolean) {
  await ensureAdmin();
  updateGalleryItemVisibility(itemId, isVisible ? 1 : 0);
  revalidatePath("/admin/galleries/[section]/[slug]");
  revalidatePath("/");
}

export async function galleryItemSetFeatured(itemId: number, isFeatured: boolean) {
  await ensureAdmin();
  updateGalleryItemFeatured(itemId, isFeatured ? 1 : 0);
  revalidatePath("/admin/galleries/[section]/[slug]");
  revalidatePath("/");
}

export async function galleryItemUpdateAlt(itemId: number, altText: string | null) {
  await ensureAdmin();
  updateGalleryItemAlt(itemId, altText);
  revalidatePath("/admin/galleries/[section]/[slug]");
}

export async function galleryItemDelete(itemId: number) {
  await ensureAdmin();
  deleteGalleryItem(itemId);
  revalidatePath("/admin/galleries/[section]/[slug]");
}

export async function galleryDelete(galleryId: number) {
  await ensureAdmin();
  deleteGallery(galleryId);
  revalidatePath("/admin/galleries");
}
