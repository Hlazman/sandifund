import React from "react";
import { View, Text, Image } from "react-native";
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

export default function CardProduct(props) {
  const {
    className, // совместимость, не используется
    title,
    image,
    description,
    price,
    donationPercent,
    status,
    master,        // { name, href?, image?, onPress? }
    reserveLabel,
    onReserve,
  } = props;

  const { t } = useLanguage();
  const L = (k, fallback) => t(k) || fallback;

  const statusKey = statusKeyFrom(status);
  const sc =
    {
      inStock: { color: "#dcfce7", text: "#166534" },
      reserved: { color: "#fef3c7", text: "#92400e" },
      sold: { color: "#fee2e2", text: "#991b1b" },
    }[statusKey] || { color: "#f3f4f6", text: "#374151" };
  const statusLabel = statusKey ? L(`card.product.status.${statusKey}`, status) : status;

  return (
    <CardWrap>
      {image ? (
        <Image
          source={{ uri: image }}
          style={{
            width: "100%",
            aspectRatio: 4 / 3,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            marginBottom: 12,
          }}
          resizeMode="cover"
        />
      ) : (
        <View style={{ marginBottom: 12 }}>
          <Placeholder />
        </View>
      )}

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <Text style={{ fontSize: 18, fontWeight: "700", flexShrink: 1 }}>
          {title || "Untitled product"}
        </Text>
        {status ? <Badge color={sc.color} textColor={sc.text}>{statusLabel}</Badge> : null}
      </View>

      {typeof price === "number" ? (
        <Field label={L("card.product.price", "Price")} value={`${price}`} />
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

      {typeof onReserve === "function" ? (
        <View style={{ marginTop: 10 }}>
          <Button
            title={reserveLabel || L("card.product.reserve", "Reserve")}
            onPress={onReserve}
          />
        </View>
      ) : null}
    </CardWrap>
  );
}
