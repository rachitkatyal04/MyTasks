import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { TaskService } from "../services/taskService";
import { Task } from "../types/Task";

const { width } = Dimensions.get("window");

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color,
  icon,
}) => {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        <Text style={styles.statIconText}>{icon}</Text>
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

interface ProgressRingProps {
  percentage: number;
  color: string;
  size: number;
  strokeWidth: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  color,
  size,
  strokeWidth,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.progressRing, { width: size, height: size }]}>
      <View style={styles.progressRingBackground}>
        <View
          style={[
            styles.progressRingFill,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: "#f1f5f9",
            },
          ]}
        />
        <View
          style={[
            styles.progressRingProgress,
            {
              width: size - strokeWidth,
              height: size - strokeWidth,
              borderRadius: (size - strokeWidth) / 2,
              borderWidth: strokeWidth,
              borderColor: color,
              transform: [{ rotate: "-90deg" }],
            },
          ]}
        />
      </View>
      <View style={styles.progressRingText}>
        <Text style={[styles.progressPercentage, { color }]}>
          {Math.round(percentage)}%
        </Text>
        <Text style={styles.progressLabel}>Complete</Text>
      </View>
    </View>
  );
};

const StatisticsScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadTasks();
      } else {
        setTasks([]);
        setLoading(false);
      }
    });

    return unsubscribeAuth;
  }, []);

  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userTasks = await TaskService.getUserTasks(user.uid);
      setTasks(userTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatistics = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const overdueTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return taskDate < today && !task.completed;
    }).length;

    const todayTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dueDate);
      const taskDay = new Date(
        taskDate.getFullYear(),
        taskDate.getMonth(),
        taskDate.getDate()
      );
      return taskDay.getTime() === today.getTime();
    }).length;

    const priorityStats = {
      high: tasks.filter((task) => task.priority === "high").length,
      medium: tasks.filter((task) => task.priority === "medium").length,
      low: tasks.filter((task) => task.priority === "low").length,
    };

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisWeekTasks = tasks.filter((task) => {
      const createdDate = new Date(task.createdAt);
      return createdDate >= thisWeekStart;
    }).length;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      overdueTasks,
      todayTasks,
      priorityStats,
      thisWeekTasks,
    };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading statistics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={["#8b5cf6", "#a855f7", "#c084fc"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientHeader}
        >
          <Text style={styles.headerTitle}>Statistics</Text>
          <Text style={styles.headerSubtitle}>Your productivity insights</Text>
        </LinearGradient>

        {/* Main Progress Ring */}
        <View style={styles.progressSection}>
          <ProgressRing
            percentage={stats.completionRate}
            color="#8b5cf6"
            size={180}
            strokeWidth={12}
          />
          <Text style={styles.progressSectionTitle}>Overall Progress</Text>
          <Text style={styles.progressSectionSubtitle}>
            {stats.completedTasks} of {stats.totalTasks} tasks completed
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Tasks"
              value={stats.totalTasks}
              color="#8b5cf6"
              icon="📝"
            />
            <StatCard
              title="Completed"
              value={stats.completedTasks}
              color="#10b981"
              icon="✅"
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              title="Pending"
              value={stats.pendingTasks}
              color="#f59e0b"
              icon="⏳"
            />
            <StatCard
              title="Overdue"
              value={stats.overdueTasks}
              color="#ef4444"
              icon="⚠️"
            />
          </View>
        </View>

        {/* Today's Focus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Focus</Text>
          <View style={styles.todayCard}>
            <View style={styles.todayStats}>
              <View style={styles.todayStat}>
                <Text style={styles.todayStatNumber}>{stats.todayTasks}</Text>
                <Text style={styles.todayStatLabel}>Tasks Due Today</Text>
              </View>
              <View style={styles.todayStat}>
                <Text style={styles.todayStatNumber}>
                  {stats.thisWeekTasks}
                </Text>
                <Text style={styles.todayStatLabel}>Created This Week</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Priority Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priority Breakdown</Text>
          <View style={styles.priorityBreakdown}>
            <View style={styles.priorityItem}>
              <View
                style={[styles.priorityDot, { backgroundColor: "#ef4444" }]}
              />
              <Text style={styles.priorityLabel}>High Priority</Text>
              <Text style={styles.priorityValue}>
                {stats.priorityStats.high}
              </Text>
            </View>
            <View style={styles.priorityItem}>
              <View
                style={[styles.priorityDot, { backgroundColor: "#f59e0b" }]}
              />
              <Text style={styles.priorityLabel}>Medium Priority</Text>
              <Text style={styles.priorityValue}>
                {stats.priorityStats.medium}
              </Text>
            </View>
            <View style={styles.priorityItem}>
              <View
                style={[styles.priorityDot, { backgroundColor: "#10b981" }]}
              />
              <Text style={styles.priorityLabel}>Low Priority</Text>
              <Text style={styles.priorityValue}>
                {stats.priorityStats.low}
              </Text>
            </View>
          </View>
        </View>

        {/* Productivity Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productivity Insights</Text>
          <View style={styles.insightsCard}>
            <Text style={styles.insightTitle}>🎯 Keep it up!</Text>
            <Text style={styles.insightText}>
              {stats.completionRate > 80
                ? "Excellent work! You're completing most of your tasks."
                : stats.completionRate > 60
                ? "Good progress! Try to focus on completing pending tasks."
                : stats.completionRate > 40
                ? "You're making progress. Consider breaking large tasks into smaller ones."
                : "Let's get started! Set achievable daily goals to build momentum."}
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafb",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 17,
    color: "#64748b",
    fontWeight: "500",
  },
  gradientHeader: {
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  progressSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: -16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  progressRing: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  progressRingBackground: {
    position: "absolute",
  },
  progressRingFill: {
    position: "absolute",
  },
  progressRingProgress: {
    position: "absolute",
  },
  progressRingText: {
    alignItems: "center",
  },
  progressPercentage: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  progressLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    marginTop: 4,
  },
  progressSectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginTop: 20,
    letterSpacing: -0.3,
  },
  progressSectionSubtitle: {
    fontSize: 15,
    color: "#64748b",
    fontWeight: "500",
    marginTop: 4,
  },
  statsGrid: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    marginRight: 16,
  },
  statIconText: {
    fontSize: 24,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statSubtitle: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  todayCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  todayStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  todayStat: {
    alignItems: "center",
  },
  todayStatNumber: {
    fontSize: 32,
    fontWeight: "900",
    color: "#8b5cf6",
    letterSpacing: -0.5,
  },
  todayStatLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },
  priorityBreakdown: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  priorityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  priorityLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  priorityValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
  },
  insightsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  insightText: {
    fontSize: 15,
    color: "#64748b",
    lineHeight: 22,
    fontWeight: "500",
  },
  bottomPadding: {
    height: 100,
  },
});

export default StatisticsScreen;
