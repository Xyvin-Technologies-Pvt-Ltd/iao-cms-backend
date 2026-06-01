module.exports = ({ env }) => {
  const uploadConfig = {
    // Disable all image processing to avoid Windows EBUSY temp-file issue.
    sizeOptimization: false,
    responsiveDimensions: false,
    autoOrientation: false,
  };

  if (env('AWS_BUCKET')) {
    const params = {
      Bucket: env('AWS_BUCKET'),
    };

    const acl = env('AWS_ACL');
    if (acl) {
      params.ACL = acl;
    }

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
