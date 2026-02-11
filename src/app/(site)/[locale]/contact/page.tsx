import { getLocaleFromParam } from "@/lib/i18n";
import { COPY } from "@/lib/i18n";
import { getHreflangUrls } from "@/lib/site";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ContactForm } from "./ContactForm";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);
  const t = COPY[loc].contact;

  return (
    <div className="min-h-screen border-t border-white/5 bg-black pt-14">
      <div className="mx-auto max-w-[480px] px-4 pb-24 pt-10 sm:px-6 md:px-8">
        <ScrollReveal>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">
            {t.defaultTitle}
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {loc === "es"
              ? "Formulario de contacto y booking."
              : "Contact and booking form."}
          </p>
        </ScrollReveal>
        <ScrollReveal className="mt-10" delayMs={100}>
          <ContactForm />
        </ScrollReveal>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = getLocaleFromParam(locale);
  const title = COPY[loc].contact.defaultTitle;
  const description =
    loc === "es"
      ? "Contacto y booking. Pablo Goldberg."
      : "Contact and booking. Pablo Goldberg.";
  const urls = getHreflangUrls("/contact");
  return {
    title,
    description,
    alternates: {
      canonical: urls[loc],
      languages: { es: urls.es, en: urls.en, "x-default": urls.es },
    },
    openGraph: {
      title: `${title} | Pablo Goldberg`,
      description,
    },
  };
}
