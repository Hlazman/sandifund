// src/screens/Partners.js
import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  Pressable,
  Modal,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useQuery } from "@apollo/client/react";
import { Ionicons } from "@expo/vector-icons";
import { GET_PARTNERS } from "../api/get";
import { useLanguage } from "../context/LanguageContext";

const API_BASE =
  (process.env.EXPO_PUBLIC_GRAPHQL_URL || "").replace("/graphql", "") ||
  "https://api.sandifund.com";

function resolveLogoUrl(logo) {
  const url = logo?.url;
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url}`;
}

function normalizeLink(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function openLink(url) {
  const full = normalizeLink(url);
  if (!full) return;
  Linking.openURL(full).catch(() => {});
}

// Рендер Slate-JSON для description
function renderRichText(nodes) {
  if (!Array.isArray(nodes)) return null;

  return nodes.map((node, idx) => {
    if (node.type === "paragraph") {
      return (
        <Text key={idx} style={styles.modalParagraph}>
          {renderRichText(node.children)}
        </Text>
      );
    }

    if (node.type?.startsWith("heading")) {
      return (
        <Text key={idx} style={styles.modalHeading}>
          {renderRichText(node.children)}
        </Text>
      );
    }

    if (!node.type || node.type === "text") {
      const text = node.text ?? "";
      if (!text) return null;

      const textStyles = [styles.modalText];
      if (node.bold) textStyles.push(styles.bold);
      if (node.italic) textStyles.push(styles.italic);
      if (node.underline) textStyles.push(styles.underline);

      return (
        <Text key={idx} style={textStyles}>
          {text}
        </Text>
      );
    }

    if (Array.isArray(node.children)) {
      return (
        <Text key={idx} style={styles.modalBlock}>
          {renderRichText(node.children)}
        </Text>
      );
    }

    return null;
  });
}

const Partners = () => {
  const { locale, dir, t } = useLanguage();
  const [activePartner, setActivePartner] = useState(null);

  const { data, loading, error } = useQuery(GET_PARTNERS, {
    variables: {
      locale,
      pagination: { limit: 100 },
    },
    fetchPolicy: "cache-and-network",
  });

  const partners = useMemo(() => data?.partners ?? [], [data]);
  const isRtl = dir === "rtl";

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          isRtl && styles.containerRtl,
        ]}
      >
        <Text
          style={[
            styles.title,
            isRtl ? styles.titleRtl : styles.titleLtr,
          ]}
        >
          {t("pages.partners.title", "Partners")}
        </Text>

        {loading && !data && (
          <View style={styles.centerRow}>
            <ActivityIndicator size="small" />
            <Text style={styles.mutedText}>
              {t("notifications.loading", "Loading...")}
            </Text>
          </View>
        )}

        {error && (
          <Text style={styles.errorText}>
            {t("errors.network", "Network error")}
          </Text>
        )}

        {!loading && !error && partners.length === 0 && (
          <Text style={styles.mutedText}>
            {t("notifications.empty", "No partners yet")}
          </Text>
        )}

        <View style={styles.grid}>
          {partners.map((p) => {
            const logoUrl = resolveLogoUrl(p.logo);
            const link = p.link || "";
            const hasLink = !!link;

            return (
              <Pressable
                key={p.documentId}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
                onPress={() => setActivePartner(p)}
              >
                <View style={styles.logoBox}>
                  {logoUrl ? (
                    <Image
                      source={{ uri: logoUrl }}
                      style={styles.logoImage}
                    />
                  ) : (
                    <Text style={styles.logoPlaceholder}>
                      {t("card.fund.noLogo", "No logo")}
                    </Text>
                  )}
                </View>

                <View
                  style={[
                    styles.cardBody,
                    isRtl ? styles.cardBodyRtl : styles.cardBodyLtr,
                  ]}
                >
                  <Text style={styles.partnerTitle}>{p.title}</Text>

                  {hasLink && (
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        openLink(link);
                      }}
                      style={styles.linkRow}
                    >
                      <Ionicons
                        name="link-outline"
                        size={16}
                        color="#4F46E5"
                      />
                      <Text style={styles.linkText} numberOfLines={1}>
                        {link}
                      </Text>
                    </Pressable>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Модалка с описанием партнёра */}
      <Modal
        visible={!!activePartner}
        transparent
        animationType="fade"
        onRequestClose={() => setActivePartner(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  isRtl ? styles.modalTitleRtl : styles.modalTitleLtr,
                ]}
              >
                {activePartner?.title}
              </Text>

              <TouchableOpacity
                onPress={() => setActivePartner(null)}
                style={styles.modalClose}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={[
                styles.modalContent,
                isRtl && styles.modalContentRtl,
              ]}
            >
              {activePartner &&
              Array.isArray(activePartner.description) &&
              activePartner.description.length > 0 ? (
                renderRichText(activePartner.description)
              ) : (
                <Text style={styles.mutedText}>
                  {t(
                    "notifications.empty",
                    "No description provided"
                  )}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  containerRtl: {
    direction: "rtl",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  titleLtr: {
    textAlign: "left",
  },
  titleRtl: {
    textAlign: "right",
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  mutedText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  card: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.9,
  },
  logoBox: {
    height: 96,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    marginBottom: 8,
    overflow: "hidden",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain", // аккуратно для горизонтальных и вертикальных логотипов
  },
  logoPlaceholder: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  cardBody: {
    gap: 4,
  },
  cardBodyLtr: {
    alignItems: "flex-start",
  },
  cardBodyRtl: {
    alignItems: "flex-end",
  },
  partnerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    maxWidth: "100%",
  },
  linkText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#4F46E5",
    textDecorationLine: "underline",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  modalCard: {
    maxHeight: "80%",
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  modalTitleLtr: {
    textAlign: "left",
  },
  modalTitleRtl: {
    textAlign: "right",
  },
  modalClose: {
    padding: 4,
    marginLeft: 8,
  },
  modalContent: {
    paddingVertical: 4,
  },
  modalContentRtl: {
    direction: "rtl",
  },
  modalParagraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 6,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
  },
  modalBlock: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  bold: {
    fontWeight: "600",
  },
  italic: {
    fontStyle: "italic",
  },
  underline: {
    textDecorationLine: "underline",
  },
});

export default Partners;
