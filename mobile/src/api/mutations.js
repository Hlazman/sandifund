import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
      user { id email username }
    }
  }
`;

export const UPDATE_USER_LANGUAGE = gql`
  mutation UpdateUserLanguage($id: ID!, $language: String!) {
    updateUsersPermissionsUser(id: $id, data: { language: $language }) {
      id
      email
      language
    }
  }
`;
