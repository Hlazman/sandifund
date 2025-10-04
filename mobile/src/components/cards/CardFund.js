import React from "react";
import { View, Text, Image } from "react-native";
import { useLanguage } from "../../context/LanguageContext";
import {
  CardWrap,
  Placeholder,
  Badge,
  Field,
  Button,
  openLink,
} from "./_CardParts";

export default function CardFund(props) {
  const {
    className, // совместимость, не используется
    title,
    logo,
    description,
    email,
    phone1,
    phone2,
    address,
    whatsapp, // "+972..." | "https://wa.me/..."
    totalDonations,
    website,
    reports, // { label?, href?, screen? }
    onNavigate, // (screenName) => void
  } = props;

  const { t } = useLanguage();
  const L = (k, fallback) => t(k) || fallback;

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
          <Placeholder aspectRatio={1} style={{ width: 72, height: 72, marginRight: 12 }} />
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
