import React from "react";
import { View, Text, Image, Modal, Pressable } from "react-native";
import { useMutation, useQuery } from "@apollo/client/react";
import { useLanguage } from "../../context/LanguageContext";
import {
  CardWrap,
  Placeholder,
  Badge,
  Field,
  MiniAvatar,
  statusKeyFrom,
  openLink,
} from "./_CardParts";
import { GET_MY_USER_INFO, GET_MASTER, GET_PRODUCTS } from "../../api/get";
import { UPDATE_PRODUCT } from "../../api/mutations";

export default function CardProduct(props) {
  const {
    documentId,
    title,
    image,
    description,
    price,
    donationPercent,
    status,
    master = {},
  } = props;

  const { t, locale } = useLanguage();
  const L = (key, fallback) => t(key) || fallback;

  // кто владелец (мастер текущего пользователя)
  const { data: meData } = useQuery(GET_MY_USER_INFO, { fetchPolicy: "cache-first" });
  const myMasterId = meData?.meFull?.user_info?.master?.documentId || null;
  const productMasterId = master?.documentId || null;
  const isOwner = !!myMasterId && !!productMasterId && myMasterId === productMasterId;

  // локальное состояние статуса (для бейджа)
  const [localState, setLocalState] = React.useState(status || "inStock");
  React.useEffect(() => {
    if (status && status !== localState) {
      setLocalState(status);
    }
  }, [status]);

  const statusKey = statusKeyFrom(localState);
  const statusColors = {
    booked: { bg: "#e0e7ff", text: "#3730a3" },    // indigo
    inStock: { bg: "#e5e7eb", text: "#374151" },   // gray
    reserved: { bg: "#fef3c7", text: "#92400e" },  // amber
    sold: { bg: "#fee2e2", text: "#991b1b" },      // red
    notValid: { bg: "#f3f4f6", text: "#374151" },  // light gray
  };
  const sc = statusColors[statusKey] || { bg: "#f3f4f6", text: "#374151" };
  const statusLabel = statusKey ? L(`card.product.status.${statusKey}`, localState) : localState;

  // мутация смены статуса
  const [mutate, { loading: saving }] = useMutation(UPDATE_PRODUCT);

  const imgStyles = {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  };

  // --- Select статуса (только для владельца товара) ---
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pendingState, setPendingState] = React.useState(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const startAction = (next) => {
    setPendingState(next);
    setPickerOpen(false);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (saving) return;
    setConfirmOpen(false);
    setPendingState(null);
  };

  const confirmAction = async () => {
    if (!pendingState) return;
    const data = { state: pendingState };

    try {
      await mutate({
        variables: { documentId, data },
        refetchQueries: [
          // обновляем данные мастера с его продуктами (MyGoods, Master)
          ...(myMasterId
            ? [{ query: GET_MASTER, variables: { documentId: myMasterId, locale } }]
            : []),
          // и общий список товаров для экрана Goods
          {
            query: GET_PRODUCTS,
            variables: {
              locale,
              pagination: { limit: 250 },
              filters: { state: { in: ["inStock", "booked"] } },
            },
          },
        ],
        awaitRefetchQueries: false,
      });
      setLocalState(pendingState);
    } catch (e) {
      if (!/aborted/i.test(e?.message || "") && e?.name !== "AbortError") {
        console.error(e);
      }
    } finally {
      closeConfirm();
    }
  };

  const OwnerSelect = () =>
    !isOwner ? null : (
      <View style={{ marginTop: 10 }}>
        {/* заголовок */}
        {/* <Text style={{ color: "#374151", marginBottom: 6, fontWeight: "600" }}>
          {L("pages.myGoods.state", "State")}
        </Text> */}

        {/* псевдо-select */}
        <Pressable
          onPress={() => setPickerOpen(true)}
          style={({ pressed }) => ({
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 12,
            backgroundColor: pressed ? "#f9fafb" : "#fff",
          })}
        >
          <Text style={{ color: "#6b7280" }}>
            {L("pages.myGoods.selectAction", "Выберите действие")}  ▼
          </Text>
        </Pressable>

        {/* список вариантов */}
        <Modal
          visible={pickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setPickerOpen(false)}
        >
          <Pressable
            onPress={() => setPickerOpen(false)}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" }}
          />
          <View
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              top: "30%",
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
              {L("pages.myGoods.selectAction", "Выберите действие")}
            </Text>

            {[
              { key: "inStock", label: L("card.product.status.inStock", "inStock") },
              { key: "booked", label: L("card.product.status.booked", "booked") },
              { key: "sold", label: L("card.product.status.sold", "sold") },
              { key: "notValid", label: L("filters.notValid", "notValid") },
            ].map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => startAction(opt.key)}
                style={({ pressed }) => ({
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: pressed ? "#f3f4f6" : "transparent",
                })}
              >
                <Text style={{ fontSize: 16 }}>{opt.label}</Text>
              </Pressable>
            ))}

            <View style={{ height: 8 }} />

            <Pressable
              onPress={() => setPickerOpen(false)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#f3f4f6" : "#fff",
                borderWidth: 1,
                borderColor: "#d1d5db",
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: "center",
              })}
            >
              <Text>{L("common.cancel", "Отмена")}</Text>
            </Pressable>
          </View>
        </Modal>

        {/* подтверждение */}
        <Modal
          visible={confirmOpen}
          transparent
          animationType="fade"
          onRequestClose={closeConfirm}
        >
          <Pressable
            onPress={saving ? undefined : closeConfirm}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" }}
          />
          <View
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              top: "35%",
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              {L("pages.myGoods.confirmTitle", "Подтверждение")}
            </Text>
            <Text style={{ marginTop: 6 }}>
              {L("pages.myGoods.confirmChange", "Подтвердите изменение статуса товара?")}{" "}
              <Text style={{ fontWeight: "700" }}>
                {pendingState === "inStock"
                  ? `(${L("card.product.status.inStock", "inStock")})`
                  : pendingState === "booked"
                  ? `(${L("card.product.status.booked", "booked")})`
                  : pendingState === "notValid"
                  ? `(${L("filters.notValid", "notValid")})`
                  : `(${L("card.product.status.sold", "sold")})`}
              </Text>
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                marginTop: 14,
              }}
            >
              <Pressable
                onPress={saving ? undefined : closeConfirm}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#f3f4f6" : "#fff",
                  borderWidth: 1,
                  borderColor: "#d1d5db",
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  marginRight: 8,
                })}
              >
                <Text>{L("common.cancel", "Отмена")}</Text>
              </Pressable>
              <Pressable
                onPress={saving ? undefined : confirmAction}
                style={({ pressed }) => ({
                  backgroundColor: pressed ? "#4338ca" : "#4f46e5",
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                })}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  {L("common.ok", "Ок")}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    );

  // --- Контакты мастера (только для НЕ своих товаров) ---

  const masterEmail = master?.email || null;
  const masterWhatsapp = master?.whatsapp || null;
  const masterOtherContact = master?.otherContact || null;
  const masterMessenger = master?.messenger || null;

  const mailHref = masterEmail ? `mailto:${masterEmail}` : null;
  
  const waHref = React.useMemo(() => {
    if (!masterWhatsapp) return null;
    const raw = masterWhatsapp.trim();
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    const digits = raw.replace(/[^\d]/g, "");
    if (!digits) return null;
    return `https://wa.me/${digits}`;
  }, [masterWhatsapp]);

  const otherHref = React.useMemo(() => {
    if (!masterOtherContact) return null;
    const raw = masterOtherContact.trim();
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://${raw}`;
  }, [masterOtherContact]);

  const messengerHref = React.useMemo(() => {
    if (!masterMessenger) return null;
    const raw = masterMessenger.trim();
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    return `https://m.me/${raw.replace(/^@/, "")}`;
  }, [masterMessenger]);
  
  // const hasContact = !!(mailHref || waHref);
  const hasContact = !!(mailHref || waHref || otherHref || messengerHref);
  const [contactOpen, setContactOpen] = React.useState(false);

  const ContactSelect = () =>
    isOwner || !hasContact ? null : (
      <>
        <View style={{ marginTop: 10 }}>
          {/* <Text style={{ color: "#374151", marginBottom: 6, fontWeight: "600" }}>
            {L("card.product.chooseContact", "Связаться с мастером")}
          </Text> */}
          <Pressable
            onPress={() => setContactOpen(true)}
            style={({ pressed }) => ({
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 12,
              paddingVertical: 10,
              paddingHorizontal: 12,
              backgroundColor: pressed ? "#f9fafb" : "#fff",
            })}
          >
            <Text style={{ color: "#6b7280" }}>
              {L("card.product.chooseContact", "Выбрать способ связи")}  ▼
            </Text>
          </Pressable>
        </View>

        <Modal
          visible={contactOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setContactOpen(false)}
        >
          <Pressable
            onPress={() => setContactOpen(false)}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" }}
          />
          <View
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              top: "35%",
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
              {L("card.product.chooseContact", "Связаться с мастером")}
            </Text>

            {waHref ? (
              <Pressable
                onPress={async () => {
                  setContactOpen(false);
                  await openLink(waHref);
                }}
                style={({ pressed }) => ({
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: pressed ? "#f3f4f6" : "transparent",
                })}
              >
                <Text style={{ fontSize: 16 }}>WhatsApp</Text>
              </Pressable>
            ) : null}

            {mailHref ? (
              <Pressable
                onPress={async () => {
                  setContactOpen(false);
                  await openLink(mailHref);
                }}
                style={({ pressed }) => ({
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: pressed ? "#f3f4f6" : "transparent",
                })}
              >
                <Text style={{ fontSize: 16 }}>{L("auth.email", "Email")}</Text>
              </Pressable>
            ) : null}

            {messengerHref ? (
              <Pressable
                onPress={async () => {
                  setContactOpen(false);
                  await openLink(messengerHref);
                }}
                style={({ pressed }) => ({
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: pressed ? "#f3f4f6" : "transparent",
                })}
              >
                <Text style={{ fontSize: 16 }}>Messenger</Text>
              </Pressable>
            ) : null}

            {otherHref ? (
              <Pressable
                onPress={async () => {
                  setContactOpen(false);
                  await openLink(otherHref);
                }}
                style={({ pressed }) => ({
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  backgroundColor: pressed ? "#f3f4f6" : "transparent",
                })}
              >
                {/* TODO */}
                <Text style={{ fontSize: 16 }}>Other contact</Text>
              </Pressable>
            ) : null}

            <View style={{ height: 8 }} />

            <Pressable
              onPress={() => setContactOpen(false)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#f3f4f6" : "#fff",
                borderWidth: 1,
                borderColor: "#d1d5db",
                paddingVertical: 10,
                borderRadius: 12,
                alignItems: "center",
              })}
            >
              <Text>{L("common.cancel", "Отмена")}</Text>
            </Pressable>
          </View>
        </Modal>
      </>
    );

  // --- Рендер карточки ---

  const masterName = master?.name || null;
  const masterImage = master?.image || null;

  return (
    <CardWrap>
      {image ? (
        <Image source={{ uri: image }} style={imgStyles} resizeMode="cover" />
      ) : (
        <View style={{ marginBottom: 12 }}>
          <Placeholder />
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", flexShrink: 1 }}>
          {title || "Untitled product"}
        </Text>
        {localState ? (
          <Badge color={sc.bg} textColor={sc.text}>
            {statusLabel}
          </Badge>
        ) : null}
      </View>

      {typeof price === "number" ? (
        <Field label={L("card.product.price", "Price")} value={`${price} ₪`} />
      ) : null}

      {typeof donationPercent === "number" ? (
        <Field
          label={L("card.product.donation", "Donation")}
          value={`${donationPercent}%`}
        />
      ) : null}

      {masterName ? (
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <MiniAvatar src={masterImage} />
          <Text
            style={{
              color: "#6b7280",
              marginLeft: masterImage ? 8 : 0,
              marginRight: 6,
            }}
          >
            {L("card.product.master", "Master")}:
          </Text>
          <Text
            onPress={master.onPress}
            style={{ color: master.onPress ? "#4f46e5" : "#111827" }}
          >
            {masterName}
          </Text>
        </View>
      ) : null}

      {description ? (
        <Text style={{ color: "#374151", marginTop: 8 }}>{description}</Text>
      ) : null}

      <OwnerSelect />
      <ContactSelect />
    </CardWrap>
  );
}
