'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    const { ensureAllPublicContentPermissions } = require('./utils/public-content-permissions');
    try {
      await ensureAllPublicContentPermissions(strapi);
    } catch (err) {
      strapi.log.warn(`[bootstrap] public content permissions skipped: ${err.message}`);
    }
  },
};
