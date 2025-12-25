// expense-app/app/index.tsx
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/theme"; // Fixed import name

export default function Index() {
  const { isLoading, isAuthenticated } = useAuth();

  // 1. Show loading spinner while checking storage
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // 2. If logged in, go to Dashboard
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  // 3. If not logged in, go to Splash
  return <Redirect href="/(auth)/splash" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
});
