import React from "react";
import { View, Text, Image } from "react-native";
import { useLanguage } from "../../context/LanguageContext";
// import { CardWrap, Placeholder, Field, Button } from "./_CardParts";
import { CardWrap, Placeholder, Button } from "./_CardParts";

export default function CardMaster(props) {
  const {
    name,
    photo,
    email,
    whatsapp,
    description,
    productsCount = 0,
    onMore, // () => void
  } = props;

  const { t } = useLanguage();
  const L = (k, fb) => t(k) || fb;

  const waHref = whatsapp
    ? whatsapp.startsWith("http")
      ? whatsapp
      : `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`
    : undefined;

  return (
    <CardWrap>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              marginRight: 12,
            }}
          />
        ) : (
          <Placeholder aspectRatio={1} style={{ width: 72, height: 72, marginRight: 12 }} />
        )}

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: "700" }} numberOfLines={1}>
            {name || "Master"}
          </Text>
          <Text style={{ color: "#6b7280", marginTop: 4 }}>
            {(L("card.master.products", "products") + ": " + productsCount)}
          </Text>
        </View>
      </View>

      {description ? (
        <Text style={{ color: "#374151", marginTop: 8 }}>{description}</Text>
      ) : null}

      {/* <View style={{ marginTop: 6 }}>
        <Field label={L("auth.email", "Email")} value={email} href={email ? `mailto:${email}` : undefined} />
        <Field label="WhatsApp" value={whatsapp} href={waHref} />
      </View> */}
      
    {onMore ? (
        <View style={{ marginTop: 10 }}>
            <Button title={L("card.master.more", "Подробнее")} onPress={onMore} fullWidth />
        </View>
    ) : null}
    </CardWrap>
  );
}
