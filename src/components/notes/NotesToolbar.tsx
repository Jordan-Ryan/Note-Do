import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import styled from 'styled-components';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ToolbarWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 5;
  background: var(--color-card);
  border-bottom: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ToolbarRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
`;

const ButtonGroup = styled.div`
  display: inline-flex;
  align-items: center;
  border-radius: var(--radius-button);
  border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  background: #ffffff;
  overflow: hidden;
`;

const ToolbarButton = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: none;
  background: transparent;
  color: ${({ $active }) => ($active ? '#111111' : 'rgba(17, 17, 17, 0.72)')};
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: background var(--duration-fast) var(--easing), color var(--duration-fast) var(--easing);

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    color: #111111;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  &[disabled] {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const MoreMenuWrapper = styled.div`
  position: relative;
`;

const MoreMenuList = styled.ul`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 220px;
  margin: 0;
  padding: 8px 0;
  list-style: none;
  background: #ffffff;
  border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-elevated);
  display: grid;
  gap: 2px;
  z-index: 10;
`;

const MoreMenuButton = styled.button<{ $active?: boolean }>`
  background: transparent;
  border: none;
  text-align: left;
  padding: 8px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#111111' : 'rgba(17, 17, 17, 0.8)')};
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover,
  &:focus-visible {
    background: rgba(0, 0, 0, 0.06);
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: -2px;
  }
`;

const StatusText = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-left: auto;
`;

const SaveButton = styled(ToolbarButton)`
  border-radius: var(--radius-button);
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 99, 99, 0.12);
  color: var(--color-accent);

  &:hover {
    background: rgba(255, 99, 99, 0.16);
  }
`;

const ICONS: Record<string, string> = {
  h1: 'H1',
  h2: 'H2',
  h3: 'H3',
  bold: 'B',
  italic: 'I',
  underline: 'U',
  bulletList: '•',
  orderedList: '1.',
  taskList: '☑︎',
  quote: '❝',
  codeBlock: '</>',
  divider: '━',
  link: '🔗',
  image: '📎',
  undo: '↺',
  redo: '↻',
  table: '⧉',
  row: '▤',
  column: '▥',
  delete: '✕',
};

type ToolbarCommand = {
  id: string;
  label: string;
  icon: string;
  run(): boolean;
  isActive?: () => boolean;
  isEnabled?: () => boolean;
  ariaLabel?: string;
  type?: 'toggle' | 'command';
};

interface ToolbarGroupConfig {
  id: string;
  buttons: ToolbarCommand[];
}

export interface NotesToolbarProps {
  editor: Editor | null;
  editorId: string;
  onManualSave(): void;
  savingState: 'idle' | 'saving' | 'saved';
}

