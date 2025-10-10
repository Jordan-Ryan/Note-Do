import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ChangeEvent } from 'react';
import styled from 'styled-components';
import NoteCard, { type NoteCardProps, type NoteListItem } from '../notes/NoteCard';
import type { NoteContent } from '../../types/para';

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

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
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

const SearchInput = styled.input`
  width: 100%;
  border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  border-radius: var(--radius-button);
  padding: 8px 12px;
  font-size: 0.875rem;
  background: var(--color-card);

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
`;

const BreadcrumbSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

const BreadcrumbItem = styled.span<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? 'var(--color-header)' : 'var(--color-text-muted)')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
`;

const BreadcrumbSeparator = styled.span`
  color: var(--color-text-muted);
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
`;

const ListContainer = styled.div`
  display: grid;
  gap: 12px;
  overflow-y: auto;
  padding-right: 4px;
  flex: 1;
`;

export interface PARANotesListHandle {
  focusNote(id: string): void;
}

export interface PARANotesListProps {
  notes: NoteContent[];
  selectedNoteId: string | null;
  selectedPath: string[];
  searchQuery: string;
  onSelectNote(id: string): void;
  onCreateNote(): void;
  onSearchChange(query: string): void;
}

export const PARANotesList = forwardRef<PARANotesListHandle, PARANotesListProps>(function PARANotesList(
  { notes, selectedNoteId, selectedPath, searchQuery, onSelectNote, onCreateNote, onSearchChange },
  ref,
) {
  const listRef = useRef<HTMLDivElement | null>(null);

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      // Filter by selected path
      const pathMatches = selectedPath.length === 0 || 
        selectedPath.every((pathId, index) => note.paraPath[index] === pathId);
      
      if (!pathMatches) return false;

      // Filter by search query
      const matchesQuery =
        searchQuery.trim().length === 0 ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        extractPlainText(note.contentJson).toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesQuery;
    });
  }, [notes, selectedPath, searchQuery]);

  const listItems: NoteListItem[] = useMemo(() => {
    return filteredNotes.map((note) => {
      const snippet = extractPlainText(note.contentJson).slice(0, 160);
      return {
        id: note.id,
        title: note.title || 'Untitled note',
        snippet: snippet.length ? `${snippet.trim()}${snippet.length >= 160 ? '…' : ''}` : 'Add content to this note',
        tags: [], // No more tags in PARA system
        updatedLabel: formatRelativeTime(note.updatedAt),
        projectLabel: undefined, // No more project/area labels
        areaLabel: undefined,
      };
    });
  }, [filteredNotes]);

  const breadcrumbPath = useMemo(() => {
    // For now, just show the selected path
    return selectedPath.length > 0 ? selectedPath : ['All Notes'];
  }, [selectedPath]);

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

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  return (
    <ListWrapper>
      <HeaderSection>
        <NewNoteButton type="button" onClick={onCreateNote}>
          New note
        </NewNoteButton>
        <SearchInput
          type="search"
          placeholder="Search notes…"
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search notes"
        />
        <BreadcrumbSection>
          {breadcrumbPath.map((item, index) => (
            <span key={index}>
              <BreadcrumbItem $active={index === breadcrumbPath.length - 1}>
                {item}
              </BreadcrumbItem>
              {index < breadcrumbPath.length - 1 && (
                <BreadcrumbSeparator> / </BreadcrumbSeparator>
              )}
            </span>
          ))}
        </BreadcrumbSection>
      </HeaderSection>
      <ListContainer
        role="listbox"
        aria-label="Notes navigation"
        ref={listRef}
        tabIndex={-1}
      >
        {filteredNotes.length === 0 ? (
          <EmptyState>
            <strong>No notes found.</strong>
            <span>
              {selectedPath.length > 0 
                ? `No notes in this folder. Tap "New note" to create one.`
                : searchQuery 
                  ? 'No notes match your search. Try a different term.'
                  : 'No notes yet. Tap "New note" to get started.'
              }
            </span>
          </EmptyState>
        ) : (
          listItems.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              index={index}
              selected={note.id === selectedNoteId}
              dragging={false}
              keyboardDragging={false}
              shaking={false}
              onSelect={onSelectNote}
              onDragStart={() => {}}
              onDragEnter={() => {}}
              onDragEnd={() => {}}
              onDrop={() => {}}
              onHandleKeyDown={() => {}}
              onHandleKeyUp={() => {}}
            />
          ))
        )}
      </ListContainer>
    </ListWrapper>
  );
});

export default PARANotesList;

// Helper functions
function extractPlainText(node: any): string {
  if (!node) return '';
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }
  if (Array.isArray(node.content)) {
    return node.content.map((child: any) => extractPlainText(child)).join(' ');
  }
  return '';
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const diff = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const minutes = Math.round(diff / (1000 * 60));
  if (Math.abs(minutes) < 60) {
    return rtf.format(Math.round(minutes), 'minute');
  }
  const hours = Math.round(diff / (1000 * 60 * 60));
  if (Math.abs(hours) < 24) {
    return rtf.format(Math.round(hours), 'hour');
  }
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  return rtf.format(Math.round(days), 'day');
}
