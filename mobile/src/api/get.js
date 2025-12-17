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
        master { documentId }
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

// Все мастера (с краткой информацией и списком их продуктов для подсчёта)
export const GET_MASTERS = gql`
  query Masters($pagination: PaginationArg, $locale: I18NLocaleCode) {
    masters(pagination: $pagination, locale: $locale) {
      documentId
      name
      email
      whatsapp
      otherContact
      messenger
      description
      photo { url documentId }
      products(filters: { state: { in: ["inStock", "booked"] } }, pagination: { limit: 250 }) {
        documentId
      }
    }
  }
`;

// Один мастер (для страницы мастера) + его продукты (кроме sold/notValid)
export const GET_MASTER = gql`
  query Master($documentId: ID!, $locale: I18NLocaleCode) {
    master(documentId: $documentId, locale: $locale) {
      documentId
      name
      email
      whatsapp
      otherContact
      messenger
      description
      photo { url documentId }
      products(
        filters: { state: { in: ["inStock", "booked"] } }
        pagination: { limit: 250 }
      ) {
        documentId
        title
        description
        price
        donationPercent
        state
        image { url documentId }
        master { documentId name photo { url documentId } }
      }
    }
  }
`;

// Продукты (общий список для Goods, с фильтрами)
export const GET_PRODUCTS = gql`
  query Products($filters: ProductFiltersInput, $pagination: PaginationArg, $locale: I18NLocaleCode) {
    products(filters: $filters, pagination: $pagination, locale: $locale) {
      documentId
      title
      description
      price
      donationPercent
      state
      image { documentId url }
      master {
        documentId
        name
        email
        whatsapp
        photo { url documentId }
      }
    }
  }
`;

export const GET_ABOUT = gql`
  query About($locale: I18NLocaleCode) {
    about(locale: $locale) {
      documentId
      text
    }
  }
`;

export const GET_PARTNERS = gql`
  query Partners($pagination: PaginationArg, $locale: I18NLocaleCode) {
    partners(pagination: $pagination, locale: $locale) {
      data
      description
      documentId
      link
      logo {
        url
        documentId
      }
      title
    }
  }
`;