import type { DragEvent, KeyboardEvent, MouseEvent, RefObject } from 'react';
import { forwardRef, useMemo } from 'react';
import styled from 'styled-components';
import type { Task } from '../../types/todo';
import TodoCard from './TodoCard';

export interface TaskGroup {
  id: string;
  label: string;
  tasks: Task[];
}

export type DropPosition = 'before' | 'after';

export interface TodoListProps {
  groups: TaskGroup[];
  selectedIds: Set<string>;
  focusedId?: string;
  draggingId?: string;
  keyboardDraggingId?: string;
  dropPreview?: { id: string; position: DropPosition | null } | null;
  shakeIds: Set<string>;
  scheduleOpenId?: string;
  quickAddValue: string;
  quickAddRef?: RefObject<HTMLInputElement>;
  onQuickAddChange: (value: string) => void;
  onQuickAddSubmit: () => void;
  onQuickAddCancel: () => void;
  onFocusTask: (id: string) => void;
  onSelectTask: (id: string, event: MouseEvent | KeyboardEvent) => void;
  onToggleComplete: (id: string) => void;
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onRequestSchedule: (id: string) => void;
  onCloseSchedule: () => void;
  onListKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  onDragStart: (taskId: string) => void;
  onDragTarget: (taskId: string, position: DropPosition | null) => void;
  onDropTask: (sourceId: string, targetId: string, position: DropPosition | null) => void;
  onDragEnd: () => void;
}

const ListShell = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: calc(var(--space-2) * 1.5);
  display: grid;
  gap: calc(var(--space-2) * 1.25);
  scroll-padding-top: var(--space-2);
`;

const GroupSection = styled.section`
  display: grid;
  gap: var(--space-2);
`;

const GroupHeader = styled.header`
  position: sticky;
  top: calc(var(--space-2) * -0.5);
  background: linear-gradient(
    to bottom,
    rgba(249, 249, 249, 0.96),
    rgba(249, 249, 249, 0.86) 60%,
    rgba(249, 249, 249, 0)
  );
  padding: 6px 0;
  z-index: 1;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
`;

const QuickAddForm = styled.form`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-card);
  background: rgba(255, 255, 255, 0.6);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.02);
`;

const QuickAddInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: var(--color-header);

  &:focus-visible {
    outline: none;
  }

  &::placeholder {
    color: var(--color-text-muted);
  }
`;

const QuickAddHint = styled.span`
  font-size: 0.78rem;
  color: var(--color-text-muted);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 64px 16px;
  color: var(--color-text-muted);
  font-size: 0.95rem;
`;

