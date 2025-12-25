// expense-app/app/expense-details/[id].tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS, SIZES } from "../../constants/theme";
import api from "../../services/api";

export default function EditTransaction() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get the ID from the URL
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"Expense" | "Income">("Expense");
  const [date, setDate] = useState(new Date());

  // Wallet & Category State
  const [category, setCategory] = useState("");
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);

  // Modals
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [walletModalVisible, setWalletModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const expenseCategories = [
    "Food",
    "Transport",
    "Shopping",
    "Entertainment",
    "Health",
    "Bills",
    "Education",
    "Other",
  ];
  const incomeCategories = [
    "Salary",
    "Freelancing",
    "Investment",
    "Gift",
    "Rental",
    "Other",
  ];
  const currentCategories =
    type === "Expense" ? expenseCategories : incomeCategories;

  // 1. Fetch Data on Load
  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      // Fetch Wallets first
      const walletRes = await api.get("/wallets");
      setWallets(walletRes.data.wallets);

      // Fetch Expense Details
      const response = await api.get(`/expenses/${id}`);
      const expense = response.data.expense;

      // Populate Form
      setAmount(expense.amount.toString());
      setDescription(expense.description);
      setType(expense.type || "Expense");
      setCategory(expense.category);
      setDate(new Date(expense.date));

      // Find and set wallet if it exists
      if (expense.wallet) {
        const foundWallet = walletRes.data.wallets.find(
          (w: any) => w._id === expense.wallet
        );
        setSelectedWallet(foundWallet || null);
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch transaction details");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!amount) {
      Alert.alert("Error", "Please enter an amount");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        category,
        description,
        type,
        wallet: selectedWallet ? selectedWallet._id : null,
        date: date,
      };

      await api.put(`/expenses/${id}`, payload);

      Alert.alert("Success", "Transaction updated!", [
        { text: "OK", onPress: () => router.back() }, // Go back to dashboard
      ]);
    } catch (error) {
      Alert.alert("Error", "Could not update transaction");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/expenses/${id}`);
            router.back();
          } catch (error) {
            Alert.alert("Error", "Could not delete transaction");
          }
        },
      },
    ]);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
    if (Platform.OS === "android") setShowDatePicker(false);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Details</Text>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteIcon}>
            <Ionicons name="trash-outline" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {/* Type Selector (Read Only or Editable? Let's keep it editable) */}
        <Text style={styles.label}>Type</Text>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "Expense" && styles.activeTypeRed,
            ]}
            onPress={() => setType("Expense")}
          >
            <Text
              style={[
                styles.typeText,
                type === "Expense" && styles.activeTypeText,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === "Income" && styles.activeTypeGreen,
            ]}
            onPress={() => setType("Income")}
          >
            <Text
              style={[
                styles.typeText,
                type === "Income" && styles.activeTypeText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={COLORS.textSecondary}
            style={styles.icon}
          />
          <Text style={styles.inputText}>
            {date.toLocaleDateString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
            themeVariant="dark"
          />
        )}

        {/* Wallet Selector */}
        <Text style={styles.label}>Wallet / Folder</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setWalletModalVisible(true)}
        >
          <Ionicons
            name="wallet-outline"
            size={20}
            color={COLORS.textSecondary}
            style={styles.icon}
          />
          <Text style={styles.inputText}>
            {selectedWallet ? selectedWallet.name : "No Folder"}
          </Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={COLORS.textSecondary}
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        {/* Amount Input */}
        <Text style={styles.label}>Amount</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="logo-usd"
            size={20}
            color={COLORS.textSecondary}
            style={styles.icon}
          />
          <TextInput
            placeholder="0"
            placeholderTextColor={COLORS.textSecondary}
            style={styles.input}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Category Selector */}
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => setCategoryModalVisible(true)}
        >
          <Ionicons
            name="grid-outline"
            size={20}
            color={COLORS.textSecondary}
            style={styles.icon}
          />
          <Text style={styles.inputText}>{category}</Text>
          <Ionicons
            name="chevron-down"
            size={20}
            color={COLORS.textSecondary}
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>

        {/* Description Input */}
        <Text style={styles.label}>Description</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="create-outline"
            size={20}
            color={COLORS.textSecondary}
            style={styles.icon}
          />
          <TextInput
            placeholder="Description"
            placeholderTextColor={COLORS.textSecondary}
            style={styles.input}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleUpdate}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.black} />
          ) : (
            <Text style={styles.submitButtonText}>Update Transaction</Text>
          )}
        </TouchableOpacity>

        {/* Big Delete Button (Bottom) */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={submitting}
        >
          <Text style={styles.deleteButtonText}>Delete Transaction</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Wallet Modal */}
      <Modal
        visible={walletModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setWalletModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Wallet</Text>
            <TouchableOpacity
              style={[
                styles.modalItem,
                { borderBottomWidth: 1, borderColor: COLORS.border },
              ]}
              onPress={() => {
                setSelectedWallet(null);
                setWalletModalVisible(false);
              }}
            >
              <Text style={{ color: COLORS.textSecondary }}>No Folder</Text>
            </TouchableOpacity>
            <FlatList
              data={wallets}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedWallet(item);
                    setWalletModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setWalletModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={currentCategories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setCategory(item);
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setCategoryModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: SIZES.padding, paddingBottom: 50 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIcon: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: SIZES.h2, color: COLORS.white, fontWeight: "700" },
  label: {
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 16,
    fontSize: 14,
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
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: COLORS.white, fontSize: 16 },
  inputText: { flex: 1, color: COLORS.white, fontSize: 16 },
  typeContainer: { flexDirection: "row", marginBottom: 10, gap: 15 },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    alignItems: "center",
  },
  activeTypeRed: { backgroundColor: COLORS.error, borderColor: COLORS.error },
  activeTypeGreen: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  typeText: { color: COLORS.textSecondary, fontWeight: "600" },
  activeTypeText: { color: COLORS.white },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  submitButtonText: { color: COLORS.black, fontSize: 16, fontWeight: "bold" },
  deleteButton: {
    backgroundColor: "transparent",
    height: 56,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  deleteButtonText: { color: COLORS.error, fontSize: 16, fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemText: { color: COLORS.white, fontSize: 16 },
  closeButton: {
    marginTop: 20,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: COLORS.border,
    borderRadius: 12,
  },
  closeButtonText: { color: COLORS.white, fontWeight: "bold" },
});
