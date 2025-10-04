import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { onError } from "@apollo/client/link/error";

const httpLink = new HttpLink({
  uri: process.env.EXPO_PUBLIC_GRAPHQL_URL || "https://api.sandifund.com/graphql",
});

// логируем любые ошибки — в DEV это must-have
const errorLink = onError(({ graphQLErrors, networkError, operation, response }) => {
  if (graphQLErrors?.length) {
    console.warn(
      "[GraphQL error]",
      operation.operationName,
      graphQLErrors.map(e => e.message).join(" | ")
    );
  }
  if (networkError) {
    console.warn("[Network error]", operation.operationName, networkError);
  }
  // полезно увидеть «сырое» тело, если приходит null/empty
  if (response && response.errors) {
    console.warn("[Response.errors]", response.errors);
  }
});

const authLink = new ApolloLink((operation, forward) => {
  const token = globalThis.sf_jwt || null;
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }));
  return forward(operation);
});

const link = ApolloLink.from([errorLink, authLink, httpLink]);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default client;
