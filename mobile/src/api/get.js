import { gql } from "@apollo/client";

// Переводы (single-type Translation)
export const GET_TRANSLATIONS = gql`
  query Translation {
    translation {
      data
    }
  }
`;

// Локализованный контент (пример: stickers)
export const GET_STICKERS = gql`
  query Stickers($locale: I18NLocaleCode) {
    stickers(locale: $locale) {
      title
      description
    }
  }
`;

// Полные данные текущего пользователя с привязкой к UserInfo (meFull → user_info)
export const GET_MY_USER_INFO = gql`
  query MyUserInfo {
    meFull {
      user_info {
        documentId
        language
      }
    }
  }
`;

// Нужен documentId пользователя (для createUserInfo после регистрации)
export const GET_ME = gql`
  query Me {
    me {
      id
      documentId
      email
      username
      role {
        name
        type
      }
    }
  }
`;

// (пригодится позже для чтения любых полей UserInfo)
export const GET_USER_INFO = gql`
  query UserInfo($documentId: ID!) {
    userInfo(documentId: $documentId) {
      documentId
      language
    }
  }
`;

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