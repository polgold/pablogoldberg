import type { Locale } from "./content";

export const LOCALES: Locale[] = ["es", "en"];
export const DEFAULT_LOCALE: Locale = "es";

export function isValidLocale(value: string): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function getLocaleFromParam(param: string | undefined): Locale {
  if (param && isValidLocale(param)) return param;
  return DEFAULT_LOCALE;
}

export const COPY: Record<
  Locale,
  {
    nav: { home: string; work: string; portfolio: string; gallery: string; about: string; contact: string };
    work: { title: string; subtitle: string; searchPlaceholder: string; all: string; projectsCount: string; noResults: string; viewAllWork: string; archive: string; archiveSubtitle: string };
    workDetail: { gallery: string; galleryStills: string; reelsTrailers: string; links: string; credits: string; viewAll: string; viewProject: string; navLabel: string };
    gallery: { title: string; subtitle?: string; all: string };
    home: { tagline: string; more: string; role: string; workTitle: string; reel: string; featured: string; viewAll: string; ctaVideos: string; ctaGallery: string; ctaFeatured: string; ctaTitle: string; ctaText: string; ctaButton: string; heroH1: string; heroSub: string; ctaPrimary: string; ctaSecondary: string; aboutText: string; ctaCollaborate: string; photography: string; about: string };
    about: { defaultTitle: string };
    contact: {
      defaultTitle: string;
      ctaButton: string;
      subtitle: string;
      metaDescription: string;
      formName: string;
      formContact: string;
      formMessage: string;
      formPlaceholderName: string;
      formPlaceholderContact: string;
      formPlaceholderMessage: string;
      formSubmit: string;
      formSending: string;
      formSuccess: string;
      formErrorRequired: string;
      formErrorSend: string;
      formErrorInvalid: string;
      formOrWhatsApp: string;
    };
    metadata: { about: string; contact: string; photography: string; archive: string; work: string; project: string };
  }
