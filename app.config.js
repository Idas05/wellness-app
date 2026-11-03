// Adds settings on top of app.json that only apply when publishing online.
module.exports = ({ config }) => {
  const projectId = config.extra?.eas?.projectId;
  return {
    ...config,
    experiments: {
      ...config.experiments,
      // The website lives at idas05.github.io/wellness-app, so it needs this prefix there.
      baseUrl: process.env.EXPO_BASE_URL || undefined,
    },
    // Lets Expo Go open the published app without your Mac running.
    runtimeVersion: { policy: 'sdkVersion' },
    ...(projectId ? { updates: { url: `https://u.expo.dev/${projectId}` } } : {}),
  };
};
