import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  upload: true,
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alt text",
    },
    {
      name: "width",
      type: "number",
      label: "Width",
      admin: { description: "Image width in pixels (if available)" },
    },
    {
      name: "height",
      type: "number",
      label: "Height",
      admin: { description: "Image height in pixels (if available)" },
    },
  ],
};
