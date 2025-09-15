import { gql } from "@apollo/client";

// уже был
export const GET_STICERS = gql`query Sticers { sticers { id name } }`;

// ✅ для Translation
export const GET_TRANSLATIONS = gql`
  query Translation {
    translation {
      data
    }
  }
`;

// ✅ текущий пользователь
export const GET_ME = gql`
  query Me {
    me {
      id
      email
      username
      language
    }
  }
`;

// ✅ локализованные стикеры
export const GET_STICKERS = gql`
  query Stickers($locale: I18NLocaleCode) {
    stickers(locale: $locale) {
      title
      description
    }
  }
`;
