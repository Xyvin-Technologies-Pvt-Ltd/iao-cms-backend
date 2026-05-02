/**
 * seed-remaining-pages.mjs
 *
 * Seeds all 14 remaining Single Type pages into PostgreSQL.
 * Pages: accessibility, associated-clinics, cookies, complaints, csr,
 *        disclaimer, ebook, free-trial, legal-notice, impressum,
 *        newsletter, open-days, privacy, terms
 *
 * Run from project root:
 *   node scripts/seed-remaining-pages.mjs
 */

import pg from "pg";
import crypto from "crypto";

const client = new pg.Client({
  host: "db.yqajmnsvvhyacorrurrk.supabase.co",
  port: 5432,
  user: "postgres",
  password: "base!vb3454",
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

const uid = () => crypto.randomBytes(16).toString("hex").slice(0, 20);

// ─── Helper: seed a simple i18n single type with flat JSON columns ────────────

async function seedSimplePage({ tableName, documentId, rows }) {
  // Wipe existing
  await client.query(`DELETE FROM ${tableName}`);
  console.log(`  🗑  Cleared ${tableName}`);

  for (const row of rows) {
    const cols = Object.keys(row);
    const vals = Object.values(row);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
    await client.query(
      `INSERT INTO ${tableName} (${cols.join(", ")}) VALUES (${placeholders})`,
      vals
    );
    console.log(`  ✅ [${row.locale}] inserted`);
  }
}

// ─── Connect ──────────────────────────────────────────────────────────────────

await client.connect();
console.log("✓ Connected to PostgreSQL\n");

// ─── Seed data ────────────────────────────────────────────────────────────────

const now = new Date();

// ── 1. Accessibility Page ─────────────────────────────────────────────────────
const accessibilityDocId = uid();
await seedSimplePage({
  tableName: "accessibility_pages",
  documentId: accessibilityDocId,
  rows: [
    {
      document_id: accessibilityDocId, locale: "en", published_at: now, created_at: now, updated_at: now,
      title: "Accessibility Statement",
      content: "We are committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience and applying relevant accessibility standards.",
    },
    {
      document_id: accessibilityDocId, locale: "nl", published_at: now, created_at: now, updated_at: now,
      title: "Toegankelijkheidsverklaring",
      content: "We zetten ons in voor digitale toegankelijkheid voor mensen met een handicap. We verbeteren voortdurend de gebruikerservaring en passen de relevante toegankelijkheidsnormen toe.",
    },
    {
      document_id: accessibilityDocId, locale: "fr", published_at: now, created_at: now, updated_at: now,
      title: "Déclaration d'accessibilité",
      content: "Nous nous engageons à garantir l'accessibilité numérique pour les personnes handicapées. Nous améliorons continuellement l'expérience utilisateur et appliquons les normes d'accessibilité pertinentes.",
    },
    {
      document_id: accessibilityDocId, locale: "de", published_at: now, created_at: now, updated_at: now,
      title: "Erklärung zur Barrierefreiheit",
      content: "Wir verpflichten uns zur digitalen Barrierefreiheit für Menschen mit Behinderungen. Wir verbessern kontinuierlich die Benutzererfahrung und wenden die relevanten Barrierefreiheitsstandards an.",
    },
  ],
});

// ── 2. Associated Clinics Page ────────────────────────────────────────────────
const associatedDocId = uid();
await seedSimplePage({
  tableName: "associated_clinics_pages",
  documentId: associatedDocId,
  rows: [
    {
      document_id: associatedDocId, locale: "en", published_at: now, created_at: now, updated_at: now,
      title: "Associated Clinics",
      intro: "At our Associated Clinics you can receive high-quality osteopathic examination and treatment. Our students, under supervision of experienced osteopaths, observe or perform these treatments. This gives them the opportunity to put their knowledge and skills into practice, while you benefit from quality care and personal attention.",
      view_list: "View the list",
      list_url: "https://docs.google.com/spreadsheets/d/18xePGRHPNQSD0dLmIlxKj5YANodK0la_ypNALdyAucE/edit?gid=0#gid=0",
      why_choose_title: "Why choose an Associated Clinic?",
      why_choose_items: JSON.stringify(["Treatments are performed by students under the guidance of experienced osteopaths.", "Your visit supports the training and development of future osteopaths."]),
      faq_section_title: "Frequently asked questions and answers",
      accordion_items: JSON.stringify([{ question: "Placeholder heading 1", answer: "" }, { question: "Placeholder heading 2", answer: "" }, { question: "Placeholder heading 3", answer: "" }]),
    },
    {
      document_id: associatedDocId, locale: "nl", published_at: now, created_at: now, updated_at: now,
      title: "Associated Clinics",
      intro: "Bij onze Associated Clinics kan je terecht voor hoogwaardig osteopathisch onderzoek en behandeling. Onze studenten, onder supervisie van ervaren osteopaten, observeren of voeren deze behandelingen uit. Dit biedt hen de kans om hun kennis en vaardigheden in de praktijk te brengen, terwijl jij profiteert van hoogwaardige zorg en persoonlijke aandacht.",
      view_list: "Lijst bekijken",
      list_url: "https://docs.google.com/spreadsheets/d/18xePGRHPNQSD0dLmIlxKj5YANodK0la_ypNALdyAucE/edit?gid=0#gid=0",
      why_choose_title: "Waarom kiezen voor een Associated Clinic?",
      why_choose_items: JSON.stringify(["Behandelingen worden uitgevoerd door studenten onder begeleiding van ervaren osteopaten.", "Je bezoek ondersteunt de opleiding en ontwikkeling van toekomstige osteopaten."]),
      faq_section_title: "Veelgestelde vragen en antwoorden",
      accordion_items: JSON.stringify([{ question: "Welke opleidingen kan ik aan de IAO® volgen?", answer: "" }, { question: "Wat is de waarde van de Master of Science in Osteopathy?", answer: "" }, { question: "Is de Master of Science een wettelijk erkend diploma?", answer: "" }, { question: "Ben ik een erkend osteopaat wanneer ik aan de IAO® afstudeer?", answer: "" }, { question: "Kan ik als osteopaat verder studeren?", answer: "" }]),
    },
    {
      document_id: associatedDocId, locale: "fr", published_at: now, created_at: now, updated_at: now,
      title: "Cliniques Associées",
      intro: "Dans nos cliniques associées, vous pouvez bénéficier d'examens et de traitements ostéopathiques de haute qualité. Nos étudiants, sous la supervision d'ostéopathes expérimentés, observent ou effectuent ces traitements.",
      view_list: "Voir la liste",
      list_url: "https://docs.google.com/spreadsheets/d/18xePGRHPNQSD0dLmIlxKj5YANodK0la_ypNALdyAucE/edit?gid=0#gid=0",
      why_choose_title: "Pourquoi choisir une clinique associée ?",
      why_choose_items: JSON.stringify(["Les traitements sont réalisés par des étudiants sous la guidance d'ostéopathes expérimentés.", "Votre visite soutient la formation et le développement des futurs ostéopathes."]),
      faq_section_title: "Questions fréquentes",
      accordion_items: JSON.stringify([{ question: "Placeholder 1", answer: "" }, { question: "Placeholder 2", answer: "" }]),
    },
    {
      document_id: associatedDocId, locale: "de", published_at: now, created_at: now, updated_at: now,
      title: "Assoziierte Kliniken",
      intro: "Bei unseren assoziierten Kliniken erhalten Sie hochwertige osteopathische Untersuchungen und Behandlungen.",
      view_list: "Liste anzeigen",
      list_url: "https://docs.google.com/spreadsheets/d/18xePGRHPNQSD0dLmIlxKj5YANodK0la_ypNALdyAucE/edit?gid=0#gid=0",
      why_choose_title: "Warum eine assoziierte Klinik wählen?",
      why_choose_items: JSON.stringify(["Behandlungen werden von Studierenden unter Anleitung erfahrener Osteopathen durchgeführt.", "Ihr Besuch unterstützt die Ausbildung und Entwicklung zukünftiger Osteopathen."]),
      faq_section_title: "Häufig gestellte Fragen",
      accordion_items: JSON.stringify([{ question: "Platzhalter 1", answer: "" }, { question: "Platzhalter 2", answer: "" }]),
    },
  ],
});

// ── 3. Complaints Page ────────────────────────────────────────────────────────
const complaintsDocId = uid();
await seedSimplePage({
  tableName: "complaints_pages",
  documentId: complaintsDocId,
  rows: [
    { document_id: complaintsDocId, locale: "en", published_at: now, created_at: now, updated_at: now, title: "Not satisfied? Let us know.", breadcrumb: "Not satisfied? Let us know.", message_label: "What is your complaint?" },
    { document_id: complaintsDocId, locale: "nl", published_at: now, created_at: now, updated_at: now, title: "Niet tevreden? Laat het ons weten.", breadcrumb: "Niet tevreden? Laat het ons weten.", message_label: "Wat is uw klacht?" },
    { document_id: complaintsDocId, locale: "fr", published_at: now, created_at: now, updated_at: now, title: "Pas satisfait? Faites-le-nous savoir.", breadcrumb: "Pas satisfait? Faites-le-nous savoir.", message_label: "Quelle est votre plainte?" },
    { document_id: complaintsDocId, locale: "de", published_at: now, created_at: now, updated_at: now, title: "Nicht zufrieden? Lassen Sie es uns wissen.", breadcrumb: "Nicht zufrieden? Lassen Sie es uns wissen.", message_label: "Was ist Ihre Beschwerde?" },
  ],
});

// ── 4. CSR Page ───────────────────────────────────────────────────────────────
const csrDocId = uid();
await seedSimplePage({
  tableName: "csr_pages",
  documentId: csrDocId,
  rows: [
    {
      document_id: csrDocId, locale: "en", published_at: now, created_at: now, updated_at: now,
      title: "CSR Policy",
      intro: "At the IAO® we take corporate social responsibility seriously. As an international educational institution that trains doctors, physiotherapists and physical therapists to become osteopaths, we actively contribute to the health of people and our society.",
      sustainability_title: "Sustainable and environmentally conscious",
      sustainability_items: JSON.stringify(["We work in energy-efficient locations and encourage sustainable behaviour among students and staff.", "We reduce our ecological footprint through digital courses, conscious mobility and waste reduction."]),
      social_title: "Socially engaged",
      social_items: JSON.stringify(["We encourage international cooperation and social involvement.", "We support mental wellbeing and ethical professional conduct.", "We provide an inclusive and respectful learning environment."]),
      governance_title: "Transparent and honest governance",
      governance_items: JSON.stringify(["We continuously invest in educational innovation and social impact.", "We respect legislation, privacy and quality standards in every country where we operate.", "We act honestly and transparently towards students, lecturers, staff and partners."]),
      scope: "This CSR policy applies to all our campuses and partners in BE, NL, DK, DE, AT and CH.",
    },
    {
      document_id: csrDocId, locale: "nl", published_at: now, created_at: now, updated_at: now,
      title: "CSR-beleid",
      intro: "Bij de IAO® nemen we maatschappelijke verantwoordelijkheid ernstig. Als internationale onderwijsinstelling die artsen, kinesitherapeuten en fysiotherapeuten opleidt tot osteopaten, dragen wij actief bij aan de gezondheid van mensen én onze samenleving.",
      sustainability_title: "Duurzaam en milieubewust",
      sustainability_items: JSON.stringify(["We werken in energiezuinige locaties en stimuleren duurzaam gedrag bij studenten en medewerkers.", "We verkleinen onze ecologische voetafdruk via digitale cursus, bewuste mobiliteit en afvalreductie."]),
      social_title: "Sociaal geëngageerd",
      social_items: JSON.stringify(["We stimuleren internationale samenwerking en sociale betrokkenheid.", "We steunen mentaal welzijn en ethisch professioneel handelen.", "We zorgen voor een inclusieve en respectvolle leeromgeving."]),
      governance_title: "Transparant en integer bestuur",
      governance_items: JSON.stringify(["We investeren continu in onderwijsinnovatie en maatschappelijke impact.", "We respecteren wetgeving, privacy en kwaliteitsnormen in elk land waar we actief zijn.", "We handelen eerlijk en transparant tegenover studenten, docenten, medewerkers en partners."]),
      scope: "Dit CSR-beleid geldt voor al onze campussen en partners in BE, NL, DK, DE, AT en CH.",
    },
    {
      document_id: csrDocId, locale: "fr", published_at: now, created_at: now, updated_at: now,
      title: "Politique RSE",
      intro: "À l'IAO®, nous prenons la responsabilité sociétale au sérieux. En tant qu'institution éducative internationale formant des médecins, kinésithérapeutes et physiothérapeutes à l'ostéopathie, nous contribuons activement à la santé des personnes et de notre société.",
      sustainability_title: "Durable et respectueux de l'environnement",
      sustainability_items: JSON.stringify(["Nous travaillons dans des locaux économes en énergie et encourageons un comportement durable chez les étudiants et le personnel.", "Nous réduisons notre empreinte écologique grâce aux cours numériques, à une mobilité consciente et à la réduction des déchets."]),
      social_title: "Engagement social",
      social_items: JSON.stringify(["Nous encourageons la coopération internationale et l'engagement social.", "Nous soutenons le bien-être mental et une conduite professionnelle éthique.", "Nous offrons un environnement d'apprentissage inclusif et respectueux."]),
      governance_title: "Gouvernance transparente et intègre",
      governance_items: JSON.stringify(["Nous investissons continuellement dans l'innovation pédagogique et l'impact social.", "Nous respectons la législation, la confidentialité et les normes de qualité dans tous les pays où nous opérons.", "Nous agissons avec honnêteté et transparence envers les étudiants, les enseignants, le personnel et les partenaires."]),
      scope: "Cette politique RSE s'applique à tous nos campus et partenaires en BE, NL, DK, DE, AT et CH.",
    },
    {
      document_id: csrDocId, locale: "de", published_at: now, created_at: now, updated_at: now,
      title: "CSR-Richtlinie",
      intro: "Bei der IAO® nehmen wir gesellschaftliche Verantwortung ernst. Als internationale Bildungseinrichtung, die Ärzte, Physiotherapeuten und Krankengymnasten zu Osteopathen ausbildet, tragen wir aktiv zur Gesundheit der Menschen und unserer Gesellschaft bei.",
      sustainability_title: "Nachhaltig und umweltbewusst",
      sustainability_items: JSON.stringify(["Wir arbeiten an energieeffizienten Standorten und fördern nachhaltiges Verhalten bei Studierenden und Mitarbeitern.", "Wir reduzieren unseren ökologischen Fußabdruck durch digitale Kurse, bewusste Mobilität und Abfallvermeidung."]),
      social_title: "Sozial engagiert",
      social_items: JSON.stringify(["Wir fördern internationale Zusammenarbeit und gesellschaftliches Engagement.", "Wir unterstützen psychisches Wohlbefinden und ethisch professionelles Handeln.", "Wir schaffen eine inklusive und respektvolle Lernumgebung."]),
      governance_title: "Transparente und integre Führung",
      governance_items: JSON.stringify(["Wir investieren kontinuierlich in Bildungsinnovation und gesellschaftliche Wirkung.", "Wir respektieren Gesetzgebung, Datenschutz und Qualitätsstandards in jedem Land, in dem wir tätig sind.", "Wir handeln ehrlich und transparent gegenüber Studierenden, Dozenten, Mitarbeitern und Partnern."]),
      scope: "Diese CSR-Richtlinie gilt für alle unsere Campus und Partner in BE, NL, DK, DE, AT und CH.",
    },
  ],
});

// ── 5. Disclaimer Page ────────────────────────────────────────────────────────
const disclaimerDocId = uid();
const disclaimerSectionsEN = [
  { title: "1. No medical or professional advice", body: "The content of this website, including but not limited to texts, videos, documents and tools such as our AI assistant Mila, is intended solely for educational and informational purposes. It does not replace medical, therapeutic, legal, financial or any other professional advice. Users who act upon this information do so at their own risk." },
  { title: "2. Use of AI", body: "Our AI assistant Mila is designed to support users in finding information about our programmes and services. While Mila is based on relevant data and regularly monitored, it may provide inaccurate, outdated or incomplete information. IAO® accepts no liability for any damages arising from the use of Mila or decisions made based on its output." },
  { title: "3. Limitation of liability", body: "IAO® shall not be held liable for any direct or indirect damages resulting from the use of this website, from its temporary unavailability, or from actions based on the information provided." },
  { title: "4. External links", body: "This website may contain links to third-party websites. IAO® assumes no responsibility for the content, accuracy, or functioning of those external sites." },
  { title: "5. Intellectual property", body: "All content on this website, including texts, images, logos, videos and documents, is the property of IAO® or used with permission from the copyright holder." },
];
await seedSimplePage({
  tableName: "disclaimer_pages",
  documentId: disclaimerDocId,
  rows: [
    { document_id: disclaimerDocId, locale: "en", published_at: now, created_at: now, updated_at: now, title: "Disclaimer", intro: "The information on this website of the International Academy of Osteopathy (IAO®) is compiled with great care and updated regularly. However, we make no guarantees regarding the completeness, accuracy or timeliness of the information provided.", last_updated: "Last updated: 28.07.2025", sections: JSON.stringify(disclaimerSectionsEN) },
    { document_id: disclaimerDocId, locale: "nl", published_at: now, created_at: now, updated_at: now, title: "Disclaimer", intro: "De informatie op deze website van The International Academy of Osteopathy® wordt met grote zorg samengesteld en regelmatig geactualiseerd.", last_updated: "Laatste update: 28.07.25", sections: JSON.stringify([{ title: "1. Geen medisch of professioneel advies", body: "De informatie op deze website is uitsluitend bedoeld voor educatieve en informatieve doeleinden." }, { title: "2. Gebruik van AI", body: "Onze AI-agent Mila is ontworpen om gebruikers te ondersteunen bij het vinden van informatie over onze opleidingen en diensten." }, { title: "3. Aansprakelijkheid", body: "IAO® kan niet aansprakelijk worden gesteld voor directe of indirecte schade die voortvloeit uit het gebruik van de website." }, { title: "4. Externe links", body: "Deze website bevat links naar externe websites van derden. IAO® is niet verantwoordelijk voor de inhoud van deze externe websites." }, { title: "5. Intellectuele eigendomsrechten", body: "Alle inhoud op deze website is eigendom van IAO® of wordt gebruikt met toestemming van de rechthebbende." }]) },
    { document_id: disclaimerDocId, locale: "fr", published_at: now, created_at: now, updated_at: now, title: "Avis de non-responsabilité", intro: "Les informations figurant sur ce site de l'International Academy of Osteopathy (IAO®) sont compilées avec le plus grand soin et régulièrement mises à jour.", last_updated: "Dernière mise à jour : 28.07.2025", sections: JSON.stringify([{ title: "1. Pas de conseil médical ou professionnel", body: "Le contenu de ce site est destiné uniquement à des fins pédagogiques et d'information." }, { title: "2. Utilisation de l'IA", body: "Notre assistante IA Mila est conçue pour aider les utilisateurs à trouver des informations sur nos programmes et services." }, { title: "3. Limitation de responsabilité", body: "IAO® ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation de ce site." }, { title: "4. Liens externes", body: "Ce site peut contenir des liens vers des sites tiers. IAO® n'assume aucune responsabilité quant au contenu de ces sites externes." }, { title: "5. Propriété intellectuelle", body: "Le contenu de ce site est la propriété d'IAO® ou utilisé avec l'autorisation du titulaire des droits." }]) },
    { document_id: disclaimerDocId, locale: "de", published_at: now, created_at: now, updated_at: now, title: "Haftungsausschluss", intro: "Die Informationen auf dieser Website der International Academy of Osteopathy (IAO®) werden mit großer Sorgfalt zusammengestellt und regelmäßig aktualisiert.", last_updated: "Zuletzt aktualisiert: 28.07.2025", sections: JSON.stringify([{ title: "1. Kein medizinischer oder professioneller Rat", body: "Die Inhalte dieser Website dienen ausschließlich zu Informations- und Bildungszwecken." }, { title: "2. Verwendung von KI", body: "Unser KI-Assistent Mila unterstützt Nutzer bei der Suche nach Informationen zu unseren Programmen und Dienstleistungen." }, { title: "3. Haftungsbeschränkung", body: "IAO® haftet nicht für direkte oder indirekte Schäden, die aus der Nutzung dieser Website entstehen." }, { title: "4. Externe Links", body: "Diese Website kann Links zu Websites Dritter enthalten. IAO® übernimmt keine Verantwortung für externe Seiten." }, { title: "5. Geistiges Eigentum", body: "Sämtliche Inhalte dieser Website sind Eigentum der IAO® oder werden mit Zustimmung des Rechteinhabers genutzt." }]) },
  ],
});

// ── 6. Ebook Page (NL only) ───────────────────────────────────────────────────
const ebookDocId = uid();
await seedSimplePage({
  tableName: "ebook_pages",
  documentId: ebookDocId,
  rows: [
    {
      document_id: ebookDocId, locale: "nl", published_at: now, created_at: now, updated_at: now,
      breadcrumb_ebook: "E-book", breadcrumb_thank_you: "Bedankt voor je interesse",
      meta_title_form: "E-book", meta_title_thank_you: "E-book - Bedankt voor je interesse",
      meta_description_form: "Vul je gegevens in en ontvang het gratis e-book over osteopathie voor zorgprofessionals.",
      meta_description_thank_you: "We hebben je aanvraag ontvangen. Je ontvangt een e-mail met de downloadlink voor het e-book.",
      title_form: "Download het e-book", intro_form: "Vul je gegevens in en ontvang direct het e-book!",
      title_thank_you: "Bedankt",
      thank_you_message: "We hebben je gegevens goed ontvangen. Je ontvangt zo meteen een e-mail met daarin de downloadlink voor het e-book.",
      brevo_form_url: "https://17bc018b.sibforms.com/serve/MUIFAJgD3OusmlX5DFCYJm6-rpUhgO4lLb-GX2adlrbdv3VPsqz3BzSTAkmgvnEBRApO7fznPibE2a2QYsL15OUP42iSOKsfg0EUrnlO7YcZFUzCMSNws7pRW0uC8wvADtXUrE0HI4dYU3gORRB9LOWeIkoZM1AuTKvViwHVFNPT5cS2tGOdFOlt52YVDCfVYCkVqtsAs7JUAOJ4",
    },
  ],
});

// ── 7. Free Trial Page ────────────────────────────────────────────────────────
const freeTrialDocId = uid();
await seedSimplePage({
  tableName: "free_trial_pages",
  documentId: freeTrialDocId,
  rows: [
    {
      document_id: freeTrialDocId, locale: "en", published_at: now, created_at: now, updated_at: now,
      title: "Interested in attending a free trial class?", breadcrumb: "Free Trial Class",
      subtitle: "Curious to see if our programs are the right fit for you? During our free trial class, you will have the opportunity to meet our lecturers, talk to current students, and experience firsthand how we teach.",
      intros: JSON.stringify(["You will discover how the program is structured and get a real sense of our unique, hands-on approach to learning.", "Experience how our personal and high-quality approach can truly help you move forward!"]),
      event_sections: JSON.stringify([{ key: "default", heading: "", events: [{ title: "Free trial class Copenhagen", date: "18 Apr", time: "08:00 – 12:30", day: "Sat 18 Apr 2026", register_link: "https://iao.promatis.be/en/inschrijvinggratis.html", register_text: "Register" }] }]),
    },
    {
      document_id: freeTrialDocId, locale: "nl", published_at: now, created_at: now, updated_at: now,
      title: "Gratis proefles bijwonen?", breadcrumb: "Gratis proefles",
      subtitle: "Benieuwd of onze opleidingen bij jou passen? Tijdens onze ", subtitle_highlight: "openlesdagen", subtitle_after: " maak je kennis met onze docenten, studenten én met de manier waarop wij lesgeven.",
      intros: JSON.stringify(["Je ontdekt hoe de opleiding is opgebouwd en ervaart zelf onze unieke, praktijkgerichte aanpak.", "Ontdek hoe onze persoonlijke en kwalitatieve aanpak jou écht vooruithelpt!"]),
      event_sections: JSON.stringify([{ key: "default", heading: "", events: [{ title: "Openlesdag Zeist", date: "17 apr", time: "08:00 – 12:30", day: "vr 17 apr 2026", register_link: "https://iao.promatis.be/nl/inschrijvinggratis.html", register_text: "Inschrijven" }, { title: "Openlesdag Gent", date: "24 apr", time: "08:00 – 12:30", day: "vr 24 apr 2026", register_link: "https://iao.promatis.be/nl/inschrijvinggratis.html", register_text: "Inschrijven" }] }]),
    },
    {
      document_id: freeTrialDocId, locale: "fr", published_at: now, created_at: now, updated_at: now,
      title: "Suivre un cours gratuit ?", breadcrumb: "Cours gratuits",
      subtitle: "Curieux de savoir si nos formations vous correspondent ? Lors de nos journées portes ouvertes, vous ferez connaissance avec nos enseignants, nos étudiants et notre méthode d'enseignement.",
      intros: JSON.stringify(["Vous découvrirez la structure de la formation et expérimenterez par vous-même notre approche unique.", "Découvrez comment notre approche personnalisée et de haute qualité peut réellement vous faire progresser !"]),
      event_sections: JSON.stringify([]),
    },
    {
      document_id: freeTrialDocId, locale: "de", published_at: now, created_at: now, updated_at: now,
      title: "Online Infoveranstaltung", breadcrumb: "Online Infoveranstaltung",
      subtitle: "Interessierst Du Dich für Osteopathie und möchtest Du die IAO® kennenlernen? Unsere Online Infoveranstaltung bieten die ideale Gelegenheit dazu!",
      intros: JSON.stringify(["Unsere Online Infoveranstaltung sind kostenlose Online-Sessions, in denen wir uns als Schule vorstellen.", "Entdecke selbst, warum die IAO® für ihre hohe Qualität und ihren persönlichen Ansatz geschätzt wird"]),
      event_sections: JSON.stringify([{ heading: "Online Infoveranstaltung – 4-jähriger Masterstudiengang", events: [{ title: "Online Infoveranstaltung", date: "28 Apr.", time: "18:00 – 19:00", day: "Di. 28 Apr. 2026", register_link: "https://iao.promatis.be/de/inschrijvingopen.html", register_text: "Melde Dich an" }] }, { heading: "Online Infoveranstaltung – 2-jähriger Masterstudiengang (Quereinstieg)", events: [{ title: "Online Infoveranstaltung", date: "29 Juni", time: "20:00 – 21:00", day: "Mo. 29 Juni 2026", register_link: "https://iao.promatis.be/de/inschrijvingopenzij.html", register_text: "Melde Dich an" }] }]),
    },
  ],
});

// ── 8. Legal Notice Page ──────────────────────────────────────────────────────
const legalNoticeDocId = uid();
const legalItems = JSON.stringify([
  "België/Belgique – artikel 44, § 2, 4° van het Belgische BTW-Wetboek.",
  "Danmark – Momsloven, § 13, stk. 1, nr. 3",
  "Deutschland – Umsatzsteuergesetz, § 4 Abs. 1 Nr. 21",
  "Nederland – Wet op de omzetbelasting 1968, art. 11, lid 1, onderdeel O i.c.m. uitvoeringsbesluit omzetbelasting 1968 artikel 8, lid 1.",
  "Österreich – Umsatzsteuergesetz 1994, § 6 Abs. 1 Z 11",
  "Schweiz – Mehrwertsteuergesetz Art. 19 Abs; Mehrwertsteuerverordnung Art. 32",
]);
await seedSimplePage({
  tableName: "legal_notice_pages",
  documentId: legalNoticeDocId,
  rows: [
    { document_id: legalNoticeDocId, locale: "en", published_at: now, created_at: now, updated_at: now, title: "Legal Notice", intro: "The fee that students pay for their training at the IAO is exempt from VAT.\nThe corresponding legal article for each country is listed below.", items: legalItems },
    { document_id: legalNoticeDocId, locale: "nl", published_at: now, created_at: now, updated_at: now, title: "Wettelijke vermelding", intro: "De vergoeding die studenten betalen voor hun opleiding aan het IAO is vrijgesteld van BTW.\nHet overeenkomstige wetsartikel voor elk land wordt hieronder vermeld.", items: legalItems },
    { document_id: legalNoticeDocId, locale: "fr", published_at: now, created_at: now, updated_at: now, title: "Mentions légales", intro: "La redevance que les étudiants paient pour leur formation à l'IAO est exonérée de TVA.\nL'article juridique correspondant pour chaque pays est indiqué ci-dessous.", items: legalItems },
    { document_id: legalNoticeDocId, locale: "de", published_at: now, created_at: now, updated_at: now, title: "Rechtlicher Hinweis", intro: "Die Gebühr, die Studierende für ihre Ausbildung am IAO zahlen, ist von der Mehrwertsteuer befreit.\nDer entsprechende Rechtsartikel für jedes Land ist nachstehend aufgeführt.", items: legalItems },
  ],
});

// ── 9. Impressum Page (DE only) ───────────────────────────────────────────────
const impressumDocId = uid();
await seedSimplePage({
  tableName: "impressum_pages",
  documentId: impressumDocId,
  rows: [
    {
      document_id: impressumDocId, locale: "de", published_at: now, created_at: now, updated_at: now,
      title: "Impressum",
      sections: JSON.stringify([
        { heading: "Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)", body: "The International Academy of Osteopathy vzw\nOffizielle Bezeichnung: Vereinigung ohne Gewinnerzielungsabsicht (vzw)\nSitz der Gesellschaft:\nBollebergen 2B\n9052 Gent, Belgien\n\nTelefon: +32 (0)9 233 04 03\nE-Mail: info@osteopathy.eu\nWebseite: www.osteopathy.eu\n\nVertreten durch: Herrn Grégoire Lason, Direktor\n\nRegistereintrag: Eingetragen im belgischen Unternehmensregister (KBO)\nRegisternummer: 0459.285.397\n\nUmsatzsteuer-Identifikationsnummer: BE 0459.285.397" },
        { heading: "Inhaltlich Verantwortlicher gemäß § 18 Abs. 2 MStV", body: "Herr Grégoire Lason\nBollebergen 2B\n9052 Gent, Belgien" },
        { heading: "Haftungsausschluss – Inhalt der Website", body: "Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir jedoch keine Gewähr." },
        { heading: "Verweise und Links", body: "Diese Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben." },
        { heading: "Urheberrecht", body: "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem belgischen und europäischen Urheberrecht." },
        { heading: "Gerichtsstand und anwendbares Recht", body: "Es gilt ausschließlich belgisches Recht. Für alle Streitigkeiten sind ausschließlich die Gerichte in Gent, Belgien, zuständig." },
        { heading: "Alternative Streitbeilegung", body: "Wir sind nicht bereit oder verpflichtet, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen." },
        { heading: "Hinweis", body: "Dieses Impressum gilt für die deutsche Sprachversion der Website osteopathie.eu/de sowie für alle Social-Media-Profile der IAO®, soweit sie sich an den deutschen Markt richten." },
      ]),
    },
  ],
});

// ── 10. Newsletter Page ───────────────────────────────────────────────────────
const newsletterDocId = uid();
await seedSimplePage({
  tableName: "newsletter_pages",
  documentId: newsletterDocId,
  rows: [
    { document_id: newsletterDocId, locale: "en", published_at: now, created_at: now, updated_at: now, breadcrumb: "Newsletter", title: "Stay in touch", description: "Subscribe to our newsletter now and receive exclusive updates on new courses, research and techniques.", first_name: "First name", last_name: "Last name", email: "Email address", consent_before: "I agree to the ", consent_link_text: "Privacy Policy", consent_after: ".*", submit: "Subscribe", form_submitting: "Subscribing…", form_success: "Thank you! You are subscribed.", form_error: "Something went wrong. Please try again later or email info@osteopathy.eu.", form_validation: "Please complete all required fields and accept the privacy policy." },
    { document_id: newsletterDocId, locale: "nl", published_at: now, created_at: now, updated_at: now, breadcrumb: "Nieuwsbrief", title: "Blijf op de hoogte", description: "Schrijf je nu in voor onze nieuwsbrief en ontvang exclusieve updates over nieuwe cursussen, onderzoeken en technieken.", first_name: "Voornaam", last_name: "Naam", email: "E-mail", consent_before: "Ik ga akkoord met het ", consent_link_text: "Privacybeleid", consent_after: ".*", submit: "Inschrijven", form_submitting: "Bezig met inschrijven…", form_success: "Bedankt! Je bent ingeschreven.", form_error: "Er ging iets mis. Probeer later opnieuw of mail info@osteopathy.eu.", form_validation: "Vul alle verplichte velden in en ga akkoord met het privacybeleid." },
    { document_id: newsletterDocId, locale: "fr", published_at: now, created_at: now, updated_at: now, breadcrumb: "Newsletter", title: "Rester au courant", description: "Inscrivez-vous à notre newsletter et recevez des mises à jour exclusives sur nos nouveaux cours, recherches et techniques.", first_name: "Prénom", last_name: "Nom de famille", email: "Adresse mail", consent_before: "J'accepte la ", consent_link_text: "politique de confidentialité", consent_after: ".*", submit: "S'abonner", form_submitting: "Inscription en cours…", form_success: "Merci ! Vous êtes inscrit(e).", form_error: "Une erreur s'est produite. Réessayez plus tard ou écrivez à info@osteopathy.eu.", form_validation: "Veuillez remplir tous les champs obligatoires et accepter la politique de confidentialité." },
    { document_id: newsletterDocId, locale: "de", published_at: now, created_at: now, updated_at: now, breadcrumb: "Newsletter", title: "Bleiben Sie am Ball", description: "Melden Sie sich jetzt für unseren Newsletter an und erhalten Sie exklusive Informationen über neue Kurse, Forschungen und Techniken.", first_name: "Vorname", last_name: "Nachname", email: "E-Mail", consent_before: "Ich stimme der ", consent_link_text: "Datenschutzrichtlinie", consent_after: " zu.*", submit: "Abonnieren", form_submitting: "Wird abonniert…", form_success: "Vielen Dank! Sie sind angemeldet.", form_error: "Etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut oder schreiben Sie an info@osteopathy.eu.", form_validation: "Bitte füllen Sie alle Pflichtfelder aus und akzeptieren Sie die Datenschutzrichtlinie." },
  ],
});

// ── 11. Open Days Page ────────────────────────────────────────────────────────
const openDaysDocId = uid();
await seedSimplePage({
  tableName: "open_days_pages",
  documentId: openDaysDocId,
  rows: [
    {
      document_id: openDaysDocId, locale: "en", published_at: now, created_at: now, updated_at: now,
      title: "Open Days",
      subtitle: "Want to find out if the IAO® is the right fit for you? During our online open days, you will get to know our academy, explore our range of programs, and have the chance to ask all your questions directly to our lecturers!",
      event_sections: JSON.stringify([
        { key: "4year", title: "Online Open Days – 4 Year Master's Programme", events: [{ title: "Online Open Day", date: "20 Apr", time: "20:00 – 21:00", day: "Mon 20 Apr 2026", register_link: "https://iao.promatis.be/en/inschrijvingopen.html", register_text: "Register" }, { title: "Online Open Day", date: "15 Jun", time: "20:00 – 21:00", day: "Mon 15 Jun 2026", register_link: "https://iao.promatis.be/en/inschrijvingopen.html", register_text: "Register" }] },
        { key: "lateral", title: "Online Open Days – 2 Year Master's Programme (Lateral Entry)", events: [{ title: "Online Open Day", date: "29 Jun", time: "20:00 – 21:00", day: "Mon 29 Jun 2026", register_link: "https://iao.promatis.be/en/inschrijvingopenzij.html", register_text: "Register" }] },
      ]),
    },
    {
      document_id: openDaysDocId, locale: "nl", published_at: now, created_at: now, updated_at: now,
      title: "Opendeurdagen",
      subtitle: "Wil je ontdekken of de IAO® bij je past? Tijdens onze online opendeurdagen maak je kennis met onze academie, krijg je inzicht in ons opleidingsaanbod én kun je al je vragen rechtstreeks stellen aan onze docenten!",
      event_sections: JSON.stringify([
        { key: "4year", title: "Online opendeurdagen 4-jarige Masteropleiding", events: [{ title: "Online opendeurdag 4-jarige Masteropleiding", date: "15 jun", time: "19:00 – 20:00", day: "ma 15 jun 2026", register_link: "https://iao.promatis.be/nl/inschrijvingopen.html", register_text: "Inschrijven" }, { title: "Online opendeurdag 4-jarige Masteropleiding", date: "31 aug", time: "19:00 – 20:00", day: "ma 31 aug 2026", register_link: "https://iao.promatis.be/nl/inschrijvingopen.html", register_text: "Inschrijven" }] },
        { key: "lateral", title: "Online opendeurdagen 2-jarige Masteropleiding zij-instroom", events: [{ title: "Online opendeurdag zij-instroomprogramma", date: "29 jun", time: "19:00 – 20:00", day: "ma 29 jun 2026", register_link: "https://iao.promatis.be/nl/inschrijvingopenzij.html", register_text: "Inschrijven" }] },
      ]),
    },
    {
      document_id: openDaysDocId, locale: "fr", published_at: now, created_at: now, updated_at: now,
      title: "Portes ouvertes",
      subtitle: "Souhaitez-vous découvrir si l'IAO® vous correspond ? Lors de nos journées portes ouvertes, vous ferez connaissance avec notre académie, découvrirez notre offre de formations et pourrez poser directement toutes vos questions à nos enseignants !",
      event_sections: JSON.stringify([{ key: "4year", title: "", events: [{ title: "Journée portes ouvertes à Mont-Saint-Guibert", date: "28 Mai", time: "19:00 – 21:00", day: "jeu 28 Mai 2026", register_link: "https://iao.promatis.be/fr/inschrijvingopen.html", register_text: "S'inscrire" }] }]),
    },
    {
      document_id: openDaysDocId, locale: "de", published_at: now, created_at: now, updated_at: now,
      title: "Tage der offenen Tür",
      subtitle: "",
      event_sections: JSON.stringify([]),
    },
  ],
});

// ── 12. Privacy Page ──────────────────────────────────────────────────────────
const privacyDocId = uid();
await seedSimplePage({
  tableName: "privacy_pages",
  documentId: privacyDocId,
  rows: [
    { document_id: privacyDocId, locale: "en", published_at: now, created_at: now, updated_at: now, title: "Privacy Policy", last_updated: "Last updated: 07.05.25", intro: "The International Academy of Osteopathy vzw (hereinafter: \"IAO\") places great importance on your right to privacy and the protection of your personal data.", sections: JSON.stringify([{ title: "1. Who are we?", body: "IAO is a non-profit association under Belgian law, located at Bollebergen 2B Bus 15, 9052 Ghent, registered under number 0459.285.397." }, { title: "2. From whom do we collect personal data?", items: ["Students;", "Prospective students;", "Teachers, assistants, employees;", "Visitors to our website;"] }, { title: "3. What personal data do we process?", body: "We only process personal data that are relevant for our purposes.", subsections: [{ heading: "Identification and contact details", items: ["Name, address, phone/mobile number, email address."] }] }, { title: "4. Purposes and legal grounds", body: "We process your data for the following purposes:", items: ["Execution of a contract;", "Management of our website and services;", "Marketing purposes (newsletters, subject to consent);"] }, { title: "5. With whom do we share your data?", body: "Your data may be shared with:", items: ["IT, marketing, and accounting service providers;", "Professional advisors;"] }, { title: "6. Retention periods", body: "We do not retain your personal data longer than necessary.", items: ["Accounting records: 10 years;", "Education data: up to 10 years after the relationship ends;"] }, { title: "7. How do we protect your personal data?", body: "We take appropriate technical and organizational measures.", items: ["SSL encryption;", "Secure servers;", "Data processing agreements;"] }, { title: "8. Your rights", body: "Under the GDPR, you have the following rights:", items: ["Right of access;", "Right to rectification;", "Right to erasure;", "Right to data portability;"] }, { title: "9. Direct marketing", body: "You may subscribe to our newsletter. Each marketing email includes an opt-out link." }, { title: "10. Changes", body: "This policy may be updated. The most recent version is always available on our website." }]) },
    { document_id: privacyDocId, locale: "nl", published_at: now, created_at: now, updated_at: now, title: "Privacybeleid", last_updated: "Laatst bijgewerkt: 07.05.25", intro: "The International Academy of Osteopathy vzw (hierna: \"IAO\") hecht groot belang aan uw recht op privacy en de bescherming van uw persoonsgegevens.", sections: JSON.stringify([{ title: "1. Wie zijn wij?", body: "IAO is een vereniging zonder winstoogmerk naar Belgisch recht, gevestigd te Bollebergen 2B bus 15, 9052 Gent, ingeschreven onder het nummer 0459.285.397." }, { title: "2. Van wie verzamelen wij persoonsgegevens?", items: ["Studenten;", "Kandidaat-studenten;", "Docenten, assistenten, werknemers;", "Bezoekers van onze website;"] }, { title: "3. Welke persoonsgegevens verwerken wij?", body: "Wij verwerken uitsluitend persoonsgegevens die relevant zijn voor onze doeleinden.", subsections: [{ heading: "Identificatie- en contactgegevens", items: ["Naam, adres, telefoon-/gsm-nummer, e-mailadres."] }] }, { title: "4. Doeleinden en rechtsgronden voor verwerking", body: "Wij verwerken uw gegevens voor:", items: ["De uitvoering van een overeenkomst;", "Het beheer van onze website;", "Marketing (nieuwsbrief, mits toestemming);"] }, { title: "5. Met wie delen wij uw gegevens?", body: "Uw gegevens kunnen gedeeld worden met:", items: ["IT-, marketing- en boekhouddienstverleners;", "Professionele adviseurs;"] }, { title: "6. Bewaartermijnen", body: "Wij bewaren uw persoonsgegevens niet langer dan nodig.", items: ["Boekhoudkundige gegevens: 10 jaar;", "Opleidingsgegevens: tot 10 jaar na beëindiging;"] }, { title: "7. Hoe beschermen wij uw persoonsgegevens?", body: "Wij nemen passende technische en organisatorische maatregelen.", items: ["SSL-encryptie;", "Beveiligde servers;", "Verwerkingsovereenkomsten;"] }, { title: "8. Uw rechten", body: "U beschikt over de volgende rechten:", items: ["Recht op inzage;", "Recht op correctie;", "Recht op verwijdering;", "Recht op overdraagbaarheid;"] }, { title: "9. Direct marketing", body: "U kunt zich inschrijven op onze nieuwsbrief. Iedere marketingmail bevat een opt-outlink." }, { title: "10. Wijzigingen", body: "Deze verklaring kan worden aangepast. De meest recente versie is steeds beschikbaar op onze website." }]) },
    { document_id: privacyDocId, locale: "fr", published_at: now, created_at: now, updated_at: now, title: "Politique de confidentialité", last_updated: "Dernière mise à jour : 07.05.25", intro: "The International Academy of Osteopathy vzw (ci-après : « IAO ») attache une grande importance au respect de votre vie privée.", sections: JSON.stringify([{ title: "1. Qui sommes-nous ?", body: "L'IAO est une association sans but lucratif de droit belge, située à Bollebergen 2B bte 15, 9052 Gand, enregistrée sous le numéro 0459.285.397." }, { title: "2. De qui collectons-nous des données ?", items: ["Étudiants;", "Candidats-étudiants;", "Enseignants, assistants, employés;", "Visiteurs de notre site internet;"] }, { title: "3. Quelles données traitons-nous ?", body: "Nous ne traitons que les données pertinentes pour nos objectifs.", subsections: [{ heading: "Données d'identification et de contact", items: ["Nom, adresse, numéro de téléphone, adresse e-mail."] }] }, { title: "4. Finalités et bases légales", body: "Nous traitons vos données pour les raisons suivantes :", items: ["Exécution d'un contrat;", "Gestion de notre site web;", "Marketing (newsletters, avec consentement);"] }, { title: "5. Avec qui partageons-nous vos données ?", body: "Vos données peuvent être partagées avec :", items: ["Prestataires IT, marketing et comptables;", "Conseillers professionnels;"] }, { title: "6. Durée de conservation", body: "Nous ne conservons pas vos données plus longtemps que nécessaire.", items: ["Documents comptables : 10 ans;", "Données de formation : jusqu'à 10 ans;"] }, { title: "7. Protection des données", body: "Nous mettons en place des mesures techniques et organisationnelles adéquates.", items: ["Chiffrement SSL;", "Serveurs sécurisés;"] }, { title: "8. Vos droits", body: "Conformément au RGPD, vous disposez des droits suivants :", items: ["Droit d'accès;", "Droit de rectification;", "Droit à l'effacement;"] }, { title: "9. Marketing direct", body: "Vous pouvez vous inscrire à notre newsletter. Chaque e-mail contient un lien de désinscription." }, { title: "10. Modifications", body: "Cette politique peut être modifiée. La version la plus récente est toujours disponible sur notre site." }]) },
    { document_id: privacyDocId, locale: "de", published_at: now, created_at: now, updated_at: now, title: "Datenschutzbestimmungen", last_updated: "Letzte Aktualisierung: 07.05.25", intro: "Die International Academy of Osteopathy vzw (nachfolgend: „IAO\") misst dem Schutz Ihrer Privatsphäre und personenbezogenen Daten große Bedeutung bei.", sections: JSON.stringify([{ title: "1. Wer sind wir?", body: "IAO ist eine gemeinnützige Vereinigung nach belgischem Recht mit Sitz in Bollebergen 2B Bus 15, 9052 Gent, eingetragen unter der Nummer 0459.285.397." }, { title: "2. Von wem erheben wir personenbezogene Daten?", items: ["Studierenden;", "Studieninteressierten;", "DozentInnen, AssistentInnen, Mitarbeitenden;", "Besuchenden unserer Website;"] }, { title: "3. Welche personenbezogenen Daten verarbeiten wir?", body: "Wir verarbeiten nur personenbezogene Daten, die für unsere Zwecke relevant sind.", subsections: [{ heading: "Identifikations- und Kontaktdaten", items: ["Name, Adresse, Telefonnummer, E-Mail-Adresse;"] }] }, { title: "4. Zwecke und Rechtsgrundlagen", body: "Wir verarbeiten Ihre Daten zu folgenden Zwecken:", items: ["Erfüllung eines Vertrags;", "Verwaltung unserer Website;", "Marketing (Newsletter, nur mit Zustimmung);"] }, { title: "5. Mit wem teilen wir Ihre Daten?", body: "Ihre Daten können weitergegeben werden an:", items: ["IT-, Marketing- und Buchhaltungsdienstleister;", "Fachliche BeraterInnen;"] }, { title: "6. Speicherfristen", body: "Wir speichern Ihre Daten nicht länger als erforderlich.", items: ["Buchhaltungsunterlagen: 10 Jahre;", "Ausbildungsbezogene Daten: bis zu 10 Jahre;"] }, { title: "7. Schutz Ihrer Daten", body: "Wir ergreifen angemessene technische und organisatorische Maßnahmen.", items: ["SSL-Verschlüsselung;", "Gesicherte Server;"] }, { title: "8. Ihre Rechte", body: "Sie haben nach der DSGVO folgende Rechte:", items: ["Recht auf Auskunft;", "Recht auf Berichtigung;", "Recht auf Löschung;"] }, { title: "9. Direktmarketing", body: "Sie können sich für unseren Newsletter anmelden. Jede Marketing-E-Mail enthält eine Opt-out-Option." }, { title: "10. Änderungen", body: "Diese Richtlinie kann geändert werden. Die aktuellste Version ist stets auf unserer Website verfügbar." }]) },
  ],
});

// ── 13. Terms Page ────────────────────────────────────────────────────────────
const termsDocId = uid();
await seedSimplePage({
  tableName: "terms_pages",
  documentId: termsDocId,
  rows: [
    {
      document_id: termsDocId, locale: "en", published_at: now, created_at: now, updated_at: now,
      title: "Terms and Conditions",
      approval: "Approved by the Board of Directors of The International Academy of Osteopathy on 7 May 2025.",
      copyright_notice: "Copyright by IAO vzw © 2025. No part of this publication may be reproduced or made public in any form without prior written permission from the publisher.",
      contact_label: "Contact", contact_address: "IAO vzw, Bollebergen 2B bus 15, 9052 Ghent, Belgium.",
      contact_mail: "info@osteopathy.eu", contact_web: "https://www.osteopathy.eu", contact_tel: "+32 (0)9 233 04 03",
      articles: JSON.stringify([
        { title: "Article 1: Applicability", body: "These general terms and conditions of sale apply to all quotations, invoices, agreements, and services of The International Academy of Osteopathy (IAO)." },
        { title: "Article 2: Invoice Payment", body: "Invoices must be paid via the student portal (HUB) using one of the available payment methods." },
        { title: "Article 3: Late Payment Interest", body: "Late payments are automatically subject to annual interest of 10% from the due date, without prior notice." },
        { title: "Article 4: Compensation Fee", body: "If payment is overdue by more than 7 days, a flat-rate compensation of 10% of the outstanding amount will be charged, with a minimum of €65." },
        { title: "Article 5: Invoice Disputes", body: "In case of material errors, the customer must contact the IAO secretariat within 7 days via info@osteopathy.eu." },
        { title: "Article 6: Termination Due to Non-Payment", body: "In case of full or partial non-payment, IAO reserves the right to immediately suspend further services." },
        { title: "Article 7: Jurisdiction and Applicable Law", body: "Belgian law applies. Only the courts of the judicial district of East Flanders, Ghent division, have jurisdiction." },
      ]),
      copyright: "© 2025 The International Academy of Osteopathy",
    },
    {
      document_id: termsDocId, locale: "nl", published_at: now, created_at: now, updated_at: now,
      title: "Algemene Voorwaarden",
      approval: "Goedgekeurd door de Raad van Bestuur van De International Academy of Osteopathy op 7 mei 2025.",
      copyright_notice: "Copyright by IAO vzw © 2025. Geen enkel deel van deze publicatie mag worden gereproduceerd zonder voorafgaande schriftelijke toestemming van de uitgever.",
      contact_label: "Contact", contact_address: "IAO vzw, Bollebergen 2B bus 15, 9052 Gent, België.",
      contact_mail: "info@osteopathy.eu", contact_web: "https://www.osteopathy.eu", contact_tel: "+32 (0)9 233 04 03",
      articles: JSON.stringify([
        { title: "Artikel 1: Toepasselijkheid", body: "Deze algemene verkoopsvoorwaarden zijn van toepassing op alle offertes, facturen, overeenkomsten en prestaties van The International Academy of Osteopathy (IAO)." },
        { title: "Artikel 2: Betaling van facturen", body: "Facturen dienen betaald te worden via het studentenportaal (HUB) met één van de aangeboden betalingswijzen." },
        { title: "Artikel 3: Verwijlintresten", body: "Achterstallige betalingen worden van rechtswege belast met een jaarlijkse verwijlintrest van 10%, gerekend vanaf de vervaldatum." },
        { title: "Artikel 4: Schadevergoeding", body: "Bij een betalingsachterstand van meer dan 7 dagen wordt een forfaitaire schadevergoeding van 10% aangerekend, met een minimum van € 65." },
        { title: "Artikel 5: Factuurbetwisting", body: "Bij materiële vergissingen dient de klant binnen 7 dagen na ontvangst contact op te nemen via info@osteopathy.eu." },
        { title: "Artikel 6: Ontbinding bij wanbetaling", body: "Bij wanbetaling heeft IAO het recht om verdere prestaties onmiddellijk stop te zetten." },
        { title: "Artikel 7: Bevoegdheid en toepasselijk recht", body: "Op deze voorwaarden is het Belgisch recht van toepassing. Enkel de rechtbanken van het gerechtelijk arrondissement Oost-Vlaanderen, afdeling Gent, zijn bevoegd." },
      ]),
      copyright: "© 2025 The International Academy of Osteopathy",
    },
    {
      document_id: termsDocId, locale: "fr", published_at: now, created_at: now, updated_at: now,
      title: "Conditions Générales",
      approval: "Approuvé par le Conseil d'Administration de l'International Academy of Osteopathy le 7 mai 2025.",
      copyright_notice: "Copyright by IAO vzw © 2025. Aucune partie de cette publication ne peut être reproduite sans la permission écrite préalable de l'éditeur.",
      contact_label: "Contact", contact_address: "IAO vzw, Bollebergen 2B bus 15, 9052 Gand, Belgique.",
      contact_mail: "info@osteopathy.eu", contact_web: "https://www.osteopathy.eu", contact_tel: "+32 (0)9 233 04 03",
      articles: JSON.stringify([
        { title: "Article 1 : Champ d'application", body: "Les présentes conditions générales de vente s'appliquent à toutes les offres, factures, conventions et prestations de The International Academy of Osteopathy (IAO)." },
        { title: "Article 2 : Paiement des factures", body: "Les factures doivent être payées via le portail étudiant (HUB) en utilisant l'un des modes de paiement proposés." },
        { title: "Article 3 : Intérêts de retard", body: "Les paiements tardifs sont automatiquement soumis à un intérêt annuel de 10%, calculé à partir de la date d'échéance." },
        { title: "Article 4 : Indemnité forfaitaire", body: "En cas de retard supérieur à 7 jours, une indemnité forfaitaire de 10% du montant dû sera appliquée, avec un minimum de 65 €." },
        { title: "Article 5 : Contestation de facture", body: "En cas d'erreur, le client doit contacter le secrétariat dans les 7 jours suivant la réception de la facture, via info@osteopathy.eu." },
        { title: "Article 6 : Résiliation pour non-paiement", body: "En cas de non-paiement, l'IAO se réserve le droit de suspendre immédiatement ses prestations." },
        { title: "Article 7 : Juridiction compétente", body: "Le droit belge est d'application. En cas de litige, seuls les tribunaux de l'arrondissement judiciaire de Flandre-Orientale, division Gand, sont compétents." },
      ]),
      copyright: "© 2025 The International Academy of Osteopathy",
    },
    {
      document_id: termsDocId, locale: "de", published_at: now, created_at: now, updated_at: now,
      title: "Allgemeine Geschäftsbedingungen",
      approval: "Genehmigt vom Vorstand der International Academy of Osteopathy am 7. Mai 2025.",
      copyright_notice: "Copyright by IAO vzw © 2025. Kein Teil dieser Veröffentlichung darf ohne vorherige schriftliche Genehmigung reproduziert werden.",
      contact_label: "Kontakt", contact_address: "IAO vzw, Bollebergen 2B bus 15, 9052 Gent, Belgien.",
      contact_mail: "info@osteopathy.eu", contact_web: "https://www.osteopathy.eu", contact_tel: "+32 (0)9 233 04 03",
      articles: JSON.stringify([
        { title: "Artikel 1: Anwendbarkeit", body: "Diese Allgemeinen Geschäftsbedingungen gelten für alle Angebote, Rechnungen, Verträge und Leistungen der The International Academy of Osteopathy (IAO)." },
        { title: "Artikel 2: Rechnungszahlung", body: "Rechnungen sind über das Studierendenportal (HUB) mit einer der angebotenen Zahlungsmethoden zu begleichen." },
        { title: "Artikel 3: Verzugszinsen", body: "Für überfällige Zahlungen werden ab dem Fälligkeitsdatum von Gesetzes weg jährliche Verzugszinsen von 10 % berechnet." },
        { title: "Artikel 4: Pauschalentschädigung", body: "Bei einem Zahlungsverzug von mehr als 7 Tagen wird eine Pauschalentschädigung von 10% erhoben, mit einem Mindestbetrag von 65 €." },
        { title: "Artikel 5: Rechnungsstreitigkeiten", body: "Bei materiellen Fehlern muss sich der Kunde innerhalb von 7 Tagen nach Rechnungseingang über info@osteopathy.eu an das Sekretariat wenden." },
        { title: "Artikel 6: Kündigung bei Nichtzahlung", body: "Bei Nichtzahlung behält sich die IAO vor, weitere Leistungen unverzüglich einzustellen." },
        { title: "Artikel 7: Gerichtsstand und anwendbares Recht", body: "Es gilt belgisches Recht. Für Streitigkeiten sind ausschließlich die Gerichte des Gerichtsbezirks Ostflandern, Abteilung Gent, zuständig." },
      ]),
      copyright: "© 2025 The International Academy of Osteopathy",
    },
  ],
});

// ── 14. Cookies Page ──────────────────────────────────────────────────────────
// Cookies sections are complex JSON — use the full dictionary data
const cookiesDocId = uid();
const cookiesSectionsEN = [
  { title: "1. Purpose of this policy", body: "The International Academy of Osteopathy VZW (IAO) uses cookies on www.osteopathie.eu. This Cookie Policy explains how we use cookies and similar technologies.", items: ["which cookies we use,", "why we use them,", "how you can manage your preferences."], footer: "This policy must be read in conjunction with our Privacy Policy." },
  { title: "2. What are cookies?", body: "Cookies are small text files stored on your device when you visit a website.", subsections: [{ heading: "By duration:", items: ["Session cookies: deleted when you close your browser.", "Persistent cookies: stored for a set period of time."] }, { heading: "By origin:", items: ["First-party cookies: placed by us.", "Third-party cookies: placed by third parties, such as Google or Facebook."] }] },
  { title: "3. Social media plug-ins and pixels", subheadings: [{ title: "a. Social media plug-ins", body: "These plug-ins allow content sharing or identifying users through their social media profiles." }, { title: "b. Pixels (e.g., Facebook Pixel)", body: "A pixel is a code snippet that helps us analyze visitor behavior and optimize advertising campaigns." }] },
  { title: "4. What types of cookies do we use and why?", table_headers: ["Type", "Purpose", "Legal basis"], table_rows: [["Necessary cookies", "Essential for the Website's functioning.", "Legitimate interest"], ["Functional cookies", "Improve the user experience.", "Consent"], ["Analytical cookies", "Help us analyze Website usage.", "Consent"], ["Advertising/tracking cookies", "Used for personalized ads and remarketing.", "Consent"]] },
  { title: "5. Overview of the cookies we use", table_headers: ["Type", "Cookie", "Origin", "Retention period", "Purpose"], table_rows: [["Necessary", "JSESSIONID", "IAO", "Session", "Manages user session"], ["Analytical", "_ga, _ga_*", "Google", "14 months", "Analyzes website usage"], ["Advertising", "_fbp", "Meta/Facebook", "3 months", "Remarketing via Facebook"]] },
  { title: "6. How to manage or delete cookies?", body: "You can manage cookies through your browser settings.", items: ["delete cookies automatically or manually,", "block them by type,", "receive a notification when cookies are stored."] },
  { title: "7. Changes to this policy", body: "We may update this Cookie Policy when necessary." },
  { title: "8. Contact", body: "If you have any questions about this policy, please contact us: Bollebergen 2B/15 9052 Ghent, Belgium. +32 9 233 04 03 info@osteopathy.eu. Last update: 7 May 2025" },
];
await seedSimplePage({
  tableName: "cookies_pages",
  documentId: cookiesDocId,
  rows: [
    { document_id: cookiesDocId, locale: "en", published_at: now, created_at: now, updated_at: now, title: "Cookie Policy", sections: JSON.stringify(cookiesSectionsEN) },
    { document_id: cookiesDocId, locale: "nl", published_at: now, created_at: now, updated_at: now, title: "Cookiebeleid", sections: JSON.stringify([{ title: "1. Doel van dit beleid", body: "The International Academy of Osteopathy vzw gebruikt cookies op www.osteopathie.eu.", items: ["welke cookies we gebruiken,", "waarom we ze gebruiken,", "hoe u uw voorkeuren kunt beheren."] }, { title: "2. Wat zijn cookies?", body: "Cookies zijn kleine tekstbestanden die op uw toestel worden opgeslagen wanneer u een website bezoekt." }, { title: "6. Hoe cookies beheren of verwijderen?", body: "U kunt cookies beheren via uw browserinstellingen.", items: ["automatisch of handmatig verwijderen;", "blokkeren per type;"] }, { title: "7. Wijzigingen aan dit beleid", body: "Wij kunnen dit Cookiebeleid bijwerken, bijvoorbeeld bij wetswijzigingen." }, { title: "8. Contact", body: "Vragen of opmerkingen? Neem contact op: Bollebergen 2B/15 9052 Gent, België. +32 9 233 04 03 info@osteopathy.eu. Laatste update: 7 mei 2025" }]) },
    { document_id: cookiesDocId, locale: "fr", published_at: now, created_at: now, updated_at: now, title: "Politique des cookies", sections: JSON.stringify([{ title: "1. Objectif de cette politique", body: "L'IAO utilise des cookies sur www.osteopathie.eu.", items: ["des cookies que nous utilisons,", "des raisons pour lesquelles nous les utilisons,"] }, { title: "2. Que sont les cookies ?", body: "Les cookies sont de petits fichiers texte enregistrés sur votre appareil lorsque vous visitez un site web." }, { title: "6. Comment gérer ou supprimer les cookies ?", body: "Vous pouvez gérer les cookies via les paramètres de votre navigateur.", items: ["les supprimer automatiquement ou manuellement,", "les bloquer par type,"] }, { title: "7. Modifications", body: "Nous pouvons mettre à jour cette politique en matière de cookies si nécessaire." }, { title: "8. Contact", body: "Pour toute question, contactez-nous : Bollebergen 2B/15 9052 Gand, Belgique. +32 9 233 04 03 info@osteopathy.eu. Dernière mise à jour : 7 mai 2025" }]) },
    { document_id: cookiesDocId, locale: "de", published_at: now, created_at: now, updated_at: now, title: "Cookie-Richtlinie", sections: JSON.stringify([{ title: "1. Zweck dieser Richtlinie", body: "Die IAO verwendet Cookies auf www.osteopathie.eu.", items: ["welche Cookies wir verwenden,", "warum wir sie verwenden,"] }, { title: "2. Was sind Cookies?", body: "Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie eine Website besuchen." }, { title: "6. Wie können Sie Cookies verwalten oder löschen?", body: "Sie können Cookies über Ihre Browsereinstellungen verwalten.", items: ["Cookies automatisch oder manuell löschen,", "Cookies nach Typ blockieren,"] }, { title: "7. Änderungen an dieser Richtlinie", body: "Wir können diese Cookie-Richtlinie bei Bedarf aktualisieren." }, { title: "8. Kontakt", body: "Bei Fragen kontaktieren Sie uns bitte: Bollebergen 2B/15 9052 Gent, Belgien. +32 9 233 04 03 info@osteopathy.eu. Letztes Update: 7. Mai 2025" }]) },
  ],
});

await client.end();
console.log("\n🎉 All 14 pages seeded successfully!");