export const TodoList = forwardRef<HTMLDivElement, TodoListProps>(function TodoListImpl(
  {
    groups,
    selectedIds,
    focusedId,
    draggingId,
    keyboardDraggingId,
    dropPreview,
    shakeIds,
    scheduleOpenId,
    quickAddValue,
    quickAddRef,
    onQuickAddChange,
    onQuickAddSubmit,
    onQuickAddCancel,
    onFocusTask,
    onSelectTask,
    onToggleComplete,
    onEditTask,
    onDeleteTask,
    onRequestSchedule,
    onCloseSchedule,
    onListKeyDown,
    onDragStart,
    onDragTarget,
    onDropTask,
    onDragEnd,
  },
  ref,
) {
  const flatTaskIds = useMemo(() => groups.flatMap((group) => group.tasks.map((task) => task.id)), [groups]);

  const handleDragStart = (event: DragEvent<HTMLDivElement>) => {
    const { taskId } = event.currentTarget.dataset;
    if (!taskId) return;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', taskId);
    onDragStart(taskId);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const { taskId } = event.currentTarget.dataset;
    if (!taskId || draggingId === taskId) {
      onDragTarget(taskId ?? '', null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const isBefore = event.clientY < rect.top + rect.height / 2;
    onDragTarget(taskId, isBefore ? 'before' : 'after');
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain');
    const { taskId } = event.currentTarget.dataset;
    if (!taskId || !sourceId || sourceId === taskId) {
      onDragEnd();
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const isBefore = event.clientY < rect.top + rect.height / 2;
    onDropTask(sourceId, taskId, isBefore ? 'before' : 'after');
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    const { taskId } = event.currentTarget.dataset;
    if (!taskId || draggingId === taskId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const isBefore = event.clientY < rect.top + rect.height / 2;
    onDragTarget(taskId, isBefore ? 'before' : 'after');
  };

  const handleDragEnd = () => {
    onDragEnd();
  };

  const handleQuickAddKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onQuickAddSubmit();
    } else if (event.key === 'Escape') {
      onQuickAddCancel();
    }
  };

  const renderContent = () => {
    if (flatTaskIds.length === 0) {
      return <EmptyState>No tasks yet. Use quick add or the new task button to get started.</EmptyState>;
    }

    return groups.map((group) => (
      <GroupSection key={group.id} aria-label={group.label}>
        <GroupHeader>{group.label}</GroupHeader>
        {group.tasks.map((task) => (
          <TodoCard
            key={task.id}
            task={task}
            tabIndex={focusedId === task.id ? 0 : -1}
            selected={selectedIds.has(task.id)}
            focused={focusedId === task.id}
            dragging={draggingId === task.id}
            keyboardDragging={keyboardDraggingId === task.id}
            shake={shakeIds.has(task.id)}
            dropPosition={
              dropPreview && dropPreview.id === task.id ? dropPreview.position ?? null : null
            }
            dueStatus={getDueStatus(task)}
            dueLabel={formatDueLabel(task)}
            onFocus={() => onFocusTask(task.id)}
            onSelect={(event) => onSelectTask(task.id, event)}
            onToggleComplete={() => onToggleComplete(task.id)}
            onEdit={() => onEditTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
            onRequestSchedule={() => onRequestSchedule(task.id)}
            onCloseSchedule={onCloseSchedule}
            scheduleOpen={scheduleOpenId === task.id}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        ))}
      </GroupSection>
    ));
  };

  return (
    <ListShell>
      <ScrollArea
        ref={ref}
        role="listbox"
        aria-multiselectable="true"
        aria-label="Tasks"
        tabIndex={-1}
        onKeyDown={onListKeyDown}
      >
        <QuickAddForm
          aria-label="Quick add task"
          onSubmit={(event) => {
            event.preventDefault();
            onQuickAddSubmit();
          }}
        >
          <QuickAddInput
            ref={quickAddRef}
            value={quickAddValue}
            placeholder="Add a task…"
            aria-label="Add a task"
            onChange={(event) => onQuickAddChange(event.target.value)}
            onKeyDown={handleQuickAddKeyDown}
          />
          <QuickAddHint>Enter to add • Esc to cancel</QuickAddHint>
        </QuickAddForm>
        {renderContent()}
      </ScrollArea>
    </ListShell>
  );
});

function getDueStatus(task: Task): 'overdue' | 'today' | 'upcoming' | 'none' {
  if (!task.due) return 'none';
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const dueDate = new Date(task.due);

  if (task.completed) {
    return dueDate < start ? 'overdue' : 'none';
  }

  if (dueDate < start) return 'overdue';
  if (dueDate >= start && dueDate < end) return 'today';
  return 'upcoming';
}

function formatDueLabel(task: Task) {
  if (!task.due) return null;
  const dueDate = new Date(task.due);
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  if (dueDate < todayStart) {
    return `Overdue · ${dueDate.toLocaleDateString(undefined, options)}`;
  }
  if (dueDate < tomorrowStart) {
    return 'Today';
  }

  const inTwoDays = new Date(todayStart.getTime() + 2 * 24 * 60 * 60 * 1000);
  if (dueDate < inTwoDays) {
    return `Tomorrow`;
  }

  return dueDate.toLocaleDateString(undefined, options);
}

export default TodoList;
