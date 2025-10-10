import { forwardRef, useId } from 'react';
import styled, { css, keyframes } from 'styled-components';
import TagPill from '../shared/TagPill';

const lift = css`
  transform: translateY(-2px);
  box-shadow: var(--shadow-elevated);
`;

const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-3px); }
  100% { transform: translateX(0); }
`;

const Card = styled.article<{ $selected: boolean; $dragging: boolean; $shaking: boolean }>`
  position: relative;
  display: flex;
  gap: 12px;
  padding: 14px 16px 14px 20px;
  background: var(--color-card);
  border-radius: var(--radius-card);
  border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: transform var(--duration-fast) var(--easing), box-shadow var(--duration-fast) var(--easing),
    border-color var(--duration-fast) var(--easing);
  outline: none;

  &:hover {
    ${lift}
  }

  ${({ $dragging }) =>
    $dragging &&
    css`
      opacity: 0.85;
      ${lift}
    `}

  ${({ $selected }) =>
    $selected &&
    css`
      border-color: var(--color-accent);
      box-shadow: 0 0 0 1.5px var(--color-accent), var(--shadow-card);

      &::before {
        content: '';
        position: absolute;
        inset: 0 auto 0 0;
        width: 3px;
        background: var(--color-accent);
        border-radius: 3px 0 0 3px;
      }
    `}

  ${({ $shaking }) =>
    $shaking &&
    css`
      animation: ${shake} 0.18s var(--easing);
    `}

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Content = styled.div`
  display: grid;
  gap: 8px;
  align-content: start;
  width: 100%;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-header);
`;

const Snippet = styled.p`
  margin: 0;
  color: rgba(0, 0, 0, 0.72);
  font-size: 0.875rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.75rem;
  color: var(--color-text-muted);
`;

const Handle = styled.button<{ $active: boolean }>`
  align-self: stretch;
  width: 28px;
  border: none;
  border-radius: var(--radius-button);
  background: transparent;
  cursor: grab;
  color: var(--color-text-muted);
  display: inline-flex;
  justify-content: center;
  padding: 0;
  margin: 0;
  transition: background var(--duration-fast) var(--easing), color var(--duration-fast) var(--easing);

  &:hover,
  &:focus-visible {
    background: rgba(0, 0, 0, 0.06);
    color: var(--color-header);
  }

  ${({ $active }) =>
    $active &&
    css`
      cursor: grabbing;
      background: rgba(0, 0, 0, 0.08);
      color: var(--color-header);
    `}

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  svg {
    pointer-events: none;
  }
`;

export interface NoteListItem {
  id: string;
  title: string;
  snippet: string;
  tags: string[];
  updatedLabel: string;
  projectLabel?: string;
  areaLabel?: string;
}

export interface NoteCardProps {
  note: NoteListItem;
  index: number;
  selected: boolean;
  dragging: boolean;
  keyboardDragging: boolean;
  shaking: boolean;
  onSelect(id: string): void;
  onDragStart(event: React.DragEvent<HTMLButtonElement>, id: string, index: number): void;
  onDragEnter(id: string, index: number): void;
  onDragEnd(): void;
  onDrop(id: string): void;
  onHandleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, id: string, index: number): void;
  onHandleKeyUp(event: React.KeyboardEvent<HTMLButtonElement>): void;
}

export const NoteCard = forwardRef<HTMLButtonElement, NoteCardProps>(function NoteCard(
  {
    note,
    selected,
    dragging,
    keyboardDragging,
    shaking,
    index,
    onSelect,
    onDragStart,
    onDragEnter,
    onDragEnd,
    onDrop,
    onHandleKeyDown,
    onHandleKeyUp,
  },
  handleRef,
) {
  const headingId = useId();
  const descriptionId = useId();

  return (
    <Card
      role="option"
      tabIndex={0}
      aria-selected={selected}
      data-note-id={note.id}
      $selected={selected}
      $dragging={dragging || keyboardDragging}
      $shaking={shaking}
      onClick={() => onSelect(note.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(note.id);
      }}
      onDragEnter={() => onDragEnter(note.id, index)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(note.id);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          (event.currentTarget.previousElementSibling as HTMLElement | null)?.focus();
        } else if (event.key === 'ArrowDown') {
          event.preventDefault();
          (event.currentTarget.nextElementSibling as HTMLElement | null)?.focus();
        }
      }}
      aria-labelledby={headingId}
      aria-describedby={descriptionId}
      draggable={false}
      data-note-index={index}
    >
      <Handle
        ref={handleRef}
        type="button"
        aria-label={`Reorder ${note.title}`}
        aria-pressed={keyboardDragging}
        aria-grabbed={dragging || keyboardDragging}
        draggable
        onDragStart={(event) => onDragStart(event, note.id, index)}
        onDragOver={(event) => {
          event.preventDefault();
          onDragEnter(note.id, index);
        }}
        onDragEnd={onDragEnd}
        onDrop={(event) => {
          event.preventDefault();
          onDrop(note.id);
        }}
        onKeyDown={(event) => onHandleKeyDown(event, note.id, index)}
        onKeyUp={onHandleKeyUp}
        $active={dragging || keyboardDragging}
      >
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
          <path d="M3 4h8M3 8h8M3 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </Handle>
      <Content>
        <Title id={headingId}>{note.title}</Title>
        <Snippet id={descriptionId}>{note.snippet}</Snippet>
        <MetaRow>
          {note.tags.map((tag) => (
            <TagPill key={tag}>{tag}</TagPill>
          ))}
          <span>Updated {note.updatedLabel}</span>
        </MetaRow>
      </Content>
    </Card>
  );
});

export default NoteCard;
