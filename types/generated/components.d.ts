import type { Schema, Struct } from '@strapi/strapi';

export interface AboutHero extends Struct.ComponentSchema {
  collectionName: 'components_about_heroes';
  info: {
    displayName: 'Hero';
  };
  attributes: {
    intro: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
    videoThumbnail: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    videoUrl: Schema.Attribute.String;
  };
}

export interface AboutMission extends Struct.ComponentSchema {
  collectionName: 'components_about_missions';
  info: {
    displayName: 'Mission';
  };
  attributes: {
    closing: Schema.Attribute.String;
    intro: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
    valuesLine: Schema.Attribute.Blocks;
  };
}

export interface AboutValueItem extends Struct.ComponentSchema {
  collectionName: 'components_about_value_items';
  info: {
    displayName: 'Value Item';
  };
  attributes: {
    description: Schema.Attribute.Blocks;
    title: Schema.Attribute.String;
  };
}

export interface ContactForm extends Struct.ComponentSchema {
  collectionName: 'components_contact_forms';
  info: {
    displayName: 'Form';
  };
  attributes: {
    consent: Schema.Attribute.Blocks;
    emailLabel: Schema.Attribute.String;
    errorMessage: Schema.Attribute.Text;
    firstNameLabel: Schema.Attribute.String;
    lastNameLabel: Schema.Attribute.String;
    messageLabel: Schema.Attribute.String;
    submitLabel: Schema.Attribute.String;
    submittingLabel: Schema.Attribute.String;
    validationMessage: Schema.Attribute.Text;
  };
}

