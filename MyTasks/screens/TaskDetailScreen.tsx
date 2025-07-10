import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Task } from "../types/Task";
import { TaskService } from "../services/taskService";

interface TaskDetailScreenProps {
  route: {
    params: {
      taskId: string;
    };
  };
  navigation: any;
}

interface Comment {
  id: string;
  text: string;
  timestamp: Date;
}

const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { taskId } = route.params;
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      // In a real app, we'd have a method to get task by ID
      // For now, we'll simulate loading
      setTimeout(() => {
        // Mock task data - in real app this would come from Firebase
        setTask({
          id: taskId,
          title: "Complete Project Proposal",
          description:
            "Write a comprehensive project proposal for the new mobile app including technical specifications, timeline, and budget estimation.",
          completed: false,
          priority: "high",
          dueDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "user123",
        });

        // Mock comments
        setComments([
          {
            id: "1",
            text: "Started working on the technical specifications",
            timestamp: new Date(Date.now() - 86400000),
          },
          {
            id: "2",
            text: "Need to research budget estimates",
            timestamp: new Date(Date.now() - 43200000),
          },
        ]);

        setLoading(false);
      }, 1000);
    } catch (error) {
      Alert.alert("Error", "Failed to load task details");
      setLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    if (!task) return;

    try {
      await TaskService.toggleTaskCompletion(task.id);
      setTask({ ...task, completed: !task.completed });
    } catch (error) {
      Alert.alert("Error", "Failed to update task");
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      timestamp: new Date(),
    };

    setComments([...comments, comment]);
    setNewComment("");
    setShowCommentModal(false);
  };

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} hours ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading task details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Task not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#8b5cf6", "#a855f7", "#c084fc"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreButtonText}>⋯</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Task Status */}
        <View style={styles.statusSection}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              task.completed && styles.completedStatus,
            ]}
            onPress={handleToggleComplete}
          >
            <View
              style={[
                styles.statusIcon,
                task.completed && styles.completedIcon,
              ]}
            >
              {task.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text
              style={[
                styles.statusText,
                task.completed && styles.completedText,
              ]}
            >
              {task.completed ? "Completed" : "Mark as Complete"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Task Info */}
        <View style={styles.taskInfo}>
          <View style={styles.titleSection}>
            <Text
              style={[
                styles.taskTitle,
                task.completed && styles.completedTitle,
              ]}
            >
              {task.title}
            </Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(task.priority) },
              ]}
            >
              <Text style={styles.priorityText}>
                {task.priority.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.taskDescription}>{task.description}</Text>

          {/* Task Meta */}
          <View style={styles.metaSection}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Due Date</Text>
              <Text style={styles.metaValue}>{formatDate(task.dueDate)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Created</Text>
              <Text style={styles.metaValue}>{formatDate(task.createdAt)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Last Updated</Text>
              <Text style={styles.metaValue}>{formatDate(task.updatedAt)}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>✏️</Text>
              <Text style={styles.actionText}>Edit Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📎</Text>
              <Text style={styles.actionText}>Add Attachment</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🔔</Text>
              <Text style={styles.actionText}>Set Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>🔗</Text>
              <Text style={styles.actionText}>Share Task</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <View style={styles.commentHeader}>
            <Text style={styles.sectionTitle}>Comments</Text>
            <TouchableOpacity
              style={styles.addCommentButton}
              onPress={() => setShowCommentModal(true)}
            >
              <Text style={styles.addCommentButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyCommentsText}>No comments yet</Text>
              <Text style={styles.emptyCommentsSubtext}>
                Add a comment to track your progress
              </Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentContent}>
                  <Text style={styles.commentText}>{comment.text}</Text>
                  <Text style={styles.commentTime}>
                    {formatRelativeTime(comment.timestamp)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Comment Modal */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowCommentModal(false)}
              style={styles.modalCancelButton}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Comment</Text>
            <TouchableOpacity
              onPress={handleAddComment}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TextInput
              style={styles.commentInput}
              placeholder="What's on your mind?"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              autoFocus
            />
          </View>
        </SafeAreaView>
      </Modal>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.3,
  },
  moreButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
  },
  moreButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 18,
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
    fontSize: 17,
    color: "#64748b",
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: "#ef4444",
    fontWeight: "600",
    marginBottom: 20,
  },
  statusSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  completedStatus: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#10b981",
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  completedIcon: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  checkmark: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  completedText: {
    color: "#10b981",
  },
  taskInfo: {
    backgroundColor: "#ffffff",
    margin: 20,
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  taskTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    lineHeight: 32,
    marginRight: 12,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: "#94a3b8",
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  taskDescription: {
    fontSize: 16,
    color: "#64748b",
    lineHeight: 24,
    marginBottom: 24,
  },
  metaSection: {
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  commentsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addCommentButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
  },
  addCommentButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyComments: {
    backgroundColor: "#ffffff",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyCommentsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
  },
  emptyCommentsSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  commentItem: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  commentContent: {
    gap: 8,
  },
  commentText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
  },
  commentTime: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafb",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalCancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "600",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  modalSaveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
  },
  modalSaveText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  commentInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#374151",
    minHeight: 120,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomPadding: {
    height: 100,
  },
});

export default TaskDetailScreen;
