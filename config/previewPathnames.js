/**
 * Strapi Preview — pathname mapping for config/admin.js
 *
 * Keep in sync with `src/lib/previewPaths.js` in the Next.js frontend repo.
 */

const SINGLE_TYPE_INTERNAL_PATHS = {
  "home-page": "",
  "about-page": "about",
  "accessibility-page": "accessibility",
  "associated-clinics-page": "associated-clinics",
  "complaints-page": "complaints",
  "contact-page": "contact",
  "cookies-page": "cookies",
  "csr-page": "csr",
  "disclaimer-page": "disclaimer",
  "ebook-page": "e-book",
  "faq-page": "faq",
  "free-hospitation-page": "free-hospitation",
  "free-trial-page": "free-trial",
  "impressum-page": "impressum",
  "legal-notice-page": "legal-notice",
  "lecturers-page": "lecturers",
  "newsletter-page": "newsletter",
  "open-days-page": "open-days",
  "privacy-page": "privacy",
  "programmes-overview": "programmes",
  "programmes-postacademic": "programmes/postacademic",
  "programmes-postacademic-programme": "programmes/postacademic-programmes",
  "team-iao-page": "team-iao",
  "terms-page": "terms",
};

const WP = {
  en: {
    about: "about-iao",
    programmes: "programmes",
    master: "programmes/master-of-science-in-osteopathy",
    lateral: "programmes/master-of-science-in-osteopathy/lateral-entry",
    postacademic: "programmes/pam",
    postacademicProgrammes: "programmes/postacademic-programmes",
    manueleTherapie: "programmes/manuele-therapie",
    omtEgypt: "programmes/omt-egypt",
    freeTrial: "free-trial",
    freeHospitation: "free-hospitation",
    openDays: "open-days",
    faq: "faq",
    news: "news",
    contact: "contact",
    newsletter: "newsletter",
    lecturers: "lecturers",
    teamIao: "team-iao",
    programmeLectures: "programme-lectures",
  },
  nl: {
    about: "over-iao",
    programmes: "opleidingen",
    master: "opleidingen/master-of-science-in-osteopathy",
    lateral: "opleidingen/master-of-science-in-osteopathy/zij-instroom",
    postacademic: "opleidingen/pam",
    postacademicProgrammes: "opleidingen/postacademische-opleidingen",
    manueleTherapie: "opleidingen/cursus/manuele-therapie",
    freeTrial: "gratis-proefles-osteopathie",
    freeHospitation: "free-hospitation",
    openDays: "online-opendeurdagen",
    faq: "faq",
    news: "nieuws",
    contact: "contact",
    newsletter: "newsletter",
    lecturers: "docenten",
    programmeLectures: "programma-docenten",
  },
  fr: {
    about: "a-propos-iao",
    programmes: "formations",
    master: "formations/formation-en-osteopathie",
    lateral: "formations/master-of-science-in-osteopathy/lateral-entry",
    postacademic: "formations/pam",
    postacademicProgrammes: "formations/formations-post-academiques",
    freeTrial: "cours-gratuits",
    freeHospitation: "free-hospitation",
    openDays: "portes-ouvertes",
    faq: "faq",
    news: "actualites",
    contact: "contact",
    newsletter: "newsletter",
    lecturers: "professeurs",
    teamIao: "equipe-iao",
    programmeLectures: "programme-professeurs",
  },
  de: {
    about: "uber-iao",
    programmes: "ausbildungen",
    master: "ausbildungen/master-of-science-in-osteopathy",
    lateral: "ausbildungen/master-of-science-in-osteopathy/quereinstieg",
    postacademic: "ausbildungen/pam",
    postacademicProgrammes: "ausbildungen/postakademische-ausbildungen",
    freeTrial: "online-infoveranstaltung",
    openDays: "open-days",
    faq: "faq",
    news: "nachrichten",
    contact: "kontakt",
    newsletter: "newsletter",
    lecturers: "dozenten",
    teamIao: "team-iao",
    programmeLectures: "programm-dozenten",
    freeHospitation: "kostenlose-hospitationen",
  },
};

const NL_LEGAL = {
  disclaimer: "disclaimer",
  terms: "algemene-voorwaarden",
  "legal-notice": "wettelijke-vermelding",
  accessibility: "toegankelijkheidsverklaring",
  privacy: "privacy",
  cookies: "cookies",
  complaints: "klachtenformulier",
  csr: "over-iao/csr",
  "e-book": "e-book",
  impressum: "impressum",
};

const EN_PROGRAMME_DEFAULT_CAMPUS = "copenhagen";
const FR_MASTER_DEFAULT_CAMPUS = "mont-saint-guibert";
const DEFAULT_LOCALE = "nl";

