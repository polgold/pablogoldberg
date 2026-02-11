"use client";

import Image from "next/image";
import type { WorkItem } from "@/types/work";

export interface WorkCardProps {
  item: WorkItem;
  /** If provided, card is a link (public work). Otherwise a div (admin). */
  href?: string;
  external?: boolean;
  /** When item has vimeoId, opens video in lightbox instead of navigating. */
  onVimeoClick?: (vimeoId: string) => void;
  /** Rendered above the gradient overlay (e.g. Hidden badge). */
  badge?: React.ReactNode;
  /** Rendered in the overlay area (e.g. Hide/Unhide button). */
  actions?: React.ReactNode;
}

export function WorkCard({ item, href, external, onVimeoClick, badge, actions }: WorkCardProps) {
  const content = (
    <>
      {item.featuredImage ? (
        <Image
          src={item.featuredImage}
          alt=""
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-white/5 text-xs text-white/30">
          {item.title}
        </div>
      )}
      {badge}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/20 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        {actions && <div className="mb-2 flex w-full justify-end">{actions}</div>}
        <div className="flex w-full items-end justify-between gap-3">
          <span className="truncate text-lg font-light tracking-wide text-white md:text-xl">{item.title}</span>
          {item.year && <span className="shrink-0 text-xs font-light tracking-wide text-white/80">{item.year}</span>}
        </div>
      </div>
      <div className="absolute inset-0 border-2 border-white/0 transition-colors duration-500 group-hover:border-white/10" />
    </>
  );

  const className =
    "relative block aspect-[4/3] overflow-hidden rounded-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-inset";

  if (item.vimeoId && onVimeoClick) {
    return (
      <button
        type="button"
        onClick={() => onVimeoClick(item.vimeoId!)}
        className={`group w-full text-left ${className}`}
      >
        {content}
      </button>
    );
  }

  if (href) {
    const linkProps = external ? { target: "_blank" as const, rel: "noopener noreferrer" as const } : {};
    return (
      <a href={href} className={`group ${className}`} {...linkProps}>
        {content}
      </a>
    );
  }

  return <div className={`group ${className}`}>{content}</div>;
}
