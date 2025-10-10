import type { KeyboardEvent, MouseEvent } from 'react';
import styled, { css, keyframes } from 'styled-components';
import type { Task } from '../../types/todo';
import TagPill from '../shared/TagPill';

type DueStatus = 'overdue' | 'today' | 'upcoming' | 'none';
type DropPosition = 'before' | 'after' | null;

export interface TodoCardProps {
  task: Task;
  tabIndex: number;
  selected: boolean;
  focused: boolean;
  dragging: boolean;
  keyboardDragging: boolean;
  shake: boolean;
  dropPosition: DropPosition;
  dueStatus: DueStatus;
  dueLabel: string | null;
  onFocus: () => void;
  onSelect: (event: MouseEvent | KeyboardEvent) => void;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRequestSchedule: () => void;
  onCloseSchedule: () => void;
  scheduleOpen: boolean;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

const priorityStripe: Record<Task['priority'], string> = {
  high: 'rgba(255, 99, 99, 1)',
  medium: 'rgba(255, 99, 99, 0.64)',
  low: 'rgba(255, 99, 99, 0.32)',
};

const dropIndicatorStyles = {
  before: css`
    &::before {
      content: '';
      position: absolute;
      inset: -10px -10px auto -10px;
      height: 3px;
      background: var(--color-accent);
      border-radius: 999px;
    }
  `,
  after: css`
    &::after {
      content: '';
      position: absolute;
      inset: auto -10px -10px -10px;
      height: 3px;
      background: var(--color-accent);
      border-radius: 999px;
    }
  `,
};

const shakeAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
`;

const CardShell = styled.div<{
  $selected: boolean;
  $focused: boolean;
  $dragging: boolean;
  $keyboardDragging: boolean;
  $shake: boolean;
  $drop: DropPosition;
  $priority: Task['priority'];
  $completed: boolean;
}>`
  position: relative;
  background: var(--color-card);
  border-radius: var(--radius-card);
  padding: calc(var(--space-2) * 1.1);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-2);
  align-items: flex-start;
  box-shadow: var(--shadow-card);
  border: 1px solid transparent;
  cursor: grab;
  transition: transform var(--duration-fast) var(--easing), box-shadow var(--duration-fast) var(--easing),
    border-color var(--duration-fast) var(--easing);
  outline: none;

  &::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    border-radius: var(--radius-card) 0 0 var(--radius-card);
    background: ${(props) => priorityStripe[props.$priority]};
  }

  ${(props) =>
    props.$shake &&
    css`
      animation: ${shakeAnim} 140ms var(--easing);
    `}

  ${(props) =>
    props.$selected &&
    css`
      border-color: rgba(255, 99, 99, 0.32);
      box-shadow: 0 0 0 2px rgba(255, 99, 99, 0.18), var(--shadow-card);
    `}

  ${(props) =>
    props.$focused &&
    css`
      box-shadow: 0 0 0 2px var(--color-accent), var(--shadow-card);
    `}

  ${(props) =>
    props.$dragging &&
    css`
      opacity: 0.68;
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.24);
      cursor: grabbing;
    `}

  ${(props) =>
    props.$keyboardDragging &&
    css`
      box-shadow: 0 0 0 2px var(--color-accent), 0 0 0 4px rgba(255, 99, 99, 0.28);
    `}

  ${(props) => props.$drop && dropIndicatorStyles[props.$drop]}

  ${(props) =>
    props.$completed &&
    css`
      opacity: 0.82;
    `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-elevated);
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  padding-top: 2px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: var(--color-accent);
  cursor: pointer;
`;

const Content = styled.div`
  display: grid;
  gap: 6px;
`;

const Title = styled.h3<{ $completed: boolean }>`
  font-size: 1rem;
  margin: 0;
  color: var(--color-header);

  ${(props) =>
    props.$completed &&
    css`
      color: var(--color-text-muted);
      text-decoration: line-through;
    `}
`;

const Description = styled.p`
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  line-height: 1.4;
  max-width: 60ch;
`;

const MetaRow = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
`;

const Actions = styled.div`
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
`;

const IconButton = styled.button`
  border: 1px solid transparent;
  background: rgba(0, 0, 0, 0.04);
  border-radius: var(--radius-button);
  padding: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--duration-fast) var(--easing), transform var(--duration-fast) var(--easing),
    box-shadow var(--duration-fast) var(--easing);

  &:hover {
    background: rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-accent);
  }
`;

