module.exports = ({ env }) => {
  const uploadConfig = {
    // Image processing flags here are documentation only; runtime settings live in
    // the upload plugin store and are forced off in src/index.js bootstrap (Windows EBUSY).
    sizeOptimization: false,
    responsiveDimensions: false,
    autoOrientation: false,
  };

  if (env('AWS_BUCKET')) {
    const params = {
      Bucket: env('AWS_BUCKET'),
      // Explicit null: provider defaults to public-read when ACL is omitted, which
      // fails on buckets with "Bucket owner enforced" (ACLs disabled).
      ACL: env('AWS_ACL') || null,
    };

    uploadConfig.provider = 'aws-s3';
    uploadConfig.providerOptions = {
      ...(env('AWS_BASE_URL') ? { baseUrl: env('AWS_BASE_URL') } : {}),
      ...(env('AWS_PREFIX') ? { rootPath: env('AWS_PREFIX') } : {}),
      s3Options: {
        credentials: {
          accessKeyId: env('AWS_ACCESS_KEY_ID'),
          secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
        },
        region: env('AWS_REGION'),
        params,
      },
    };
    uploadConfig.actionOptions = {
      upload: {},
      uploadStream: {},
      delete: {},
    };
  }

  return {
    upload: {
      config: uploadConfig,
    },
    i18n: {
      enabled: true,
    },
  };
};
