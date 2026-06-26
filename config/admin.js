const { getPreviewPathname } = require('./previewPathnames');

module.exports = ({ env }) => {
  const clientUrl = env('CLIENT_URL', 'http://localhost:3000');
  const previewSecret = env('PREVIEW_SECRET');

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    preview: {
      enabled: true,
      config: {
        allowedOrigins: [
          clientUrl,
          env('STRAPI_ADMIN_URL', 'http://localhost:1337'),
        ],
        async handler(uid, { documentId, locale, status }) {
          const loc = locale ?? 'nl';
          let document = null;

          try {
            const query = { locale: loc };
            if (documentId) query.documentId = documentId;
            if (status) query.status = status;
            document = await strapi.documents(uid).findOne(query);
          } catch {
            // Pathname mapping for single types does not require document fields.
          }

          const pathname = getPreviewPathname(uid, { locale: loc, document: document ?? {} });

          if (!pathname) {
            return null;
          }

          const urlSearchParams = new URLSearchParams({
            url: pathname,
            secret: previewSecret,
            status,
            uid,
            locale: locale ?? 'nl',
            documentId,
          });

          return `${clientUrl}/api/preview?${urlSearchParams}`;
        },
      },
    },
  };
};
