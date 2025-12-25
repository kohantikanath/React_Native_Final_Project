import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";

export default function Settings() {
  const router = useRouter();

  // Dummy State for Toggles
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [sounds, setSounds] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>General</Text>

        <View style={styles.row}>
          <Text style={styles.rowText}>Push Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: COLORS.surface, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowText}>Sound Effects</Text>
          <Switch
            value={sounds}
            onValueChange={setSounds}
            trackColor={{ false: COLORS.surface, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Security</Text>

        <View style={styles.row}>
          <Text style={styles.rowText}>FaceID / TouchID</Text>
          <Switch
            value={biometric}
            onValueChange={setBiometric}
            trackColor={{ false: COLORS.surface, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>About</Text>
        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.rowText}>Terms of Service</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.rowText}>App Version</Text>
          <Text style={styles.versionText}>1.0.0</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: SIZES.h2,
    color: COLORS.white,
    fontWeight: "700",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  rowText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "500",
  },
  versionText: {
    color: COLORS.textSecondary,
  },
});
