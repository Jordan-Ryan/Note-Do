import { useCallback, useEffect, useId, useMemo } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import type { FloatingMenuProps } from '@tiptap/react/menus';
import type { JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import styled from 'styled-components';
import NotesToolbar from './NotesToolbar';
import TagPill from '../shared/TagPill';
import type { NoteContent } from '../../types/para';
import type { EditorState } from '@tiptap/pm/state';

const EditorPane = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--color-card);
  border-radius: var(--radius-card);
  border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  box-shadow: var(--shadow-card);
  overflow: hidden;
`;

const EditorHeader = styled.div`
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
`;

const EditorScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 24px 24px;
  min-height: 0;
`;

const MetadataRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  flex-wrap: wrap;
`;

const AddButton = styled.button`
  border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  background: transparent;
  color: var(--color-text-muted);
  padding: 4px 8px;
  border-radius: var(--radius-button);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing);

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: var(--color-header);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
`;


const TitleInput = styled.input`
  padding: 8px 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  border: none;
  outline: none;
  color: var(--color-header);
  background: transparent;

  &:focus-visible {
    outline: none;
    box-shadow: inset 0 -2px 0 0 var(--color-accent);
  }
`;

const EditorBody = styled.div`
  position: relative;
  min-height: 420px;
  padding: 16px 0 48px;
  color: rgba(17, 17, 17, 0.88);
  font-size: 1rem;
  line-height: 1.65;

  .ProseMirror {
    min-height: 100%;
    outline: none;
  }

  .ProseMirror p {
    margin: 0 0 1em;
  }

  .ProseMirror h1,
  .ProseMirror h2,
  .ProseMirror h3 {
    font-weight: 700;
    line-height: 1.2;
    margin: 1.75em 0 0.6em;
  }

  .ProseMirror h1 {
    font-size: 1.9rem;
  }
  .ProseMirror h2 {
    font-size: 1.45rem;
  }
  .ProseMirror h3 {
    font-size: 1.25rem;
  }

  .ProseMirror blockquote {
    border-left: 3px solid var(--color-accent);
    padding-left: 16px;
    color: rgba(17, 17, 17, 0.7);
    font-style: italic;
  }

  .ProseMirror pre {
    background: #f3f3f3;
    border-radius: var(--radius-card);
    padding: 16px;
    font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    font-size: 0.9rem;
  }

  .ProseMirror code {
    font-family: 'JetBrains Mono', 'SFMono-Regular', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 4px;
    border-radius: 4px;
  }

  .ProseMirror ul,
  .ProseMirror ol {
    padding-left: 1.5rem;
    margin: 0 0 1em;
  }

  .ProseMirror a {
    color: var(--color-accent);
    text-decoration: underline;
    transition: color var(--duration-fast) var(--easing);
  }

  .ProseMirror a:hover,
  .ProseMirror a:focus {
    color: #d45454;
  }

  .ProseMirror table {
    width: 100%;
    border-collapse: collapse;
    margin: 24px 0;
    font-size: 0.9rem;
  }

  .ProseMirror table td,
  .ProseMirror table th {
    border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
    padding: 8px;
  }

  .ProseMirror table th {
    background: rgba(0, 0, 0, 0.04);
    text-align: left;
  }

  .ProseMirror hr {
    border: none;
    border-top: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
    margin: 32px 0;
  }

  .ProseMirror:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
`;

const BubbleMenuContent = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #111111;
  color: var(--color-text-on-dark);
  padding: 6px 10px;
  border-radius: 999px;
  box-shadow: var(--shadow-card);

  button {
    background: transparent;
    border: none;
    color: inherit;
    font-size: 0.85rem;
    cursor: pointer;
  }
`;

const FloatingMenuContent = styled.div`
  background: #111111;
  color: var(--color-text-on-dark);
  padding: 8px 12px;
  border-radius: var(--radius-card);
  display: inline-flex;
  gap: 8px;
  align-items: center;
  font-size: 0.85rem;
  box-shadow: var(--shadow-card);
`;


