// import React from "react";
// import "react-native-gesture-handler";
// import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// import { NavigationContainer } from "@react-navigation/native";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import { ApolloProvider } from "@apollo/client/react";
// import client from "./src/api/apolloClient";
// import { Platform } from "react-native";

// import { AuthProvider, useAuth } from "./src/context/AuthContext";
// import { LanguageProvider } from "./src/context/LanguageContext";

// import Header from "./src/components/Header";
// import Footer from "./src/components/Footer";

// // авторизованные
// import Sticers from "./src/screens/Sticers";
// import Payment from "./src/screens/Payment";
// import Profile from "./src/screens/Profile";
// import Fonds from "./src/screens/Fonds";
// import Goods from "./src/screens/Goods";
// import FAQ from "./src/screens/FAQ";
// import Orders from "./src/screens/Orders";
// import ForgotPassword from "./src/screens/ForgotPassword";
// import ResetPassword from "./src/screens/ResetPassword";
// import EmailConfirmation from "./src/screens/EmailConfirmation";
// import CheckEmail from "./src/screens/CheckEmail";

// // неавторизованные
// import Auth from "./src/screens/Auth";
// import Terms from "./src/screens/Terms";
// import Privacy from "./src/screens/Privacy";

// const Stack = createNativeStackNavigator();

// // URL ↔︎ экраны (для web, чтобы после refresh попадать на ту же страницу)
// const linking = {
//   prefixes: Platform.OS === "web" ? [window.location.origin] : ["sandifund://"],
//   config: {
//     screens: {
//       Sticers: "sticers",
//       Payment: "payment",
//       Profile: "profile",
//       Fonds: "fonds",
//       Goods: "goods",
//       FAQ: "faq",
//       Orders: "orders",
//       Terms: "terms",
//       Privacy: "privacy",
//       Auth: "auth",
//       ForgotPassword: "forgot-password",
//       ResetPassword: {
//         path: "reset-password",
//         parse: { code: (v) => v },
//       },
//       EmailConfirmation: {
//         path: "email-confirmation",
//         parse: { confirmation: (v) => v },
//       },
//       CheckEmail: "check-email",
//     },
//   },
// };

// function AuthedStack() {
//   return (
//     <Stack.Navigator screenOptions={{ header: ({ navigation }) => <Header navigation={navigation} /> }}>
//       <Stack.Screen name="Sticers" component={Sticers} />
//       <Stack.Screen name="Payment" component={Payment} />
//       <Stack.Screen name="Profile" component={Profile} />
//       <Stack.Screen name="Fonds" component={Fonds} />
//       <Stack.Screen name="Goods" component={Goods} />
//       <Stack.Screen name="FAQ" component={FAQ} />
//       <Stack.Screen name="Orders" component={Orders} />
//       <Stack.Screen name="Terms" component={Terms} />
//       <Stack.Screen name="Privacy" component={Privacy} />
//     </Stack.Navigator>
//   );
// }

// function UnauthedStack() {
//   return (
//     <Stack.Navigator screenOptions={{ header: ({ navigation }) => <Header navigation={navigation} /> }}>
//       <Stack.Screen name="Auth" component={Auth} />
//       <Stack.Screen name="Terms" component={Terms} />
//       <Stack.Screen name="Privacy" component={Privacy} />
//       <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
//       <Stack.Screen name="ResetPassword" component={ResetPassword} />
//       <Stack.Screen name="EmailConfirmation" component={EmailConfirmation} />
//       <Stack.Screen name="CheckEmail" component={CheckEmail} />
//     </Stack.Navigator>
//   );
// }

// function RootNav() {
//   const { isAuthed, ready } = useAuth();
//   if (!ready) return null;

//   // сохраняем состояние навигации только на web
//   const navKey = React.useMemo(
//     () => (isAuthed ? "sf_nav_state_authed" : "sf_nav_state_unauthed"),
//     [isAuthed]
//   );

//   const [initialState, setInitialState] = React.useState();
//   const [isReady, setIsReady] = React.useState(false);