const StatusText = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-muted);
`;

const SchedulePopover = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-elevated);
  border: 1px solid var(--color-border);
  padding: var(--space-1);
  display: grid;
  gap: 4px;
  min-width: 160px;
  z-index: calc(var(--z-sidebar) + 50);
`;

const ScheduleButton = styled.button`
  border: none;
  background: transparent;
  font-size: 0.85rem;
  padding: 8px;
  border-radius: var(--radius-button);
  text-align: left;
  cursor: pointer;
  transition: background var(--duration-fast) var(--easing);

  &:hover,
  &:focus-visible {
    background: rgba(255, 99, 99, 0.1);
    outline: none;
  }
`;

export function TodoCard({
  task,
  tabIndex,
  selected,
  focused,
  dragging,
  keyboardDragging,
  shake,
  dropPosition,
  dueStatus,
  dueLabel,
  onFocus,
  onSelect,
  onToggleComplete,
  onEdit,
  onDelete,
  onRequestSchedule,
  onCloseSchedule,
  scheduleOpen,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragEnd,
  onDrop,
}: TodoCardProps) {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    onSelect(event);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      onSelect(event);
    }
  };

  const renderDuePill = () => {
    if (!dueLabel) {
      return null;
    }
    let tone: 'default' | 'accent' | 'muted' = 'default';
    if (dueStatus === 'overdue' || dueStatus === 'today') {
      tone = 'accent';
    } else if (task.completed) {
      tone = 'muted';
    }
    return (
      <TagPill size="sm" tone={tone} aria-label={`Due ${dueLabel}`} disabled>
        {dueLabel}
      </TagPill>
    );
  };

  const srStatus = task.completed
    ? 'Completed'
    : dueStatus === 'overdue'
    ? 'Overdue'
    : dueStatus === 'today'
    ? 'Due today'
    : dueStatus === 'upcoming'
    ? 'Upcoming'
    : 'No due date';

  return (
    <CardShell
      role="option"
      aria-selected={selected}
      aria-roledescription="Task"
      aria-describedby={`${task.id}-status`}
      tabIndex={tabIndex}
      $priority={task.priority}
      $selected={selected}
      $focused={focused}
      $dragging={dragging}
      $keyboardDragging={keyboardDragging}
      $shake={shake}
      $drop={dropPosition}
      $completed={task.completed}
      draggable
      onFocus={onFocus}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDrop={onDrop}
      data-task-id={task.id}
    >
      <CheckboxWrapper>
        <Checkbox
          type="checkbox"
          checked={task.completed}
          onChange={onToggleComplete}
          aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        />
      </CheckboxWrapper>

      <Content>
        <Title $completed={task.completed}>{task.title}</Title>
        {task.description ? <Description>{task.description}</Description> : null}
        <MetaRow>
          {renderDuePill()}
          {task.tags.map((tag) => (
            <TagPill key={tag} size="sm" tone="muted" disabled>
              {tag}
            </TagPill>
          ))}
          <StatusText id={`${task.id}-status`}>{srStatus}</StatusText>
        </MetaRow>
      </Content>

      <Actions>
        <IconButton type="button" aria-label="Edit task" onClick={onEdit}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M4 13.5 13.5 4l2.5 2.5L6.5 16H4v-2.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
        <IconButton
          type="button"
          aria-expanded={scheduleOpen}
          aria-controls={`${task.id}-schedule`}
          aria-label="Schedule task"
          onClick={scheduleOpen ? onCloseSchedule : onRequestSchedule}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="7" cy="12" r="1.5" fill="currentColor" />
            <path d="M10 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </IconButton>
        <IconButton type="button" aria-label="Delete task" onClick={onDelete}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M5 6h10m-8 0v8a2 2 0 1 0 4 0V6M7 6h6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M8 6h4l-.5-2h-3L8 6Z" fill="currentColor" />
          </svg>
        </IconButton>
        {scheduleOpen ? (
          <SchedulePopover id={`${task.id}-schedule`} role="dialog" aria-label="Schedule task">
            {createScheduleSlots().map((slot) => (
              <ScheduleButton key={slot} type="button" onClick={onCloseSchedule}>
                {slot}
              </ScheduleButton>
            ))}
          </SchedulePopover>
        ) : null}
      </Actions>
    </CardShell>
  );
}

function createScheduleSlots() {
  const slots: string[] = [];
  for (let hour = 8; hour <= 20; hour += 1) {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : hour;
    slots.push(`${hour12}:00 ${suffix}`);
    slots.push(`${hour12}:30 ${suffix}`);
  }
  return slots;
}

export default TodoCard;