export interface TagOption {
  id: string;
  label: string;
}

export interface NoteEditorProps {
  note: NoteContent;
  availableTags: string[];
  projectOptions: TagOption[];
  areaOptions: TagOption[];
  savingState: 'idle' | 'saving' | 'saved';
  onChangeTitle(id: string, title: string): void;
  onChangeTags(id: string, tags: string[]): void;
  onChangeProject(id: string, projectId?: string): void;
  onChangeArea(id: string, areaId?: string): void;
  onChangeContent(id: string, content: JSONContent): void;
  onManualSave(): void;
  onRequestFocusList(): void;
}

export function NoteEditor({
  note,
  availableTags,
  projectOptions,
  areaOptions,
  savingState,
  onChangeTitle,
  onChangeTags,
  onChangeProject,
  onChangeArea,
  onChangeContent,
  onManualSave,
  onRequestFocusList,
}: NoteEditorProps) {
  const floatingShouldShow = useCallback<NonNullable<FloatingMenuProps['shouldShow']>>(
    ({ state }) => state.selection.empty,
    [],
  );
  const editorId = useId();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: { class: 'code-block' },
        },
      }),
      Underline,
      Link.configure({
        linkOnPaste: true,
        autolink: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
        },
      }),
      Table.configure({
        resizable: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: note.contentJson,
    onUpdate({ editor: current }) {
      onChangeContent(note.id, current.getJSON());
    },
    editorProps: {
      attributes: {
        id: editorId,
        'aria-label': 'Note content',
      },
      handleKeyDown(_, event) {
        if (event.key === 'Escape') {
          event.preventDefault();
          onRequestFocusList();
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(note.contentJson, { emitUpdate: false });
  }, [editor, note.id]);

  useEffect(() => {
    if (!editor) return;
    const currentJson = editor.getJSON();
    const nextJson = note.contentJson;
    const isSame = JSON.stringify(currentJson) === JSON.stringify(nextJson);
    if (!isSame) {
      editor.commands.setContent(nextJson, { emitUpdate: false });
    }
  }, [editor, note.contentJson]);

  useEffect(() => {
    if (!editor) return;
    if (note.id) {
      editor.commands.focus('start');
    }
  }, [editor, note.id]);


  const projectLabel = useMemo(() => projectOptions.find((opt) => opt.id === note.projectId)?.label, [note.projectId, projectOptions]);
  const areaLabel = useMemo(() => areaOptions.find((opt) => opt.id === note.areaId)?.label, [note.areaId, areaOptions]);

  if (!editor) {
    return null;
  }

  return (
    <EditorPane>
      <EditorHeader>
        <NotesToolbar editor={editor} editorId={editorId} savingState={savingState} onManualSave={onManualSave} />
        <TitleInput
          value={note.title}
          placeholder="Give this note a punchy title…"
          onChange={(event) => onChangeTitle(note.id, event.target.value)}
        />
        <MetadataRow>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Location: {note.paraPath?.join(' / ') || 'Unorganized'}
          </span>
        </MetadataRow>
      </EditorHeader>
      <EditorScrollArea>
        <EditorBody>
          <EditorContent editor={editor} />
          <BubbleMenu editor={editor}>
            <BubbleMenuContent>
              <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Bold">
                B
              </button>
              <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic">
                I
              </button>
              <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} aria-label="Underline">
                U
              </button>
            </BubbleMenuContent>
          </BubbleMenu>
          <FloatingMenu editor={editor} shouldShow={floatingShouldShow}>
            <FloatingMenuContent>
              <span>/</span>
              <span>Insert: type "/image", "/table", "/todo"</span>
            </FloatingMenuContent>
          </FloatingMenu>
        </EditorBody>
      </EditorScrollArea>
    </EditorPane>
  );
}

export default NoteEditor;
