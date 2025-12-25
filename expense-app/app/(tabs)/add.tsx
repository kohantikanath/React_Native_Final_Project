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
import { useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import NetInfo from "@react-native-community/netinfo"; // Offline Check
import { COLORS, SIZES } from "../../constants/theme";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext"; // To get limit

export default function AddTransaction() {
  const router = useRouter();
  const { user } = useAuth(); // Get user for Monthly Limit

  const [loading, setLoading] = useState(false);

  // Form Fields
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"Expense" | "Income">("Expense");

  // Date State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Wallet Selection
  const [wallets, setWallets] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<any>(null);
  const [walletModalVisible, setWalletModalVisible] = useState(false);

  // Categories
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

  const [category, setCategory] = useState(expenseCategories[0]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Spending Tracking
  const [currentMonthSpend, setCurrentMonthSpend] = useState(0);

  // Fetch Wallets & Current Spending
  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          // 1. Get Wallets
          const walletRes = await api.get("/wallets");
          setWallets(walletRes.data.wallets);

          // 2. Get Expenses to calculate current month total
          const expRes = await api.get("/expenses");
          const expenses = expRes.data.expenses;

          const thisMonth = new Date().getMonth();
          const thisYear = new Date().getFullYear();

          const total = expenses
            .filter((e: any) => {
              const d = new Date(e.date);
              return (
                d.getMonth() === thisMonth &&
                d.getFullYear() === thisYear &&
                (e.type || "Expense") === "Expense"
              );
            })
            .reduce((sum: number, e: any) => sum + e.amount, 0);

          setCurrentMonthSpend(total);
        } catch (error) {
          console.error("Failed to load initial data");
        }
      };
      fetchData();
    }, [])
  );

  useEffect(() => {
    setCategory(
      type === "Expense" ? expenseCategories[0] : incomeCategories[0]
    );
  }, [type]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
    if (Platform.OS === "android") setShowDatePicker(false);
  };

  const handleSaveAttempt = async () => {
    if (!amount) {
      Alert.alert("Error", "Please enter an amount");
      return;
    }

    // 1. Check Offline Status (The "Easy Way")
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      Alert.alert(
        "Offline",
        "You cannot add expenses while offline. Please connect to the internet."
      );
      return;
    }

    // 2. Check Monthly Limit (The "Bonus Feature")
    const newAmount = parseFloat(amount);
    const limit = user?.monthlyLimit ?? 0;

    if (
      type === "Expense" &&
      limit > 0 &&
      currentMonthSpend + newAmount > limit
    ) {
      Alert.alert(
        "⚠️ Overspending Warning!",
        `This expense puts you over your monthly limit of $${limit}.\n\nCurrent Total: $${currentMonthSpend}\nNew Total: $${
          currentMonthSpend + newAmount
        }`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Anyway",
            style: "destructive",
            onPress: async () => await processTransaction(),
          },
        ]
      );
    } else {
      // No limit issues, proceed directly
      await processTransaction();
    }
  };

  const processTransaction = async () => {
    setLoading(true);
    try {
      const payload = {
        amount: parseFloat(amount),
        category,
        description,
        paymentMethod: "Cash",
        date: date,
        localId: Math.random().toString(36).substring(7),
      };

      await api.post("/expenses", payload);

      Alert.alert("Success", "Transaction saved!", [
        { text: "OK", onPress: () => router.push("/(tabs)") },
      ]);
    } catch (error: any) {
      console.error("Save Error:", error);
      Alert.alert("Error", "Could not save transaction");
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Type Selector */}
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
          <Ionicons
            name="chevron-down"
            size={20}
            color={COLORS.textSecondary}
            style={{ marginLeft: "auto" }}
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
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
            {selectedWallet ? selectedWallet.name : "No Folder (General)"}
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
        <Text style={styles.label}>Description (Optional)</Text>
        <View style={styles.inputContainer}>
          <Ionicons
            name="create-outline"
            size={20}
            color={COLORS.textSecondary}
            style={styles.icon}
          />
          <TextInput
            placeholder="What was this for?"
            placeholderTextColor={COLORS.textSecondary}
            style={styles.input}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSaveAttempt}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.black} />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
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
              <Text style={{ color: COLORS.textSecondary }}>
                No Folder (General)
              </Text>
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
  scrollContent: { padding: SIZES.padding },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
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
  headerTitle: { fontSize: SIZES.h2, color: COLORS.white, fontWeight: "700" },
  label: {
    color: COLORS.textSecondary,
    marginBottom: 10,
    marginTop: 10,
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
    marginBottom: 10,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: COLORS.white, fontSize: 16 },
  inputText: { flex: 1, color: COLORS.white, fontSize: 16 },
  typeContainer: { flexDirection: "row", marginBottom: 20, gap: 15 },
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
    flexDirection: "row",
    justifyContent: "space-between",
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
