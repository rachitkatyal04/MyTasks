import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { TaskFilters } from "../types/Task";

interface TaskSortProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
}

const TaskSort: React.FC<TaskSortProps> = ({ filters, onFiltersChange }) => {
  const [showSortOptions, setShowSortOptions] = useState(false);

  const sortOptions = [
    { value: "dueDate", label: "Due Date", icon: "📅" },
    { value: "createdAt", label: "Created Date", icon: "📝" },
    { value: "priority", label: "Priority", icon: "⭐" },
  ] as const;

  const getCurrentSortLabel = () => {
    const currentSort = sortOptions.find(
      (option) => option.value === (filters.sortBy || "dueDate")
    );
    return currentSort?.label || "Due Date";
  };

  const getCurrentSortIcon = () => {
    const currentSort = sortOptions.find(
      (option) => option.value === (filters.sortBy || "dueDate")
    );
    return currentSort?.icon || "📅";
  };

  const handleSortChange = (sortBy: "dueDate" | "createdAt" | "priority") => {
    onFiltersChange({
      ...filters,
      sortBy,
    });
    setShowSortOptions(false);
  };

  const toggleSortOrder = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
    });
  };

  const getSortOrderIcon = () => {
    return filters.sortOrder === "desc" ? "↓" : "↑";
  };

  const getSortOrderLabel = () => {
    const order = filters.sortOrder === "desc" ? "Latest" : "Earliest";
    const sortBy = filters.sortBy || "dueDate";

    if (sortBy === "dueDate") {
      return filters.sortOrder === "desc" ? "Latest Due" : "Earliest Due";
    } else if (sortBy === "createdAt") {
      return filters.sortOrder === "desc" ? "Newest First" : "Oldest First";
    } else {
      return filters.sortOrder === "desc" ? "High to Low" : "Low to High";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.sortControls}>
        {/* Sort By Button */}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortOptions(true)}
        >
          <Text style={styles.sortIcon}>{getCurrentSortIcon()}</Text>
          <Text style={styles.sortButtonText}>
            Sort by {getCurrentSortLabel()}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>

        {/* Sort Order Toggle */}
        <TouchableOpacity style={styles.orderButton} onPress={toggleSortOrder}>
          <Text style={styles.orderIcon}>{getSortOrderIcon()}</Text>
          <Text style={styles.orderButtonText}>{getSortOrderLabel()}</Text>
        </TouchableOpacity>
      </View>

      {/* Sort Options Modal */}
      <Modal
        visible={showSortOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortOptions(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort by</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortOption,
                  (filters.sortBy || "dueDate") === option.value &&
                    styles.sortOptionActive,
                ]}
                onPress={() => handleSortChange(option.value)}
              >
                <Text style={styles.sortOptionIcon}>{option.icon}</Text>
                <Text
                  style={[
                    styles.sortOptionText,
                    (filters.sortBy || "dueDate") === option.value &&
                      styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {(filters.sortBy || "dueDate") === option.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 16,
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
  sortControls: {
    flexDirection: "row",
    gap: 12,
  },
  sortButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  sortIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  sortButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#94a3b8",
  },
  orderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#8b5cf6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  orderIcon: {
    fontSize: 16,
    color: "#ffffff",
    marginRight: 6,
  },
  orderButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    marginHorizontal: 32,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    minWidth: 250,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  sortOptionActive: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#8b5cf6",
  },
  sortOptionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#475569",
  },
  sortOptionTextActive: {
    color: "#8b5cf6",
    fontWeight: "700",
  },
  checkmark: {
    fontSize: 16,
    color: "#8b5cf6",
    fontWeight: "bold",
  },
});

export default TaskSort;
