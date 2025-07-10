import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Platform,
  ScrollView,
} from "react-native";
import { Task } from "../types/Task";

interface TaskFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "userId">
  ) => void;
  editingTask?: Task | null;
  loading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  visible,
  onClose,
  onSubmit,
  editingTask,
  loading = false,
}) => {
  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(
    editingTask?.description || ""
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    editingTask?.priority || "medium"
  );
  const [dueDate, setDueDate] = useState(
    editingTask?.dueDate
      ? editingTask.dueDate.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Update form fields when editingTask changes or modal opens
  useEffect(() => {
    if (visible) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description);
        setPriority(editingTask.priority);
        setDueDate(editingTask.dueDate.toISOString().split("T")[0]);
      } else {
        // Reset form for new task
        setTitle("");
        setDescription("");
        setPriority("medium");
        setDueDate(new Date().toISOString().split("T")[0]);
      }
    }
  }, [editingTask, visible]);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Error", "Please enter a task description");
      return;
    }

    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      Alert.alert("Error", "Please enter a valid due date");
      return;
    }

    const taskData: any = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDateObj,
      completed: editingTask?.completed || false,
    };

    // Only include notificationId if it exists (when editing)
    if (editingTask?.notificationId) {
      taskData.notificationId = editingTask.notificationId;
    }

    onSubmit(taskData);

    // Reset form if not editing
    if (!editingTask) {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate(new Date().toISOString().split("T")[0]);
    }
  };

  const handleClose = () => {
    if (!editingTask) {
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate(new Date().toISOString().split("T")[0]);
    }
    onClose();
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {editingTask ? "Edit Task" : "New Task"}
          </Text>
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <Text
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            >
              {loading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === "title" && styles.inputFocused,
              ]}
              placeholder="Enter task title"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              onFocus={() => setFocusedInput("title")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                focusedInput === "description" && styles.inputFocused,
              ]}
              placeholder="Enter task description"
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
              onFocus={() => setFocusedInput("description")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Due Date *</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === "dueDate" && styles.inputFocused,
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
              value={dueDate}
              onChangeText={setDueDate}
              keyboardType={
                Platform.OS === "ios" ? "numbers-and-punctuation" : "default"
              }
              onFocus={() => setFocusedInput("dueDate")}
              onBlur={() => setFocusedInput(null)}
            />
            <Text style={styles.helper}>
              Format: YYYY-MM-DD (e.g., 2024-12-25)
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {(["low", "medium", "high"] as const).map((priorityLevel) => (
                <TouchableOpacity
                  key={priorityLevel}
                  style={[
                    styles.priorityButton,
                    { backgroundColor: getPriorityColor(priorityLevel) },
                    priority === priorityLevel && styles.priorityButtonSelected,
                  ]}
                  onPress={() => setPriority(priorityLevel)}
                >
                  <Text style={styles.priorityButtonText}>
                    {priorityLevel.charAt(0).toUpperCase() +
                      priorityLevel.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingTop: 48,
    backgroundColor: "#ffffff",
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a202c",
    letterSpacing: -0.3,
  },
  cancelButton: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "600",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  saveButton: {
    fontSize: 16,
    color: "#8b5cf6",
    fontWeight: "700",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  saveButtonDisabled: {
    color: "#94a3b8",
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 12,
    letterSpacing: -0.1,
  },
  input: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    color: "#1e293b",
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputFocused: {
    borderColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 16,
  },
  helper: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 8,
    fontWeight: "500",
  },
  priorityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  priorityButtonSelected: {
    borderColor: "#1e293b",
    borderWidth: 3,
    shadowOpacity: 0.15,
  },
  priorityButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

export default TaskForm;
