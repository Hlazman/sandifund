import React from "react";
import "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ApolloProvider } from "@apollo/client/react"; // важно: /react
import client from "./src/api/apolloClient";
import { LanguageProvider } from "./src/context/LanguageContext";

import Header from "./src/components/Header";
import Footer from "./src/components/Footer";

// базовые экраны
import Sticers from "./src/screens/Sticers";
import Payment from "./src/screens/Payment";

// новые экраны
import Profile from "./src/screens/Profile";
import Fonds from "./src/screens/Fonds";
import Goods from "./src/screens/Goods";
import FAQ from "./src/screens/FAQ";
import Orders from "./src/screens/Orders";
import Auth from "./src/screens/Auth";
import Terms from "./src/screens/Terms";
import Privacy from "./src/screens/Privacy";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ApolloProvider client={client}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
          <LanguageProvider>
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  header: ({ navigation }) => <Header navigation={navigation} />,
                }}
              >
                {/* существующие */}
                <Stack.Screen name="Sticers" component={Sticers} />
                <Stack.Screen name="Payment" component={Payment} />

                {/* добавленные */}
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen name="Fonds" component={Fonds} />
                <Stack.Screen name="Goods" component={Goods} />
                <Stack.Screen name="FAQ" component={FAQ} />
                <Stack.Screen name="Orders" component={Orders} />
                <Stack.Screen name="Auth" component={Auth} />
                <Stack.Screen name="Terms" component={Terms} />
                <Stack.Screen name="Privacy" component={Privacy} />
              </Stack.Navigator>
            </NavigationContainer>
            <Footer />
          </LanguageProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </ApolloProvider>
  );
}
