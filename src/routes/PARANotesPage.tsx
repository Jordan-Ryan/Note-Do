import { useCallback, useMemo, useRef, useState } from 'react';
import type { JSONContent } from '@tiptap/react';
import styled from 'styled-components';
import PARAFileSystem from '../components/para/PARAFileSystem';
import NoteEditor from '../components/notes/NoteEditor';
import InlineToasts, { type InlineToast } from '../components/notes/InlineToasts';
import type { NoteContent, PARAItem, PARAState } from '../types/para';
import { DEFAULT_PARA_STRUCTURE } from '../types/para';

const PageContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: calc(var(--space-2) * 1.5) var(--space-2);
  gap: 24px;

  @media (max-width: 768px) {
    padding-bottom: calc(var(--space-2) * 2);
  }
`;

const Layout = styled.div`
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const Sidebar = styled.div`
  min-width: 320px;
  max-width: 360px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;

  @media (max-width: 1024px) {
    min-width: auto;
    max-width: none;
    flex-shrink: 1;
    height: 300px;
  }
`;

const EditorWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  height: 100%;
`;

// Demo data converted to PARA structure
const demoPARAFolders: PARAItem[] = [
  {
    id: 'projects',
    name: 'Projects',
    type: 'projects',
    children: [
      {
        id: 'asos-ss24',
        name: 'ASOS SS24',
        type: 'projects',
        parentId: 'projects',
        children: [],
        notesCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'retail-ops',
        name: 'Retail Operations',
        type: 'projects',
        parentId: 'projects',
        children: [],
        notesCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'labs-initiative',
        name: 'Labs Initiative',
        type: 'projects',
        parentId: 'projects',
        children: [],
        notesCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    notesCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'areas',
    name: 'Areas',
    type: 'areas',
    children: [
      {
        id: 'brand',
        name: 'Brand',
        type: 'areas',
        parentId: 'areas',
        children: [],
        notesCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'growth',
        name: 'Growth',
        type: 'areas',
        parentId: 'areas',
        children: [],
        notesCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'product',
        name: 'Product',
        type: 'areas',
        parentId: 'areas',
        children: [],
        notesCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    notesCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'resources',
    name: 'Resources',
    type: 'resources',
    children: [],
    notesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'archive',
    name: 'Archive',
    type: 'archive',
    children: [],
    notesCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
    paraPath: ['projects', 'asos-ss24'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
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
    paraPath: ['projects', 'retail-ops'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
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
            { type: 'paragraph', content: [{ type: 'text', text: '"Lead with curiosity, ship with precision."' }] },
          ],
        },
      ],
    },
    paraPath: ['projects', 'labs-initiative'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

export default function PARANotesPage() {
  const [folders, setFolders] = useState<PARAItem[]>(demoPARAFolders);
  const [notes, setNotes] = useState<NoteContent[]>(demoNotes);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(demoNotes[0]?.id ?? null);
  const [selectedPath, setSelectedPath] = useState<string[]>(['projects', 'asos-ss24']);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['projects', 'areas']));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [toasts, setToasts] = useState<InlineToast[]>([]);
  const autosaveTimer = useRef<number | null>(null);

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
      paraPath: selectedPath.length > 0 ? selectedPath : ['projects'],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
  }, [selectedPath]);

  const handleSelectFolder = useCallback((path: string[]) => {
    setSelectedPath(path);
    // Clear search when changing folders
    setSearchQuery('');
  }, []);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleFocusList = useCallback(() => {
    // Focus will be handled by the file system component
    // This is kept for compatibility with NoteEditor
  }, []);

  const handleCreateFolder = useCallback((parentPath: string[], name: string, type: PARACategory) => {
    const newFolderId = `folder-${Date.now()}`;
    const newFolder: PARAItem = {
      id: newFolderId,
      name,
      type,
      parentId: parentPath[parentPath.length - 1] || null,
      children: [],
      notesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFolders(prev => {
      const updateFolders = (items: PARAItem[]): PARAItem[] => {
        return items.map(item => {
          if (item.id === parentPath[parentPath.length - 1]) {
            return {
              ...item,
              children: [...item.children, newFolder],
              updatedAt: new Date().toISOString(),
            };
          }
          if (item.children.length > 0) {
            return {
              ...item,
              children: updateFolders(item.children),
            };
          }
          return item;
        });
      };
      return updateFolders(prev);
    });

    // Auto-expand the parent folder
    setExpandedFolders(prev => new Set([...prev, ...parentPath]));
  }, []);

  const handleRemoveToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <PageContainer>
      <Layout>
        <Sidebar>
          <PARAFileSystem
            folders={folders}
            notes={notes}
            selectedPath={selectedPath}
            selectedNoteId={selectedNote?.id ?? null}
            expandedFolders={expandedFolders}
            searchQuery={searchQuery}
            onSelectFolder={handleSelectFolder}
            onSelectNote={handleSelectNote}
            onToggleExpand={handleToggleExpand}
            onCreateNote={handleCreateNote}
            onCreateFolder={handleCreateFolder}
            onSearchChange={setSearchQuery}
          />
        </Sidebar>
        <EditorWrapper>
          {selectedNote ? (
            <NoteEditor
              note={selectedNote}
              availableTags={[]}
              projectOptions={[]}
              areaOptions={[]}
              savingState={savingState}
              onChangeTitle={(id, title) => updateNote(id, { title })}
              onChangeTags={() => {}} // No more tags
              onChangeProject={() => {}} // No more projects
              onChangeArea={() => {}} // No more areas
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
    </PageContainer>
  );
}