//   React.useEffect(() => {
//     let mounted = true;
//     (async () => {
//       try {
//         let useSavedState = true;
//         if (Platform.OS === "web") {
//           const path = window.location.pathname || "/";
//           if (path && path !== "/") useSavedState = false; // если явный URL — доверяем ему
//         }

//         if (Platform.OS === "web" && useSavedState) {
//           try {
//             const json = localStorage.getItem(navKey);
//             if (mounted && json) setInitialState(JSON.parse(json));
//           } catch {}
//         }
//       } finally {
//         if (mounted) setIsReady(true);
//       }
//     })();
//     return () => { mounted = false; };
//   }, [navKey]);

//   if (!isReady) return null;

//   return (
//     <NavigationContainer
//       linking={linking}
//       initialState={initialState}
//       onStateChange={(state) => {
//         if (Platform.OS === "web") {
//           try { localStorage.setItem(navKey, JSON.stringify(state)); } catch {}
//         }
//       }}
//     >
//       {isAuthed ? <AuthedStack /> : <UnauthedStack />}
//     </NavigationContainer>
//   );
// }

// export default function App() {
//   return (
//     <ApolloProvider client={client}>
//       <SafeAreaProvider>
//         <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
//           <AuthProvider>
//             <LanguageProvider>
//               <RootNav />
//               <Footer />
//             </LanguageProvider>
//           </AuthProvider>
//         </SafeAreaView>
//       </SafeAreaProvider>
//     </ApolloProvider>
//   );
// }


import React from "react";
import "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApolloProvider } from "@apollo/client/react";
import client from "./src/api/apolloClient";
import { Platform, View, Text } from "react-native";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { LanguageProvider } from "./src/context/LanguageContext";

import Header from "./src/components/Header";
import Footer from "./src/components/Footer";

// авторизованные
import Sticers from "./src/screens/Sticers";
import Payment from "./src/screens/Payment";
import Profile from "./src/screens/Profile";
import Fonds from "./src/screens/Fonds"; // используем тот же компонент, но маршрут называется "Funds"
import Goods from "./src/screens/Goods";
import FAQ from "./src/screens/FAQ";
import Orders from "./src/screens/Orders";
import ForgotPassword from "./src/screens/ForgotPassword";
import ResetPassword from "./src/screens/ResetPassword";
import EmailConfirmation from "./src/screens/EmailConfirmation";
import CheckEmail from "./src/screens/CheckEmail";

// неавторизованные
import Auth from "./src/screens/Auth";
import Terms from "./src/screens/Terms";
import Privacy from "./src/screens/Privacy";

// новые экраны
import Masters from "./src/screens/Masters";
import MyGoods from "./src/screens/MyGoods";
import Reports from "./src/screens/Reports";

const Stack = createNativeStackNavigator();

// URL ↔︎ экраны (для web, чтобы после refresh попадать на ту же страницу)
const linking = {
  prefixes: Platform.OS === "web" ? [window.location.origin] : ["sandifund://"],
  config: {
    screens: {
      Sticers: "sticers",
      Payment: "payment",
      Profile: "profile",
      Funds: "funds",
      // legacy-алиас (по желанию можно удалить позже)
      Fonds: "fonds",
      Goods: "goods",
      Masters: "masters",
      FAQ: "faq",
      Orders: "orders",
      Terms: "terms",
      Privacy: "privacy",
      MyGoods: "my-goods",
      Reports: "reports",

      Auth: "auth",
      ForgotPassword: "forgot-password",
      ResetPassword: { path: "reset-password", parse: { code: (v) => v } },
      EmailConfirmation: { path: "email-confirmation", parse: { confirmation: (v) => v } },
      CheckEmail: "check-email",
    },
  },
};

// нормализуем роли
function useRoleNames() {
  const { isAuthed, roles, user } = useAuth();
  const raw = roles ?? user?.roles ?? (user?.role ? [user.role] : []);
  const roleNames = (Array.isArray(raw) ? raw : [raw])
    .filter(Boolean)
    .map((r) => (typeof r === "string" ? r : r?.name || r?.type || ""))
    .map((s) => s.toLowerCase());
  if (isAuthed && !roleNames.length) roleNames.push("authenticated");
  return roleNames;
}

