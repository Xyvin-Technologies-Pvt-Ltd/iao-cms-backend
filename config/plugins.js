module.exports = () => ({
  upload: {
    config: {
      // Disable all image processing to avoid Windows EBUSY temp-file issue.
      sizeOptimization: false,
      responsiveDimensions: false,
      autoOrientation: false,
    },
  },
  i18n: {
    enabled: true,
  },
});
