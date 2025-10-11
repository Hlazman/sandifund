import { gql } from "@apollo/client";

// Вход
export const LOGIN = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
      user { id email username }
    }
  }
`;

// Регистрация
export const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(input: { username: $username, email: $email, password: $password }) {
      jwt
      user { id email username }
    }
  }
`;

// Обновление UserInfo (язык и любые будущие поля)
export const UPDATE_USER_INFO = gql`
  mutation UpdateUserInfo($documentId: ID!, $data: UserInfoInput!) {
    updateUserInfo(documentId: $documentId, data: $data) {
      documentId
    }
  }
`;

// Создание UserInfo после регистрации
export const CREATE_USER_INFO = gql`
  mutation CreateUserInfo($data: UserInfoInput!) {
    createUserInfo(data: $data) {
      documentId
    }
  }
`;

// Устанавливаем весь массив прочитанных уведомлений
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

// Изменить продукт (бронируем и привязываем к user_info)
export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($documentId: ID!, $data: ProductInput!) {
    updateProduct(documentId: $documentId, data: $data) {
      documentId
      state
      user_info { documentId }
    }
  }
`;


// Обновление email/username текущего пользователя (Strapi users-permissions)
export const UPDATE_USERS_PERMISSIONS_USER = gql`
  mutation UpdateUsersPermissionsUser($id: ID!, $data: UsersPermissionsUserInput!) {
    updateUsersPermissionsUser(id: $id, data: $data) {
      __typename
    }
  }
`;

// Сменить пароль
export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $password: String!, $passwordConfirmation: String!) {
    changePassword(currentPassword: $currentPassword, password: $password, passwordConfirmation: $passwordConfirmation) {
      jwt
      user { id }
    }
  }
`;