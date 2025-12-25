import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants/theme";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function EditProfile() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(false);

  // Pre-fill with current data
  const [name, setName] = useState(user?.name || "");
  const [currency, setCurrency] = useState<string>("USD");
  const [limit, setLimit] = useState<string>("");

  useEffect(() => {
    if (user) {
      setCurrency(user.currency || "USD");
      setLimit(
        user.monthlyLimit !== undefined ? user.monthlyLimit.toString() : ""
      );
    }
  }, [user]);

  const handleSave = async () => {
    if (!name) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      // 1. Prepare Payload
      const payload = {
        name,
        currency,
        monthlyLimit: limit ? parseFloat(limit) : 0, // Send 0 if empty
      };

      // 2. Call Backend
      const response = await api.put("/auth/profile", payload);

      // 3. Update Local Context
      const updatedUser = response.data.user;
      const token = await import(
        "@react-native-async-storage/async-storage"
      ).then((module) => module.default.getItem("token"));

      if (token) {
        await login(token, updatedUser);
      }

      Alert.alert("Success", "Profile updated!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error("Update Error:", error);
      Alert.alert("Error", "Could not update profile");
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Name Input */}
        <Text style={styles.label}>Full Name</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color={COLORS.textSecondary}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Currency Input */}
        <Text style={styles.label}>Currency (e.g. USD, EUR)</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="cash-outline"
            size={20}
            color={COLORS.textSecondary}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={currency}
            onChangeText={setCurrency}
            placeholder="USD"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* NEW: Monthly Budget Limit Input */}
        <Text style={styles.label}>Monthly Budget Limit</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={20}
            color={COLORS.textSecondary}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={limit}
            onChangeText={setLimit}
            placeholder="0.00"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="numeric"
          />
        </View>
        <Text style={styles.helperText}>Set to 0 to disable warnings.</Text>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.black} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
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
  content: {
    marginTop: 20,
  },
  label: {
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginTop: 10,
    fontSize: 14,
  },
  helperText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 5,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  saveButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: "bold",
  },
});
