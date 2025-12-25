import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { COLORS, SIZES } from "../../constants/theme";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]); // <--- New State for filtering
  const [searchQuery, setSearchQuery] = useState(""); // <--- New State for text
  const [isSearching, setIsSearching] = useState(false); // <--- New State for toggle

  const [stats, setStats] = useState({
    balance: 0,
    income: 0,
    expense: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Try to get fresh data from Server
      const response = await api.get("/expenses");
      const data = response.data.expenses;

      // 2. SUCCESS: Save this data to local storage for later
      await AsyncStorage.setItem("cached_expenses", JSON.stringify(data));

      setExpenses(data);
      setFilteredExpenses(data);
      calculateStats(data);
    } catch (error) {
      // 3. ERROR (Offline): Try to load old data from storage
      console.log("Network failed, trying cache...");
      const cached = await AsyncStorage.getItem("cached_expenses");
      if (cached) {
        const data = JSON.parse(cached);
        setExpenses(data);
        setFilteredExpenses(data);
        calculateStats(data);
        // Optional: Show a small toast "Showing offline data"
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    let income = 0;
    let expense = 0;
    data.forEach((item: any) => {
      if (item.type === "Income") income += item.amount;
      else expense += item.amount;
    });
    setStats({ income, expense, balance: income - expense });
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // Search Logic
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const filtered = expenses.filter(
        (item) =>
          item.category.toLowerCase().includes(text.toLowerCase()) ||
          (item.description &&
            item.description.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredExpenses(filtered);
    } else {
      setFilteredExpenses(expenses);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* 1. Header (Dynamic: Shows Search Bar OR Greeting) */}
      <View style={styles.header}>
        {isSearching ? (
          // Search Bar View
          <View style={styles.searchBarContainer}>
            <TextInput
              placeholder="Search expenses..."
              placeholderTextColor={COLORS.textSecondary}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => {
                setIsSearching(false);
                setSearchQuery("");
                setFilteredExpenses(expenses);
              }}
            >
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        ) : (
          // Normal Greeting View
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.username}>{user?.name || "User"}</Text>
          </View>
        )}

        {!isSearching && (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setIsSearching(true)}
          >
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchData}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Only show Balance Card if NOT searching (to save space) */}
        {!isSearching && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Total Balance</Text>
              <Ionicons
                name="ellipsis-horizontal"
                size={24}
                color={COLORS.black}
              />
            </View>

            <Text style={styles.balanceAmount}>
              $ {stats.balance.toFixed(2)}
            </Text>

            <View style={styles.cardRow}>
              <View>
                <View style={styles.trendRow}>
                  <Ionicons name="arrow-down" size={16} color={COLORS.black} />
                  <Text style={styles.trendLabel}>Income</Text>
                </View>
                <Text style={styles.trendValue}>
                  $ {stats.income.toFixed(2)}
                </Text>
              </View>
              <View>
                <View style={styles.trendRow}>
                  <Ionicons name="arrow-up" size={16} color={COLORS.black} />
                  <Text style={styles.trendLabel}>Expense</Text>
                </View>
                <Text style={[styles.trendValue, { color: COLORS.error }]}>
                  $ {stats.expense.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>
          {isSearching ? "Search Results" : "Recent Transactions"}
        </Text>

        {/* List uses filteredExpenses instead of expenses */}
        {filteredExpenses.length === 0 && !loading ? (
          <Text
            style={{
              color: COLORS.textSecondary,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            {isSearching
              ? "No results found."
              : "No transactions yet. Add one!"}
          </Text>
        ) : (
          filteredExpenses.map((item) => (
            <TouchableOpacity
              key={item._id || item.localId}
              style={styles.transactionItem}
              activeOpacity={0.8}
              onPress={() => {
                // Safety check
                if (item._id) {
                  router.push({
                    pathname: "/expense-details/[id]",
                    params: { id: item._id },
                  });

                }
              }}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      item.type === "Income" ? COLORS.success : COLORS.error,
                  },
                ]}
              >
                <Ionicons
                  name={item.type === "Income" ? "cash" : "cart"}
                  size={24}
                  color={COLORS.white}
                />
              </View>

              <View style={styles.transactionDetails}>
                <Text style={styles.transactionCategory}>{item.category}</Text>
                <Text style={styles.transactionDesc}>
                  {item.description || "No description"}
                </Text>
              </View>

              <View style={styles.amountBox}>
                <Text
                  style={[
                    styles.amountText,
                    {
                      color:
                        item.type === "Income" ? COLORS.success : COLORS.error,
                    },
                  ]}
                >
                  {item.type === "Income" ? "+" : "-"} ${item.amount}
                </Text>
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/(tabs)/add")}
      >
        <Ionicons name="add" size={32} color={COLORS.black} />
      </TouchableOpacity>
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
    height: 50, // Fixed height to prevent jumping when switching to search bar
  },
  greeting: {
    fontSize: SIZES.body,
    color: COLORS.textSecondary,
  },
  username: {
    fontSize: SIZES.h2,
    fontWeight: "700",
    color: COLORS.white,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 45,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    marginRight: 10,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#E0E0E0",
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: "600",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  trendLabel: {
    marginLeft: 4,
    color: COLORS.black,
    fontSize: 14,
  },
  trendValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.success,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    color: COLORS.white,
    fontWeight: "700",
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "600",
    marginBottom: 4,
  },
  transactionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  amountBox: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "700",
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  fab: {
    position: "absolute",
    bottom: 50,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
