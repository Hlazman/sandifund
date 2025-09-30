
// import React from "react";
// import Card from "../components/Card";

// export default function Sticers() {
//   return (
//     <div className="max-w-5xl mx-auto p-4">
//       <Card title="Sticers (Главная)">
//         <p className="text-sm opacity-80">
//           Здесь будет логика стикеров и подписок.
//         </p>
//       </Card>
//     </div>
//   );
// }

import React from "react";
import Card from "../components/Card";
import { Link } from "react-router-dom";

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function Sticers() {
  // Рандомные данные (мемоизируем, чтобы не прыгали при ререндере)
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
      title: randomItem(titles) + " #" + seed.toUpperCase(),
      description: randomItem(descs),
      price: randomItem(prices),
      donationPercent: randomItem(donations),
      status: randomItem(statuses),
      master: { name: "Anna Master", href: "/masters" },
      image: null, // как просили — вместо изображения "no image"
    };
  }, [seed]);

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
      title: randomItem(titles),
      description: randomItem(descs),
      email: "info@sandifund.org",
      phone1: randomItem(phones),
      phone2: Math.random() > 0.5 ? randomItem(phones) : null,
      address: "Tel Aviv - Yafo, Israel",
      whatsapp: "+972 541112233",
      totalDonations: randomItem(totals),
      website: "https://example.org",
      reports: { href: "/reports", label: "Reports" },
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
      title: randomItem(titles),
      description: randomItem(descs),
      image: null, // плейсхолдер
      link: "#",
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Sticers (демо карточек)</h1>
        <Link className="text-sm text-indigo-600 hover:underline" to="/funds">
          → к списку фондов
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card variant="product" {...product} />
        <Card variant="fund" {...fund} />
        <Card variant="sticker" {...sticker} />
      </div>
    </div>
  );
}
