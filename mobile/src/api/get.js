import { gql } from "@apollo/client";

// Переводы (single-type Translation)
export const GET_TRANSLATIONS = gql`
  query Translation {
    translation {
      data
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

export const GET_FUNDS = gql`
  query Funds($pagination: PaginationArg, $locale: I18NLocaleCode) {
    funds(pagination: $pagination, locale: $locale) {
      address
      description
      documentId
      email
      locale
      logo { documentId url }
      phone1
      phone2
      title
      totalDonations
      website
      whatsapp
      Facebook
      Instagram
      TikTok
      YouTube
      Twitter
    }
  }
`;

export const GET_REPORTS = gql`
  query Reports($filters: ReportFiltersInput, $pagination: PaginationArg, $locale: I18NLocaleCode) {
    reports(filters: $filters, pagination: $pagination, locale: $locale) {
      documentId
      pdf { url documentId }
      sum
      title
      locale
    }
  }
`;

// Stickers (с локалью, картинкой и zip)
export const GET_STICKERS = gql`
  query Stickers($locale: I18NLocaleCode) {
    stickers(locale: $locale) {
      documentId
      title
      description
      locale
      image { documentId url }
      zipFile { documentId url }
      zipFileUrl
    }
  }
`;

// FAQ
export const GET_FAQS = gql`
  query Faqs($pagination: PaginationArg, $locale: I18NLocaleCode) {
    faqs(pagination: $pagination, locale: $locale) {
      documentId
      locale
      question
      answerFofmated
    }
  }
`;