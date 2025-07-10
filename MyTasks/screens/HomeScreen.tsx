import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { TaskService } from "../services/taskService";
import { Task, TaskFilters } from "../types/Task";
import TaskForm from "../components/TaskForm";
import TaskFiltersComponent from "../components/TaskFilters";
import TaskSort from "../components/TaskSort";

interface TaskItemProps {
  item: Task;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  item,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#f59e0b";
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate && !item.completed;
  };

  return (
    <View style={[styles.taskItem, item.completed && styles.completedTask]}>
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => onToggleComplete(item.id)}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleRow}>
            <View
              style={[styles.checkbox, item.completed && styles.checkedBox]}
            >
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[styles.taskTitle, item.completed && styles.completedText]}
            >
              {item.title}
            </Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority) },
              ]}
            >
              <Text style={styles.priorityText}>
                {item.priority.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text
            style={[
              styles.taskDescription,
              item.completed && styles.completedText,
            ]}
          >
            {item.description}
          </Text>

          <View style={styles.taskFooter}>
            <Text
              style={[
                styles.dueDate,
                isOverdue(item.dueDate) && styles.overdueDate,
                item.completed && styles.completedText,
              ]}
            >
              Due: {formatDate(item.dueDate)}
            </Text>
            {isOverdue(item.dueDate) && (
              <Text style={styles.overdueLabel}>OVERDUE</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.taskActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(item)}
        >
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(item.id)}
        >
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HomeScreen: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    priority: "all",
    status: "all",
    sortBy: "dueDate",
    sortOrder: "asc",
  });
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

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [filters, user]);

  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userTasks = await TaskService.getUserTasks(user.uid, filters);
      setTasks(userTasks);
    } catch (error) {
      Alert.alert("Error", "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">
  ) => {
    if (!user) return;

    try {
      setLoading(true);
      await TaskService.addTask({ ...taskData, userId: user.uid });
      loadTasks();
      setShowTaskForm(false);
    } catch (error) {
      Alert.alert("Error", "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">
  ) => {
    if (!editingTask) return;

    try {
      setLoading(true);
      await TaskService.updateTask(editingTask.id, taskData);
      loadTasks();
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (error) {
      Alert.alert("Error", "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      await TaskService.toggleTaskCompletion(taskId);
      loadTasks();
    } catch (error) {
      Alert.alert("Error", "Failed to update task");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await TaskService.deleteTask(taskId);
            loadTasks();
          } catch (error) {
            Alert.alert("Error", "Failed to delete task");
          }
        },
      },
    ]);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert("Error", "Failed to sign out");
    }
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const closeTaskForm = () => {
    setEditingTask(null);
    setShowTaskForm(false);
  };

  const completedTasksCount = tasks.filter((task) => task.completed).length;
  const totalTasksCount = tasks.length;

  // Group tasks by time periods
  const groupTasksByDate = (tasks: Task[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const thisWeekEnd = new Date(today);
    thisWeekEnd.setDate(thisWeekEnd.getDate() + (7 - today.getDay()));

    const groups = {
      overdue: [] as Task[],
      today: [] as Task[],
      tomorrow: [] as Task[],
      thisWeek: [] as Task[],
      later: [] as Task[],
    };

    tasks.forEach((task) => {
      const taskDate = new Date(task.dueDate);
      const taskDay = new Date(
        taskDate.getFullYear(),
        taskDate.getMonth(),
        taskDate.getDate()
      );

      if (taskDay < today && !task.completed) {
        groups.overdue.push(task);
      } else if (taskDay.getTime() === today.getTime()) {
        groups.today.push(task);
      } else if (taskDay.getTime() === tomorrow.getTime()) {
        groups.tomorrow.push(task);
      } else if (taskDay <= thisWeekEnd && taskDay > tomorrow) {
        groups.thisWeek.push(task);
      } else {
        groups.later.push(task);
      }
    });

    return groups;
  };

  const taskGroups = groupTasksByDate(tasks);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header with Gradient */}
      <LinearGradient
        colors={["#8b5cf6", "#a855f7", "#c084fc"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Text>
            <Text style={styles.headerTitle}>My Tasks</Text>
          </View>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>🔓</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Sort Controls */}
      <TaskSort filters={filters} onFiltersChange={setFilters} />

      {/* Filter Toggle */}
      <View style={styles.filterToggleContainer}>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowTaskForm(true)}
        >
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <TaskFiltersComponent filters={filters} onFiltersChange={setFilters} />
      )}

      {/* Task Progress Summary */}
      {!loading && tasks.length > 0 && (
        <View style={styles.progressSummary}>
          <View style={styles.progressStats}>
            <Text style={styles.progressNumber}>{completedTasksCount}</Text>
            <Text style={styles.progressLabel}>
              of {totalTasksCount} completed
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    totalTasksCount > 0
                      ? (completedTasksCount / totalTasksCount) * 100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Tasks List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks found</Text>
            <Text style={styles.emptyStateSubtext}>
              {filters.status === "all"
                ? "Create your first task to get started!"
                : "Try adjusting your filters to see more tasks."}
            </Text>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.tasksContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Overdue Tasks */}
          {taskGroups.overdue.length > 0 && (
            <View style={styles.taskSection}>
              <Text style={styles.sectionTitle}>Overdue</Text>
              {taskGroups.overdue.map((task) => (
                <TaskItem
                  key={task.id}
                  item={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={openEditForm}
                  onDelete={handleDeleteTask}
                />
              ))}
            </View>
          )}

          {/* Today Tasks */}
          {taskGroups.today.length > 0 && (
            <View style={styles.taskSection}>
              <Text style={styles.sectionTitle}>Today</Text>
              {taskGroups.today.map((task) => (
                <TaskItem
                  key={task.id}
                  item={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={openEditForm}
                  onDelete={handleDeleteTask}
                />
              ))}
            </View>
          )}

          {/* Tomorrow Tasks */}
          {taskGroups.tomorrow.length > 0 && (
            <View style={styles.taskSection}>
              <Text style={styles.sectionTitle}>Tomorrow</Text>
              {taskGroups.tomorrow.map((task) => (
                <TaskItem
                  key={task.id}
                  item={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={openEditForm}
                  onDelete={handleDeleteTask}
                />
              ))}
            </View>
          )}

          {/* This Week Tasks */}
          {taskGroups.thisWeek.length > 0 && (
            <View style={styles.taskSection}>
              <Text style={styles.sectionTitle}>This Week</Text>
              {taskGroups.thisWeek.map((task) => (
                <TaskItem
                  key={task.id}
                  item={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={openEditForm}
                  onDelete={handleDeleteTask}
                />
              ))}
            </View>
          )}

          {/* Later Tasks */}
          {taskGroups.later.length > 0 && (
            <View style={styles.taskSection}>
              <Text style={styles.sectionTitle}>Later</Text>
              {taskGroups.later.map((task) => (
                <TaskItem
                  key={task.id}
                  item={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={openEditForm}
                  onDelete={handleDeleteTask}
                />
              ))}
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      {/* Task Form Modal */}
      <TaskForm
        visible={showTaskForm}
        onClose={closeTaskForm}
        onSubmit={editingTask ? handleEditTask : handleAddTask}
        editingTask={editingTask}
        loading={loading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafb",
  },
  gradientHeader: {
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
  },
  headerDate: {
    fontSize: 14,
    color: "#e2e8f0",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: -0.8,
  },
  signOutButton: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  signOutButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 18,
  },
  filterToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: "#ffffff",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterToggle: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  filterToggleText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#8b5cf6",
    borderRadius: 12,
    shadowColor: "#8b5cf6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 17,
    color: "#64748b",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48,
  },
  emptyStateText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#374151",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },
  progressSummary: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  progressStats: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 12,
  },
  progressNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#8b5cf6",
    marginRight: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8b5cf6",
    borderRadius: 3,
  },
  tasksContainer: {
    flex: 1,
    backgroundColor: "#f8fafb",
  },
  taskSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  taskItem: {
    backgroundColor: "#ffffff",
    padding: 18,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  completedTask: {
    opacity: 0.7,
    backgroundColor: "#f8fafc",
    shadowOpacity: 0.04,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    marginBottom: 12,
  },
  taskTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  checkedBox: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    lineHeight: 22,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#94a3b8",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  taskDescription: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 8,
    fontWeight: "400",
  },
  taskFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dueDate: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "500",
  },
  overdueDate: {
    color: "#ef4444",
    fontWeight: "700",
  },
  overdueLabel: {
    color: "#ef4444",
    fontSize: 11,
    fontWeight: "800",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    letterSpacing: 0.3,
  },
  taskActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  deleteButtonText: {
    color: "#dc2626",
  },
  bottomPadding: {
    height: 100,
  },
});

export default HomeScreen;
