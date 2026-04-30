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
    consentAfter: Schema.Attribute.String;
    consentBefore: Schema.Attribute.String;
    consentLinkText: Schema.Attribute.String;
    emailLabel: Schema.Attribute.String;
    firstNameLabel: Schema.Attribute.String;
    lastNameLabel: Schema.Attribute.String;
    messageLabel: Schema.Attribute.String;
    submitLabel: Schema.Attribute.String;
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

export interface LayoutFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_layout_footer_columns';
  info: {
    displayName: 'Footer Column';
  };
  attributes: {
    items: Schema.Attribute.Component<'layout.link-item', true>;
    title: Schema.Attribute.String;
  };
}

export interface LayoutLinkItem extends Struct.ComponentSchema {
  collectionName: 'components_layout_link_items';
  info: {
    displayName: 'Link Item';
  };
  attributes: {
    href: Schema.Attribute.String & Schema.Attribute.Required;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    openInNewTab: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface LayoutNavDropdown extends Struct.ComponentSchema {
  collectionName: 'components_layout_nav_dropdowns';
  info: {
    displayName: 'Nav Dropdown';
  };
  attributes: {
    items: Schema.Attribute.Component<'layout.link-item', true>;
    label: Schema.Attribute.String;
  };
}

export interface LayoutNewsletterStrip extends Struct.ComponentSchema {
  collectionName: 'components_layout_newsletter_strips';
  info: {
    displayName: 'Newsletter Strip';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String;
    description: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'about.hero': AboutHero;
      'about.mission': AboutMission;
      'about.value-item': AboutValueItem;
      'contact.form': ContactForm;
      'faq.category': FaqCategory;
      'faq.faq-item': FaqFaqItem;
      'layout.footer-column': LayoutFooterColumn;
      'layout.link-item': LayoutLinkItem;
      'layout.nav-dropdown': LayoutNavDropdown;
      'layout.newsletter-strip': LayoutNewsletterStrip;
    }
  }
}
