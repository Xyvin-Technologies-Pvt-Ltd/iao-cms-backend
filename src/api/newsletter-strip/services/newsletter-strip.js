'use strict';

/**
 * newsletter-strip service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::newsletter-strip.newsletter-strip');
