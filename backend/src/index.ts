// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    const extensionService = strapi.plugin('graphql').service('extension');

    extensionService.use(() => ({
      typeDefs: /* GraphQL */ `
        extend type Query {
          meFull: UsersPermissionsUser
        }
      `,
      resolvers: {
        Query: {
          meFull: {
            resolve: async (parent, args, ctx) => {
              if (!ctx.state.user) return null;
              // Populate all relations and fields
              const user = await strapi.entityService.findOne(
                'plugin::users-permissions.user',
                ctx.state.user.id,
                { populate: '*' }
              );
              return user;
            },
          },
        },
      },
      resolversConfig: {
        'Query.meFull': { auth: true },
      },
    }));
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (clientId && clientSecret) {
      const providersRegistry = strapi.plugin('users-permissions').service('providers-registry');
      const defaultGoogle = providersRegistry?.get('google');

      if (defaultGoogle) {
        const providersService = strapi.plugin('users-permissions').service('providers');
        const defaultCallback = providersService?.buildRedirectUri('google');

        providersRegistry.add('google', {
          ...defaultGoogle,
          enabled: true,
          grantConfig: {
            ...defaultGoogle.grantConfig,
            key: clientId,
            secret: clientSecret,
            callbackUrl:
              process.env.GOOGLE_CALLBACK_URL || defaultCallback ||
              'http://localhost:1338/api/connect/google/callback',
            scope: ['email', 'profile'],
          },
        });
      } else {
        strapi.log.warn('Google auth provider definition is missing. Skipped automatic setup.');
      }
    } else {
      strapi.log.warn(
        'Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables. Google auth not configured.'
      );
    }
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};
