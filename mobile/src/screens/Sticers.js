import React from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import Card from "../components/Card";
import { useNavigation } from "@react-navigation/native";

function rnd(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Sticers() {
  const navigation = useNavigation();

  const [seed] = React.useState(() => Math.random().toString(36).slice(2, 8));

  const product = React.useMemo(() => {
    const titles = ["Olive Wood Bowl", "Handmade Candle", "Ceramic Mug", "Linen Tote Bag", "Wool Scarf"];
    const descs = [
      "Eco-friendly and handcrafted with care.",
      "Limited batch. Natural materials only.",
      "Perfect as a gift. Dishwasher safe.",
      "Strong stitches and comfy long straps.",
      "Soft, warm and breathable. Unisex.",
    ];
    const statuses = ["в наличии", "забронировано", "куплено"];
    const prices = [149, 199, 249, 299, 349];
    const donations = [5, 10, 12, 15];

    return {
      variant: "product",
      title: rnd(titles) + " #" + seed.toUpperCase(),
      description: rnd(descs),
      price: rnd(prices),
      donationPercent: rnd(donations),
      status: rnd(statuses),
      master: {
        name: "Anna Master",
        onPress: () => navigation.navigate("Masters"),
        // image: "https://picsum.photos/seed/master/64", // когда появятся фото
      },
      image: null, // плейсхолдер "no image"
      onReserve: () => Alert.alert("Бронирование", "Заявка отправлена (демо)"),
    };
  }, [seed, navigation]);

  const fund = React.useMemo(() => {
    const titles = ["Helping Hands", "Bright Future", "Care & Share", "Sunrise Foundation", "Kind Hearts"];
    const descs = [
      "Supporting local communities with targeted aid.",
      "Education and mentorship programs for youth.",
      "Medical support for families in need.",
      "Emergency relief and recovery assistance.",
      "Cultural and social inclusion initiatives.",
    ];
    const phones = ["+972 54-111-2233", "+972 52-444-5566", "+972 53-777-8899"];
    const totals = [2500, 7630, 12000, 540, 90550];

    return {
      variant: "fund",
      title: rnd(titles),
      description: rnd(descs),
      email: "info@sandifund.org",
      phone1: rnd(phones),
      phone2: Math.random() > 0.5 ? rnd(phones) : null,
      address: "Tel Aviv - Yafo, Israel",
      whatsapp: "+972 541112233",
      totalDonations: rnd(totals),
      website: "https://example.org",
      reports: { screen: "Reports"}, // кнопка ведёт на экран Reports
      logo: null, // плейсхолдер
    };
  }, []);

  const sticker = React.useMemo(() => {
    const titles = ["Cats Party", "Sunny Day", "Pixel Hearts", "Coffee Time", "Good Vibes"];
    const descs = [
      "Cute stickers for daily chats.",
      "Minimal, clean and fun.",
      "Retro pixel-art style pack.",
      "Perfect for coffee lovers.",
      "Spread positivity in your messages.",
    ];
    return {
      variant: "sticker",
      title: rnd(titles),
      description: rnd(descs),
      image: null, // плейсхолдер
      link: "https://example.org/stickers",
    };
  }, []);

    return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      persistentScrollbar={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
        paddingBottom: 80, // ⬅️ запас под Footer, чтобы не перекрывал последнюю карточку
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 4 }}>
        Sticers (демо карточек)
      </Text>

      <Card {...product} onNavigate={(screen) => navigation.navigate(screen)} />
      <Card {...fund} onNavigate={(screen) => navigation.navigate(screen)} />
      <Card {...sticker} />
    </ScrollView>
  );
}
