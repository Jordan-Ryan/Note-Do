export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'done';

export type TaskPriority = 'high' | 'medium' | 'low';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  notes?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type?: string;
  sizeKb?: number;
  url?: string;
}

export interface TimeEntry {
  id: string;
  startIso: string;
  endIso?: string;
  source: 'timer' | 'manual';
  minutes: number;
}

export interface Reminder {
  atIso?: string;
  offsetMin?: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId?: string;
  areaId?: string;
  tags: string[];
  dueIso?: string;
  reminder?: Reminder;
  estimatedMinutes?: number;
  timeSpentMinutes: number;
  timeEntries: TimeEntry[];
  linkedNoteIds: string[];
  calendarEventId?: string;
  dependencyIds: string[];
  attachments: Attachment[];
  subtasks: Subtask[];
  createdAtIso: string;
  updatedAtIso: string;
  completed: boolean;
  order: number;
}

export type TaskFilter = 'all' | 'today' | 'upcoming' | 'completed';

export type TaskSort = 'due' | 'priority' | 'updated';
