'use strict';

/**
 * news-page service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::news-page.news-page');
