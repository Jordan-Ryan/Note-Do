import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import styled from 'styled-components';
import type { Task, TaskFilter, TaskSort } from '../types/todo';
import TodoToolbar from '../components/todo/TodoToolbar';
import TodoList, { type DropPosition, type TaskGroup } from '../components/todo/TodoList';
import TodoBulkBar from '../components/todo/TodoBulkBar';

const PageShell = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: calc(var(--space-2) * 1.5);
  gap: calc(var(--space-2) * 1.5);
  background: var(--color-surface);
`;

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const LiveRegion = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

type GroupKey = 'overdue' | 'today' | 'upcoming' | 'completed';

interface DropPreviewState {
  id: string;
  position: DropPosition | null;
}

interface KeyboardDragState {
  id: string | null;
  originIndex: number;
}

const initialTasks: Task[] = normaliseOrders([
  {
    id: 'task-1',
    title: 'Prep the lookbook moodboard',
    description: 'Curate 12 hero images and annotate palette options.',
    due: shiftDayISO(-1),
    priority: 'high',
    tags: ['Styling', 'Campaign'],
    projectId: 'proj-brand',
    completed: false,
    updatedAt: shiftTimestamp(-2, 10),
    order: 1,
  },
  {
    id: 'task-2',
    title: 'Confirm influencer shortlist',
    description: 'Send the final shortlist to PR for approval.',
    due: shiftDayISO(0),
    priority: 'medium',
    tags: ['PR'],
    projectId: 'proj-brand',
    completed: false,
    updatedAt: shiftTimestamp(-1, 20),
    order: 2,
  },
  {
    id: 'task-3',
    title: 'Plan push notifications cadence',
    description: 'Draft copy variants and schedule times.',
    due: shiftDayISO(2),
    priority: 'low',
    tags: ['CRM', 'Mobile'],
    projectId: 'proj-growth',
    completed: false,
    updatedAt: shiftTimestamp(-3, 12),
    order: 3,
  },
  {
    id: 'task-4',
    title: 'Retouch studio shoot selects',
    description: 'Apply consistent lighting and export web-ready assets.',
    due: shiftDayISO(3),
    priority: 'high',
    tags: ['Creative'],
    projectId: 'proj-creative',
    completed: true,
    updatedAt: shiftTimestamp(-1, 3),
    order: 4,
  },
  {
    id: 'task-5',
    title: 'Finalize paid social budget',
    description: 'Update the spreadsheet with latest CPM projections.',
    due: shiftDayISO(-3),
    priority: 'medium',
    tags: ['Performance'],
    projectId: 'proj-growth',
    completed: false,
    updatedAt: shiftTimestamp(-4, 16),
    order: 5,
  },
  {
    id: 'task-6',
    title: 'Wrap UX copy QA',
    description: 'Proof microcopy for the checkout flow A/B test.',
    due: undefined,
    priority: 'low',
    tags: ['UX'],
    projectId: 'proj-product',
    completed: true,
    updatedAt: shiftTimestamp(0, -3),
    order: 6,
  },
]);

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sort, setSort] = useState<TaskSort>('due');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [focusedId, setFocusedId] = useState<string | undefined>(initialTasks[0]?.id);
  const [anchorId, setAnchorId] = useState<string | undefined>(initialTasks[0]?.id);
  const [draggingId, setDraggingId] = useState<string | undefined>(undefined);
  const [dropPreview, setDropPreview] = useState<DropPreviewState | null>(null);
  const [shakeIds, setShakeIds] = useState<Set<string>>(new Set());
  const [keyboardDrag, setKeyboardDrag] = useState<KeyboardDragState>({ id: null, originIndex: -1 });
  const [scheduleTaskId, setScheduleTaskId] = useState<string | undefined>(undefined);
  const [quickAddValue, setQuickAddValue] = useState('');
  const [liveMessage, setLiveMessage] = useState('');
  const quickAddFocusRef = useRef<HTMLInputElement | null>(null);
  const shakeTimeouts = useRef<Map<string, number>>(new Map());

  const triggerShake = useCallback((taskId: string) => {
    setShakeIds((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
    const existing = shakeTimeouts.current.get(taskId);
    if (existing) {
      window.clearTimeout(existing);
    }
    const timeoutId = window.setTimeout(() => {
      setShakeIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      shakeTimeouts.current.delete(taskId);
    }, 180);
    shakeTimeouts.current.set(taskId, timeoutId);
  }, []);

  const groups = useMemo<TaskGroup[]>(() => {
    const now = new Date();
    const result = buildGroups(tasks, filter, sort, tagFilter, now);
    return result;
  }, [tasks, filter, sort, tagFilter]);

  const flatTaskIds = useMemo(() => groups.flatMap((group) => group.tasks.map((task) => task.id)), [groups]);

  useEffect(() => {
    if (focusedId && !flatTaskIds.includes(focusedId)) {
      setFocusedId(flatTaskIds[0]);
    }
    setSelectedIds((prev) => {
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (flatTaskIds.includes(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    setAnchorId((prev) => {
      if (!prev || flatTaskIds.includes(prev)) return prev;
      return flatTaskIds[0];
    });
  }, [flatTaskIds, focusedId]);

  useEffect(
    () => () => {
      shakeTimeouts.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      shakeTimeouts.current.clear();
    },
    [],
  );

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const task of tasks) {
      task.tags.forEach((tag) => tagSet.add(tag));
    }
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  const handleSelectTask = (taskId: string, event: MouseEvent | KeyboardEvent) => {
    const isMeta = 'metaKey' in event ? event.metaKey || event.ctrlKey : false;
    const isShift = 'shiftKey' in event ? event.shiftKey : false;

    if (event.type === 'keydown') {
      const keyEvent = event as KeyboardEvent;
      if (keyEvent.key === ' ' || keyEvent.key === 'Enter') {
        keyEvent.preventDefault();
      } else {
        return;
      }
    }

    setFocusedId(taskId);

    if (isShift) {
      rangeSelect(taskId);
    } else if (isMeta) {
      toggleSelect(taskId);
    } else {
      replaceSelection(taskId);
    }
  };

  const handleFocusTask = (taskId: string) => {
    setFocusedId(taskId);
    if (!selectedIds.size) {
      setAnchorId(taskId);
    }
  };

  const handleToggleComplete = (taskId: string) => {
    const task = getTaskById(taskId);
    const nextCompleted = task ? !task.completed : false;
    setTasks((prev) =>
      normaliseOrders(
        prev.map((current) =>
          current.id === taskId ? { ...current, completed: nextCompleted, updatedAt: new Date().toISOString() } : current,
        ),
      ),
    );
    setLiveMessage(`${task?.title ?? 'Task'} marked as ${nextCompleted ? 'complete' : 'incomplete'}.`);
  };

  const handleEditTask = () => {
    setLiveMessage('Edit action coming soon.');
  };

  const handleDeleteTask = (taskId: string) => {
    const task = getTaskById(taskId);
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
    setLiveMessage(`${task?.title ?? 'Task'} deleted.`);
  };

  const handleRequestSchedule = (taskId: string) => {
    setScheduleTaskId(taskId);
    setLiveMessage(`Schedule options opened for ${getTaskById(taskId)?.title ?? 'task'}.`);
  };

  const handleCloseSchedule = () => {
    setScheduleTaskId(undefined);
    setLiveMessage('Schedule popover closed.');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!flatTaskIds.length) return;
    const currentIndex = focusedId ? flatTaskIds.indexOf(focusedId) : -1;

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = Math.min(flatTaskIds.length - 1, currentIndex + 1);
        const targetId = flatTaskIds[nextIndex];
        if (targetId) {
          setFocusedId(targetId);
          if (event.shiftKey) {
            rangeSelect(targetId);
          } else {
            setAnchorId(targetId);
            if (!event.metaKey && !event.ctrlKey && !selectedIds.has(targetId)) {
              replaceSelection(targetId);
            }
          }
        }
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        const nextIndex = Math.max(0, currentIndex - 1);
        const targetId = flatTaskIds[nextIndex];
        if (targetId) {
          setFocusedId(targetId);
          if (event.shiftKey) {
            rangeSelect(targetId);
          } else {
            setAnchorId(targetId);
            if (!event.metaKey && !event.ctrlKey && !selectedIds.has(targetId)) {
              replaceSelection(targetId);
            }
          }
        }
        break;
      }
      case 'Home': {
        event.preventDefault();
        const targetId = flatTaskIds[0];
        if (targetId) {
          setFocusedId(targetId);
          if (event.shiftKey) {
            rangeSelect(targetId);
          } else {
            replaceSelection(targetId);
          }
        }
        break;
      }
      case 'End': {
        event.preventDefault();
        const targetId = flatTaskIds[flatTaskIds.length - 1];
        if (targetId) {
          setFocusedId(targetId);
          if (event.shiftKey) {
            rangeSelect(targetId);
          } else {
            replaceSelection(targetId);
          }
        }
        break;
      }
      case ' ': {
        event.preventDefault();
        if (!focusedId) break;
        if (keyboardDrag.id === focusedId) {
          finalizeKeyboardDrop();
        } else if (keyboardDrag.id) {
          finalizeKeyboardDrop();
        } else {
          toggleSelect(focusedId);
          beginKeyboardDrag(focusedId);
        }
        break;
      }
      case 'Escape': {
        if (keyboardDrag.id) {
          cancelKeyboardDrag();
          event.preventDefault();
          return;
        }
        if (selectedIds.size > 0) {
          clearSelection();
          event.preventDefault();
        }
        break;
      }
      case 'Enter': {
        if (focusedId) {
          toggleSelect(focusedId);
          event.preventDefault();
        }
        break;
      }
      default:
        if (keyboardDrag.id) {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            moveKeyboardDrag(event.key === 'ArrowDown' ? 1 : -1);
          }
        }
    }
  };

  const handleDragStart = (taskId: string) => {
    setDraggingId(taskId);
    setDropPreview(null);
    if (!selectedIds.has(taskId)) {
      replaceSelection(taskId);
    }
    setLiveMessage(`Picked up ${getTaskById(taskId)?.title ?? 'task'}.`);
  };

  const handleDragTarget = (taskId: string, position: DropPosition | null) => {
    if (!taskId) {
      setDropPreview(null);
      return;
    }
    setDropPreview({ id: taskId, position });
  };

  const handleDropTask = (sourceId: string, targetId: string, position: DropPosition | null) => {
    if (!position) {
      triggerShake(targetId);
      setLiveMessage('Cannot drop there.');
      setDraggingId(undefined);
      setDropPreview(null);
      return;
    }
    const sourceTask = getTaskById(sourceId);
    const targetTask = getTaskById(targetId);
    const result = reorderWithinGroup(tasks, sourceId, targetId, position);
    if (!result) {
      triggerShake(targetId);
      setLiveMessage('Only tasks within the same section can be reordered.');
    } else {
      setTasks(result);
      setLiveMessage(
        `Moved ${sourceTask?.title ?? 'task'} ${position} ${targetTask?.title ?? 'task'}.`,
      );
    }
    setDraggingId(undefined);
    setDropPreview(null);
  };

  const handleDragEnd = () => {
    setDraggingId(undefined);
    setDropPreview(null);
  };

  const beginKeyboardDrag = (taskId: string) => {
    const index = flatTaskIds.indexOf(taskId);
    setKeyboardDrag({ id: taskId, originIndex: index });
    setLiveMessage(`Picked up ${getTaskById(taskId)?.title ?? 'task'}. Use arrow keys to move, space to drop.`);
  };

  const moveKeyboardDrag = (direction: 1 | -1) => {
    if (!keyboardDrag.id) return;
    const currentIndex = flatTaskIds.indexOf(keyboardDrag.id);
    const targetIndex = currentIndex + direction;
    const targetId = flatTaskIds[targetIndex];
    if (!targetId) {
      triggerShake(keyboardDrag.id);
      setLiveMessage('No more tasks in that direction.');
      return;
    }

    const movingTask = getTaskById(keyboardDrag.id);
    const targetTask = getTaskById(targetId);
    const result = reorderWithinGroup(tasks, keyboardDrag.id, targetId, direction > 0 ? 'after' : 'before');
    if (!result) {
      triggerShake(keyboardDrag.id);
      setLiveMessage('Cannot move task outside its section.');
      return;
    }
    setTasks(result);
    setFocusedId(keyboardDrag.id);
    setLiveMessage(
      `Moved ${movingTask?.title ?? 'task'} ${direction > 0 ? 'after' : 'before'} ${
        targetTask?.title ?? 'task'
      }.`,
    );
  };

  const finalizeKeyboardDrop = () => {
    if (!keyboardDrag.id) return;
    const droppedTask = keyboardDrag.id ? getTaskById(keyboardDrag.id) : focusedId ? getTaskById(focusedId) : undefined;
    setKeyboardDrag({ id: null, originIndex: -1 });
    setLiveMessage(`Dropped ${droppedTask?.title ?? 'task'}.`);
  };

  const cancelKeyboardDrag = () => {
    if (!keyboardDrag.id) return;
    setKeyboardDrag({ id: null, originIndex: -1 });
    setLiveMessage('Cancelled move.');
  };

  const toggleSelect = (taskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      setAnchorId(taskId);
      return next;
    });
  };

  const replaceSelection = (taskId: string) => {
    setSelectedIds(new Set([taskId]));
    setAnchorId(taskId);
  };

  const rangeSelect = (taskId: string) => {
    const startId = anchorId ?? focusedId ?? taskId;
    const startIndex = flatTaskIds.indexOf(startId);
    const endIndex = flatTaskIds.indexOf(taskId);
    if (startIndex === -1 || endIndex === -1) return;
    const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
    const ids = flatTaskIds.slice(from, to + 1);
    setSelectedIds(new Set(ids));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleQuickAddSubmit = () => {
    const trimmed = quickAddValue.trim();
    if (!trimmed) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: trimmed,
      description: '',
      due: filter === 'upcoming' ? shiftDayISO(1) : shiftDayISO(0),
      priority: 'medium',
      tags: [],
      projectId: undefined,
      completed: false,
      updatedAt: new Date().toISOString(),
      order: tasks.length + 1,
    };
    setTasks((prev) => normaliseOrders([newTask, ...prev]));
    setQuickAddValue('');
    setFocusedId(newTask.id);
    replaceSelection(newTask.id);
    setLiveMessage(`Added ${newTask.title}.`);
  };

  const handleBulkComplete = () => {
    if (!selectedIds.size) return;
    setTasks((prev) =>
      normaliseOrders(
        prev.map((task) =>
          selectedIds.has(task.id) ? { ...task, completed: true, updatedAt: new Date().toISOString() } : task,
        ),
      ),
    );
    setLiveMessage('Selected tasks completed.');
  };

  const handleBulkDelete = () => {
    if (!selectedIds.size) return;
    setTasks((prev) => prev.filter((task) => !selectedIds.has(task.id)));
    clearSelection();
    setLiveMessage('Selected tasks deleted.');
  };

  const getTaskById = (taskId: string) => tasks.find((task) => task.id === taskId);

  return (
    <PageShell>
      <TodoToolbar
        filter={filter}
        onFilterChange={(next) => {
          setFilter(next);
          setFocusedId(undefined);
        }}
        availableTags={availableTags}
        activeTag={tagFilter}
        onTagChange={(tag) => setTagFilter(tag)}
        sort={sort}
        onSortChange={setSort}
        onNewTask={() => {
          quickAddFocusRef.current?.focus();
        }}
      />

      <ContentArea>
        <TodoList
          groups={groups}
          selectedIds={selectedIds}
          focusedId={focusedId}
          draggingId={draggingId}
          keyboardDraggingId={keyboardDrag.id ?? undefined}
          dropPreview={dropPreview}
          shakeIds={shakeIds}
          scheduleOpenId={scheduleTaskId}
          quickAddValue={quickAddValue}
          quickAddRef={quickAddFocusRef}
          onQuickAddChange={setQuickAddValue}
          onQuickAddSubmit={handleQuickAddSubmit}
          onQuickAddCancel={() => setQuickAddValue('')}
          onFocusTask={handleFocusTask}
          onSelectTask={handleSelectTask}
          onToggleComplete={handleToggleComplete}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onRequestSchedule={handleRequestSchedule}
          onCloseSchedule={handleCloseSchedule}
          onListKeyDown={handleKeyDown}
          onDragStart={handleDragStart}
          onDragTarget={handleDragTarget}
          onDropTask={handleDropTask}
          onDragEnd={handleDragEnd}
        />
        {selectedIds.size > 1 ? (
          <TodoBulkBar
            selectedCount={selectedIds.size}
            onCompleteSelected={handleBulkComplete}
            onDeleteSelected={handleBulkDelete}
            onClearSelection={clearSelection}
          />
        ) : null}
      </ContentArea>

      <LiveRegion role="status" aria-live="polite">
        {liveMessage}
      </LiveRegion>
    </PageShell>
  );
}

function buildGroups(
  tasks: Task[],
  filter: TaskFilter,
  sort: TaskSort,
  tagFilter: string | null,
  now: Date,
): TaskGroup[] {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const filtered = tasks.filter((task) => {
    if (tagFilter && !task.tags.some((tag) => tag === tagFilter)) return false;
    if (filter === 'today') {
      if (task.completed) return true;
      if (!task.due) return false;
      const due = new Date(task.due);
      return due < end;
    }
    if (filter === 'upcoming') {
      if (task.completed) return true;
      if (!task.due) return true;
      const due = new Date(task.due);
      return due >= end;
    }
    return true;
  });

  const comparator = createComparator(sort, start);

  const buckets: Record<GroupKey, Task[]> = {
    overdue: [],
    today: [],
    upcoming: [],
    completed: [],
  };

  for (const task of filtered) {
    const key = getGroupKey(task, start, end);
    buckets[key].push(task);
  }

  (Object.keys(buckets) as GroupKey[]).forEach((key) => {
    buckets[key].sort(comparator);
  });

  const groups: TaskGroup[] = [];
  if (buckets.overdue.length) {
    groups.push({ id: 'overdue', label: 'Overdue', tasks: buckets.overdue });
  }
  if (buckets.today.length) {
    groups.push({ id: 'today', label: 'Today', tasks: buckets.today });
  }
  if (buckets.upcoming.length) {
    groups.push({ id: 'upcoming', label: 'Upcoming', tasks: buckets.upcoming });
  }
  if (buckets.completed.length) {
    groups.push({ id: 'completed', label: 'Completed', tasks: buckets.completed });
  }

  return groups;
}

function getGroupKey(task: Task, start: Date, end: Date): GroupKey {
  if (task.completed) return 'completed';
  if (!task.due) return 'upcoming';
  const due = new Date(task.due);
  if (due < start) return 'overdue';
  if (due >= start && due < end) return 'today';
  return 'upcoming';
}

function createComparator(sort: TaskSort, todayStart: Date) {
  const priorityRank: Record<Task['priority'], number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return (a: Task, b: Task) => {
    if (sort === 'due') {
      const aDue = a.due ? new Date(a.due).getTime() : Number.POSITIVE_INFINITY;
      const bDue = b.due ? new Date(b.due).getTime() : Number.POSITIVE_INFINITY;
      if (aDue !== bDue) return aDue - bDue;
    } else if (sort === 'priority') {
      const diff = priorityRank[a.priority] - priorityRank[b.priority];
      if (diff !== 0) return diff;
    } else if (sort === 'updated') {
      const diff = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (diff !== 0) return diff;
    }
    return a.order - b.order;
  };
}

function reorderWithinGroup(
  tasks: Task[],
  sourceId: string,
  targetId: string,
  position: DropPosition,
): Task[] | null {
  if (sourceId === targetId) return normaliseOrders(tasks);
  const start = new Date();
  const todayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const todayEnd = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);

  const sourceTask = tasks.find((task) => task.id === sourceId);
  const targetTask = tasks.find((task) => task.id === targetId);
  if (!sourceTask || !targetTask) return null;

  const sourceKey = getGroupKey(sourceTask, todayStart, todayEnd);
  const targetKey = getGroupKey(targetTask, todayStart, todayEnd);

  if (sourceKey !== targetKey) {
    return null;
  }

  const updated = [...tasks];
  const sourceIndex = updated.findIndex((task) => task.id === sourceId);
  const [item] = updated.splice(sourceIndex, 1);
  let targetIndex = updated.findIndex((task) => task.id === targetId);
  if (targetIndex < 0) return null;
  if (position === 'after') {
    targetIndex += 1;
  }
  updated.splice(targetIndex, 0, item);
  return normaliseOrders(updated);
}

function normaliseOrders(tasks: Task[]): Task[] {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const counters = new Map<GroupKey, number>();

  return tasks.map((task) => {
    const key = getGroupKey(task, start, end);
    const nextOrder = (counters.get(key) ?? 0) + 1;
    counters.set(key, nextOrder);
    return { ...task, order: nextOrder };
  });
}

function shiftDayISO(delta: number) {
  const now = new Date();
  now.setDate(now.getDate() + delta);
  now.setHours(9, 0, 0, 0);
  return now.toISOString();
}

function shiftTimestamp(dayOffset: number, hourOffset: number) {
  const now = new Date();
  now.setDate(now.getDate() + dayOffset);
  now.setHours(now.getHours() + hourOffset);
  return now.toISOString();
}
