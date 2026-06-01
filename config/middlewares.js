module.exports = ({ env }) => {
  const s3MediaHosts = ['market-assets.strapi.io'];

  const bucket = env('AWS_BUCKET');
  const region = env('AWS_REGION');
  if (bucket && region) {
    s3MediaHosts.push(`${bucket}.s3.${region}.amazonaws.com`);
    s3MediaHosts.push(`s3.${region}.amazonaws.com`);
  }

  const baseUrl = env('AWS_BASE_URL');
  if (baseUrl) {
    try {
      s3MediaHosts.push(new URL(baseUrl).hostname);
    } catch {
      // ignore invalid AWS_BASE_URL
    }
  }

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', ...s3MediaHosts],
            'media-src': ["'self'", 'data:', 'blob:', ...s3MediaHosts],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};
