import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Content is managed via Supabase.",
};

export default function AdminPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 text-white">
      <p>Content is managed via Supabase. No Payload admin.</p>
    </div>
  );
}
