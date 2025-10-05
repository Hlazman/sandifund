import React from "react";
import { View, Text, Image, Alert, Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useLanguage } from "../../context/LanguageContext";
import { CardWrap, Placeholder, Button, openLink } from "./_CardParts";

export default function CardSticker(props) {
  const {
    className, // не используется
    title,
    image,
    description,
    zipHref,     // абсолютная или относительная ссылка на zip
  } = props;

  const { t } = useLanguage();
  const L = (k, fallback) => t(k) || fallback;

  const onDownload = async () => {
    const url = zipHref;
    if (!url) return;

    if (Platform.OS === "web") {
      // В веб-режиме просто откроем ссылку (браузер сам скачает)
      return openLink(url);
    }

    try {
      const fileName = (url.split("/").pop() || "stickers.zip").split("?")[0];
      const dest = FileSystem.documentDirectory + fileName;

      const { uri } = await FileSystem.downloadAsync(url, dest);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(L("card.sticker.download", "Скачать"), `Saved to: ${uri}`);
      }
    } catch (e) {
      Alert.alert(t("errors.unknown") || "Unknown error.", String(e?.message || e));
    }
  };

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

      {zipHref ? (
        <View style={{ marginTop: 10 }}>
          <Button title={L("card.sticker.download", "Скачать")} onPress={onDownload} />
        </View>
      ) : null}
    </CardWrap>
  );
}
