import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Task, TaskFilters } from "../types/Task";

const TASKS_COLLECTION = "tasks";

export class TaskService {
  // Add a new task
  static async addTask(
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    try {
      const now = new Date();

      // Filter out undefined values to avoid Firestore errors
      const cleanTaskData: any = {
        title: taskData.title,
        description: taskData.description,
        completed: taskData.completed,
        priority: taskData.priority,
        userId: taskData.userId,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now),
        dueDate: Timestamp.fromDate(taskData.dueDate),
      };

      // Only include notificationId if it's not undefined
      if (taskData.notificationId !== undefined) {
        cleanTaskData.notificationId = taskData.notificationId;
      }

      const docRef = await addDoc(
        collection(db, TASKS_COLLECTION),
        cleanTaskData
      );
      return docRef.id;
    } catch (error) {
      console.error("Error adding task:", error);
      throw new Error("Failed to create task");
    }
  }

  // Update an existing task
  static async updateTask(
    taskId: string,
    updates: Partial<Omit<Task, "id" | "createdAt" | "userId">>
  ): Promise<void> {
    try {
      const taskRef = doc(db, TASKS_COLLECTION, taskId);
      const updateData: any = {
        updatedAt: Timestamp.fromDate(new Date()),
      };

      // Only include defined fields in the update
      Object.keys(updates).forEach((key) => {
        const value = (updates as any)[key];
        if (value !== undefined) {
          if (key === "dueDate" && value instanceof Date) {
            updateData[key] = Timestamp.fromDate(value);
          } else {
            updateData[key] = value;
          }
        }
      });

      await updateDoc(taskRef, updateData);
    } catch (error) {
      console.error("Error updating task:", error);
      throw new Error("Failed to update task");
    }
  }

  // Delete a task
  static async deleteTask(taskId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
      throw new Error("Failed to delete task");
    }
  }

  // Get tasks for a specific user with filters
  static async getUserTasks(
    userId: string,
    filters?: TaskFilters
  ): Promise<Task[]> {
    try {
      // Simplified query - only filter by userId to avoid index requirements
      let q = query(
        collection(db, TASKS_COLLECTION),
        where("userId", "==", userId),
        orderBy("dueDate", "asc") // Basic sort that doesn't require composite index
      );

      const querySnapshot = await getDocs(q);
      let tasks: Task[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          completed: data.completed,
          priority: data.priority,
          dueDate: data.dueDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          userId: data.userId,
          notificationId: data.notificationId || undefined,
        });
      });

      // Apply filters locally to avoid complex Firestore queries
      if (filters) {
        // Filter by priority
        if (filters.priority && filters.priority !== "all") {
          tasks = tasks.filter((task) => task.priority === filters.priority);
        }

        // Filter by status
        if (filters.status && filters.status !== "all") {
          const isCompleted = filters.status === "completed";
          tasks = tasks.filter((task) => task.completed === isCompleted);
        }

        // Apply sorting
        if (filters.sortBy) {
          tasks.sort((a, b) => {
            let comparison = 0;

            switch (filters.sortBy) {
              case "dueDate":
                comparison = a.dueDate.getTime() - b.dueDate.getTime();
                break;
              case "createdAt":
                comparison = a.createdAt.getTime() - b.createdAt.getTime();
                break;
              case "priority":
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                comparison =
                  priorityOrder[a.priority] - priorityOrder[b.priority];
                break;
              default:
                comparison = a.dueDate.getTime() - b.dueDate.getTime();
            }

            return filters.sortOrder === "desc" ? -comparison : comparison;
          });
        }
      }

      return tasks;
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      throw new Error("Failed to fetch tasks");
    }
  }

  // Real-time listener for user tasks
  static subscribeToUserTasks(
    userId: string,
    callback: (tasks: Task[]) => void,
    filters?: TaskFilters
  ): () => void {
    try {
      // Simplified query to avoid index requirements
      let q = query(
        collection(db, TASKS_COLLECTION),
        where("userId", "==", userId),
        orderBy("dueDate", "asc")
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          let tasks: Task[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            tasks.push({
              id: doc.id,
              title: data.title,
              description: data.description,
              completed: data.completed,
              priority: data.priority,
              dueDate: data.dueDate.toDate(),
              createdAt: data.createdAt.toDate(),
              updatedAt: data.updatedAt.toDate(),
              userId: data.userId,
              notificationId: data.notificationId || undefined,
            });
          });

          // Apply filters locally to avoid complex Firestore queries
          if (filters) {
            // Filter by priority
            if (filters.priority && filters.priority !== "all") {
              tasks = tasks.filter(
                (task) => task.priority === filters.priority
              );
            }

            // Filter by status
            if (filters.status && filters.status !== "all") {
              const isCompleted = filters.status === "completed";
              tasks = tasks.filter((task) => task.completed === isCompleted);
            }

            // Apply sorting
            if (filters.sortBy) {
              tasks.sort((a, b) => {
                let comparison = 0;

                switch (filters.sortBy) {
                  case "dueDate":
                    comparison = a.dueDate.getTime() - b.dueDate.getTime();
                    break;
                  case "createdAt":
                    comparison = a.createdAt.getTime() - b.createdAt.getTime();
                    break;
                  case "priority":
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    comparison =
                      priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
                  default:
                    comparison = a.dueDate.getTime() - b.dueDate.getTime();
                }

                return filters.sortOrder === "desc" ? -comparison : comparison;
              });
            }
          }

          callback(tasks);
        },
        (error) => {
          console.error("Error in real-time listener:", error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up real-time listener:", error);
      return () => {};
    }
  }

  // Toggle task completion status
  static async toggleTaskCompletion(taskId: string): Promise<void> {
    try {
      // First, get the current task to know its completion status
      const tasksQuery = query(
        collection(db, TASKS_COLLECTION),
        where("__name__", "==", taskId)
      );
      const querySnapshot = await getDocs(tasksQuery);

      if (!querySnapshot.empty) {
        const taskDoc = querySnapshot.docs[0];
        const currentCompleted = taskDoc.data().completed;

        await this.updateTask(taskId, {
          completed: !currentCompleted,
        });
      } else {
        throw new Error("Task not found");
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
      throw new Error("Failed to update task status");
    }
  }
}
