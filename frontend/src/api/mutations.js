import { gql } from "@apollo/client";

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(data: $input) { id status }
  }
`;

// ✅ Логин (JWT + user)
export const LOGIN = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
      user { id email username }
    }
  }
`;

// ✅ Обновление языка пользователя (без data/attributes-обёрток)
export const UPDATE_USER_LANGUAGE = gql`
  mutation UpdateUserLanguage($id: ID!, $language: String!) {
    updateUsersPermissionsUser(id: $id, data: { language: $language }) {
      id
      email
      language
    }
  }
`;


