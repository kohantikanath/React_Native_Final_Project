import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { BarChart } from "react-native-gifted-charts";
import { useFocusEffect, useRouter } from "expo-router";
import { COLORS, SIZES } from "../../constants/theme";
import api from "../../services/api";

const { width } = Dimensions.get("window");

export default function Stats() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"Weekly" | "Monthly" | "Yearly">(
    "Weekly"
  );
  const [chartType, setChartType] = useState<"Expense" | "Income">("Expense");
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // 1️⃣ Fetch expenses
      const response = await api.get("/expenses");
      const expenses = response.data.expenses;

      // 2️⃣ Fetch insights
      try {
        const insightRes = await api.get("/expenses/stats/insights");
        setInsights(insightRes.data);
      } catch (e: any) {
        console.log(
          "Insight fetch failed (likely no previous month data):",
          e?.message
        );
      }

      let newChartData: any[] = [];
      const today = new Date();

      if (filter === "Weekly") {
        // --- WEEKLY LOGIC (Last 7 Days) ---
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(today.getDate() - i);
          const label = d.toLocaleDateString("en-US", { weekday: "short" });

          const total = expenses
            .filter((e: any) => {
              const expDate = new Date(e.date);
              return (
                expDate.getDate() === d.getDate() &&
                expDate.getMonth() === d.getMonth() &&
                expDate.getFullYear() === d.getFullYear() &&
                (e.type || "Expense") === chartType
              );
            })
            .reduce((sum: number, e: any) => sum + e.amount, 0);

          newChartData.push({
            value: total,
            label,
            frontColor:
              chartType === "Income" ? COLORS.success : COLORS.primary,
            topLabelComponent: () =>
              total > 0 ? (
                <Text style={styles.chartLabel}>{Math.round(total)}</Text>
              ) : null,
          });
        }
      } else if (filter === "Monthly") {
        // --- MONTHLY LOGIC (Last 6 Months) ---
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(today.getMonth() - i);
          const label = d.toLocaleDateString("en-US", { month: "short" });

          const total = expenses
            .filter((e: any) => {
              const expDate = new Date(e.date);
              return (
                expDate.getMonth() === d.getMonth() &&
                expDate.getFullYear() === d.getFullYear() &&
                (e.type || "Expense") === chartType
              );
            })
            .reduce((sum: number, e: any) => sum + e.amount, 0);

          newChartData.push({
            value: total,
            label,
            frontColor:
              chartType === "Income" ? COLORS.success : COLORS.primary,
            topLabelComponent: () =>
              total > 0 ? (
                <Text style={styles.chartLabel}>{Math.round(total)}</Text>
              ) : null,
          });
        }
      } else {
        // --- YEARLY LOGIC (Current Year) ---
        const year = today.getFullYear();
        for (let i = 0; i < 12; i++) {
          const d = new Date(year, i, 1);
          const label = d
            .toLocaleDateString("en-US", { month: "narrow" })
            .charAt(0);

          const total = expenses
            .filter((e: any) => {
              const expDate = new Date(e.date);
              return (
                expDate.getMonth() === i &&
                expDate.getFullYear() === year &&
                (e.type || "Expense") === chartType
              );
            })
            .reduce((sum: number, e: any) => sum + e.amount, 0);

          newChartData.push({
            value: total,
            label,
            frontColor:
              chartType === "Income" ? COLORS.success : COLORS.primary,
            topLabelComponent: () =>
              total > 0 ? (
                <Text style={styles.chartLabel}>{Math.round(total)}</Text>
              ) : null,
          });
        }
      }

      setChartData(newChartData);

      // Filter Recent Transactions List
      const recent = expenses
        .filter((e: any) => (e.type || "Expense") === chartType)
        .sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        .slice(0, 10);

      setRecentTransactions(recent);
    } catch (error) {
      console.error("Stats Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filter, chartType]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  // --- Dynamic Chart Sizing Logic ---
  const chartWidth = width - 60; // Full width minus padding
  const barWidth = filter === "Yearly" ? 14 : 22; // Thinner bars for yearly
  // Calculate spacing so bars fill the width evenly
  const spacing = (chartWidth - chartData.length * barWidth) / chartData.length;
  // Ensure the max value isn't 0 (avoids crash) and adds headroom
  const maxValue = Math.max(...chartData.map((d) => d.value), 50) * 1.2;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.headerTitle}>Statistics</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* FILTER TABS */}
        <View style={styles.tabContainer}>
          {["Weekly", "Monthly", "Yearly"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, filter === tab && styles.activeTab]}
              onPress={() => setFilter(tab as any)}
            >
              <Text
                style={[styles.tabText, filter === tab && styles.activeTabText]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* INSIGHTS CARD */}
        {insights && (
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Ionicons name="bulb" size={20} color={COLORS.black} />
              <Text style={styles.insightTitle}>Monthly Insights</Text>
            </View>

            <Text style={styles.insightText}>
              You spent{" "}
              <Text style={{ fontWeight: "bold" }}>
                ${insights.currentMonthTotal}
              </Text>{" "}
              this month.
            </Text>

            {/* Percentage Change Badge */}
            {insights.overallChange !== 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      insights.overallChange > 0
                        ? COLORS.error
                        : COLORS.success,
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {insights.overallChange > 0
                    ? `+${Math.round(insights.overallChange)}% from last month`
                    : `${Math.round(insights.overallChange)}% from last month`}
                </Text>
              </View>
            )}

            {/* Category specific insight */}
            {insights.insights?.length > 0 && (
              <Text style={styles.categoryInsight}>
                {insights.insights[0].message}
              </Text>
            )}
          </View>
        )}

        {/* INCOME / EXPENSE TOGGLE */}
        <View style={styles.toggleContainer}>
          {["Expense", "Income"].map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.toggleButton,
                chartType === t &&
                  (t === "Expense" ? styles.activeRed : styles.activeGreen),
              ]}
              onPress={() => setChartType(t as any)}
            >
              <Text
                style={[
                  styles.toggleText,
                  chartType === t && styles.activeText,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* THE CHART */}
        <View style={styles.chartWrapper}>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <BarChart
              data={chartData}
              width={chartWidth}
              barWidth={barWidth}
              spacing={spacing}
              initialSpacing={10} // Padding at start
              hideRules
              roundedTop
              noOfSections={4}
              maxValue={maxValue}
              // Axis & Label Styling
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
              xAxisLabelTextStyle={{
                color: COLORS.textSecondary,
                fontSize: 11,
                textAlign: "center",
              }}
              isAnimated
              animationDuration={400}
            />
          )}
        </View>

        {/* RECENT TRANSACTIONS LIST */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top {chartType}s</Text>
        </View>

        {recentTransactions.map((item) => (
          <TouchableOpacity
            key={item._id || item.localId}
            style={styles.transactionItem}
            onPress={() => {
              if (item._id) {
                // Navigate to details page (Edit/Delete)
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
              <Text style={styles.dateText}>
                {new Date(item.date).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                })}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  scrollContent: { paddingBottom: 60 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTab: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabText: { color: COLORS.textSecondary, fontWeight: "600" },
  activeTabText: { color: COLORS.white },

  // Insights Card
  insightCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  insightTitle: {
    color: COLORS.black,
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  insightText: { color: COLORS.black, fontSize: 14, marginBottom: 8 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  badgeText: { color: COLORS.white, fontSize: 12, fontWeight: "bold" },
  categoryInsight: { color: COLORS.black, fontStyle: "italic", fontSize: 12 },

  toggleContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeRed: { backgroundColor: COLORS.error },
  activeGreen: { backgroundColor: COLORS.success },
  toggleText: { color: COLORS.textSecondary, fontWeight: "600" },
  activeText: { color: COLORS.white, fontWeight: "700" },

  // Chart
  chartWrapper: {
    alignItems: "center",
    marginBottom: 30,
    justifyContent: "center",
  },
  chartLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    marginBottom: 6,
    fontWeight: "bold",
  },

  // List Items
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: SIZES.h3, color: COLORS.white, fontWeight: "700" },
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
  transactionDetails: { flex: 1 },
  transactionCategory: { fontSize: 16, color: COLORS.white, fontWeight: "600" },
  transactionDesc: { fontSize: 12, color: COLORS.textSecondary },
  amountBox: { alignItems: "flex-end" },
  amountText: { fontSize: 16, fontWeight: "700" },
  dateText: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4 },
});
