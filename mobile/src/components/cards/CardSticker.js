import React from "react";
import { View, Text, Image } from "react-native";
import { useLanguage } from "../../context/LanguageContext";
import {
  CardWrap,
  Placeholder,
  Button,
  openLink,
} from "./_CardParts";

export default function CardSticker(props) {
  const {
    className, // совместимость, не используется
    title,
    image,
    description,
    link,
  } = props;

  const { t } = useLanguage();
  const L = (k, fallback) => t(k) || fallback;

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

      <Text style={{ fontSize: 18, fontWeight: "700" }}>
        {title || "Untitled sticker pack"}
      </Text>

      {description ? (
        <Text style={{ color: "#374151", marginTop: 8 }}>{description}</Text>
      ) : null}

      {link ? (
        <View style={{ marginTop: 10 }}>
          <Button title={L("card.sticker.openLink", "Open link")} onPress={() => openLink(link)} />
        </View>
      ) : null}
    </CardWrap>
  );
}
