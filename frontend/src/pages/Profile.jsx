import React, { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ME, GET_MY_USER_INFO } from "../api/get";
import { UPDATE_USERS_PERMISSIONS_USER } from "../api/mutations";
import { useLanguage } from "../context/LanguageContext";
import LanguageSelect from "../components/LanguageSelect";

export default function Profile() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // текущий пользователь
  const { data: meData, loading: meLoading, refetch: refetchMe } = useQuery(GET_ME, {
    fetchPolicy: "cache-and-network",
  });
  useQuery(GET_MY_USER_INFO, { fetchPolicy: "cache-first" });

  const me = meData?.me || null;
  const roleName = useMemo(
    () => (me?.role?.name || me?.role?.type || "").toString().toLowerCase(),
    [me]
  );

  // локальные состояния
  const [email, setEmail] = useState(me?.email || "");
  const [emailMsg, setEmailMsg] = useState("");
  const [username, setUsername] = useState(me?.username || "");
  const [usernameMsg, setUsernameMsg] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (me?.email) setEmail(me.email);
    if (me?.username) setUsername(me.username);
  }, [me?.email, me?.username]);

  // мутация обновления пользователя (email/username)
  const [updateUser, { loading: updatingUser, error: updateErr }] =
    useMutation(UPDATE_USERS_PERMISSIONS_USER, {
      onCompleted: () => refetchMe().catch(() => {}),
    });

  // валидация
  const isEmailValid = !!email && /\S+@\S+\.\S+/.test(email);
  const canSaveEmail = !!me?.id && isEmailValid && email !== me?.email;
  const canSaveUsername = !!me?.id && username && username.length >= 2 && username !== me?.username;

  const saveEmail = async () => {
    setEmailMsg("");
    try {
      await updateUser({ variables: { id: me.id, data: { email } } });
      setEmailMsg("OK");
    } catch (e) {
      setEmailMsg(e?.message || t("errors.unknown"));
    }
  };

  const saveUsername = async () => {
    setConfirmOpen(false);
    setUsernameMsg("");
    try {
      await updateUser({ variables: { id: me.id, data: { username } } });
      setUsernameMsg("OK");
    } catch (e) {
      setUsernameMsg(e?.message || t("errors.unknown"));
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">{t("header.items.profile") || "My profile"}</h1>

      {/* Шапка с данными */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        {meLoading ? (
          <div className="text-gray-500">{t("common.loading")}</div>
        ) : (
          <div className="space-y-1">
            <div className="text-gray-800">
              <span className="opacity-70">{t("pages.profile.changeUsername")}:</span>{" "}
              <span className="font-semibold">{me?.username || "-"}</span>
            </div>
            <div className="text-gray-800">
              <span className="opacity-70">{t("auth.email")}:</span>{" "}
              <span className="font-semibold">{me?.email || "-"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Язык */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="font-semibold mb-2">{t("common.language")}</div>
        <LanguageSelect />
      </div>

      {/* TODO Подписка — заглушка */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="font-semibold mb-1">{t("pages.profile.subscription")}</div>
        <div className="text-sm text-gray-600">{t("pages.profile.subscriptionDesc")}</div>
      </div>

      {/* Email */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
        <div className="font-semibold">{t("pages.profile.changeEmail")}</div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("auth.placeholders.email")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        {!isEmailValid && !!email && (
          <div className="text-sm text-red-600">{t("auth.errors.invalidEmail")}</div>
        )}
        <button
          disabled={!canSaveEmail || updatingUser}
          onClick={saveEmail}
          className="rounded-lg bg-indigo-600 text-white py-2 px-4 font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {updatingUser ? "…" : t("common.save")}
        </button>
        {!!emailMsg && (
          <div className={`text-sm ${emailMsg === "OK" ? "text-green-700" : "text-red-600"}`}>
            {emailMsg === "OK" ? t("common.ok") : emailMsg}
          </div>
        )}
        {updateErr && <div className="text-sm text-red-600">{String(updateErr.message)}</div>}
      </div>

      {/* Пароль — отдельная страница */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
        <div className="font-semibold">{t("pages.profile.changePassword")}</div>
        <button
          onClick={() => navigate("/change-password")}
          className="rounded-lg bg-indigo-600 text-white py-2 px-4 font-medium hover:bg-indigo-700"
        >
          {t("pages.profile.changePassword")}
        </button>
      </div>

      {/* Username (с подтверждением) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
        <div className="font-semibold">{t("pages.profile.changeUsername")}</div>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t("pages.profile.changeUsername")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/50"
        />
        <button
          disabled={!canSaveUsername || updatingUser}
          onClick={() => setConfirmOpen(true)}
          className="rounded-lg bg-indigo-600 text-white py-2 px-4 font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {updatingUser ? "…" : t("common.save")}
        </button>
        {!!usernameMsg && (
          <div className={`text-sm ${usernameMsg === "OK" ? "text-green-700" : "text-red-600"}`}>
            {usernameMsg === "OK" ? t("common.ok") : usernameMsg}
          </div>
        )}

        {/* Модалка подтверждения */}
        <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40" />
            <Dialog.Content className="fixed inset-4 sm:inset-auto sm:top-[10%] sm:left-1/2 sm:-translate-x-1/2 sm:w-[520px] bg-white rounded-2xl border border-gray-200 p-4 shadow-xl">
              <Dialog.Title className="text-lg font-semibold mb-2">
                {t("pages.profile.changeUsername")}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-600 mb-4">
                {t("pages.myGoods.confirmChange")}
              </Dialog.Description>
              <div className="flex justify-end gap-2">
                <Dialog.Close asChild>
                  <button className="rounded-lg border px-3 py-1.5 hover:bg-gray-50">
                    {t("common.cancel")}
                  </button>
                </Dialog.Close>
                <button
                  onClick={saveUsername}
                  className="rounded-lg bg-indigo-600 text-white px-3 py-1.5 font-medium hover:bg-indigo-700"
                >
                  {t("common.ok")}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Нижний текст по роли */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4">
        <div className="text-gray-800">
          {roleName === "master" ? t("pages.profile.masterFooter") : t("pages.profile.userFooter")}
        </div>
      </div>
    </div>
  );
}
