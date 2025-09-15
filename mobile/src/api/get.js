import { gql } from "@apollo/client";

export const GET_TRANSLATIONS = gql`
  query Translation {
    translation {
      data
    }
  }
`;

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

export const GET_STICKERS = gql`
  query Stickers($locale: I18NLocaleCode) {
    stickers(locale: $locale) {
      title
      description
    }
  }
`;
