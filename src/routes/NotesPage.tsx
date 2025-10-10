import { useCallback, useMemo, useRef, useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import styled from 'styled-components';
import NotesList, { type NotesListHandle } from '../components/notes/NotesList';
import NoteEditor, { type TagOption } from '../components/notes/NoteEditor';
import InlineToasts, { type InlineToast } from '../components/notes/InlineToasts';
import type { NoteListItem } from '../components/notes/NoteCard';

const Layout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: calc(100vh - 64px - (var(--space-2) * 3));

  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const EditorWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  min-height: 0;

  @media (max-width: 1024px) {
    order: -1;
    flex: none;
  }
`;

export interface NoteContent {
  id: string;
  title: string;
  contentJson: JSONContent;
  tags: string[];
  projectId?: string;
  areaId?: string;
  updatedAt: string;
}

export interface FiltersState {
  query: string;
  scope: 'all' | 'project' | 'area';
}

const demoProjects: TagOption[] = [
  { id: 'asos-24', label: 'ASOS SS24' },
  { id: 'asos-retail', label: 'Retail Ops' },
  { id: 'asos-labs', label: 'Labs Initiative' },
];

const demoAreas: TagOption[] = [
  { id: 'brand', label: 'Brand' },
  { id: 'growth', label: 'Growth' },
  { id: 'product', label: 'Product' },
];

const defaultTags = ['campaign', 'launch', 'team', 'operations', 'logistics', 'experiments', 'ux', 'copy', 'strategy'];

const demoNotes: NoteContent[] = [
  {
    id: 'note-1',
    title: 'Campaign kickoff talking points',
    contentJson: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Launch momentum' }],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Focus on the hero drop, limited colorway, and influencer seeding timeline. Highlight backstage content and prep newsletter copy placeholders.',
            },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Finalize shoot locations by Friday.' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Confirm editorial budget with finance.' }] }],
            },
          ],
        },
      ],
    },
    tags: ['campaign', 'launch', 'team'],
    projectId: 'asos-24',
    areaId: 'brand',
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'note-2',
    title: 'Ops sync follow-ups',
    contentJson: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Recap: inventory handoff delayed by a week. Need updated runway and cross-team comms.' },
          ],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Share revised arrival ETAs with CX.' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Update store signage guidelines.' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Draft ops memo for regional leads.' }] }],
            },
          ],
        },
        {
          type: 'horizontalRule',
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Escalate freight issue with carrier if no response by Thursday.' }],
        },
      ],
    },
    tags: ['operations', 'logistics'],
    projectId: 'asos-retail',
    areaId: 'product',
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'note-3',
    title: 'Labs experimentation ideas',
    contentJson: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Three experiments to trial with the Labs squad. Prioritize low-lift tests with clear conversion metrics.',
            },
          ],
        },
        {
          type: 'orderedList',
          attrs: { start: 1 },
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Dynamic styling suggestions based on browsing history.' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'One-click wardrobe bundles with predictive sizing.' }],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    { type: 'text', text: 'Contextual onboarding overlays for first-time app visits.' },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'blockquote',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: '“Lead with curiosity, ship with precision.”' }] },
          ],
        },
      ],
    },
    tags: ['experiments', 'ux'],
    projectId: 'asos-labs',
    areaId: 'growth',
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
];

function extractPlainText(node: JSONContent | null | undefined): string {
  if (!node) return '';
  if (node.type === 'text' && typeof node.text === 'string') {
    return node.text;
  }
  if (Array.isArray(node.content)) {
    return node.content.map((child) => extractPlainText(child)).join(' ');
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

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteContent[]>(demoNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(demoNotes[0]?.id ?? null);
  const [filters, setFilters] = useState<FiltersState>({ query: '', scope: 'all' });
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [toasts, setToasts] = useState<InlineToast[]>([]);
  const autosaveTimer = useRef<number | null>(null);
  const listHandleRef = useRef<NotesListHandle>(null);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    defaultTags.forEach((tag) => tagSet.add(tag));
    notes.forEach((note) => note.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet.values());
  }, [notes]);

  const listItems: NoteListItem[] = useMemo(() => {
    return notes.map((note) => {
      const snippet = extractPlainText(note.contentJson).slice(0, 160);
      return {
        id: note.id,
        title: note.title || 'Untitled note',
        snippet: snippet.length ? `${snippet.trim()}${snippet.length >= 160 ? '…' : ''}` : 'Add content to this note',
        tags: note.tags,
        updatedLabel: formatRelativeTime(note.updatedAt),
        projectLabel: demoProjects.find((project) => project.id === note.projectId)?.label,
        areaLabel: demoAreas.find((area) => area.id === note.areaId)?.label,
      };
    });
  }, [notes]);

  const selectedNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? notes[0],
    [notes, selectedNoteId],
  );

  const announceSaved = useCallback(() => {
    setSavingState('saved');
    const toastId = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id: toastId, message: 'Saved' }]);
    window.setTimeout(() => setSavingState('idle'), 2000);
  }, []);

  const scheduleAutosave = useCallback(() => {
    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
    }
    setSavingState('saving');
    autosaveTimer.current = window.setTimeout(() => {
      announceSaved();
      autosaveTimer.current = null;
    }, 1000);
  }, [announceSaved]);

  const updateNote = useCallback(
    (id: string, updates: Partial<NoteContent>) => {
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, ...updates, updatedAt: new Date().toISOString() } : note)),
      );
      scheduleAutosave();
    },
    [scheduleAutosave],
  );

  const handleManualSave = useCallback(() => {
    if (autosaveTimer.current) {
      window.clearTimeout(autosaveTimer.current);
      autosaveTimer.current = null;
    }
    setSavingState('saving');
    window.setTimeout(() => {
      announceSaved();
    }, 400);
  }, [announceSaved]);

  const handleSelectNote = useCallback((id: string) => {
    setSelectedNoteId(id);
  }, []);

  const handleCreateNote = useCallback(() => {
    const newNote: NoteContent = {
      id: `note-${Date.now()}`,
      title: 'Untitled note',
      contentJson: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }] },
      tags: [],
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  }, []);

  const handleReorder = useCallback(
    (sourceId: string, targetId: string, position: 'before' | 'after') => {
      if (sourceId === targetId) return;
      setNotes((prev) => {
        const current = [...prev];
        const fromIndex = current.findIndex((note) => note.id === sourceId);
        let toIndex = current.findIndex((note) => note.id === targetId);
        if (fromIndex === -1 || toIndex === -1) {
          return prev;
        }
        const [moved] = current.splice(fromIndex, 1);
        if (fromIndex < toIndex) {
          toIndex -= 1;
        }
        if (position === 'after') {
          toIndex += 1;
        }
        current.splice(toIndex, 0, moved);
        return current;
      });
    },
    [],
  );

  const handleRemoveToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const handleFocusList = useCallback(() => {
    if (!selectedNoteId) return;
    listHandleRef.current?.focusNote(selectedNoteId);
  }, [selectedNoteId]);

  return (
    <>
      <Layout>
        <NotesList
          ref={listHandleRef}
          notes={listItems}
          filters={filters}
          selectedNoteId={selectedNote?.id ?? null}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
          onFilterChange={setFilters}
          onReorder={handleReorder}
        />
        <EditorWrapper>
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              availableTags={availableTags}
              projectOptions={demoProjects}
              areaOptions={demoAreas}
              savingState={savingState}
              onChangeTitle={(id, title) => updateNote(id, { title })}
              onChangeTags={(id, tags) => updateNote(id, { tags })}
              onChangeProject={(id, projectId) => updateNote(id, { projectId })}
              onChangeArea={(id, areaId) => updateNote(id, { areaId })}
              onChangeContent={(id, contentJson) => updateNote(id, { contentJson: contentJson as JSONContent })}
              onManualSave={handleManualSave}
              onRequestFocusList={handleFocusList}
            />
          ) : (
            <p style={{ alignSelf: 'center', color: 'var(--color-text-muted)' }}>Select a note to edit.</p>
          )}
        </EditorWrapper>
      </Layout>
      <InlineToasts toasts={toasts} onRemove={handleRemoveToast} aria-live="polite" />
    </>
  );
}
