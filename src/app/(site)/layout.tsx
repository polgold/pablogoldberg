import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CanonicalLink } from "@/components/CanonicalLink";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <CanonicalLink />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
