// import React from "react";
// import { View, Text, Linking } from "react-native";

// export default function Footer() {
//   return (
//     <View
//       style={{
//         height: 48,
//         borderTopWidth: 1,
//         borderTopColor: "#e5e7eb",
//         backgroundColor: "#fff",
//         alignItems: "center",
//         justifyContent: "center",
//         paddingHorizontal: 16,
//       }}
//     >
//       <Text style={{ fontSize: 14 }} numberOfLines={1}>
//         Create by{" "}
//         <Text
//           style={{ textDecorationLine: "none", fontWeight: "500", color: '#646cfd', }}
//           onPress={() => Linking.openURL("https://sandifund.com/")}
//         >
//           Sandifund
//         </Text>
//       </Text>
//     </View>
//   );
// }

import React from "react";
import { View, Text, Linking } from "react-native";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t, dir } = useLanguage();
  return (
    <View
      style={{
        height: 48,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
      }}
    >
      <Text style={{ fontSize: 14, textAlign: dir === "rtl" ? "right" : "left" }} numberOfLines={1}>
        {t("footer.createdBy")}{" "}
        <Text
          style={{ textDecorationLine: "none", fontWeight: "500", color: "#646cfd" }}
          onPress={() => Linking.openURL("https://sandifund.com/")}
        >
          {t("footer.brand")}
        </Text>
      </Text>
    </View>
  );
}
