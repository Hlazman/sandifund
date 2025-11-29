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
import Fonds from "./src/screens/Fonds";
import Goods from "./src/screens/Goods";
import FAQ from "./src/screens/FAQ";
import ForgotPassword from "./src/screens/ForgotPassword";
import ResetPassword from "./src/screens/ResetPassword";
import ChangePassword from "./src/screens/ChangePassword";
import EmailConfirmation from "./src/screens/EmailConfirmation";
import CheckEmail from "./src/screens/CheckEmail";
import Auth from "./src/screens/Auth";
import Terms from "./src/screens/Terms";
import Privacy from "./src/screens/Privacy";
import Masters from "./src/screens/Masters";
import MyGoods from "./src/screens/MyGoods";
import Reports from "./src/screens/Reports";
import Master from "./src/screens/Master";

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
      Terms: "terms",
      Privacy: "privacy",
      MyGoods: "my-goods",
      Reports: "reports",

      Auth: "auth",
      ForgotPassword: "forgot-password",
      ResetPassword: { path: "reset-password", parse: { code: (v) => v } },
      EmailConfirmation: { path: "email-confirmation", parse: { confirmation: (v) => v } },
      CheckEmail: "check-email",
      Master: "master/:masterId",
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

function AuthedStack() {
  return (
    <Stack.Navigator screenOptions={{ header: ({ navigation }) => <Header navigation={navigation} /> }}>
      <Stack.Screen name="Sticers" component={Sticers} />
      <Stack.Screen name="Payment" component={Payment} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Funds" component={Fonds} />
      <Stack.Screen name="Fonds" component={Fonds} options={{ presentation: "card" }} />
      <Stack.Screen name="Goods" component={Goods} />
      <Stack.Screen name="Masters" component={Masters} />
      <Stack.Screen name="FAQ" component={FAQ} />
      <Stack.Screen name="Terms" component={Terms} />
      <Stack.Screen name="Privacy" component={Privacy} />
      <Stack.Screen name="MyGoods" component={MyGoods} />
      <Stack.Screen name="Reports" component={Reports} />
      <Stack.Screen name="Master" component={Master} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: true, title: "Change password" }} />
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
              <View style={{ flex: 1 }}>
                <RootNav />
              </View>
              <Footer />
            </LanguageProvider>
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </ApolloProvider>
  );
}