function normalizeLocale(locale) {
  const value = String(locale ?? DEFAULT_LOCALE).trim().toLowerCase();
  return ["nl", "en", "fr", "de"].includes(value) ? value : DEFAULT_LOCALE;
}

function internalToPublicPath(locale, internalPath) {
  const raw = String(internalPath ?? "").replace(/^\/+|\/+$/g, "");
  if (!raw) return "";
  if (raw === "associated-clinics" && locale !== DEFAULT_LOCALE) return "";
  const L = WP[locale] || WP.en;
  const parts = raw.split("/").filter(Boolean);

  if (parts[0] === "about") return L.about;
  if (parts[0] === "free-trial") return parts.length > 1 ? `${L.freeTrial}/${parts.slice(1).join("/")}` : L.freeTrial;
  if (parts[0] === "free-hospitation") return L.freeHospitation ?? "free-hospitation";
  if (parts[0] === "open-days") return L.openDays;
  if (parts[0] === "faq") return L.faq;
  if (parts[0] === "news") return parts.length > 1 ? `${L.news}/${parts.slice(1).join("/")}` : L.news;
  if (parts[0] === "contact" && parts[1] === "thank-you") {
    if (locale === "nl") return `${L.contact}/bedankt`;
    if (locale === "fr") return `${L.contact}/merci`;
    if (locale === "de") return `${L.contact}/danke`;
    return `${L.contact}/thank-you`;
  }
  if (parts[0] === "newsletter" && parts[1] === "thank-you") {
    if (locale === "nl") return "nieuwsbrief/bedankt";
    if (locale === "fr") return `${L.newsletter}/merci`;
    if (locale === "de") return `${L.newsletter}/danke`;
    return `${L.newsletter}/thank-you`;
  }
  if (parts[0] === "complaints" && parts[1] === "thank-you") {
    if (locale === "nl") return "klachtenformulier/bedankt";
    if (locale === "fr") return "klachtenformulier/merci";
    if (locale === "de") return "complaints/danke";
    return "complaints/thank-you";
  }
  if (parts[0] === "e-book" && parts[1] === "bedankt") return "e-book/bedankt";
  if (parts[0] === "contact") return L.contact;
  if (parts[0] === "newsletter") return L.newsletter;
  if (parts[0] === "lecturers") return L.lecturers ?? "lecturers";
  if (parts[0] === "team-iao") return L.teamIao ?? "team-iao";
  if (parts[0] === "programme-lectures") {
    return parts.length > 1
      ? `${L.programmeLectures ?? "programme-lectures"}/${parts.slice(1).join("/")}`
      : (L.programmeLectures ?? "programme-lectures");
  }
  if (parts[0] === "programmes" && parts.length === 1) return L.programmes;
  if (parts[0] === "programmes" && parts[1] === "master") {
    const rest = parts.slice(2).join("/");
    if (locale === "fr" && !rest) return `${L.master}/${FR_MASTER_DEFAULT_CAMPUS}`;
    if (locale === "en" && !rest) return `${L.master}/${EN_PROGRAMME_DEFAULT_CAMPUS}`;
    return rest ? `${L.master}/${rest}` : L.master;
  }
  if (parts[0] === "programmes" && parts[1] === "lateral") {
    const rest = parts.slice(2).join("/");
    if (locale === "en" && !rest) return `${L.lateral}/${EN_PROGRAMME_DEFAULT_CAMPUS}`;
    return rest ? `${L.lateral}/${rest}` : L.lateral;
  }
  if (parts[0] === "programmes" && (parts[1] === "postacademic" || parts[1] === "pam")) {
    const rest = parts.slice(2).join("/");
    return rest ? `${L.postacademic}/${rest}` : L.postacademic;
  }
  if (parts[0] === "programmes" && parts[1] === "postacademic-programmes") {
    const rest = parts.slice(2).join("/");
    return rest ? `${L.postacademicProgrammes}/${rest}` : L.postacademicProgrammes;
  }
  if (parts[0] === "programmes" && parts[1] === "manuele-therapie") {
    const rest = parts.slice(2).join("/");
    const base = L.manueleTherapie ?? "programmes/manuele-therapie";
    return rest ? `${base}/${rest}` : base;
  }
  if (parts[0] === "programmes" && parts[1] === "omt-egypt") {
    const rest = parts.slice(2).join("/");
    const base = L.omtEgypt ?? "programmes/omt-egypt";
    return rest ? `${base}/${rest}` : base;
  }
  if (locale === DEFAULT_LOCALE && NL_LEGAL[raw]) return NL_LEGAL[raw];
  if (locale === DEFAULT_LOCALE && raw === "registration-form") return "inschrijvingsformulier";
  if (locale === DEFAULT_LOCALE && raw.startsWith("registration-form/")) {
    return `inschrijvingsformulier/${raw.slice("registration-form/".length)}`;
  }
  return raw;
}

