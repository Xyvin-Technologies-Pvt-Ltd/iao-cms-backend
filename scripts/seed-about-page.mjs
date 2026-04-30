/**
 * seed-about-page.mjs
 *
 * Directly inserts About Page content (all 4 locales) into PostgreSQL.
 * Run from project root:
 *   node scripts/seed-about-page.mjs
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

const textBlock = (text) => [
  { type: "paragraph", children: [{ type: "text", text }] },
];

const uid = () => crypto.randomBytes(16).toString("hex").slice(0, 20);

// ─── Seed data ───────────────────────────────────────────────────────────────

const localeData = {
  en: {
    hero: {
      title: "About Us",
      intro: [
        { type: "paragraph", children: [{ type: "text", text: "We are a leading educational institution offering high quality training in the field of osteopathy." }] },
        { type: "paragraph", children: [{ type: "text", text: "The academy has a team of highly qualified and experienced teachers who are committed to providing students with a comprehensive understanding of osteopathy, its principles and techniques." }] },
      ],
      videoUrl: "",
    },
    mission: {
      title: "Our mission and vision",
      intro: textBlock("We want to train our students to be safe, competent and independent osteopaths. That is why we offer modern courses that meet the highest possible academic standards. We attach great importance to good scientific evidence (Evidence Based Practice). Our students are expected to always act from a broad scientific knowledge."),
      valuesLine: textBlock("Quality, Innovation, Appreciation and Respect are our values."),
      closing: "That is what we at the IAO\u00ae stand for.",
    },
    values: [
      { title: "Quality", description: textBlock("We are constantly looking for ways to make our training even better. Current students play an important role in this, including through their feedback we can improve the quality of our services.") },
      { title: "Innovation", description: textBlock("The IAO\u00ae follows the most recent evolutions closely (Evidence Based Practice). We implemented \u201cBlended Learning\u201d in our curriculum years ago. This means that our teaching method consists of a combination of classroom teaching with e-learning. In addition, we continue to look for ways to make the Evidence Based Practice model even more visible in our training courses.") },
      { title: "Appreciation", description: textBlock("A lot of appreciation for osteopathy, but also for the efforts of our employees, teachers and students.") },
      { title: "Respect", description: textBlock("Not only respect for our students, our teachers, our assistants and staff, but also for patients. The relationship between the osteopath and his patient is based on mutual respect.") },
    ],
  },

  nl: {
    hero: {
      title: "Over ons",
      intro: [
        { type: "paragraph", children: [{ type: "text", text: "De International Academy of Osteopathy (IAO\u00ae) werd in 1987 opgericht door Gr\u00e9goire Lason, met een duidelijke missie: de academisering van het osteopathisch beroep. Al meer dan 35 jaar bouwen we aan kwalitatief en wetenschappelijk onderbouwd osteopathisch onderwijs." }] },
        { type: "paragraph", children: [{ type: "text", text: "Vandaag is de IAO\u00ae d\u00e9 toonaangevende osteopathieschool in Vlaanderen en Nederland. Studenten kunnen exclusief bij ons de erkende Master of Science in Osteopathy (MSc.Ost.) behalen \u2013 een unieke academische graad in Vlaanderen en Nederland." }] },
        { type: "paragraph", children: [{ type: "text", text: "Ons docententeam bestaat uit ervaren osteopaten, onderzoekers en academici die praktijkexpertise combineren met een sterke wetenschappelijke basis. Zo garanderen we toekomstgerichte, evidence-based opleidingen van internationaal niveau." }] },
        { type: "paragraph", children: [{ type: "text", text: "De IAO\u00ae wordt geleid door Joint-Principals Gr\u00e9goire Lason, MSc.Ost., DO en Yourik van Overloop MD, MSc.Ost., DO. Samen zetten zij zich dagelijks in voor de verdere academische en wetenschappelijke ontwikkeling van de osteopathie, in samenwerking met nationale en internationale onderwijs- en onderzoekspartners." }] },
      ],
      videoUrl: "",
    },
    mission: {
      title: "Onze missie en visie",
      intro: [
        { type: "paragraph", children: [{ type: "text", text: "Bij de IAO\u00ae leiden we studenten op tot veilige, competente en onafhankelijke osteopaten. We kiezen bewust voor opleidingen die voldoen aan de hoogste academische en kwaliteitsstandaarden. Wetenschappelijke onderbouwing vormt hierbij het fundament: al onze programma\u2019s zijn gebouwd op Evidence Based Practice (EBP) en een brede medische en biofysische kennisbasis." }] },
        { type: "paragraph", children: [{ type: "text", text: "Onze kernwaarden \u2013 Kwaliteit, Innovatie, Appreciatie en Respect \u2013 bepalen wie we zijn en hoe we werken." }] },
      ],
      valuesLine: textBlock("Kwaliteit, Innovatie, Appreciatie en Respect zijn onze waarden."),
      closing: "Dat is waar de IAO\u00ae voor staat:",
    },
    values: [
      { title: "Kwaliteit", description: textBlock("Wij streven elke dag naar onderwijs van het hoogste niveau. Door voortdurend te evalueren en te luisteren naar studenten en docenten, verbeteren we continu onze programma\u2019s. Kwaliteit is geen doel, maar een proces.") },
      {
        title: "Innovatie",
        description: [
          { type: "paragraph", children: [{ type: "text", text: "De IAO\u00ae volgt de nieuwste wetenschappelijke en onderwijskundige evoluties op de voet. Als pionier implementeerden we jaren geleden Blended Learning, waarbij klassikale lessen worden gecombineerd met hoogwaardige e-learningmodules." }] },
          { type: "paragraph", children: [{ type: "text", text: "Daarnaast zijn we de enige osteopathieschool in Europa waar studenten gratis toegang hebben tot het innovatieve 3D-anatomieplatform ENATOM. Dit geavanceerde leerplatform biedt onze studenten onge\u00ebvenaarde mogelijkheden om de menselijke anatomie in detail te bestuderen \u2014 interactief, visueel en volledig wetenschappelijk onderbouwd." }] },
          { type: "paragraph", children: [{ type: "text", text: "We blijven voortdurend zoeken naar manieren om het Evidence Based Practice-model nog sterker zichtbaar en toepasbaar te maken in al onze opleidingen." }] },
        ],
      },
      { title: "Appreciatie", description: textBlock("Wij waarderen de inzet en het enthousiasme van iedereen binnen onze academie: studenten, docenten, assistenten en medewerkers. Hun betrokkenheid maakt ons instituut sterker.") },
      { title: "Respect", description: textBlock("Respect vormt de basis van alle relaties binnen de IAO\u00ae. Het gaat om respect voor elkaar \u00e9n respect voor de pati\u00ebnten waarmee onze afgestudeerde osteopaten later werken. Een osteopathische behandeling is altijd gebaseerd op vertrouwen en wederzijds respect.") },
    ],
  },

  fr: {
    hero: {
      title: "\u00c0 propos de nous",
      intro: [
        { type: "paragraph", children: [{ type: "text", text: "Nous sommes un \u00e9tablissement d\u2019enseignement de premier plan qui offre une formation de haute qualit\u00e9 dans le domaine de l\u2019ost\u00e9opathie." }] },
        { type: "paragraph", children: [{ type: "text", text: "L\u2019acad\u00e9mie dispose d\u2019une \u00e9quipe d\u2019enseignants hautement qualifi\u00e9s et exp\u00e9riment\u00e9s qui s\u2019engagent \u00e0 fournir aux \u00e9tudiants une compr\u00e9hension compl\u00e8te de l\u2019ost\u00e9opathie, de ses principes et de ses techniques." }] },
      ],
      videoUrl: "",
    },
    mission: {
      title: "Mission et vision",
      intro: textBlock("Nous voulons former nos \u00e9tudiants \u00e0 devenir des ost\u00e9opathes s\u00fbrs, comp\u00e9tents et ind\u00e9pendants. C\u2019est pourquoi nous proposons des cours modernes qui r\u00e9pondent aux normes acad\u00e9miques les plus \u00e9lev\u00e9es possibles. Nous attachons une grande importance \u00e0 de bonnes preuves scientifiques (Evidence Based Practice). On attend de nos \u00e9tudiants qu\u2019ils agissent toujours \u00e0 partir d\u2019une large connaissance scientifique."),
      valuesLine: textBlock("Qualit\u00e9, innovation, appr\u00e9ciation et respect sont nos valeurs."),
      closing: "C\u2019est ce que nous d\u00e9fendons \u00e0 l\u2019IAO\u00ae.",
    },
    values: [
      { title: "Qualit\u00e9", description: textBlock("Nous recherchons constamment des moyens d\u2019am\u00e9liorer notre formation. Les \u00e9tudiants actuels jouent un r\u00f4le important \u00e0 cet \u00e9gard, notamment gr\u00e2ce \u00e0 leurs commentaires, nous pouvons am\u00e9liorer la qualit\u00e9 de nos services.") },
      { title: "Innovation", description: textBlock("L\u2019IAO\u00ae suit de pr\u00e8s les \u00e9volutions les plus r\u00e9centes (Evidence Based Practice). Nous avons impl\u00e9ment\u00e9 \u00abBlended Learning\u00bb dans notre programme il y a des ann\u00e9es. Cela signifie que notre m\u00e9thode d\u2019enseignement consiste en une combinaison d\u2019enseignement en classe et d\u2019apprentissage en ligne. De plus, nous continuons \u00e0 chercher des moyens de rendre le mod\u00e8le de pratique bas\u00e9e sur les preuves encore plus visible dans nos cours de formation.") },
      { title: "Appr\u00e9ciation", description: textBlock("Beaucoup d\u2019appr\u00e9ciation pour l\u2019ost\u00e9opathie, mais aussi pour les efforts de nos employ\u00e9s, enseignants et \u00e9tudiants.") },
      { title: "Respect", description: textBlock("Non seulement le respect de nos \u00e9l\u00e8ves, de nos professeurs, de nos assistants et de notre personnel, mais aussi des patients. La relation entre l\u2019ost\u00e9opathe et son patient est bas\u00e9e sur le respect mutuel.") },
    ],
  },

  de: {
    hero: {
      title: "\u00dcber uns",
      intro: [
        { type: "paragraph", children: [{ type: "text", text: "Wir sind eine f\u00fchrende Bildungseinrichtung, die eine hochwertige Ausbildung auf dem Gebiet der Osteopathie anbietet." }] },
        { type: "paragraph", children: [{ type: "text", text: "Die Akademie verf\u00fcgt \u00fcber ein Team hochqualifizierter und erfahrener Dozenten, die sich daf\u00fcr einsetzen, den Studierenden ein umfassendes Verst\u00e4ndnis der Osteopathie, ihrer Prinzipien und Techniken zu vermitteln." }] },
      ],
      videoUrl: "",
    },
    mission: {
      title: "Unsere Mission und Vision",
      intro: textBlock("Wir wollen unsere Studenten zu sicheren, kompetenten und unabh\u00e4ngigen Osteopathen ausbilden. Aus diesem Grund bieten wir moderne Kurse an, die den h\u00f6chstm\u00f6glichen akademischen Standards entsprechen. Wir legen gro\u00dfen Wert auf eine gute wissenschaftliche Basis (Evidence Based Practice). Von unseren Studierenden wird erwartet, dass sie stets auf der Grundlage umfassender wissenschaftlicher Kenntnisse handeln."),
      valuesLine: textBlock("Qualit\u00e4t, Innovation, Wertsch\u00e4tzung und Respekt sind unsere Werte."),
      closing: "Das ist es, wof\u00fcr wir bei der IAO\u00ae stehen.",
    },
    values: [
      { title: "Qualit\u00e4t", description: textBlock("Wir sind st\u00e4ndig auf der Suche nach M\u00f6glichkeiten, unsere Ausbildungen weiter zu verbessern. Die derzeitigen Studierenden spielen dabei eine wichtige Rolle; u.a. durch ihr Feedback k\u00f6nnen wir die Qualit\u00e4t unserer Angebote verbessern.") },
      { title: "Innovation", description: textBlock("Die IAO\u00ae verfolgt aufmerksam alle aktuellen Entwicklungen (Evidence Based Practice). Wir haben \u201eBlended Learning\u201c bereits vor Jahren in unseren Lehrplan aufgenommen. Das bedeutet, dass unsere Lehrmethode aus einer Kombination von klassischem Unterricht und E-Learning besteht. Dar\u00fcber hinaus suchen wir st\u00e4ndig nach M\u00f6glichkeiten, das Modell der evidenzbasierten Praxis in unseren Kursen noch st\u00e4rker sichtbar zu machen.") },
      { title: "Wertsch\u00e4tzung", description: textBlock("Eine gro\u00dfe Anerkennung f\u00fcr die Osteopathie, aber auch f\u00fcr das Engagement unserer Mitarbeiter, Dozenten und Studierenden.") },
      { title: "Respekt", description: textBlock("Nicht nur Respekt f\u00fcr unsere Studierenden, unsere Dozenten, unsere Assistenten und Mitarbeiter, sondern auch f\u00fcr die Patienten. Die Beziehung zwischen dem Osteopathen und seinem Patienten baut auf gegenseitigem Respekt auf.") },
    ],
  },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

await client.connect();
console.log("✓ Connected to PostgreSQL\n");

const now = new Date();

// ── Wipe all existing about page data ───────────────────────────────────────
console.log("🗑  Clearing existing data...");
await client.query("DELETE FROM about_pages_cmps");
await client.query("DELETE FROM components_about_heroes");
await client.query("DELETE FROM components_about_missions");
await client.query("DELETE FROM components_about_value_items");
await client.query("DELETE FROM about_pages");
console.log("   Done.\n");

// All locales share one document_id (Strapi 5 i18n)
const documentId = uid();
console.log(`📄 document_id: ${documentId}\n`);

for (const [locale, data] of Object.entries(localeData)) {
  console.log(`🌍 Seeding [${locale}]...`);

  // ── 1. Insert about_pages row FIRST so we have the entity id ────────────
  const pageRes = await client.query(
    `INSERT INTO about_pages (document_id, locale, published_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [documentId, locale, now, now, now]
  );
  const pageId = pageRes.rows[0].id;

  // ── 2. Insert hero component ─────────────────────────────────────────────
  const heroRes = await client.query(
    `INSERT INTO components_about_heroes (title, intro, video_url)
     VALUES ($1, $2, $3) RETURNING id`,
    [data.hero.title, JSON.stringify(data.hero.intro), data.hero.videoUrl]
  );
  const heroId = heroRes.rows[0].id;

  // ── 3. Link hero to page ─────────────────────────────────────────────────
  await client.query(
    `INSERT INTO about_pages_cmps (entity_id, cmp_id, component_type, field, "order")
     VALUES ($1, $2, $3, $4, $5)`,
    [pageId, heroId, "about.hero", "hero", 1]
  );

  // ── 4. Insert mission component ──────────────────────────────────────────
  const missionRes = await client.query(
    `INSERT INTO components_about_missions (title, intro, values_line, closing)
     VALUES ($1, $2, $3, $4) RETURNING id`,
    [
      data.mission.title,
      JSON.stringify(data.mission.intro),
      JSON.stringify(data.mission.valuesLine),
      data.mission.closing,
    ]
  );
  const missionId = missionRes.rows[0].id;

  // ── 5. Link mission to page ──────────────────────────────────────────────
  await client.query(
    `INSERT INTO about_pages_cmps (entity_id, cmp_id, component_type, field, "order")
     VALUES ($1, $2, $3, $4, $5)`,
    [pageId, missionId, "about.mission", "mission", 1]
  );

  // ── 6. Insert value-item components and link them ───────────────────────
  for (let i = 0; i < data.values.length; i++) {
    const v = data.values[i];
    const vRes = await client.query(
      `INSERT INTO components_about_value_items (title, description)
       VALUES ($1, $2) RETURNING id`,
      [v.title, JSON.stringify(v.description)]
    );
    const vId = vRes.rows[0].id;
    await client.query(
      `INSERT INTO about_pages_cmps (entity_id, cmp_id, component_type, field, "order")
       VALUES ($1, $2, $3, $4, $5)`,
      [pageId, vId, "about.value-item", "values", i + 1]
    );
  }

  console.log(`  ✅ [${locale}] page_id=${pageId}, hero_id=${heroId}, mission_id=${missionId}`);
}

await client.end();
console.log("\n🎉 Done! Refresh Strapi admin to see the data.");
