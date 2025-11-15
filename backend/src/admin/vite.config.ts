import { mergeConfig, type UserConfig } from 'vite';

export default (config: UserConfig) => {
  return mergeConfig(config, {
    server: {
      allowedHosts: ['api.sandifund.com', 'localhost:1339'],
      // або allowedHosts: true для дозволу всіх хостів
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  });
};
