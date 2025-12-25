import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, SIZES } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.headerTitle}>Profile</Text>

      {/* 1. User Info Section */}
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          {/* Placeholder Avatar */}
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=12" }}
            style={styles.avatar}
          />
          <View style={styles.editIcon}>
            <Ionicons name="pencil" size={12} color={COLORS.white} />
          </View>
        </View>
        <Text style={styles.userName}>{user?.name || "User Name"}</Text>
        <Text style={styles.userEmail}>
          {user?.email || "email@example.com"}
        </Text>
      </View>

      {/* 2. Menu Options */}
      <View style={styles.menuContainer}>
        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/edit-profile")} // <--- Link Added
        >
          <View style={[styles.menuIconBox, { backgroundColor: "#E0E7FF" }]}>
            <Ionicons name="person" size={20} color="#4F46E5" />
          </View>
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/settings")} // <--- Link Added
        >
          <View style={[styles.menuIconBox, { backgroundColor: "#D1FAE5" }]}>
            <Ionicons name="settings" size={20} color="#059669" />
          </View>
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={[styles.menuIconBox, { backgroundColor: "#F3F4F6" }]}>
            <Ionicons name="lock-closed" size={20} color="#4B5563" />
          </View>
          <Text style={styles.menuText}>Privacy Policy</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={[styles.menuIconBox, { backgroundColor: "#FEE2E2" }]}>
            <Ionicons name="power" size={20} color={COLORS.error} />
          </View>
          <Text style={[styles.menuText, { color: COLORS.error }]}>Logout</Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={COLORS.textSecondary}
          />
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
  headerTitle: {
    fontSize: SIZES.h2,
    color: COLORS.white,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 20,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  menuContainer: {
    gap: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.white,
  },
});
