import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { COLORS, SIZES } from "../../constants/theme";
import api from "../../services/api";

export default function Wallet() {
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState<any[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);

  // Create wallet
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newWalletName, setNewWalletName] = useState("");
  const [newWalletBalance, setNewWalletBalance] = useState("");

  // Edit wallet
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [editedAmount, setEditedAmount] = useState("");
  const [editedName, setEditedName] = useState("");

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const response = await api.get("/wallets");
      const data = response.data.wallets;

      setWallets(data);
      const total = data.reduce(
        (sum: number, w: any) => sum + w.currentBalance,
        0
      );
      setTotalBalance(total);
    } catch (error) {
      console.error("Wallet Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createWallet = async () => {
    if (!newWalletName) {
      Alert.alert("Error", "Please enter wallet name");
      return;
    }

    try {
      await api.post("/wallets", {
        name: newWalletName,
        initialBalance: parseFloat(newWalletBalance) || 0,
        icon: "wallet",
        color: COLORS.primary,
      });

      setCreateModalVisible(false);
      setNewWalletName("");
      setNewWalletBalance("");
      fetchWallets();
    } catch {
      Alert.alert("Error", "Could not create wallet");
    }
  };

  const updateWallet = async () => {
    if (!selectedWallet) return;

    try {
      await api.put(`/wallets/${selectedWallet._id}`, {
        name: editedName,
        currentBalance: parseFloat(editedAmount),
      });

      setEditModalVisible(false);
      setSelectedWallet(null);
      fetchWallets();
    } catch {
      Alert.alert("Error", "Could not update wallet");
    }
  };

  const deleteWallet = async () => {
    if (!selectedWallet) return;

    Alert.alert(
      "Delete Wallet",
      "Are you sure you want to delete this wallet?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/wallets/${selectedWallet._id}`);
              setEditModalVisible(false);
              setSelectedWallet(null);
              fetchWallets();
            } catch {
              Alert.alert("Error", "Could not delete wallet");
            }
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchWallets();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wallets</Text>
        <TouchableOpacity onPress={() => setCreateModalVisible(true)}>
          <Ionicons name="add-circle" size={32} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Total Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>$ {totalBalance.toFixed(2)}</Text>
      </View>

      {/* Wallet List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchWallets}
            tintColor={COLORS.primary}
          />
        }
      >
        <Text style={styles.sectionTitle}>Your Wallets</Text>

        {wallets.map((wallet) => (
          <TouchableOpacity
            key={wallet._id}
            style={styles.walletItem}
            activeOpacity={0.8}
            onPress={() => {
              setSelectedWallet(wallet);
              setEditedAmount(wallet.currentBalance.toString());
              setEditedName(wallet.name);
              setEditModalVisible(true);
            }}
          >
            <View style={styles.walletIconBox}>
              <Ionicons name="wallet" size={24} color={COLORS.black} />
            </View>

            <View style={styles.walletDetails}>
              <Text style={styles.walletName}>{wallet.name}</Text>
              <Text style={styles.walletSubtitle}>Current Balance</Text>
            </View>

            <Text style={styles.walletAmount}>
              $ {wallet.currentBalance.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Create Wallet Modal */}
      <Modal transparent animationType="slide" visible={createModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Wallet</Text>

            <TextInput
              style={styles.input}
              placeholder="Wallet Name"
              placeholderTextColor={COLORS.textSecondary}
              value={newWalletName}
              onChangeText={setNewWalletName}
            />

            <TextInput
              style={styles.input}
              placeholder="Initial Balance"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="numeric"
              value={newWalletBalance}
              onChangeText={setNewWalletBalance}
            />

            <TouchableOpacity style={styles.saveButton} onPress={createWallet}>
              <Text style={styles.saveButtonText}>Create</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCreateModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Wallet Modal */}
      <Modal transparent animationType="slide" visible={editModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Wallet</Text>

            <TextInput
              style={styles.input}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Wallet Name"
              placeholderTextColor={COLORS.textSecondary}
            />

            <TextInput
              style={styles.input}
              value={editedAmount}
              onChangeText={setEditedAmount}
              keyboardType="numeric"
              placeholder="Amount"
              placeholderTextColor={COLORS.textSecondary}
            />

            <TouchableOpacity style={styles.saveButton} onPress={updateWallet}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={deleteWallet}
            >
              <Text style={styles.deleteButtonText}>Delete Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  headerTitle: {
    fontSize: SIZES.h2,
    color: COLORS.white,
    fontWeight: "700",
  },
  balanceCard: { alignItems: "center", marginBottom: 30 },
  balanceLabel: { color: COLORS.textSecondary },
  balanceAmount: { fontSize: 40, fontWeight: "700", color: COLORS.white },
  scrollContent: { paddingBottom: 60 },
  sectionTitle: {
    fontSize: SIZES.h3,
    color: COLORS.white,
    fontWeight: "700",
    marginBottom: 16,
  },
  walletItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  walletIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  walletDetails: { flex: 1 },
  walletName: { color: COLORS.white, fontWeight: "600", fontSize: 16 },
  walletSubtitle: { color: COLORS.textSecondary, fontSize: 12 },
  walletAmount: { color: COLORS.white, fontWeight: "700" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    color: COLORS.white,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: { color: COLORS.black, fontWeight: "bold" },
  deleteButton: {
    backgroundColor: COLORS.error,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  deleteButtonText: { color: COLORS.white, fontWeight: "bold" },
  cancelButton: { padding: 16, alignItems: "center" },
  cancelButtonText: { color: COLORS.textSecondary },
});
