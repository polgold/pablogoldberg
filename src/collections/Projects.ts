import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

const ROLES = ["Director", "Cinematography/DP", "Producer", "Drone", "Photography"] as const;

export const Projects: CollectionConfig = {
  slug: "projects",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "year", "slug", "isFeatured"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
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
      name: "year",
      type: "number",
      required: true,
    },
    {
      name: "roles",
      type: "select",
      hasMany: true,
      options: ROLES.map((r) => ({ label: r, value: r })),
    },
    {
      name: "description",
      type: "richText",
      editor: lexicalEditor(),
    },
    {
      name: "videoUrl",
      type: "text",
      admin: {
        description: "Vimeo or YouTube URL (e.g. https://vimeo.com/123456 or https://youtube.com/watch?v=...)",
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
