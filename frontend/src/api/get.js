import { gql } from "@apollo/client";

export const GET_TRANSLATIONS = gql`
  query Translation {
    translation {
      data
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
      role {
        name
        type
      }
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
        products { documentId }
        master { documentId }
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

// === Funds (с локалью) ===
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

// === Reports (топ-уровень, фильтр по fund.documentId) ===
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

// === Stickers (c локалью, с zip) ===
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

// === FAQ (с локалью и answerFofmated) ===
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

export const GET_MASTERS = gql`
  query Masters($pagination: PaginationArg, $productsPagination2: PaginationArg) {
    masters(pagination: $pagination) {
      description
      documentId
      email
      locale
      name
      photo { documentId url }
      products(pagination: $productsPagination2) { documentId title state }
      whatsapp
    }
  }
`;

export const GET_PRODUCTS = gql`
  query Products($pagination: PaginationArg) {
    products(pagination: $pagination) {
      documentId
      description
      donationPercent
      image { documentId url }
      locale
      master {
        documentId
        name
        email
        whatsapp
      }
      price
      sold
      state
      title
      user_info { documentId }
    }
  }
`;

export const GET_PRODUCTS_BY_MASTER = gql`
  query ProductsByMaster($pagination: PaginationArg, $masterId: ID!) {
    products(
      pagination: $pagination
      filters: { master: { documentId: { eq: $masterId } } }
    ) {
      documentId
      description
      donationPercent
      image { documentId url }
      locale
      master {
        documentId
        name
        email
        whatsapp
      }
      price
      sold
      state
      title
      user_info { documentId }
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