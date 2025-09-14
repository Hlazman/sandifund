import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.EXPO_PUBLIC_GRAPHQL_URL || "https://YOUR-STRAPI-DOMAIN/graphql",
  }),
  cache: new InMemoryCache(),
});

export default client;
