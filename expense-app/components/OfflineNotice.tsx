import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { COLORS } from "../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function OfflineNotice() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // If state.isConnected is null, assume we are online (optimistic)
      setIsConnected(state.isConnected !== false);
    });
    return () => unsubscribe();
  }, []);

  if (isConnected) return null; // Hide if online

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.offlineContainer}>
        <Text style={styles.offlineText}>No Internet Connection</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.error, zIndex: 9999 },
  offlineContainer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.error,
    width,
  },
  offlineText: { color: "#fff", fontWeight: "bold" },
});
