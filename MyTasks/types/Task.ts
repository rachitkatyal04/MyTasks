export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string; // Associate tasks with specific users
  notificationId?: string; // Optional notification ID
}

export interface TaskFilters {
  priority?: "low" | "medium" | "high" | "all";
  status?: "completed" | "incomplete" | "all";
  sortBy?: "dueDate" | "createdAt" | "priority";
  sortOrder?: "asc" | "desc";
}
