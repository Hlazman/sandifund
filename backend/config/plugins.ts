export default () => ({
    graphql: {
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      landingPage: true,
      depthLimit: 10,
      amountLimit: 100,
      apolloServer: {
        tracing: false,
      },
    },
  },
});
