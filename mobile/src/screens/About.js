// src/screens/About.js
import React, { useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useQuery } from "@apollo/client/react";
import { GET_ABOUT } from "../api/get";
import { useLanguage } from "../context/LanguageContext";

// Очень простой рендер Slate-JSON (абзацы + жирный/курсив/подчёркнутый)
function renderRichText(nodes) {
  if (!Array.isArray(nodes)) return null;

  return nodes.map((node, idx) => {
    if (node.type === "paragraph") {
      return (
        <Text key={idx} style={styles.paragraph}>
          {renderRichText(node.children)}
        </Text>
      );
    }

    if (node.type?.startsWith("heading")) {
      return (
        <Text key={idx} style={styles.heading}>
          {renderRichText(node.children)}
        </Text>
      );
    }

    if (!node.type || node.type === "text") {
      const text = node.text ?? "";
      if (!text) return null;

      const textStyles = [styles.text];
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
        <Text key={idx} style={styles.block}>
          {renderRichText(node.children)}
        </Text>
      );
    }

    return null;
  });
}

const About = () => {
  const { locale, dir, t } = useLanguage();

  const { data, loading, error } = useQuery(GET_ABOUT, {
    variables: { locale },
    fetchPolicy: "cache-and-network",
  });

  const content = useMemo(() => {
    const text = data?.about?.text;
    if (!text || !Array.isArray(text) || text.length === 0) return null;
    return renderRichText(text);
  }, [data]);

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
          {t("pages.about.title", "About us")}
        </Text>

        <View style={styles.card}>
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

          {!loading && !error && !content && (
            <Text style={styles.mutedText}>
              {t("notifications.empty", "Nothing here yet")}
            </Text>
          )}

          {!loading && !error && content && (
            <View
              style={[
                styles.textWrapper,
                isRtl ? styles.textWrapperRtl : styles.textWrapperLtr,
              ]}
            >
              {content}
            </View>
          )}
        </View>
      </ScrollView>
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  centerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mutedText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
  },
  textWrapper: {
    marginTop: 4,
  },
  textWrapperLtr: {
    textAlign: "left",
  },
  textWrapperRtl: {
    textAlign: "right",
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  heading: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 6,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
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
  block: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
});

export default About;
