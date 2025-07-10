import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { TaskFilters } from "../types/Task";

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

const TaskFiltersComponent: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ] as const;

  const statusOptions = [
    { value: "all", label: "All Tasks" },
    { value: "incomplete", label: "Active" },
    { value: "completed", label: "Completed" },
  ] as const;

  const updateFilter = (key: keyof TaskFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
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
        return "#64748b";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Priority</Text>
        <View style={styles.optionsContainer}>
          {priorityOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterButton,
                filters.priority === option.value && styles.filterButtonActive,
                option.value !== "all" && {
                  backgroundColor: getPriorityColor(option.value),
                  borderColor: getPriorityColor(option.value),
                },
                filters.priority === option.value &&
                  option.value !== "all" &&
                  styles.priorityButtonActive,
              ]}
              onPress={() => updateFilter("priority", option.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filters.priority === option.value &&
                    styles.filterButtonTextActive,
                  option.value !== "all" && styles.priorityButtonText,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.optionsContainer}>
          {statusOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterButton,
                filters.status === option.value && styles.filterButtonActive,
              ]}
              onPress={() => updateFilter("status", option.value)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filters.status === option.value &&
                    styles.filterButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    marginRight: 0,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: "#8b5cf6",
    borderColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  priorityButtonActive: {
    borderWidth: 3,
    borderColor: "#1e293b",
    shadowOpacity: 0.2,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  filterButtonTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  priorityButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
});

export default TaskFiltersComponent;
