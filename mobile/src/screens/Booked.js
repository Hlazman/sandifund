import React from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute } from "@react-navigation/native";
import { useMutation } from "@apollo/client/react";
import { UPDATE_PRODUCT } from "../api/mutations";
import { useLanguage } from "../context/LanguageContext";

// Телефон
import PhoneInput from "react-native-phone-number-input";
// Наш принудительный флаг
import CountryFlag from "react-native-country-flag";

function Checkbox({ label, checked, onChange }) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={{ flexDirection: "row", alignItems: "center", marginRight: 16 }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: "#9ca3af",
          backgroundColor: checked ? "#4f46e5" : "transparent",
          marginRight: 8,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {checked ? (
          <Text style={{ color: "#fff", fontWeight: "700", lineHeight: 18 }}>
            ✓
          </Text>
        ) : null}
      </View>
      <Text>{label}</Text>
    </Pressable>
  );
}

export default function Booked() {
  const route = useRoute();
  const { t } = useLanguage();
  const productId = route.params?.productId;

  const [name, setName] = React.useState("");
  const [phoneE164, setPhoneE164] = React.useState(""); // +9725...
  const [isPhoneValid, setIsPhoneValid] = React.useState(false);
  const [touched, setTouched] = React.useState(false);

  const [byWhatsapp, setByWhatsapp] = React.useState(true);
  const [byPhone, setByPhone] = React.useState(true);
  const [success, setSuccess] = React.useState(false);

  const [cca2, setCca2] = React.useState("IL"); // для отрисовки флага
  const phoneRef = React.useRef(null);

  const [mutate, { loading, error }] = useMutation(UPDATE_PRODUCT);

  const canSubmit = !!productId && isPhoneValid;

  const onSubmit = async () => {
    setTouched(true);
    if (!canSubmit) return;

    const userInfoId = globalThis.sf_userInfoId || null;
    const data = userInfoId
      ? { state: "booked", user_info: userInfoId }
      : { state: "booked" };

    try {
      await mutate({ variables: { documentId: productId, data } });
      // TODO: отправить данные формы (name, phoneE164, byWhatsapp, byPhone)
      setSuccess(true);
    } catch (e) {
      // обработка ниже
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 12 }}>
          {t("pages.booked.title") || "Reserve product"}
        </Text>

        {/* Имя */}
        <Text style={{ color: "#374151", marginBottom: 6, fontWeight: "600" }}>
          {t("pages.booked.form.name") || "Name"}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t("pages.booked.form.name") || "Name"}
          style={{
            borderWidth: 1,
            borderColor: "#d1d5db",
            borderRadius: 12,
            paddingVertical: 10,
            paddingHorizontal: 12,
            marginBottom: 12,
            backgroundColor: "#fff",
          }}
        />

        {/* Телефон */}
        <Text style={{ color: "#374151", marginBottom: 6, fontWeight: "600" }}>
          {t("pages.booked.form.phone") || "Phone"}
        </Text>

        {/* Обёртка нужна, чтобы поверх PhoneInput положить свой флаг */}
        <View
          style={{
            position: "relative",
            borderWidth: 1,
            borderColor: touched && !isPhoneValid ? "#fecaca" : "#d1d5db",
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 6,
            marginBottom: 8,
            backgroundColor: "#fff",
          }}
        >
          {/* Наш флаг — всегда виден */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 10,
              top: 8,
              width: 28,
              height: 20,
              borderRadius: 3,
              overflow: "hidden",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CountryFlag isoCode={cca2} size={18} />
          </View>

          <PhoneInput
            ref={phoneRef}
            defaultCode="IL"
            layout="first"
            withDarkTheme={false}
            withShadow={false}
            countryPickerProps={{
              withFlag: true,
              withFilter: true,
              preferredCountries: ["IL", "UA", "US"],
            }}
            onChangeCountry={(c) => {
              if (c?.cca2) setCca2(c.cca2.toUpperCase());
            }}
            onChangeText={(text) => {
              const ok = phoneRef.current?.isValidNumber(text);
              setIsPhoneValid(!!ok);
            }}
            onChangeFormattedText={(formatted) => setPhoneE164(formatted)}
            containerStyle={{
              width: "100%",
              backgroundColor: "transparent",
              borderWidth: 0,
            }}
            textContainerStyle={{
              backgroundColor: "transparent",
              borderWidth: 0,
              paddingVertical: 0,
              paddingLeft: 12, // место под наш флаг
              paddingRight: 6,
            }}
            textInputStyle={{
              color: "#111827",
              padding: 0,
              margin: 0,
            }}
            codeTextStyle={{ color: "#111827", fontWeight: "600" }}
            // Скрываем «родной» флаг-кнопку, оставляя её кликабельной (чтобы открыть список стран)
            flagButtonStyle={{
              opacity: 0,
              width: 36,
              marginRight: 4,
            }}
            placeholder="5X XXX XXXX"
            textInputProps={{
              keyboardType: "phone-pad",
              onBlur: () => setTouched(true),
              returnKeyType: "done",
            }}
          />
        </View>
        {touched && !isPhoneValid ? (
          <Text style={{ color: "#b91c1c", marginBottom: 8 }}>
            {t("errors.invalidPhone", "Invalid phone number")}
          </Text>
        ) : null}

        {/* Контакты */}
        <Text style={{ color: "#374151", marginBottom: 8, fontWeight: "600" }}>
          {t("pages.booked.form.contacts") || "Contact me via"}
        </Text>
        <View style={{ flexDirection: "row", marginBottom: 16, flexWrap: "wrap" }}>
          <Checkbox
            label={t("card.fund.whatsapp") || "WhatsApp"}
            checked={byWhatsapp}
            onChange={setByWhatsapp}
          />
          <Checkbox
            label={t("pages.booked.form.byPhone") || "Phone call"}
            checked={byPhone}
            onChange={setByPhone}
          />
        </View>

        {/* Кнопка бронирования */}
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Pressable
            disabled={!canSubmit}
            onPress={onSubmit}
            style={({ pressed }) => ({
              backgroundColor: !canSubmit
                ? "#c7d2fe"
                : pressed
                ? "#4338ca"
                : "#4f46e5",
              paddingVertical: 12,
              paddingHorizontal: 14,
              borderRadius: 12,
              alignSelf: "stretch",
              justifyContent: "center",
            })}
          >
            <Text style={{ color: "#fff", fontWeight: "700", textAlign: "center" }}>
              {t("pages.booked.form.submit") || "Reserve"}
            </Text>
          </Pressable>
        )}

        {/* Сообщения */}
        {success ? (
          <Text style={{ color: "#166534", marginTop: 12, fontWeight: "600" }}>
            {t("pages.booked.success") || "The product has been reserved."}
          </Text>
        ) : (
          <Text style={{ color: "#6b7280", marginTop: 12 }}>
            {t("pages.booked.note") || "Press OK to reserve this product."}
          </Text>
        )}

        {error ? (
          <Text style={{ color: "#b91c1c", marginTop: 12 }}>{String(error)}</Text>
        ) : null}

        {/* Примечание под формой */}
        <View
          style={{
            backgroundColor: "#eff6ff",
            borderColor: "#bfdbfe",
            borderWidth: 1,
            borderRadius: 12,
            padding: 10,
            marginTop: 16,
          }}
        >
          <Text style={{ color: "#1e3a8a" }}>
            {t("pages.booked.cancelNote") ||
              "If you decide to cancel the reservation, please notify the Master via any contact listed on their profile. Or write to us at support@sandifund.com."}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

