import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client/react"; // ← ВАЖНО: из субпакета react
import { LanguageProvider } from "./context/LanguageContext";
import client from "./api/apolloClient";
import App from "./App";
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(
  <ApolloProvider client={client}>
    <BrowserRouter>
      {/* <App /> */}
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </BrowserRouter>
  </ApolloProvider>
);
