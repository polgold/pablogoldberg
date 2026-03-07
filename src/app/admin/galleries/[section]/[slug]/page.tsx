import { notFound } from "next/navigation";
import Link from "next/link";
import { galleryGetBySectionSlug, galleryGetItems } from "@/app/admin/galleries/actions";
import { getUploadUrl } from "@/lib/galleries/urls";
import { GalleryDetailClient } from "./GalleryDetailClient";

export const dynamic = "force-dynamic";

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ section: string; slug: string }>;
}) {
  const { section, slug } = await params;
  const gallery = await galleryGetBySectionSlug(section, slug);
  if (!gallery) notFound();
  const items = await galleryGetItems(gallery.id);
  const itemsWithUrls = items.map((p) => ({
    ...p,
    thumbUrl: getUploadUrl(p.thumb_path),
    largeUrl: getUploadUrl(p.large_path),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/galleries" className="text-zinc-400 hover:text-white">← Galerías</Link>
          <h1 className="text-2xl font-semibold text-white">{gallery.title}</h1>
          <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {section}/{slug}
          </span>
        </div>
      </div>

      <GalleryDetailClient
        galleryId={gallery.id}
        section={section}
        slug={slug}
        initialItems={itemsWithUrls}
      />
    </div>
  );
}
