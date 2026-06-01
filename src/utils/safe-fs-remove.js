'use strict';

/**
 * Patches fs-extra remove() to retry on Windows EBUSY/EPERM when Strapi cleans up
 * multipart temp files (@strapi/core body middleware) or upload temp dirs.
 */
function patchFsExtraRemove(logger) {
  const fse = require('fs-extra');

  if (fse.remove.__iaoSafeRemovePatched) {
    return;
  }

  const originalRemove = fse.remove.bind(fse);
  const maxAttempts = 10;

  async function removeWithRetry(target, attempt = 0) {
    try {
      return await originalRemove(target);
    } catch (err) {
      const retryable = err && (err.code === 'EBUSY' || err.code === 'EPERM');
      if (retryable && attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
        return removeWithRetry(target, attempt + 1);
      }
      if (retryable) {
        logger?.warn?.(`[safe-fs-remove] skipped temp cleanup (${err.code}): ${target}`);
        return;
      }
      throw err;
    }
  }

  removeWithRetry.__iaoSafeRemovePatched = true;
  fse.remove = removeWithRetry;
}

module.exports = { patchFsExtraRemove };
