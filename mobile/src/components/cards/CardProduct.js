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
  Button,
  statusKeyFrom,
} from "./_CardParts";
import { GET_MY_USER_INFO, GET_PRODUCTS_BY_MASTER, GET_PRODUCTS } from "../../api/get";
import { UPDATE_PRODUCT } from "../../api/mutations";

export default function CardProduct(props) {
  const {
    className, // совместимость, не используется
    title,
    image,
    description,
    price,
    donationPercent,
    status,
    master,        // { name, href?, image?, onPress?, documentId? }
    reserveLabel,
    onReserve,
  } = props;

  const { t, locale } = useLanguage();
  const L = (k, fallback) => t(k) || fallback;

  // кто я: мастер?
  const { data: meData } = useQuery(GET_MY_USER_INFO, { fetchPolicy: "cache-first" });
  const myMasterId = meData?.meFull?.user_info?.master?.documentId || null;
  const productMasterId = master?.documentId || null;
  const isOwner = !!myMasterId && !!productMasterId && myMasterId === productMasterId;

  // текущее состояние (для бейджа)
  const [localState, setLocalState] = React.useState(status || "inStock");
  const statusKey = statusKeyFrom(localState);

  const sc =
    {
      booked:  { color: "#e0e7ff", text: "#3730a3" }, // indigo
      inStock: { color: "#dcfce7", text: "#166534" }, // green
      reserved:{ color: "#fef3c7", text: "#92400e" }, // amber
      sold:    { color: "#fee2e2", text: "#991b1b" }, // red
      notValid:{ color: "#fef3c7", text: "#92400e" }, // amber
    }[statusKey] || { color: "#f3f4f6", text: "#374151" };
  const statusLabel = statusKey ? L(`card.product.status.${statusKey}`, localState) : localState;

  // селект действия + подтверждение
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [pendingState, setPendingState] = React.useState(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const [mutate, { loading: saving }] = useMutation(UPDATE_PRODUCT);

  const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || "";
  const API_BASE = GRAPHQL_URL.replace(/\/graphql\/?$/, "");

  const imgStyles = {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  };

  const startAction = (next) => {
    setPendingState(next);
    setPickerOpen(false);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setPendingState(null);
  };

  const confirmAction = async () => {
    if (!pendingState) return;
    const data = { state: pendingState };
    if (pendingState === "inStock" || pendingState === "notValid") {
      data.user_info = null;
    }
    try {
      await mutate({
        variables: { documentId: props.documentId, data },
        refetchQueries: [
          ...(myMasterId
            ? [{ query: GET_PRODUCTS_BY_MASTER, variables: { masterId: myMasterId, locale } }]
            : []),
          // чтобы общий список на Goods тоже «проснулся»
          { query: GET_PRODUCTS, variables: { locale, pagination: { limit: 250 }, filters: { state: { in: ["inStock", "booked"] } } } }
        ],
        awaitRefetchQueries: false,
        optimisticResponse: {
          updateProduct: {
            __typename: "Product",
            documentId: props.documentId,
            state: pendingState,
            user_info: pendingState === "inStock" || pendingState === "notValid" ? null : null,
          },
        },
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

  const OwnerSelect = () => (
    <View style={{ marginTop: 10 }}>
      {/* заголовок */}
      <Text style={{ color: "#374151", marginBottom: 6, fontWeight: "600" }}>
        {L("pages.myGoods.state", "State")}
      </Text>

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
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable
          onPress={() => setPickerOpen(false)}
          style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)" }}
        />
        <View style={{
          position: "absolute", left: 16, right: 16, top: "30%",
          backgroundColor: "#fff", borderRadius: 16, padding: 16,
          borderWidth: 1, borderColor: "#e5e7eb"
        }}>
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
            {L("pages.myGoods.selectAction", "Выберите действие")}
          </Text>

          {[
            { key: "inStock", label: L("card.product.status.inStock", "inStock") },
            { key: "notValid", label: L("filters.notValid", "notValid") },
            { key: "sold",    label: L("card.product.status.sold", "sold") },
          ].map(opt => (
            <Pressable
              key={opt.key}
              onPress={() => startAction(opt.key)}
              style={({ pressed }) => ({
                paddingVertical: 12,
                paddingHorizontal: 10,
                borderRadius: 10,
                backgroundColor: pressed ? "#f3f4f6" : "transparent"
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
              borderWidth: 1, borderColor: "#d1d5db",
              paddingVertical: 10, borderRadius: 12, alignItems: "center"
            })}
          >
            <Text>{L("common.cancel", "Отмена")}</Text>
          </Pressable>
        </View>
      </Modal>

      {/* подтверждение */}
      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={closeConfirm}>
        <Pressable
          onPress={saving ? undefined : closeConfirm}
          style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)" }}
        />
        <View style={{
          position: "absolute", left: 16, right: 16, top: "35%",
          backgroundColor: "#fff", borderRadius: 16, padding: 16,
          borderWidth: 1, borderColor: "#e5e7eb"
        }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>
            {L("pages.myGoods.confirmTitle", "Подтверждение")}
          </Text>
          <Text style={{ marginTop: 6 }}>
            {L("pages.myGoods.confirmChange", "Подтвердите изменение статуса товара?")}{" "}
            <Text style={{ fontWeight: "700" }}>
              ({pendingState === "inStock" ? L("card.product.status.inStock","inStock")
               : pendingState === "notValid" ? L("filters.notValid","notValid")
               : L("card.product.status.sold","sold")})
            </Text>
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <Pressable
              onPress={saving ? undefined : closeConfirm}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#f3f4f6" : "#fff",
                borderWidth: 1, borderColor: "#d1d5db",
                paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12
              })}
            >
              <Text>{L("common.cancel", "Отмена")}</Text>
            </Pressable>
            <Pressable
              onPress={saving ? undefined : confirmAction}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#4338ca" : "#4f46e5",
                paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12
              })}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>{L("common.ok","Ок")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <CardWrap>
      {image ? (
        <Image source={{ uri: image }} style={imgStyles} resizeMode="cover" />
      ) : (
        <View style={{ marginBottom: 12 }}><Placeholder /></View>
      )}

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", flexShrink: 1 }}>
          {title || "Untitled product"}
        </Text>
        {localState ? <Badge color={sc.color} textColor={sc.text}>{statusLabel}</Badge> : null}
      </View>

      {typeof price === "number" ? (
        <Field label={L("card.product.price", "Price")} value={`${price} ₪`} />
      ) : null}
      {typeof donationPercent === "number" ? (
        <Field label={L("card.product.donation", "Donation")} value={`${donationPercent}%`} />
      ) : null}

      {master?.name ? (
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <MiniAvatar src={master.image} />
          <Text style={{ color: "#6b7280", marginLeft: master?.image ? 8 : 0, marginRight: 6 }}>
            {L("card.product.master", "Master")}:
          </Text>
          <Text
            onPress={master?.onPress}
            style={{ color: master?.onPress ? "#4f46e5" : "#111827" }}
          >
            {master.name}
          </Text>
        </View>
      ) : null}

      {description ? (
        <Text style={{ color: "#374151", marginTop: 8 }}>{description}</Text>
      ) : null}

      {isOwner ? (
        <OwnerSelect />
      ) : typeof onReserve === "function" ? (
        <View style={{ marginTop: 10 }}>
          <Button
            title={reserveLabel || L("card.product.reserve", "Reserve")}
            onPress={onReserve}
            fullWidth
          />
        </View>
      ) : null}
    </CardWrap>
  );
}