// простой guard по ролям
function RequireRoles({ allowed = [], children }) {
  const roleNames = useRoleNames();
  const ok = allowed.length === 0 || allowed.some((a) => roleNames.includes(a.toLowerCase()));
  if (ok) return children;
  return (
    <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827", textAlign: "center" }}>
          Access restricted
        </Text>
        <Text style={{ marginTop: 6, fontSize: 14, color: "#6b7280", textAlign: "center" }}>
          Your role doesn’t allow opening this screen.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function AuthedStack() {
  return (
    <Stack.Navigator screenOptions={{ header: ({ navigation }) => <Header navigation={navigation} /> }}>
      <Stack.Screen name="Sticers" component={Sticers} />
      <Stack.Screen name="Payment" component={Payment} />
      <Stack.Screen name="Profile" component={Profile} />

      {/* Переименование Fonds → Funds (видимый маршрут) */}
      <Stack.Screen name="Funds" component={Fonds} />
      {/* Легаси-роут, чтобы старые deeplink-и не сломались */}
      <Stack.Screen name="Fonds" component={Fonds} options={{ presentation: "card" }} />

      <Stack.Screen name="Goods" component={Goods} />
      <Stack.Screen name="Masters" component={Masters} />
      <Stack.Screen name="FAQ" component={FAQ} />
      <Stack.Screen name="Terms" component={Terms} />
      <Stack.Screen name="Privacy" component={Privacy} />

      {/* Ролевые экраны */}
      <Stack.Screen name="MyGoods">
        {() => (
          <RequireRoles allowed={["free", "masters", "authenticated"]}>
            <MyGoods />
          </RequireRoles>
        )}
      </Stack.Screen>

      <Stack.Screen name="Orders">
        {() => (
          <RequireRoles allowed={["free", "authenticated"]}>
            <Orders />
          </RequireRoles>
        )}
      </Stack.Screen>

      {/* Не в меню */}
      <Stack.Screen name="Reports" component={Reports} />
    </Stack.Navigator>
  );
}

function UnauthedStack() {
  return (
    <Stack.Navigator screenOptions={{ header: ({ navigation }) => <Header navigation={navigation} /> }}>
      <Stack.Screen name="Auth" component={Auth} />
      <Stack.Screen name="Terms" component={Terms} />
      <Stack.Screen name="Privacy" component={Privacy} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPassword" component={ResetPassword} />
      <Stack.Screen name="EmailConfirmation" component={EmailConfirmation} />
      <Stack.Screen name="CheckEmail" component={CheckEmail} />
    </Stack.Navigator>
  );
}

function RootNav() {
  const { isAuthed, ready } = useAuth();
  if (!ready) return null;

  // сохраняем состояние навигации только на web
  const navKey = React.useMemo(
    () => (isAuthed ? "sf_nav_state_authed" : "sf_nav_state_unauthed"),
    [isAuthed]
  );

  const [initialState, setInitialState] = React.useState();
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        let useSavedState = true;
        if (Platform.OS === "web") {
          const path = window.location.pathname || "/";
          if (path && path !== "/") useSavedState = false; // если явный URL — доверяем ему
        }

        if (Platform.OS === "web" && useSavedState) {
          try {
            const json = localStorage.getItem(navKey);
            if (mounted && json) setInitialState(JSON.parse(json));
          } catch {}
        }
      } finally {
        if (mounted) setIsReady(true);
      }
    })();
    return () => { mounted = false; };
  }, [navKey]);

  if (!isReady) return null;

  return (
    <NavigationContainer
      linking={linking}
      initialState={initialState}
      onStateChange={(state) => {
        if (Platform.OS === "web") {
          try { localStorage.setItem(navKey, JSON.stringify(state)); } catch {}
        }
      }}
    >
      {isAuthed ? <AuthedStack /> : <UnauthedStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ApolloProvider client={client}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
          <AuthProvider>
            <LanguageProvider>
              <RootNav />
              <Footer />
            </LanguageProvider>
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </ApolloProvider>
  );
}
