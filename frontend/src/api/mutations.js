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

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($documentId: ID!, $data: ProductInput!) {
    updateProduct(documentId: $documentId, data: $data) {
      documentId
      state
    }
  }
`;

// обновление полей users-permissions пользователя (email/username)
export const UPDATE_USERS_PERMISSIONS_USER = gql`
  mutation UpdateUsersPermissionsUser($id: ID!, $data: UsersPermissionsUserInput!) {
    updateUsersPermissionsUser(id: $id, data: $data) {
      __typename
    }
  }
`;

// смена пароля (без писем)
export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $password: String!, $passwordConfirmation: String!) {
    changePassword(
      currentPassword: $currentPassword
      password: $password
      passwordConfirmation: $passwordConfirmation
    ) {
      jwt
    }
  }
`;