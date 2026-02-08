import type { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug"],
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
        description: "e.g. home, about, contact",
      },
    },
    {
      name: "content",
      type: "richText",
      editor: lexicalEditor(),
    },
  ],
};