export function NotesToolbar({ editor, editorId, onManualSave, savingState }: NotesToolbarProps) {
  const isCompact = useMediaQuery('(max-width: 1024px)');
  const [overflowOpen, setOverflowOpen] = useState(false);
  const overflowButtonRef = useRef<HTMLButtonElement | null>(null);
  const overflowMenuRef = useRef<HTMLUListElement | null>(null);

  const toolbarButtons = useMemo<ToolbarGroupConfig[]>(() => {
    if (!editor) {
      return [];
    }
    return [
      {
        id: 'headings',
        buttons: [
          {
            id: 'heading-1',
            label: 'Heading 1',
            icon: ICONS.h1,
            type: 'toggle',
            run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: () => editor.isActive('heading', { level: 1 }),
          },
          {
            id: 'heading-2',
            label: 'Heading 2',
            icon: ICONS.h2,
            type: 'toggle',
            run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: () => editor.isActive('heading', { level: 2 }),
          },
          {
            id: 'heading-3',
            label: 'Heading 3',
            icon: ICONS.h3,
            type: 'toggle',
            run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
            isActive: () => editor.isActive('heading', { level: 3 }),
          },
        ],
      },
      {
        id: 'inline',
        buttons: [
          {
            id: 'bold',
            label: 'Bold',
            icon: ICONS.bold,
            type: 'toggle',
            run: () => editor.chain().focus().toggleBold().run(),
            isActive: () => editor.isActive('bold'),
            ariaLabel: 'Toggle bold',
          },
          {
            id: 'italic',
            label: 'Italic',
            icon: ICONS.italic,
            type: 'toggle',
            run: () => editor.chain().focus().toggleItalic().run(),
            isActive: () => editor.isActive('italic'),
          },
          {
            id: 'underline',
            label: 'Underline',
            icon: ICONS.underline,
            type: 'toggle',
            run: () => editor.chain().focus().toggleUnderline().run(),
            isActive: () => editor.isActive('underline'),
          },
        ],
      },
      {
        id: 'lists',
        buttons: [
          {
            id: 'bullet-list',
            label: 'Bulleted list',
            icon: ICONS.bulletList,
            type: 'toggle',
            run: () => editor.chain().focus().toggleBulletList().run(),
            isActive: () => editor.isActive('bulletList'),
          },
          {
            id: 'ordered-list',
            label: 'Numbered list',
            icon: ICONS.orderedList,
            type: 'toggle',
            run: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: () => editor.isActive('orderedList'),
          },
          {
            id: 'task-list',
            label: 'Checkbox list',
            icon: ICONS.taskList,
            type: 'toggle',
            run: () => editor.chain().focus().toggleTaskList().run(),
            isActive: () => editor.isActive('taskList'),
          },
        ],
      },
      {
        id: 'blocks',
        buttons: [
          {
            id: 'blockquote',
            label: 'Quote',
            icon: ICONS.quote,
            type: 'toggle',
            run: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: () => editor.isActive('blockquote'),
          },
          {
            id: 'code-block',
            label: 'Code block',
            icon: ICONS.codeBlock,
            type: 'toggle',
            run: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: () => editor.isActive('codeBlock'),
          },
          {
            id: 'divider',
            label: 'Divider',
            icon: ICONS.divider,
            run: () => editor.chain().focus().setHorizontalRule().run(),
          },
        ],
      },
      {
        id: 'table',
        buttons: [
          {
            id: 'insert-table',
            label: 'Insert table',
            icon: ICONS.table,
            run: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
            isEnabled: () => editor.can().chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
          },
          {
            id: 'add-row',
            label: 'Add row',
            icon: ICONS.row,
            run: () => editor.chain().focus().addRowAfter().run(),
            isEnabled: () => editor.can().chain().focus().addRowAfter().run(),
          },
          {
            id: 'delete-row',
            label: 'Remove row',
            icon: ICONS.delete,
            run: () => editor.chain().focus().deleteRow().run(),
            isEnabled: () => editor.can().chain().focus().deleteRow().run(),
          },
          {
            id: 'add-column',
            label: 'Add column',
            icon: ICONS.column,
            run: () => editor.chain().focus().addColumnAfter().run(),
            isEnabled: () => editor.can().chain().focus().addColumnAfter().run(),
          },
          {
            id: 'delete-column',
            label: 'Remove column',
            icon: ICONS.delete,
            run: () => editor.chain().focus().deleteColumn().run(),
            isEnabled: () => editor.can().chain().focus().deleteColumn().run(),
          },
          {
            id: 'delete-table',
            label: 'Delete table',
            icon: ICONS.delete,
            run: () => editor.chain().focus().deleteTable().run(),
            isEnabled: () => editor.can().chain().focus().deleteTable().run(),
          },
        ],
      },
      {
        id: 'media',
        buttons: [
          {
            id: 'link',
            label: 'Link',
            icon: ICONS.link,
            type: 'toggle',
            run: () => {
              const previousUrl = editor.getAttributes('link').href as string | undefined;
              const url = window.prompt('Enter URL', previousUrl ?? '');
              if (url === null) {
                return false;
              }
              if (url === '') {
                return editor.chain().focus().unsetLink().run();
              }
              return editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
            },
            isActive: () => editor.isActive('link'),
          },
          {
            id: 'attachment',
            label: 'Attachment',
            icon: ICONS.image,
            run: () => {
              window.alert('File attachments coming soon.');
              return true;
            },
          },
        ],
      },
      {
        id: 'history',
        buttons: [
          {
            id: 'undo',
            label: 'Undo',
            icon: ICONS.undo,
            run: () => editor.chain().focus().undo().run(),
            isEnabled: () => editor.can().undo(),
          },
          {
            id: 'redo',
            label: 'Redo',
            icon: ICONS.redo,
            run: () => editor.chain().focus().redo().run(),
            isEnabled: () => editor.can().redo(),
          },
        ],
      },
    ];
  }, [editor]);

  const visibleGroups = useMemo(() => {
    if (!isCompact) {
      return toolbarButtons;
    }
    const alwaysVisible = new Set(['headings', 'inline', 'lists', 'history']);
    return toolbarButtons.filter((group) => alwaysVisible.has(group.id));
  }, [toolbarButtons, isCompact]);

  const overflowGroups = useMemo(() => {
    if (!isCompact) {
      return [];
    }
    const visibleIds = new Set(visibleGroups.map((group) => group.id));
    return toolbarButtons.filter((group) => !visibleIds.has(group.id));
  }, [toolbarButtons, visibleGroups, isCompact]);

  const focusables = useRef<HTMLButtonElement[]>([]);
  focusables.current = [];

  const registerFocusable = (element: HTMLButtonElement | null) => {
    if (element) {
      focusables.current.push(element);
    }
  };

  const handleToolbarKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }

    const target = event.target as HTMLElement;
    const buttons = focusables.current;
    const index = buttons.findIndex((btn) => btn === target);
    if (index === -1) {
      return;
    }
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    let nextIndex = (index + delta + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus();
  };

  useEffect(() => {
    if (!overflowOpen) {
      return;
    }
    const dismiss = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        overflowMenuRef.current?.contains(target) ||
        overflowButtonRef.current?.contains(target as Node)
      ) {
        return;
      }
      setOverflowOpen(false);
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOverflowOpen(false);
        overflowButtonRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', dismiss);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', dismiss);
      document.removeEventListener('keydown', handleKey);
    };
  }, [overflowOpen]);

  return (
    <ToolbarWrapper role="toolbar" aria-label="Note formatting" aria-controls={editorId} onKeyDown={handleToolbarKeyDown}>
      <ToolbarRow>
        {visibleGroups.map((group) => (
          <ButtonGroup role="group" aria-label={group.id} key={group.id}>
            {group.buttons.map((button) => {
              const active = button.isActive?.() ?? false;
              const enabled = button.isEnabled ? button.isEnabled() : true;
              return (
                <ToolbarButton
                  key={button.id}
                  type="button"
                  ref={registerFocusable}
                  aria-label={button.ariaLabel ?? button.label}
                  aria-pressed={button.type === 'toggle' ? active : undefined}
                  $active={active}
                  disabled={!enabled}
                  onClick={() => {
                    button.run();
                    if (overflowOpen) {
                      setOverflowOpen(false);
                      overflowButtonRef.current?.focus();
                    }
                  }}
                >
                  <span aria-hidden="true">{button.icon}</span>
                  <span>{button.icon === button.label ? '' : button.label}</span>
                </ToolbarButton>
              );
            })}
          </ButtonGroup>
        ))}
        {isCompact && overflowGroups.length > 0 && (
          <MoreMenuWrapper>
            <ToolbarButton
              type="button"
              aria-haspopup="true"
              aria-expanded={overflowOpen}
              aria-label="More formatting options"
              onClick={() => setOverflowOpen((open) => !open)}
              ref={(node) => {
                registerFocusable(node);
                overflowButtonRef.current = node;
              }}
            >
              ⋯
            </ToolbarButton>
            {overflowOpen && (
              <MoreMenuList
                role="menu"
                ref={(node) => {
                  overflowMenuRef.current = node;
                }}
              >
                {overflowGroups.map((group) => (
                  <Fragment key={group.id}>
                    {group.buttons.map((button) => {
                      const active = button.isActive?.() ?? false;
                      const enabled = button.isEnabled ? button.isEnabled() : true;
                      return (
                        <li key={button.id} role="none">
                          <MoreMenuButton
                            role="menuitem"
                            type="button"
                            tabIndex={-1}
                            $active={active}
                            disabled={!enabled}
                            onClick={() => {
                              button.run();
                              setOverflowOpen(false);
                              overflowButtonRef.current?.focus();
                            }}
                          >
                            <span aria-hidden="true">{button.icon}</span>
                            <span>{button.label}</span>
                          </MoreMenuButton>
                        </li>
                      );
                    })}
                  </Fragment>
                ))}
              </MoreMenuList>
            )}
          </MoreMenuWrapper>
        )}
        <SaveButton
          type="button"
          onClick={onManualSave}
          ref={registerFocusable}
          aria-label="Save note"
          disabled={savingState === 'saving'}
        >
          <span aria-hidden="true">💾</span> Save
        </SaveButton>
        <StatusText role="status" aria-live="polite">
          {savingState === 'saving' && 'Saving…'}
          {savingState === 'saved' && 'Saved'}
        </StatusText>
      </ToolbarRow>
    </ToolbarWrapper>
  );
}

export default NotesToolbar;
