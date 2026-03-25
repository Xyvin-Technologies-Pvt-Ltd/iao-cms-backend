import type { Schema, Struct } from '@strapi/strapi';

export interface AboutValueItem extends Struct.ComponentSchema {
  collectionName: 'components_about_value_items';
  info: {
    displayName: 'value-item';
  };
  attributes: {
    valueDescription: Schema.Attribute.Blocks;
    valueTitle: Schema.Attribute.String;
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
      'about.value-item': AboutValueItem;
      'faq.category': FaqCategory;
      'faq.faq-item': FaqFaqItem;
      'layout.footer-column': LayoutFooterColumn;
      'layout.link-item': LayoutLinkItem;
      'layout.nav-dropdown': LayoutNavDropdown;
      'layout.newsletter-strip': LayoutNewsletterStrip;
    }
  }
}
