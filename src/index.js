'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    const { patchFsExtraRemove } = require('./utils/safe-fs-remove');
    patchFsExtraRemove(strapi.log);
  },

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

    // Upload plugin reads sizeOptimization from DB (not config/plugins.js).
    // Defaults are true and cause sharp temp-file EBUSY errors on Windows.
    try {
      const uploadService = strapi.plugin('upload').service('upload');
      const current = (await uploadService.getSettings()) || {};
      await uploadService.setSettings({
        ...current,
        sizeOptimization: false,
        responsiveDimensions: false,
        autoOrientation: false,
      });
    } catch (err) {
      strapi.log.warn(`[bootstrap] upload settings skipped: ${err.message}`);
    }
  },
};
