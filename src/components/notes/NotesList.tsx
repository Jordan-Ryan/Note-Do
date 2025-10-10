import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import styled, { keyframes } from 'styled-components';
import NoteCard, { type NoteCardProps, type NoteListItem } from './NoteCard';
import type { FiltersState } from '../../routes/NotesPage';

const ListWrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  min-width: 320px;
  max-width: 360px;
  flex-shrink: 0;

  @media (max-width: 1024px) {
    max-width: none;
    flex-shrink: 1;
  }
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Segmented = styled.div`
  display: inline-flex;
  border-radius: var(--radius-button);
  border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  overflow: hidden;
`;

const SegmentButton = styled.button<{ $active: boolean }>`
  padding: 6px 14px;
  border: none;
  background: ${({ $active }) => ($active ? 'rgba(17,17,17,0.9)' : 'transparent')};
  color: ${({ $active }) => ($active ? '#ffffff' : 'rgba(17, 17, 17, 0.75)')};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--duration-fast) var(--easing), color var(--duration-fast) var(--easing);

  &:hover {
    background: rgba(17, 17, 17, 0.08);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 160px;
  border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  border-radius: var(--radius-button);
  padding: 6px 12px;
  font-size: 0.85rem;
  background: var(--color-card);

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
`;

const NewNoteButton = styled.button`
  align-self: flex-start;
  border-radius: var(--radius-button);
  border: 1px solid transparent;
  background: var(--color-accent);
  color: #ffffff;
  font-weight: 600;
  padding: 8px 16px;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--easing), box-shadow var(--duration-fast) var(--easing);
  box-shadow: var(--shadow-card);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-elevated);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  30% { transform: translateX(-6px); }
  60% { transform: translateX(6px); }
`;

const EmptyState = styled.div`
  display: grid;
  gap: 8px;
  background: var(--color-card);
  border-radius: var(--radius-card);
  border: 1px dashed var(--border-subtle, var(--color-border, #e5e5e5));
  padding: 24px;
  text-align: center;
  color: rgba(17, 17, 17, 0.7);
  animation: ${shake} 0.2s ease;
`;

const ListContainer = styled.div`
  display: grid;
  gap: 12px;
  overflow-y: auto;
  padding-right: 4px;
`;

export interface NotesListHandle {
  focusNote(id: string): void;
}

export interface NotesListProps {
  notes: NoteListItem[];
  selectedNoteId: string | null;
  filters: FiltersState;
  onSelectNote(id: string): void;
  onCreateNote(): void;
  onFilterChange(next: FiltersState): void;
  onReorder(sourceId: string, targetId: string, position: 'before' | 'after'): void;
}

export const NotesList = forwardRef<NotesListHandle, NotesListProps>(function NotesList(
  { notes, selectedNoteId, filters, onSelectNote, onCreateNote, onFilterChange, onReorder },
  ref,
) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [keyboardDraggingId, setKeyboardDraggingId] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesQuery =
        filters.query.trim().length === 0 ||
        note.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        note.snippet.toLowerCase().includes(filters.query.toLowerCase());
      if (!matchesQuery) return false;
      if (filters.scope === 'project') {
        return Boolean(note.projectLabel);
      }
      if (filters.scope === 'area') {
        return Boolean(note.areaLabel);
      }
      return true;
    });
  }, [filters.query, filters.scope, notes]);

  useImperativeHandle(
    ref,
    () => ({
      focusNote(id: string) {
        const target = listRef.current?.querySelector<HTMLElement>(`[data-note-id="${id}"]`);
        if (target) {
          target.focus();
        } else {
          listRef.current?.focus();
        }
      },
    }),
    [],
  );

  useEffect(() => {
    if (!shakeId) return;
    const timeout = window.setTimeout(() => setShakeId(null), 200);
    return () => window.clearTimeout(timeout);
  }, [shakeId]);

  const handleDragStart: NoteCardProps['onDragStart'] = (event, id) => {
    setDraggingId(id);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnter = (_id: string) => {
    // no-op; container handles onDrop
  };

  const handleDrop: NoteCardProps['onDrop'] = (targetId) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }
    onReorder(draggingId, targetId, 'before');
    setDraggingId(null);
  };

  const handleDragEnd: NoteCardProps['onDragEnd'] = () => {
    setDraggingId(null);
  };

  const handleListDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!draggingId) return;
    const targetId = filteredNotes[filteredNotes.length - 1]?.id;
    if (targetId && targetId !== draggingId) {
      onReorder(draggingId, targetId, 'after');
    }
    setDraggingId(null);
  };

  const handleKeyboardKeyDown: NoteCardProps['onHandleKeyDown'] = (event, id) => {
    const currentIndex = filteredNotes.findIndex((note) => note.id === id);
    if (event.key === ' ') {
      event.preventDefault();
      if (keyboardDraggingId === id) {
        setKeyboardDraggingId(null);
      } else {
        setKeyboardDraggingId(id);
      }
      return;
    }
    if (!keyboardDraggingId) {
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const direction = event.key === 'ArrowUp' ? -1 : 1;
      const nextIndex = currentIndex + direction;
      if (nextIndex < 0 || nextIndex >= filteredNotes.length) {
        setShakeId(id);
        return;
      }
      const targetId = filteredNotes[nextIndex].id;
      const position = direction === -1 ? 'before' : 'after';
      onReorder(keyboardDraggingId, targetId, position);
      setKeyboardDraggingId(targetId);
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setKeyboardDraggingId(null);
    }
  };

  const handleKeyboardKeyUp: NoteCardProps['onHandleKeyUp'] = (event) => {
    if (event.key === ' ') {
      event.preventDefault();
      setKeyboardDraggingId(null);
    }
  };

  const handleFiltersChange = useCallback(
    (scope: FiltersState['scope']) => {
      if (filters.scope !== scope) {
        onFilterChange({ ...filters, scope });
      }
    },
    [filters, onFilterChange],
  );

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, query: event.target.value });
  };

  return (
    <ListWrapper>
      <NewNoteButton type="button" onClick={onCreateNote}>
        New note
      </NewNoteButton>
      <ControlsRow>
        <Segmented role="radiogroup" aria-label="Filter notes">
          {(['all', 'project', 'area'] as FiltersState['scope'][]).map((scope) => (
            <SegmentButton
              key={scope}
              role="radio"
              type="button"
              aria-checked={filters.scope === scope}
              $active={filters.scope === scope}
              onClick={() => handleFiltersChange(scope)}
            >
              {scope === 'all' ? 'All' : scope === 'project' ? 'Project' : 'Area'}
            </SegmentButton>
          ))}
        </Segmented>
        <SearchInput
          type="search"
          placeholder="Search notes…"
          value={filters.query}
          onChange={handleSearch}
          aria-label="Search notes"
        />
      </ControlsRow>
      <ListContainer
        role="listbox"
        aria-label="Notes navigation"
        ref={listRef}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleListDrop}
        tabIndex={-1}
      >
        {filteredNotes.length === 0 ? (
          <EmptyState>
            <strong>No notes yet.</strong>
            <span>Tap “New note” to get started with a fresh idea.</span>
          </EmptyState>
        ) : (
          filteredNotes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              index={index}
              selected={note.id === selectedNoteId}
              dragging={draggingId === note.id}
              keyboardDragging={keyboardDraggingId === note.id}
              shaking={shakeId === note.id}
              onSelect={onSelectNote}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onHandleKeyDown={handleKeyboardKeyDown}
              onHandleKeyUp={handleKeyboardKeyUp}
            />
          ))
        )}
      </ListContainer>
    </ListWrapper>
  );
});

export default NotesList;
