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
