import { gql } from "@apollo/client";

// Логин (оставляем для демо/разработки)
export const LOGIN = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
      user { id email username }
    }
  }
`;

// Обновление настроек пользователя в отдельной сущности UserInfo
// (язык и любые будущие поля)
export const UPDATE_USER_INFO = gql`
  mutation UpdateUserInfo($documentId: ID!, $data: UserInfoInput!) {
    updateUserInfo(documentId: $documentId, data: $data) {
      documentId
    }
  }
`;
