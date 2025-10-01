import { gql } from "@apollo/client";

export const GET_TRANSLATIONS = gql`
  query Translation {
    translation {
      data
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

// нужен для получения documentId пользователя после регистрации
export const GET_ME = gql`
  query Me {
    me {
      id
      documentId
      email
      username
      confirmed
    }
  }
`;

// если нужно тянуть язык (и documentId user_info) при старте
export const GET_MY_USER_INFO = gql`
  query MyUserInfo {
    meFull {
      user_info {
        documentId
        language
        createdAt
      }
    }
  }
`;


// === получить все уведомления (до 250 штук) ===
export const GET_NOTIFICATIONS = gql`
  query Notifications($pagination: PaginationArg, $locale: I18NLocaleCode) {
    notifications(pagination: $pagination, locale: $locale) {
      isRead
      isMass
      documentId
      title
      text
      locale
      link
      publishedAt
    }
  }
`;

// === получить список ПРОЧИТАННЫХ пользователем (по user_info) ===
export const GET_MY_READ_NOTIFICATIONS = gql`
  query MyReadNotifs($pagination: PaginationArg) {
    meFull {
      user_info {
        documentId
        language
        createdAt
        notifications(pagination: $pagination) {
          documentId
        }
      }
    }
  }
`;