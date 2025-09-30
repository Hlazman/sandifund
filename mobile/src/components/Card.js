import React from "react";
import {
  View,
  Text,
  Platform,
  Image,
  Pressable,
  Linking,
} from "react-native";
import { useLanguage } from "../context/LanguageContext";

/**
 * Универсальная карточка (mobile RN)
 * variant: "product" | "fund" | "sticker"
 * Доп. коллбеки:
 * - onNavigate?(screenName: string) — для внутренних переходов (например, Reports)
 */
export default function Card(props) {
  const {
    variant,
    title,
    description,
    image, // url | null => плейсхолдер "no image"
    className, // для совместимости, в RN не используется

    // product
    price,
    donationPercent,
    status,
    master, // { name, href?, image?, onPress? }
    reserveLabel,
    onReserve,

    // fund
    logo, // url | null
    email,
    phone1,
    phone2,
    address,
    whatsapp, // "+972..." | "https://wa.me/..."
    totalDonations,
    website,
    reports, // { label?, href?, screen? }

    // sticker
    link,

    // навигация
    onNavigate,

    // fallback
    children,
  } = props;

  const { t } = useLanguage();
  const L = (k, fallback) => t(k) || fallback;

  // --------- контейнер ----------
  const CardWrap = ({ children: c }) => (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        ...(Platform.OS === "web"
          ? { boxShadow: "0px 8px 16px rgba(0,0,0,0.06)" }
          : { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }),
      }}
    >
      {c}
    </View>
  );

  // --------- утилиты ----------
  const Placeholder = ({ aspectRatio = 4 / 3, text = "no image", style }) => (
    <View
      style={[
        {
          width: "100%",
          aspectRatio,
          backgroundColor: "#f3f4f6",
          borderWidth: 1,
          borderColor: "#e5e7eb",
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <Text style={{ color: "#6b7280" }}>{text}</Text>
    </View>
  );

  const MiniAvatar = ({ src, size = 24 }) =>
    src ? (
      <Image
        source={{ uri: src }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      />
    ) : null;

  const Badge = ({ color = "#e5e7eb", textColor = "#374151", children: c }) => (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: color,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ color: textColor, fontSize: 12, fontWeight: "600" }}>{c}</Text>
    </View>
  );

  const Field = ({ label, value, onPress, href }) => {
    if (!value) return null;
    const tappable = !!onPress || !!href;
    const open = async () => {
      if (onPress) return onPress();
      if (href) {
        try {
          await Linking.openURL(href);
        } catch {}
      }
    };
    return (
      <View style={{ flexDirection: "row", alignItems: "flex-start", marginTop: 6 }}>
        <Text style={{ color: "#6b7280", marginRight: 6 }}>{label}:</Text>
        {tappable ? (
          <Pressable onPress={open}>
            <Text style={{ color: "#4f46e5" }}>{value}</Text>
          </Pressable>
        ) : (
          <Text style={{ color: "#111827", flex: 1 }}>{value}</Text>
        )}
      </View>
    );
  };

  const Button = ({ title: txt, onPress }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: pressed ? "#4338ca" : "#4f46e5",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        alignSelf: "flex-start",
      })}
    >
      <Text style={{ color: "#fff", fontWeight: "600" }}>{txt}</Text>
    </Pressable>
  );

  const openLink = async (url) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {}
  };

  const statusKeyFrom = (s) => {
    const v = (s || "").toString().toLowerCase();
    if (!v) return null;
    if (v.includes("stock") || v.includes("налич")) return "inStock";
    if (v.includes("reserv") || v.includes("заброн")) return "reserved";
    if (v.includes("sold") || v.includes("куплен") || v.includes("bought") || v.includes("purchas")) return "sold";
    return null;
  };
  const statusKey = statusKeyFrom(status);
  const sc = (
    {
      inStock: { color: "#dcfce7", text: "#166534" },
      reserved: { color: "#fef3c7", text: "#92400e" },
      sold: { color: "#fee2e2", text: "#991b1b" },
    }[statusKey] || { color: "#f3f4f6", text: "#374151" }
  );
  const statusLabel = statusKey ? L(`card.product.status.${statusKey}`, status) : status;

  // --------- fallback старого Card ----------
  if (!variant) {
    return (
      <CardWrap>
        {title ? (
          <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8 }}>{title}</Text>
        ) : null}
        {children}
      </CardWrap>
    );
  }

  // --------- product ----------
  if (variant === "product") {
    return (
      <CardWrap>
        {/* картинка перед заголовком */}
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
            {master.onPress ? (
              <Pressable onPress={master.onPress}>
                <Text style={{ color: "#4f46e5" }}>{master.name}</Text>
              </Pressable>
            ) : master?.href ? (
              <Pressable onPress={() => openLink(master.href)}>
                <Text style={{ color: "#4f46e5" }}>{master.name}</Text>
              </Pressable>
            ) : (
              <Text style={{ color: "#111827" }}>{master.name}</Text>
            )}
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

  // --------- fund ----------
  if (variant === "fund") {
    const waHref = whatsapp
      ? whatsapp.startsWith("http")
        ? whatsapp
        : `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}`
      : undefined;

    return (
      <CardWrap>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {logo ? (
            <Image
              source={{ uri: logo }}
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
            <Placeholder
              aspectRatio={1}
              style={{ width: 72, height: 72, marginRight: 12 }}
            />
          )}

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }} numberOfLines={1}>
              {title || "Untitled fund"}
            </Text>
            {typeof totalDonations === "number" ? (
              <View style={{ marginTop: 6 }}>
                <Badge color="#e0e7ff" textColor="#3730a3">
                  {L("card.fund.donations", "Donations")}: {totalDonations}
                </Badge>
              </View>
            ) : null}
          </View>
        </View>

        {description ? (
          <Text style={{ color: "#374151", marginTop: 8 }}>{description}</Text>
        ) : null}

        <View style={{ marginTop: 6 }}>
          <Field label={L("card.fund.email", "Email")} value={email} href={email ? `mailto:${email}` : undefined} />
          <Field label={L("card.fund.phone1", "Phone 1")} value={phone1} href={phone1 ? `tel:${phone1}` : undefined} />
          <Field label={L("card.fund.phone2", "Phone 2")} value={phone2} href={phone2 ? `tel:${phone2}` : undefined} />
          <Field label={L("card.fund.address", "Address")} value={address} />
          <Field label={L("card.fund.whatsapp", "WhatsApp")} value={whatsapp} href={waHref} />
          <Field label={L("card.fund.website", "Website")} value={website} href={website} />
        </View>

        {reports ? (
          <View style={{ marginTop: 10 }}>
            <Button
              title={reports.label || L("card.fund.reports", "Reports")}
              onPress={() => {
                if (reports.screen && typeof onNavigate === "function") {
                  onNavigate(reports.screen);
                } else if (reports.href) {
                  openLink(reports.href);
                }
              }}
            />
          </View>
        ) : null}
      </CardWrap>
    );
  }

  // --------- sticker ----------
  if (variant === "sticker") {
    return (
      <CardWrap>
        {/* картинка перед заголовком */}
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

  // --------- safety ----------
  return (
    <CardWrap>
      <Text style={{ fontSize: 18, fontWeight: "700" }}>{title || "Card"}</Text>
      {description ? <Text style={{ color: "#374151", marginTop: 8 }}>{description}</Text> : null}
      {children}
    </CardWrap>
  );
}

