// import { gql } from "@apollo/client";

// // 1) Переводы (single-type Translation)
// export const GET_TRANSLATIONS = gql`
//   query Translation {
//     translation {
//       data
//     }
//   }
// `;

// // 2) Локализованный контент (пример: stickers)
// export const GET_STICKERS = gql`
//   query Stickers($locale: I18NLocaleCode) {
//     stickers(locale: $locale) {
//       title
//       description
//     }
//   }
// `;

// // 3) Полные данные текущего пользователя с привязкой к UserInfo.
// //    Важно: поле называется именно meFull, а связь — user_info (snake_case), как ты указал.
// export const GET_MY_USER_INFO = gql`
//   query MyUserInfo {
//     meFull {
//       user_info {
//         documentId
//         language
//       }
//     }
//   }
// `;


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
      }
    }
  }
`;
