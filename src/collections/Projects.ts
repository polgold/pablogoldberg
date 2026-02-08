import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

const ROLES = ["Director", "Cinematography/DP", "Producer", "Drone", "Photography"] as const;

const PIECE_TYPES = [
  { label: "Ad", value: "Ad" },
  { label: "Documentary", value: "Documentary" },
  { label: "Brand Film", value: "Brand Film" },
  { label: "Music Video", value: "Music Video" },
  { label: "Social", value: "Social" },
  { label: "Other", value: "Other" },
] as const;

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "client", "year", "pieceType", "slug", "isFeatured", "order"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "URL-friendly identifier. Leave empty to auto-generate from title.",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (value && String(value).trim()) return value;
            const title = (data?.title as string) || "";
            return title
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")
              .replace(/-+/g, "-")
              .replace(/^-|-$/g, "") || "project";
          },
        ],
      },
    },
    {
      name: "client",
      type: "text",
      required: true,
      admin: {
        description: "Cliente o marca del proyecto.",
      },
    },
    {
      name: "pieceType",
      type: "select",
      options: [...PIECE_TYPES],
      admin: {
        description: "Tipo de pieza (Ad, Documentary, Brand Film, etc.).",
      },
    },
    {
      name: "year",
      type: "number",
      required: true,
    },
    {
      name: "order",
      type: "number",
      admin: {
        description: "Opcional. Si existe, los proyectos se ordenan por este valor; si no, por año.",
      },
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      options: ROLES.map((r) => ({ label: r, value: r })),
    },
    {
      name: "summary",
      type: "textarea",
      admin: {
        description: "Resumen corto (1–2 líneas) para listados y SEO.",
      },
      localized: true,
    },
    {
      name: "description",
      type: "richText",
      editor: lexicalEditor(),
      localized: true,
    },
    {
      name: "credits",
      type: "richText",
      editor: lexicalEditor(),
      admin: {
        description: "Créditos del proyecto (dirección, producción, etc.).",
      },
      localized: true,
    },
    {
      name: "duration",
      type: "text",
      admin: {
        description: "Opcional. Ej: 30s, 2:15",
      },
    },
    {
      name: "videoUrl",
      type: "text",
      admin: {
        description: "Vimeo or YouTube URL (e.g. https://vimeo.com/123456 or https://youtube.com/watch?v=...)",
      },
    },
    {
      name: "externalLink",
      type: "text",
      admin: {
        description: "Enlace externo opcional (sitio del proyecto, etc.).",
      },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      required: false,
    },
    {
      name: "gallery",
      type: "array",
      label: "Gallery images",
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
    {
      name: "isFeatured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Show on homepage featured section",
      },
    },
  ],
};
