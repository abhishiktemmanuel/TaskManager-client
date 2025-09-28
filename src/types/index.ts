import type { User } from '../context/authContext';
export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  assignedTo: User;
  createdBy: User;
  progress: number;
  todos: Todo[];
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

export interface CreateTaskData {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  assignedToId?: number;
  todos?: string[];
}

export interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  teamSize?: number;
}