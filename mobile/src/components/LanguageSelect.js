import React, { useState } from "react";
// import { Modal, Pressable, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Modal, Pressable, View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CountryFlag from "react-native-country-flag";
import { useLanguage } from "../context/LanguageContext";

// язык → ISO страны (должно быть 2 буквы, верхний регистр)
const FLAG_CODE = { en: "GB", ru: "RU", he: "IL" };

function Flag({ code, size = 18 }) {
  const iso = FLAG_CODE[code] || "GB"; // безопасный фолбэк
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
      }}
    >
      {/* Чуть меньший размер + центрирование → не режет края иконки */}
      <CountryFlag isoCode={iso} size={Math.max(1, size - 2)} />
    </View>
  );
}

export default function LanguageSelect({ onChange }) {
  const { locale, setLocale, languages, savingLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const current = languages.find((l) => l.code === locale) || languages[0];

  const handlePick = async (code) => {
    setOpen(false);
    await setLocale(code);
    onChange?.(code);
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [s.trigger, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
        accessibilityLabel="Select language"
      >
        <View style={s.triggerLeft}>
          <Flag code={current.code} />
          <Text style={s.triggerText}>{current.label}</Text>
        </View>
        <Ionicons name="chevron-down" size={16} color="#555" />
      </Pressable>

      {savingLanguage ? <Text style={s.saving}>Saving…</Text> : null}

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <View />
        </Pressable>

        <View style={s.dropdown}>
          {languages.map((l) => (
            <TouchableOpacity key={l.code} style={s.item} onPress={() => handlePick(l.code)}>
              <View style={s.itemLeft}>
                <Flag code={l.code} />
                <Text style={s.itemText}>{l.label}</Text>
              </View>
              {locale === l.code ? <Ionicons name="checkmark" size={16} color="#333" /> : null}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  trigger: {
    minWidth: 200,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    // shadowColor: "#000",
    // shadowOpacity: 0.05,
    // shadowRadius: 6,
    // elevation: 2,
    ...(Platform.OS === "web"
       ? { boxShadow: "0px 6px 12px rgba(0,0,0,0.06)" }
       : { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }),
  },
  triggerLeft: { flexDirection: "row", alignItems: "center", columnGap: 8 },
  triggerText: { fontWeight: "600" },
  saving: { marginLeft: 8, opacity: 0.7 },
//   backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  dropdown: {
    position: "absolute",
    top: 120,
    right: 16,
    left: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    backgroundColor: "#fff",
    paddingVertical: 6,
    // shadowColor: "#000",
    // shadowOpacity: 0.12,
    // shadowRadius: 12,
    // elevation: 8,
    ...(Platform.OS === "web"
      ? { boxShadow: "0px 12px 24px rgba(0,0,0,0.12)" }
      : { shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 }),
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: { flexDirection: "row", alignItems: "center", columnGap: 8 },
  itemText: { fontSize: 15 },
});
