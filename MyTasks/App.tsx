import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Vibration,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure expo-notifications handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  notificationId?: string;
}

const STORAGE_KEY = "@MyTasks:tasks";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputText, setInputText] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editText, setEditText] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [reminderInterval, setReminderInterval] = useState<10 | 60 | 300>(10); // 10s, 1min, 5min
  const [activeReminders, setActiveReminders] = useState<
    Map<string, NodeJS.Timeout>
  >(new Map());

  // Notification system state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<
    "success" | "reminder" | "info"
  >("info");
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Store notification timeout IDs for both system and alert notifications
  const [activeSystemNotifications, setActiveSystemNotifications] = useState<
    Map<string, NodeJS.Timeout>
  >(new Map());

  // Custom notification system
  const showCustomNotification = (
    message: string,
    type: "success" | "reminder" | "info" = "info",
    duration: number = 3000
  ) => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);

    // Vibrate for emphasis
    if (Platform.OS === "android" || Platform.OS === "ios") {
      Vibration.vibrate(200);
    }

    // Animate in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto dismiss
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowNotification(false);
      });
    }, duration);
  };

  // Setup expo-notifications for system tray notifications
  const setupLocalNotifications = async () => {
    try {
      // Request ALL notification permissions explicitly
      const { status, canAskAgain } =
        await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowCriticalAlerts: false,
            provideAppNotificationSettings: true,
            allowProvisional: false,
          },
          android: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });

      if (status !== "granted") {
        console.log("Notification permissions not granted:", status);
        if (canAskAgain) {
          Alert.alert(
            "Notifications Required",
            "Please enable notifications to receive task reminders in your notification tray.",
            [{ text: "OK" }]
          );
        }
        return false;
      }

      console.log("Notification permissions granted:", status);

      // Setup notification channel for Android with HIGH importance
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("task-reminders", {
          name: "Task Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#4ECDC4",
          sound: "default",
          showBadge: true,
          enableVibrate: true,
          enableLights: true,
        });
        console.log("Android notification channel created");
      }

      console.log("System notifications setup complete");
      return true;
    } catch (error) {
      console.error("Error setting up notifications:", error);
      return false;
    }
  };

  // Schedule expo notification at exact time
  const scheduleTaskReminder = async (task: Task) => {
    try {
      // Cancel any existing notifications for this task
      await cancelTaskReminder(task.id);

      const currentTime = new Date();
      const scheduledTime = new Date(
        currentTime.getTime() + reminderInterval * 1000
      );

      console.log(
        `Scheduling expo notification for ${reminderInterval} seconds from now`
      );
      console.log(`Current time: ${currentTime.toLocaleTimeString()}`);
      console.log(`Scheduled time: ${scheduledTime.toLocaleTimeString()}`);

      // Ensure we're scheduling for future time, not immediate
      if (reminderInterval <= 0) {
        console.error("Invalid reminder interval:", reminderInterval);
        return;
      }

      // Schedule system notification with task existence check
      const systemNotificationTimeoutId = setTimeout(async () => {
        // Check if task still exists and is not completed
        const currentTasks = await new Promise<Task[]>((resolve) => {
          setTasks((prevTasks) => {
            resolve(prevTasks);
            return prevTasks;
          });
        });

        const currentTask = currentTasks.find((t) => t.id === task.id);

        if (currentTask && !currentTask.completed) {
          console.log(
            `Sending system notification NOW for task: ${currentTask.text}`
          );
          try {
            const systemNotificationId =
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: "📋 Task Reminder",
                  body: `Time to complete: ${currentTask.text}`,
                  sound: "default",
                  priority: Notifications.AndroidNotificationPriority.HIGH,
                  vibrate: [0, 250, 250, 250],
                  categoryIdentifier: "task-reminder",
                  data: { taskId: currentTask.id, taskText: currentTask.text },
                },
                trigger: null, // Send immediately
              });
            console.log(
              "System notification sent with ID:",
              systemNotificationId
            );
          } catch (error) {
            console.error("Error sending system notification:", error);
          }
        } else {
          console.log(
            `Task ${task.id} no longer exists or is completed - skipping system notification`
          );
        }

        // Clean up from active system notifications
        setActiveSystemNotifications((prev) => {
          const newMap = new Map(prev);
          newMap.delete(task.id);
          return newMap;
        });
      }, reminderInterval * 1000);

      // Schedule in-app alert with task existence check
      const alertTimeoutId = setTimeout(() => {
        // Check if task still exists and is not completed
        setTasks((prevTasks) => {
          const currentTask = prevTasks.find((t) => t.id === task.id);

          if (currentTask && !currentTask.completed) {
            Alert.alert(
              "📋 Task Reminder",
              `Time to complete: ${currentTask.text}`,
              [
                {
                  text: "Mark Complete",
                  onPress: () => toggleTaskCompletion(currentTask.id),
                  style: "default",
                },
                {
                  text: "Remind Later",
                  onPress: () => {
                    scheduleTaskReminder(currentTask);
                  },
                  style: "cancel",
                },
                {
                  text: "Dismiss",
                  style: "destructive",
                },
              ],
              { cancelable: true }
            );

            showCustomNotification(
              `📋 Reminder: ${currentTask.text}`,
              "reminder",
              5000
            );

            if (Platform.OS === "android" || Platform.OS === "ios") {
              Vibration.vibrate([0, 500, 200, 500]);
            }
          } else {
            console.log(
              `Task ${task.id} no longer exists or is completed - skipping in-app alert`
            );
          }

          return prevTasks;
        });

        // Clean up from active reminders
        setActiveReminders((prev) => {
          const newMap = new Map(prev);
          newMap.delete(task.id);
          return newMap;
        });
      }, reminderInterval * 1000);

      // Track both timeouts
      setActiveReminders((prev) => new Map(prev).set(task.id, alertTimeoutId));
      setActiveSystemNotifications((prev) =>
        new Map(prev).set(task.id, systemNotificationTimeoutId)
      );

      console.log(
        `Both notifications scheduled successfully for task: ${task.text}`
      );
      return {
        notificationId: "scheduled",
        timeoutId: alertTimeoutId,
        systemTimeoutId: systemNotificationTimeoutId,
        type: "expo-notification",
      };
    } catch (error) {
      console.error("Error scheduling expo notification:", error);
      return { timeoutId: null, type: "error" };
    }
  };

  // Cancel task reminder (both timeouts and system notifications)
  const cancelTaskReminder = async (taskId: string) => {
    console.log(`Cancelling all notifications for task: ${taskId}`);

    // Cancel the setTimeout for in-app alerts
    const alertTimeoutId = activeReminders.get(taskId);
    if (alertTimeoutId) {
      clearTimeout(alertTimeoutId);
      setActiveReminders((prev) => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
      console.log(`Cancelled alert timeout for task: ${taskId}`);
    }

    // Cancel the setTimeout for system notifications
    const systemTimeoutId = activeSystemNotifications.get(taskId);
    if (systemTimeoutId) {
      clearTimeout(systemTimeoutId);
      setActiveSystemNotifications((prev) => {
        const newMap = new Map(prev);
        newMap.delete(taskId);
        return newMap;
      });
      console.log(`Cancelled system notification timeout for task: ${taskId}`);
    }

    // Cancel any already scheduled system notifications for this task
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (task?.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(
          task.notificationId
        );
        console.log(
          `Cancelled existing system notification for task: ${taskId}`
        );
      }

      // Also cancel all notifications for this task (comprehensive cleanup)
      const allNotifications =
        await Notifications.getAllScheduledNotificationsAsync();
      const taskNotifications = allNotifications.filter(
        (notification) => notification.content.data?.taskId === taskId
      );

      for (const notification of taskNotifications) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
        console.log(
          `Cancelled system notification: ${notification.identifier}`
        );
      }
    } catch (error) {
      console.error("Error cancelling system notifications:", error);
    }
  };

  // Load tasks from storage
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }));
        setTasks(parsedTasks);
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  // Save tasks to storage
  const saveTasks = async (tasksToSave: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    setupLocalNotifications();

    // Add notification listener to debug when notifications actually fire
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("System notification received:", notification);
        console.log("Notification time:", new Date().toLocaleTimeString());
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("User responded to notification:", response);
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const addTask = async () => {
    if (inputText.trim() === "") {
      Alert.alert("Error", "Please enter a task!");
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
      priority: selectedPriority,
      createdAt: new Date(),
    };

    // Schedule reminder for new task
    scheduleTaskReminder(newTask);

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setInputText("");
    setSelectedPriority("medium");

    // Show immediate feedback
    const intervalText =
      reminderInterval === 10
        ? "10 seconds"
        : reminderInterval === 60
        ? "1 minute"
        : "5 minutes";
    showCustomNotification(
      `✅ Task added! Reminder set for ${intervalText}.`,
      "success"
    );
  };

  const toggleTaskCompletion = async (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, completed: !task.completed };

          // Cancel reminder if task is being marked as completed
          if (updatedTask.completed) {
            cancelTaskReminder(task.id); // This will cancel both timeout and system notifications
            showCustomNotification(
              "🎉 Task completed! Reminder cancelled.",
              "success"
            );
          } else {
            // Re-schedule reminder if task is being marked as incomplete
            scheduleTaskReminder(updatedTask);
            showCustomNotification(
              "↩️ Task reopened. New reminder set!",
              "info"
            );
          }

          return updatedTask;
        }
        return task;
      })
    );
  };

  const deleteTask = (taskId: string) => {
    Alert.alert("Delete Task", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          // Cancel any pending reminder (both timeout and system notifications)
          await cancelTaskReminder(taskId);

          setTasks((prevTasks) =>
            prevTasks.filter((task) => task.id !== taskId)
          );

          showCustomNotification(
            "🗑️ Task deleted and notifications cancelled!",
            "info"
          );
        },
      },
    ]);
  };

  const startEditTask = (task: Task) => {
    setEditingTask(task);
    setEditText(task.text);
    setShowEditModal(true);
  };

  const saveEditTask = () => {
    if (editText.trim() === "") {
      Alert.alert("Error", "Task text cannot be empty!");
      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === editingTask?.id ? { ...task, text: editText.trim() } : task
      )
    );

    setShowEditModal(false);
    setEditingTask(null);
    setEditText("");

    showCustomNotification("✏️ Task updated!", "success");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#FF6B6B";
      case "medium":
        return "#4ECDC4";
      case "low":
        return "#95E1D3";
      default:
        return "#4ECDC4";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "🟡";
    }
  };

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "success":
        return { backgroundColor: "#4CAF50" };
      case "reminder":
        return { backgroundColor: "#FF9800" };
      case "info":
      default:
        return { backgroundColor: "#4ECDC4" };
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View
      style={[
        styles.taskItem,
        { borderLeftColor: getPriorityColor(item.priority) },
      ]}
    >
      <TouchableOpacity
        style={styles.taskContent}
        onPress={() => toggleTaskCompletion(item.id)}
      >
        <View style={styles.taskLeft}>
          <View
            style={[
              styles.checkbox,
              item.completed && styles.checkboxCompleted,
            ]}
          >
            {item.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.taskTextContainer}>
            <Text
              style={[
                styles.taskText,
                item.completed && styles.taskTextCompleted,
              ]}
            >
              {item.text}
            </Text>
            <View style={styles.taskMeta}>
              <Text style={styles.priorityText}>
                {getPriorityIcon(item.priority)} {item.priority.toUpperCase()}
              </Text>
              <Text style={styles.timeText}>
                {item.createdAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
            {!item.completed && activeReminders.has(item.id) && (
              <Text style={styles.reminderText}>⏰ Reminder active</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.taskActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => startEditTask(item)}
        >
          <Text style={styles.actionText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTask(item.id)}
        >
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const incompleteTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Custom In-App Notification */}
      {showNotification && (
        <Animated.View
          style={[
            styles.customNotification,
            getNotificationStyle(notificationType),
            { opacity: fadeAnim },
          ]}
        >
          <Text style={styles.notificationText}>{notificationMessage}</Text>
        </Animated.View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>📋 My Tasks</Text>
        <Text style={styles.subtitle}>
          {incompleteTasks.length} pending • {completedTasks.length} completed
        </Text>
        <Text style={styles.featureText}>
          ✨ Expo notifications • Scheduled reminders • Real notifications
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <View style={styles.prioritySelector}>
          {(["low", "medium", "high"] as const).map((priority) => (
            <TouchableOpacity
              key={priority}
              style={[
                styles.priorityButton,
                selectedPriority === priority && styles.priorityButtonSelected,
                {
                  backgroundColor:
                    selectedPriority === priority
                      ? getPriorityColor(priority)
                      : "#f0f0f0",
                },
              ]}
              onPress={() => setSelectedPriority(priority)}
            >
              <Text
                style={[
                  styles.priorityButtonText,
                  selectedPriority === priority &&
                    styles.priorityButtonTextSelected,
                ]}
              >
                {getPriorityIcon(priority)} {priority.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.reminderSelector}>
          <Text style={styles.selectorLabel}>⏰ Reminder Time:</Text>
          <View style={styles.reminderButtons}>
            {[
              { value: 10, label: "10s" },
              { value: 60, label: "1min" },
              { value: 300, label: "5min" },
            ].map((interval) => (
              <TouchableOpacity
                key={interval.value}
                style={[
                  styles.reminderButton,
                  reminderInterval === interval.value &&
                    styles.reminderButtonSelected,
                ]}
                onPress={() =>
                  setReminderInterval(interval.value as 10 | 60 | 300)
                }
              >
                <Text
                  style={[
                    styles.reminderButtonText,
                    reminderInterval === interval.value &&
                      styles.reminderButtonTextSelected,
                  ]}
                >
                  {interval.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Add a new task..."
            placeholderTextColor="#999"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={addTask}
            multiline
          />
          <TouchableOpacity style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <FlatList
        data={[...incompleteTasks, ...completedTasks]}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        style={styles.taskList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🎯</Text>
            <Text style={styles.emptyTitle}>No tasks yet!</Text>
            <Text style={styles.emptySubtitle}>Add your first task above</Text>
            <Text style={styles.emptyFeature}>Get expo notifications! ⏰</Text>
          </View>
        }
      />

      {/* Edit Task Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.modalInput}
              value={editText}
              onChangeText={setEditText}
              placeholder="Enter task text..."
              multiline
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEditTask}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  customNotification: {
    position: "absolute",
    top: 80, // Moved down to avoid camera/notch area
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    zIndex: 1000,
    elevation: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  notificationText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50, // Extra top padding to avoid camera/notch
    backgroundColor: "#16213e",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#4ECDC4",
    textAlign: "center",
    marginTop: 5,
  },
  featureText: {
    fontSize: 12,
    color: "#95E1D3",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  inputContainer: {
    padding: 20,
    backgroundColor: "#16213e",
  },
  prioritySelector: {
    flexDirection: "row",
    marginBottom: 15,
    justifyContent: "space-around",
  },
  priorityButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  priorityButtonSelected: {
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  priorityButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  priorityButtonTextSelected: {
    color: "#fff",
  },
  reminderSelector: {
    marginBottom: 15,
  },
  selectorLabel: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  reminderButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  reminderButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    minWidth: 60,
    alignItems: "center",
  },
  reminderButtonSelected: {
    backgroundColor: "#4ECDC4",
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  reminderButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  reminderButtonTextSelected: {
    color: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#4ECDC4",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    marginRight: 10,
    maxHeight: 100,
    color: "#333",
  },
  addButton: {
    backgroundColor: "#4ECDC4",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  taskItem: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginVertical: 5,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    borderLeftWidth: 4,
  },
  taskContent: {
    flex: 1,
  },
  taskLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: "#4ECDC4",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  taskMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  reminderText: {
    fontSize: 11,
    color: "#FF9800",
    fontStyle: "italic",
    marginTop: 3,
  },
  taskActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    marginRight: 5,
  },
  deleteButton: {
    padding: 8,
  },
  actionText: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4ECDC4",
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 10,
  },
  emptyFeature: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#4ECDC4",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
    maxHeight: 100,
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#4ECDC4",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
