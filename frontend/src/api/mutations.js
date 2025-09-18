// import { gql } from "@apollo/client";

// // Логин (для демо/разработки, если нужно)
// export const LOGIN = gql`
//   mutation Login($identifier: String!, $password: String!) {
//     login(input: { identifier: $identifier, password: $password }) {
//       jwt
//       user { id email username }
//     }
//   }
// `;

// // Обновление языка в отдельной сущности UserInfo
// export const UPDATE_USER_INFO = gql`
//   mutation UpdateUserInfo($documentId: ID!, $data: UserInfoInput!) {
//     updateUserInfo(documentId: $documentId, data: $data) {
//       documentId
//     }
//   }
// `;



import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
      user { id email username }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(input: { username: $username, email: $email, password: $password }) {
      jwt
      user { id email username }
    }
  }
`;

// язык и будущие поля — через эту же сущность
export const UPDATE_USER_INFO = gql`
  mutation UpdateUserInfo($documentId: ID!, $data: UserInfoInput!) {
    updateUserInfo(documentId: $documentId, data: $data) {
      documentId
    }
  }
`;

// создаём UserInfo после регистрации
export const CREATE_USER_INFO = gql`
  mutation CreateUserInfo($data: UserInfoInput!) {
    createUserInfo(data: $data) {
      documentId
    }
  }
`;


// ✅ Устанавливаем ВЕСЬ массив связей (без connect)
export const SET_USERINFO_NOTIFICATIONS = gql`
  mutation SetUserInfoNotifications($userInfoId: ID!, $notifications: [ID]!) {
    updateUserInfo(
      documentId: $userInfoId
      data: { notifications: $notifications }
    ) {
      documentId
    }
  }
`;
