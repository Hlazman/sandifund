import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
// Важно: как и оговаривали в проекте — берем ApolloProvider из субпакета react
import { ApolloProvider } from "@apollo/client/react";
import client from "./api/apolloClient";

import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";

import App from "./App";
import "./index.css";

const root = createRoot(document.getElementById("root"));

root.render(
  <ApolloProvider client={client}>
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  </ApolloProvider>
);