export interface CsrCsrSection extends Struct.ComponentSchema {
  collectionName: 'components_csr_csr_sections';
  info: {
    description: 'A titled CSR pillar with a list of bullet points';
    displayName: 'CSR Section';
  };
  attributes: {
    items: Schema.Attribute.Component<'shared.list-item', true>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface EventsEventItem extends Struct.ComponentSchema {
  collectionName: 'components_events_event_items';
  info: {
    description: 'A single scheduled event with date, time, and registration link';
    displayName: 'Event Item';
  };
  attributes: {
    date_short: Schema.Attribute.String;
    day_label: Schema.Attribute.String;
    register_label: Schema.Attribute.String & Schema.Attribute.Required;
    register_url: Schema.Attribute.String & Schema.Attribute.Required;
    time: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface EventsEventSection extends Struct.ComponentSchema {
  collectionName: 'components_events_event_sections';
  info: {
    description: "A titled group of events (e.g. '4-Year Programme Open Days')";
    displayName: 'Event Section';
  };
  attributes: {
    events: Schema.Attribute.Component<'events.event-item', true>;
    heading: Schema.Attribute.String;
  };
}

export interface FaqCategory extends Struct.ComponentSchema {
  collectionName: 'components_faq_categories';
  info: {
    displayName: 'category';
  };
  attributes: {
    items: Schema.Attribute.Component<'faq.faq-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface FaqFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_faq_faq_item_s';
  info: {
    displayName: 'faqItem ';
  };
  attributes: {
    answer: Schema.Attribute.Blocks;
    question: Schema.Attribute.String;
  };
}

export interface HomeAboutTeaser extends Struct.ComponentSchema {
  collectionName: 'components_home_about_teasers';
  info: {
    description: 'Two-column about block for en/fr/de home; not used on nl (nl uses nl_programmes instead)';
    displayName: 'About Teaser';
  };
  attributes: {
    button_label: Schema.Attribute.String & Schema.Attribute.Required;
    text_1: Schema.Attribute.Blocks & Schema.Attribute.Required;
    text_2: Schema.Attribute.Blocks & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeFaqHomeItem extends Struct.ComponentSchema {
  collectionName: 'components_home_faq_home_items';
  info: {
    description: 'One FAQ accordion item on the home page; answer supports **bold**, [label](url), bullet lists';
    displayName: 'FAQ Home Item';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeHero extends Struct.ComponentSchema {
  collectionName: 'components_home_heroes';
  info: {
    displayName: 'Home Hero';
  };
  attributes: {
    cta_label: Schema.Attribute.String & Schema.Attribute.Required;
    lead: Schema.Attribute.Blocks & Schema.Attribute.Required;
    lead_secondary: Schema.Attribute.Blocks;
    nl_about: Schema.Attribute.Component<'home.hero-nl-about', false>;
    rating: Schema.Attribute.String & Schema.Attribute.Required;
    subtitle: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface HomeHeroNlAbout extends Struct.ComponentSchema {
  collectionName: 'components_home_hero_nl_abouts';
  info: {
    description: 'Extra about block below hero \u2014 only used on nl locale (about_title / about_text1 / about_text2)';
    displayName: 'Hero NL About';
  };
  attributes: {
    body_1: Schema.Attribute.Blocks & Schema.Attribute.Required;
    body_2: Schema.Attribute.Blocks & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeNlBulletLine extends Struct.ComponentSchema {
  collectionName: 'components_home_nl_bullet_lines';
  info: {
    description: 'Single bullet item; may contain inline HTML (bold tags, anchor tags)';
    displayName: 'NL Bullet Line';
  };
  attributes: {
    content: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface HomeNlEbookBlock extends Struct.ComponentSchema {
  collectionName: 'components_home_nl_ebook_blocks';
  info: {
    description: "E-book CTA teaser on nl home; CTA href is prefixedHref(locale, 'e-book'), not stored here";
    displayName: 'NL E-book Block';
  };
  attributes: {
    bullets: Schema.Attribute.Component<'home.nl-bullet-line', true> &
      Schema.Attribute.Required;
    button_label: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'>;
    image_alt: Schema.Attribute.String & Schema.Attribute.Required;
    paragraph_1: Schema.Attribute.Blocks & Schema.Attribute.Required;
    paragraph_2: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeNlEnatomBlock extends Struct.ComponentSchema {
  collectionName: 'components_home_nl_enatom_blocks';
  info: {
    displayName: 'NL Enatom Block';
  };
  attributes: {
    bullets: Schema.Attribute.Component<'home.nl-bullet-line', true> &
      Schema.Attribute.Required;
    button_label: Schema.Attribute.String & Schema.Attribute.Required;
    external_url: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'>;
    image_alt: Schema.Attribute.String & Schema.Attribute.Required;
    intro_before_bullets: Schema.Attribute.String & Schema.Attribute.Required;
    paragraph_1: Schema.Attribute.Blocks & Schema.Attribute.Required;
    paragraph_3: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeNlProgrammeRow extends Struct.ComponentSchema {
  collectionName: 'components_home_nl_programme_rows';
  info: {
    description: 'One programme entry in NetherlandAboutSection; link is app-relative, resolved per locale by resolveProgrammeHref';
    displayName: 'NL Programme Row';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    link: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HomeNlProgrammesSection extends Struct.ComponentSchema {
  collectionName: 'components_home_nl_programmes_sections';
  info: {
    description: 'Full NetherlandAboutSection: programmes list + Enatom block + e-book block. Only filled for nl locale.';
    displayName: 'NL Programmes Section';
  };
  attributes: {
    button_label: Schema.Attribute.String & Schema.Attribute.Required;
    ebook: Schema.Attribute.Component<'home.nl-ebook-block', false> &
      Schema.Attribute.Required;
    enatom: Schema.Attribute.Component<'home.nl-enatom-block', false> &
      Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'>;
    image_alt: Schema.Attribute.String & Schema.Attribute.Required;
    intro: Schema.Attribute.Text & Schema.Attribute.Required;
    programme_rows: Schema.Attribute.Component<'home.nl-programme-row', true> &
      Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LayoutFooterProgrammeLink extends Struct.ComponentSchema {
  collectionName: 'components_layout_footer_programme_links';
  info: {
    description: 'One row in the footer Academy column; nav_key drives the href via localePaths';
    displayName: 'Footer Programme Link';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    nav_key: Schema.Attribute.Enumeration<
      ['master', 'lateral', 'postacademic', 'manueleTherapie']
    > &
      Schema.Attribute.Required;
  };
}

export interface LayoutNavStrings extends Struct.ComponentSchema {
  collectionName: 'components_layout_nav_strings';
  info: {
    description: 'Primary nav labels \u2014 matches getDictionary(locale).nav';
    displayName: 'Nav Strings';
  };
  attributes: {
    about: Schema.Attribute.String & Schema.Attribute.Required;
    contact: Schema.Attribute.String & Schema.Attribute.Required;
    faq: Schema.Attribute.String & Schema.Attribute.Required;
    free_trial: Schema.Attribute.String & Schema.Attribute.Required;
    hub: Schema.Attribute.String & Schema.Attribute.Required;
    lectures: Schema.Attribute.String & Schema.Attribute.Required;
    news: Schema.Attribute.String & Schema.Attribute.Required;
    open_days: Schema.Attribute.String & Schema.Attribute.Required;
    programmes: Schema.Attribute.String & Schema.Attribute.Required;
    search: Schema.Attribute.String & Schema.Attribute.Required;
    search_placeholder: Schema.Attribute.String & Schema.Attribute.Required;
    shop: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LayoutProgrammesDropdown extends Struct.ComponentSchema {
  collectionName: 'components_layout_programmes_dropdowns';
  info: {
    description: 'Labels for the Programmes dropdown; omt_egypt only for en, manual_therapy only for nl';
    displayName: 'Programmes Dropdown';
  };
  attributes: {
    all: Schema.Attribute.String & Schema.Attribute.Required;
    lateral: Schema.Attribute.String & Schema.Attribute.Required;
    manual_therapy: Schema.Attribute.String;
    master: Schema.Attribute.String & Schema.Attribute.Required;
    omt_egypt: Schema.Attribute.String;
    postacademic: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface LecturerCard extends Struct.ComponentSchema {
  collectionName: 'components_lecturer_cards';
  info: {
    description: 'Lecturer profile card';
    displayName: 'Card';
  };
  attributes: {
    description: Schema.Attribute.RichText;
    image: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String;
    professional_title: Schema.Attribute.String;
    role: Schema.Attribute.String;
  };
}

export interface LegalArticleSection extends Struct.ComponentSchema {
  collectionName: 'components_legal_article_sections';
  info: {
    description: 'A numbered article/clause for Terms & Conditions';
    displayName: 'Article Section';
  };
  attributes: {
    body: Schema.Attribute.Blocks;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ModuleItem extends Struct.ComponentSchema {
  collectionName: 'components_module_items';
  info: {
    displayName: 'item';
  };
  attributes: {
    text: Schema.Attribute.String;
  };
}

export interface ModuleSection extends Struct.ComponentSchema {
  collectionName: 'components_module_sections';
  info: {
    displayName: 'section';
  };
  attributes: {
    content: Schema.Attribute.RichText;
    title: Schema.Attribute.String;
  };
}

export interface PracticalRow extends Struct.ComponentSchema {
  collectionName: 'components_practical_rows';
  info: {
    description: 'A practical information row';
    displayName: 'Row';
  };
  attributes: {
    badges: Schema.Attribute.Component<'shared.badge-item', true>;
    label: Schema.Attribute.String;
    note: Schema.Attribute.Text;
    value: Schema.Attribute.Text;
  };
}

export interface ScheduleDay extends Struct.ComponentSchema {
  collectionName: 'components_schedule_days';
  info: {
    description: 'A day section with schedule items';
    displayName: 'Day';
  };
  attributes: {
    day_title: Schema.Attribute.String;
    items: Schema.Attribute.Component<'schedule.item', true>;
  };
}

export interface ScheduleItem extends Struct.ComponentSchema {
  collectionName: 'components_schedule_items';
  info: {
    description: 'A single schedule activity row';
    displayName: 'Item';
  };
  attributes: {
    activity: Schema.Attribute.Text;
    time: Schema.Attribute.String;
  };
}

export interface SharedBadgeItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_badge_items';
  info: {
    description: 'Single badge label';
    displayName: 'Badge Item';
  };
  attributes: {
    label: Schema.Attribute.String;
    variant: Schema.Attribute.Enumeration<['success', 'warning']>;
  };
}

export interface SharedClinicFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_clinic_faq_items';
  info: {
    description: 'A question + rich text answer for the Associated Clinics FAQ accordion';
    displayName: 'Clinic FAQ Item';
  };
  attributes: {
    answer: Schema.Attribute.Blocks;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedListItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_list_items';
  info: {
    description: 'A single text bullet point';
    displayName: 'List Item';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedLocation extends Struct.ComponentSchema {
  collectionName: 'components_shared_locations';
  info: {
    description: 'Shared location information block';
    displayName: 'Location';
  };
  attributes: {
    address: Schema.Attribute.Text;
    campus: Schema.Attribute.String;
    label: Schema.Attribute.String;
    map_embed: Schema.Attribute.Text;
    search_link: Schema.Attribute.Text;
  };
}

export interface SharedPageSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_page_sections';
  info: {
    description: 'A titled section with rich text body \u2014 used in legal/policy pages';
    displayName: 'Page Section';
  };
  attributes: {
    body: Schema.Attribute.Blocks;
    section_title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'about.hero': AboutHero;
      'about.mission': AboutMission;
      'about.value-item': AboutValueItem;
      'contact.form': ContactForm;
      'csr.csr-section': CsrCsrSection;
      'events.event-item': EventsEventItem;
      'events.event-section': EventsEventSection;
      'faq.category': FaqCategory;
      'faq.faq-item': FaqFaqItem;
      'home.about-teaser': HomeAboutTeaser;
      'home.faq-home-item': HomeFaqHomeItem;
      'home.hero': HomeHero;
      'home.hero-nl-about': HomeHeroNlAbout;
      'home.nl-bullet-line': HomeNlBulletLine;
      'home.nl-ebook-block': HomeNlEbookBlock;
      'home.nl-enatom-block': HomeNlEnatomBlock;
      'home.nl-programme-row': HomeNlProgrammeRow;
      'home.nl-programmes-section': HomeNlProgrammesSection;
      'layout.footer-programme-link': LayoutFooterProgrammeLink;
      'layout.nav-strings': LayoutNavStrings;
      'layout.programmes-dropdown': LayoutProgrammesDropdown;
      'lecturer.card': LecturerCard;
      'legal.article-section': LegalArticleSection;
      'module.item': ModuleItem;
      'module.section': ModuleSection;
      'practical.row': PracticalRow;
      'schedule.day': ScheduleDay;
      'schedule.item': ScheduleItem;
      'shared.badge-item': SharedBadgeItem;
      'shared.clinic-faq-item': SharedClinicFaqItem;
      'shared.list-item': SharedListItem;
      'shared.location': SharedLocation;
      'shared.page-section': SharedPageSection;
    }
  }
}
