import { AuthProvider } from "@/context/authContext";
import { Stack } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

const StackLayout = () => {
  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="(main)/profileModal" options={{presentation: "modal"}}/>
    <Stack.Screen name="(main)/newConversationModal" options={{presentation: "modal"}}/>
  </Stack>
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({});
