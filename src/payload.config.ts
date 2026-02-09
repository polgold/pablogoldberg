import path from "path";
import sharp from "sharp";
import { buildConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { s3Storage } from "@payloadcms/storage-s3";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Pages } from "./collections/Pages";
import { Projects } from "./collections/Projects";

const srcDir = path.resolve(process.cwd(), "src");

/** Connection string para el pool: DATABASE_URL con sslmode normalizado para evitar SELF_SIGNED_CERT_IN_CHAIN.
 *  Si la URL tiene sslmode=require|prefer|verify-ca|verify-full (tratados como verify-full por pg), se reemplaza por sslmode=no-verify.
 *  No se borran otros params ni se toca user/pass/host/db. */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || "";
  if (!url) return url;
  const normalized = url.replace(
    /sslmode=(require|prefer|verify-ca|verify-full)/gi,
    "sslmode=no-verify"
  );
  return normalized;
}

/** SSL a nivel conexión pg: evita SELF_SIGNED_CERT_IN_CHAIN en managed DBs (Neon, Supabase, etc.). */
function getPoolSsl(): { rejectUnauthorized: boolean } | undefined {
  const url = process.env.DATABASE_URL || "";
  if (!url) return undefined;
  return { rejectUnauthorized: false };
}

const useS3 =
  process.env.S3_BUCKET &&
  process.env.S3_ACCESS_KEY_ID &&
  process.env.S3_SECRET_ACCESS_KEY;

export default buildConfig({
  localization: {
    locales: [
      { label: "Español", code: "es" },
      { label: "English", code: "en" },
    ],
    defaultLocale: "es",
    fallback: true,
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: srcDir,
    },
  },
  collections: [Users, Media, Pages, Projects],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(srcDir, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      connectionString: getDatabaseUrl(),
      ssl: getPoolSsl(),
    },
  }),
  sharp,
  plugins: [
    ...(useS3
      ? [
          s3Storage({
            collections: {
              media: true,
            },
            bucket: process.env.S3_BUCKET!,
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
              },
              region: process.env.S3_REGION || "auto",
              ...(process.env.S3_ENDPOINT && {
                endpoint: process.env.S3_ENDPOINT,
                forcePathStyle: true,
              }),
            },
          }),
        ]
      : []),
  ],
});
