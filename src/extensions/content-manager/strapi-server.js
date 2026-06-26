'use strict';

const yup = require('yup');
const { pick } = require('lodash/fp');
const { validateYupSchema, errors } = require('@strapi/utils');

const getPreviewUrlSchema = yup
  .object()
  .shape({
    documentId: yup.string(),
    locale: yup.string().nullable(),
    status: yup.string(),
  })
  .required();

/**
 * Strapi's built-in preview validation calls findFirst() without locale, so single
 * types that only exist in a non-default locale return 404 ("Set up preview").
 * @see https://github.com/strapi/strapi/issues/23450
 */
async function validatePreviewUrl(strapi, uid, params) {
  await validateYupSchema(getPreviewUrlSchema)(params);

  const newParams = pick(['documentId', 'locale', 'status'], params);
  const model = strapi.getModel(uid);

  if (!model || model.modelType !== 'contentType') {
    throw new errors.ValidationError('Invalid content type');
  }

  const isSingleType = model?.kind === 'singleType';
  if (!isSingleType && !params.documentId) {
    throw new errors.ValidationError('documentId is required for Collection Types');
  }

  if (isSingleType) {
    const findParams = newParams.locale ? { locale: newParams.locale } : {};
    const doc = await strapi.documents(uid).findFirst(findParams);

    if (!doc) {
      throw new errors.NotFoundError('Document not found');
    }

    newParams.documentId = doc.documentId;
  }

  if (!newParams.status) {
    const isDPEnabled = model?.options?.draftAndPublish;
    newParams.status = isDPEnabled ? 'draft' : 'published';
  }

  return newParams;
}

module.exports = (plugin) => {
  const originalPreviewFactory = plugin.controllers.preview;

  plugin.controllers.preview = () => {
    const originalPreview = originalPreviewFactory();

    originalPreview.getPreviewUrl = async (ctx) => {
      const uid = ctx.params.contentType;
      const query = ctx.request.query;
      const params = await validatePreviewUrl(strapi, uid, query);
      const url = await strapi.plugin('content-manager').service('preview').getPreviewUrl(uid, params);

      if (!url) {
        ctx.status = 204;
      }

      return {
        data: { url: url || undefined },
      };
    };

    return originalPreview;
  };

  return plugin;
};
