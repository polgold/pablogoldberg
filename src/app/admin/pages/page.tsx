import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGES = [
  { slug: "about", label: "About / Bio" },
  // { slug: "home", label: "Home" },
  // { slug: "contact", label: "Contact" },
];

export default function AdminPagesListPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-white">Páginas</h1>
      <ul className="space-y-2">
        {PAGES.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/admin/pages/${p.slug}`}
              className="text-amber-500 hover:underline"
            >
              {p.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
