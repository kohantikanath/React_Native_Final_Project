// expense-app/app/(auth)/splash.tsx
import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../../constants/theme";
import { StatusBar } from "expo-status-bar";

export default function Splash() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* 1. Illustration Area */}
      <View style={styles.imageContainer}>
        {/* Replace this with your specific 3D illustration later */}
        <Image
          source={require("../../assets/images/onboarding-sc.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* 2. Text Content Area */}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          Always take control{"\n"}of your finances
        </Text>

        <Text style={styles.subtitle}>
          Finances must be arranged to set a better lifestyle in future
        </Text>

        {/* 3. Get Started Button */}
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  imageContainer: {
    flex: 0.6, 
    justifyContent: "center",
    alignItems: "center",
    padding: SIZES.padding,
  },
  image: {
    width: "200%",
    height: undefined,
    aspectRatio: 1, 
    maxHeight: 360, 
    resizeMode: "contain",
  },
  contentContainer: {
    flex: 0.4, // Takes up bottom 40%
    paddingHorizontal: SIZES.padding * 1.5,
    justifyContent: "flex-start",
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 30, // Fully rounded pills
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "700",
  },
});