function hrefForLocalePath(locale, internalPath) {
  const raw = String(internalPath ?? "").replace(/^\/+|\/+$/g, "");
  if (!raw) return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
  const pub = internalToPublicPath(locale, raw);
  if (!pub) return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
  if (locale === DEFAULT_LOCALE) return `/${pub}`;
  return `/${locale}/${pub}`;
}

function defaultCampusForHub(locale, programmeType) {
  if (programmeType === "master" && locale === "fr") return FR_MASTER_DEFAULT_CAMPUS;
  if ((programmeType === "master" || programmeType === "lateral") && locale === "en") {
    return EN_PROGRAMME_DEFAULT_CAMPUS;
  }
  return null;
}

function programmeCampusInternalPath(document) {
  const programmeType = String(document?.programme_type ?? "").trim();
  const campusSlug = String(document?.campus_slug ?? "").trim();
  if (programmeType === "omt-egypt") return "programmes/omt-egypt";
  const hubMap = {
    master: "programmes/master",
    lateral: "programmes/lateral",
    "manual-therapy": "programmes/manuele-therapie",
  };
  const hubPath = hubMap[programmeType];
  if (!hubPath) return null;
  return campusSlug ? `${hubPath}/${campusSlug}` : hubPath;
}

function pamModuleInternalPath(document) {
  const slug = String(document?.slug ?? "").trim();
  if (!slug) return "programmes/postacademic";
  return `programmes/postacademic/${slug}`;
}

function formThankYouInternalPath(kind, locale) {
  switch (String(kind ?? "").trim()) {
    case "contact":
      return "contact/thank-you";
    case "newsletter":
      return "newsletter/thank-you";
    case "complaints":
      return "complaints/thank-you";
    case "ebook":
      return locale === DEFAULT_LOCALE ? "e-book/bedankt" : null;
    default:
      return null;
  }
}

/**
 * Programme registration thank-you — internal app route (any Strapi slug works).
 * nl: /registration-thank-you/{slug} (middleware rewrites to /nl/…)
 * other locales: /{locale}/registration-thank-you/{slug}
 */
function registrationThankYouPreviewPath(locale, slug) {
  const s = String(slug ?? "").trim();
  if (!s) return null;

  const loc = normalizeLocale(locale);
  if (loc === DEFAULT_LOCALE) return `/registration-thank-you/${s}`;
  return `/${loc}/registration-thank-you/${s}`;
}

function getPreviewPathname(uid, { locale, document = {} }) {
  const contentType = String(uid ?? "").split(".").pop().trim();
  if (!contentType) return null;

  const loc = normalizeLocale(locale);
  const singleTypePath = SINGLE_TYPE_INTERNAL_PATHS[contentType];
  if (singleTypePath !== undefined) {
    return hrefForLocalePath(loc, singleTypePath);
  }

  switch (contentType) {
    case "news-article": {
      const slug = String(document?.slug ?? "").trim();
      return slug ? hrefForLocalePath(loc, `news/${slug}`) : hrefForLocalePath(loc, "news");
    }
    case "registration-form-page": {
      const slug = String(document?.slug ?? "").trim();
      if (!slug || slug === "registration-form") return hrefForLocalePath(loc, "registration-form");
      return hrefForLocalePath(loc, `registration-form/${slug}`);
    }
    case "programme-lecturers-page": {
      const slug = String(document?.slug ?? "").trim();
      return slug
        ? hrefForLocalePath(loc, `programme-lectures/${slug}`)
        : hrefForLocalePath(loc, "programme-lectures");
    }
    case "programme-hub": {
      const programmeType = String(document?.programme_type ?? "").trim();
      const hubMap = {
        master: "programmes/master",
        lateral: "programmes/lateral",
        "manual-therapy": "programmes/manuele-therapie",
      };
      const base = hubMap[programmeType];
      if (!base) return null;
      const campus = defaultCampusForHub(loc, programmeType);
      return hrefForLocalePath(loc, campus ? `${base}/${campus}` : base);
    }
    case "programme-campus": {
      const internal = programmeCampusInternalPath(document);
      return internal ? hrefForLocalePath(loc, internal) : null;
    }
    case "pam-module": {
      const internal = pamModuleInternalPath(document);
      return internal ? hrefForLocalePath(loc, internal) : null;
    }
    case "form-thank-you": {
      const internal = formThankYouInternalPath(document?.kind, loc);
      return internal ? hrefForLocalePath(loc, internal) : null;
    }
    case "registration-thank-you": {
      return registrationThankYouPreviewPath(loc, document?.slug);
    }
    default:
      return null;
  }
}

module.exports = { getPreviewPathname };
