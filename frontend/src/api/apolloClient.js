// import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

// const client = new ApolloClient({
//   link: new HttpLink({
//     uri: process.env.REACT_APP_GRAPHQL_URL,
//   }),
//   cache: new InMemoryCache(),
// });

// export default client;


// import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";

// const httpLink = new HttpLink({
//   uri: process.env.REACT_APP_GRAPHQL_URL,
// });

// const authLink = new ApolloLink((operation, forward) => {
//   const token = localStorage.getItem("sf_jwt");
//   operation.setContext(({ headers = {} }) => ({
//     headers: {
//       ...headers,
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//     },
//   }));
//   return forward(operation);
// });

// const link = ApolloLink.from([authLink, httpLink]);

// const client = new ApolloClient({
//   link,
//   cache: new InMemoryCache(),
// });

// export default client;


import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URL,
});

// Берём JWT либо из sessionStorage, либо из localStorage (под «Запомнить меня»)
const authLink = new SetContextLink((prevContext, operation) => {
  const token = sessionStorage.getItem("sf_jwt") || localStorage.getItem("sf_jwt");
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const link = ApolloLink.from([authLink, httpLink]);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

export default client;
