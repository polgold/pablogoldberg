"use client";

import Image from "next/image";
import type { WorkItem } from "@/types/work";

export interface WorkCardProps {
  item: WorkItem;
  /** If provided, card is a link (public work). Otherwise a div (admin). */
  href?: string;
  external?: boolean;
  /** Rendered above the gradient overlay (e.g. Hidden badge). */
  badge?: React.ReactNode;
  /** Rendered in the overlay area (e.g. Hide/Unhide button). */
  actions?: React.ReactNode;
}

export function WorkCard({ item, href, external, badge, actions }: WorkCardProps) {
  const content = (
    <>
      {item.featuredImage ? (
        <Image
          src={item.featuredImage}
          alt=""
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-white/5 text-xs text-white/30">
          {item.title}
        </div>
      )}
      {badge}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {actions && <div className="mb-2 flex w-full justify-end">{actions}</div>}
        <div className="flex w-full items-end justify-between gap-2">
          <span className="text-sm font-medium text-white truncate">{item.title}</span>
          {item.year && <span className="text-xs text-white/80 shrink-0">{item.year}</span>}
        </div>
      </div>
    </>
  );

  const className =
    "relative block aspect-[4/3] overflow-hidden focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-inset";

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