> = {
  es: {
    nav: { home: "Inicio", work: "Proyectos", portfolio: "Portfolio", gallery: "Fotografía", about: "Sobre mí", contact: "Contacto" },
    work: {
      title: "Proyectos",
      subtitle: "Selección de proyectos como director, DP y productor.",
      searchPlaceholder: "Buscar proyectos...",
      all: "Todos",
      projectsCount: "proyecto",
      noResults: "No hay proyectos que coincidan.",
      viewAllWork: "Ver todo el trabajo",
      archive: "Archivo",
      archiveSubtitle: "Todos los proyectos publicados.",
    },
    workDetail: { gallery: "Galería", galleryStills: "Galería / Stills", reelsTrailers: "Reels y trailers", links: "Enlaces", credits: "Créditos", viewAll: "Ver todos", viewProject: "Ver proyecto", navLabel: "Navegación entre proyectos" },
    gallery: { title: "Fotografía", subtitle: "Fotografías seleccionadas.", all: "Todas" },
    home: {
      tagline: "Director · Director de fotografía · Productor",
      more: "Más de 20 años contando historias. Buenos Aires.",
      role: "Director / Realizador",
      workTitle: "Proyectos",
      reel: "Reel",
      featured: "Trabajo destacado",
      viewAll: "Ver todo",
      ctaVideos: "Ver reel",
      ctaGallery: "Fotografía",
      ctaFeatured: "Proyectos",
      heroH1: "Director y productor en cine documental y publicidad.",
      heroSub: "Director de Sun Factory. Director, DF y productor para agencias. Más de 20 años desarrollando piezas con una mirada clara según cada proyecto.",
      ctaPrimary: "Ver reel",
      ctaSecondary: "Comenzar un proyecto",
      aboutText: "Director de Sun Factory. Más de 20 años en cine documental y contenido comercial para agencias y empresas, con una mirada clara y un enfoque específico según cada proyecto.",
      ctaCollaborate: "Colaboremos.",
      photography: "Fotografía",
      about: "Sobre mí",
      ctaTitle: "¿Proyecto en mente?",
      ctaText: "Hablemos de tu próximo spot, videoclip o documental.",
      ctaButton: "Contacto / Booking",
    },
    about: { defaultTitle: "Sobre mí" },
    contact: {
      defaultTitle: "Contacto",
      ctaButton: "Contacto / Booking",
      subtitle: "Formulario de contacto y booking.",
      metaDescription: "Contacto y booking. Pablo Goldberg.",
      formName: "Nombre",
      formContact: "Contacto",
      formMessage: "Mensaje",
      formPlaceholderName: "Tu nombre",
      formPlaceholderContact: "Email o WhatsApp",
      formPlaceholderMessage: "Cuéntame sobre tu proyecto...",
      formSubmit: "Enviar",
      formSending: "Enviando…",
      formSuccess: "Mensaje enviado.",
      formErrorRequired: "Completa todos los campos.",
      formErrorSend: "No se pudo enviar. Intenta más tarde.",
      formErrorInvalid: "Solicitud no válida.",
      formOrWhatsApp: "o escribe directo por WhatsApp",
    },
    metadata: { about: "Sobre mí | Pablo Goldberg", contact: "Contacto | Pablo Goldberg", photography: "Fotografía | Pablo Goldberg", archive: "Archivo | Pablo Goldberg", work: "Proyectos | Pablo Goldberg", project: "Proyecto | Pablo Goldberg" },
  },
  en: {
    nav: { home: "Home", work: "Projects", portfolio: "Portfolio", gallery: "Photography", about: "About", contact: "Contact" },
    work: {
      title: "Projects",
      subtitle: "Selection of projects as director, DP and producer.",
      searchPlaceholder: "Search projects...",
      all: "All",
      projectsCount: "project",
      noResults: "No projects match.",
      viewAllWork: "View All Work",
      archive: "Archive",
      archiveSubtitle: "All published projects.",
    },
    workDetail: { gallery: "Gallery", galleryStills: "Gallery / Stills", reelsTrailers: "Reels & Trailers", links: "Links", credits: "Credits", viewAll: "View all", viewProject: "View project", navLabel: "Project navigation" },
    gallery: { title: "Photography", subtitle: "Selected photographs.", all: "All" },
    home: {
      tagline: "Director · Director of Photography · Producer",
      more: "Over 20 years telling stories. Buenos Aires.",
      role: "Director / Filmmaker",
      workTitle: "Projects",
      reel: "Reel",
      featured: "Featured Work",
      viewAll: "View all",
      ctaVideos: "Watch Reel",
      ctaGallery: "Photography",
      ctaFeatured: "Projects",
      heroH1: "Director and producer in documentary and commercial film.",
      heroSub: "Director at Sun Factory. Director, DP and producer for agencies. Over 20 years developing pieces with a clear vision for each project.",
      ctaPrimary: "Watch Reel",
      ctaSecondary: "Start a Project",
      aboutText: "Director at Sun Factory. Over 20 years in documentary film and commercial content for agencies and companies, with a clear vision and a specific approach for each project.",
      ctaCollaborate: "Let's collaborate.",
      photography: "Photography",
      about: "About",
      ctaTitle: "Have a project in mind?",
      ctaText: "Let's talk about your next spot, music video or documentary.",
      ctaButton: "Contact / Booking",
    },
    about: { defaultTitle: "About" },
    contact: {
      defaultTitle: "Contact",
      ctaButton: "Contact / Booking",
      subtitle: "Contact and booking form.",
      metaDescription: "Contact and booking. Pablo Goldberg.",
      formName: "Name",
      formContact: "Contact",
      formMessage: "Message",
      formPlaceholderName: "Your name",
      formPlaceholderContact: "Email or WhatsApp",
      formPlaceholderMessage: "Tell me about your project...",
      formSubmit: "Send",
      formSending: "Sending…",
      formSuccess: "Message sent.",
      formErrorRequired: "Please fill in all fields.",
      formErrorSend: "Could not send. Please try again later.",
      formErrorInvalid: "Invalid request.",
      formOrWhatsApp: "or message directly via WhatsApp",
    },
    metadata: { about: "About | Pablo Goldberg", contact: "Contact | Pablo Goldberg", photography: "Photography | Pablo Goldberg", archive: "Archive | Pablo Goldberg", work: "Projects | Pablo Goldberg", project: "Project | Pablo Goldberg" },
  },
};
