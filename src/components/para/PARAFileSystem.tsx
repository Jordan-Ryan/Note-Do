import { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import type { PARAItem, PARACategory, NoteContent } from '../../types/para';
import NoteCard, { type NoteListItem } from '../notes/NoteCard';

const FileSystemContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: var(--color-card);
  border-radius: var(--radius-card);
  border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  box-shadow: var(--shadow-card);
  overflow: hidden;
`;

const HeaderSection = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
`;

const NewNoteButton = styled.button`
  width: 100%;
  border-radius: var(--radius-button);
  border: 1px solid transparent;
  background: var(--color-accent);
  color: #ffffff;
  font-weight: 600;
  padding: 10px 16px;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--easing), box-shadow var(--duration-fast) var(--easing);
  box-shadow: var(--shadow-card);
  margin-bottom: 12px;

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

const FileSystemList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
  min-height: 0;
`;

const FileSystemItem = styled.div<{ $level: number; $selected: boolean; $isFolder: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  padding-left: ${({ $level }) => 16 + $level * 16}px;
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing);
  font-size: 0.875rem;
  color: var(--color-header);
  background: ${({ $selected }) => ($selected ? 'rgba(255, 99, 99, 0.12)' : 'transparent')};
  border-left: ${({ $selected }) => ($selected ? '3px solid var(--color-accent)' : '3px solid transparent')};
  font-weight: ${({ $selected, $isFolder }) => ($selected ? '600' : $isFolder ? '500' : '400')};

  &:hover {
    background: ${({ $selected }) => ($selected ? 'rgba(255, 99, 99, 0.16)' : 'rgba(0, 0, 0, 0.06)')};
    transform: translateX(2px);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
  }
`;

const ExpandIcon = styled.div<{ $expanded: boolean }>`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: transform var(--duration-fast) var(--easing);
  transform: ${({ $expanded }) => ($expanded ? 'rotate(90deg)' : 'rotate(0deg)')};

  svg {
    width: 12px;
    height: 12px;
  }
`;

const ItemIcon = styled.div<{ $type: PARACategory; $isFolder: boolean }>`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $type, $isFolder }) => {
    if (!$isFolder) return 'var(--color-text-muted)';
    switch ($type) {
      case 'projects':
        return '#ff6b6b';
      case 'areas':
        return '#4ecdc4';
      case 'resources':
        return '#45b7d1';
      case 'archive':
        return '#96ceb4';
      default:
        return 'var(--color-text-muted)';
    }
  }};

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ItemName = styled.span`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemCount = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-muted);
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
`;

const ContextMenu = styled.div<{ $x: number; $y: number; $visible: boolean }>`
  position: fixed;
  top: ${({ $y }) => $y}px;
  left: ${({ $x }) => $x}px;
  background: var(--color-card);
  border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-elevated);
  padding: 4px 0;
  min-width: 160px;
  z-index: 1000;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  visibility: ${({ $visible }) => ($visible ? 'visible' : 'hidden')};
  transition: opacity var(--duration-fast) var(--easing);
`;

const ContextMenuItem = styled.button`
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: var(--color-header);
  text-align: left;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: -2px;
  }
`;

const FolderNameInput = styled.input`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-button);
  font-size: 0.875rem;
  background: var(--color-card);
  outline: none;

  &:focus {
    box-shadow: 0 0 0 2px rgba(255, 99, 99, 0.2);
  }
`;

const FolderTypeSelector = styled.select`
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  border-radius: var(--radius-button);
  font-size: 0.875rem;
  background: var(--color-card);
  color: var(--color-header);
  outline: none;

  &:focus {
    border-color: var(--color-accent);
  }
`;

const AddFolderButton = styled.button`
  width: 100%;
  margin-top: 8px;
  padding: 8px 16px;
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: white;
  border-radius: var(--radius-button);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #e55a5a;
    border-color: #e55a5a;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
`;

const ChevronRightIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ProjectIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 3h12v2l-6 4-6-4V3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const AreaIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ResourceIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 4h10v8H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6h4M6 8h4M6 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ArchiveIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 5h12v8H2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 5l2-2h8l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const NoteIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 2h7l3 3v9H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const getIcon = (type: PARACategory, isFolder: boolean) => {
  if (!isFolder) return <NoteIcon />;
  switch (type) {
    case 'projects':
      return <ProjectIcon />;
    case 'areas':
      return <AreaIcon />;
    case 'resources':
      return <ResourceIcon />;
    case 'archive':
      return <ArchiveIcon />;
    default:
      return <ProjectIcon />;
  }
};

interface FileSystemItemProps {
  item: PARAItem;
  notes: NoteContent[];
  level: number;
  selectedPath: string[];
  selectedNoteId: string | null;
  expandedFolders: Set<string>;
  searchQuery: string;
  onSelectFolder: (path: string[]) => void;
  onSelectNote: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onCreateFolder: (parentPath: string[], name: string, type: PARACategory) => void;
}

const FileSystemItemComponent = ({ 
  item, 
  notes, 
  level, 
  selectedPath, 
  selectedNoteId,
  expandedFolders, 
  searchQuery,
  onSelectFolder, 
  onSelectNote, 
  onToggleExpand,
  onCreateFolder
}: FileSystemItemProps) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderType, setNewFolderType] = useState<PARACategory>('projects');
  const contextMenuRef = useRef<HTMLDivElement>(null);
  
  const isExpanded = expandedFolders.has(item.id);
  const isSelected = selectedPath.includes(item.id);
  const hasChildren = item.children && item.children.length > 0;
  
  // Filter notes that belong to this folder path
  const folderNotes = notes.filter(note => 
    note.paraPath.length >= level + 1 && 
    note.paraPath[level] === item.id &&
    (searchQuery === '' || 
     note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     extractPlainText(note.contentJson).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleClick = useCallback(() => {
    onSelectFolder([...selectedPath.slice(0, level), item.id]);
  }, [item.id, level, selectedPath, onSelectFolder]);

  const handleExpandClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleExpand(item.id);
    }
  }, [item.id, hasChildren, onToggleExpand]);

  const handleNoteClick = useCallback((noteId: string) => {
    onSelectNote(noteId);
  }, [onSelectNote]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, visible: true });
  }, []);

  const handleCreateFolder = useCallback(() => {
    if (newFolderName.trim()) {
      const parentPath = [...selectedPath.slice(0, level + 1)];
      onCreateFolder(parentPath, newFolderName.trim(), newFolderType);
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  }, [newFolderName, newFolderType, selectedPath, level, onCreateFolder]);

  const handleCancelCreateFolder = useCallback(() => {
    setNewFolderName('');
    setIsCreatingFolder(false);
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [contextMenu.visible]);

  return (
    <>
      <FileSystemItem
        $level={level}
        $selected={isSelected}
        $isFolder={true}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        tabIndex={0}
        role="button"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
      >
        {hasChildren && (
          <ExpandIcon $expanded={isExpanded} onClick={handleExpandClick}>
            <ChevronRightIcon />
          </ExpandIcon>
        )}
        <ItemIcon $type={item.type} $isFolder={true}>
          {getIcon(item.type, true)}
        </ItemIcon>
        <ItemName>{item.name}</ItemName>
        {folderNotes.length > 0 && (
          <ItemCount>{folderNotes.length}</ItemCount>
        )}
      </FileSystemItem>
      
      {/* Context Menu */}
      <ContextMenu
        ref={contextMenuRef}
        $x={contextMenu.x}
        $y={contextMenu.y}
        $visible={contextMenu.visible}
      >
        <ContextMenuItem onClick={() => setIsCreatingFolder(true)}>
          New Folder
        </ContextMenuItem>
      </ContextMenu>
      
      {/* Folder Creation Form */}
      {isCreatingFolder && (
        <div style={{ padding: '8px 16px', paddingLeft: `${16 + (level + 1) * 16}px` }}>
          <FolderNameInput
            type="text"
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') handleCancelCreateFolder();
            }}
            autoFocus
          />
          <FolderTypeSelector
            value={newFolderType}
            onChange={(e) => setNewFolderType(e.target.value as PARACategory)}
          >
            <option value="projects">Projects</option>
            <option value="areas">Areas</option>
            <option value="resources">Resources</option>
            <option value="archive">Archive</option>
          </FolderTypeSelector>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <AddFolderButton onClick={handleCreateFolder}>
              Create
            </AddFolderButton>
            <button
              onClick={handleCancelCreateFolder}
              style={{
                padding: '8px 16px',
                border: '1px solid var(--border-subtle)',
                background: 'transparent',
                color: 'var(--color-header)',
                borderRadius: 'var(--radius-button)',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Show notes in this folder */}
      {isExpanded && folderNotes.map((note) => (
        <FileSystemItem
          key={note.id}
          $level={level + 1}
          $selected={selectedNoteId === note.id}
          $isFolder={false}
          onClick={() => handleNoteClick(note.id)}
          tabIndex={0}
          role="button"
          aria-selected={selectedNoteId === note.id}
        >
          <ItemIcon $type={item.type} $isFolder={false}>
            {getIcon(item.type, false)}
          </ItemIcon>
          <ItemName>{note.title || 'Untitled note'}</ItemName>
        </FileSystemItem>
      ))}
      
      {/* Show child folders */}
      {isExpanded && hasChildren && item.children?.map((child) => (
        <FileSystemItemComponent
          key={child.id}
          item={child}
          notes={notes}
          level={level + 1}
          selectedPath={selectedPath}
          selectedNoteId={selectedNoteId}
          expandedFolders={expandedFolders}
          searchQuery={searchQuery}
          onSelectFolder={onSelectFolder}
          onSelectNote={onSelectNote}
          onToggleExpand={onToggleExpand}
          onCreateFolder={onCreateFolder}
        />
      ))}
    </>
  );
};

export interface PARAFileSystemProps {
  folders: PARAItem[];
  notes: NoteContent[];
  selectedPath: string[];
  selectedNoteId: string | null;
  expandedFolders: Set<string>;
  searchQuery: string;
  onSelectFolder: (path: string[]) => void;
  onSelectNote: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onCreateNote: () => void;
  onCreateFolder: (parentPath: string[], name: string, type: PARACategory) => void;
  onSearchChange: (query: string) => void;
}

export default function PARAFileSystem({
  folders,
  notes,
  selectedPath,
  selectedNoteId,
  expandedFolders,
  searchQuery,
  onSelectFolder,
  onSelectNote,
  onToggleExpand,
  onCreateNote,
  onCreateFolder,
  onSearchChange,
}: PARAFileSystemProps) {
  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  }, [onSearchChange]);

  return (
    <FileSystemContainer>
      <HeaderSection>
        <NewNoteButton type="button" onClick={onCreateNote}>
          New note
        </NewNoteButton>
        <SearchInput
          type="search"
          placeholder="Search notes and folders…"
          value={searchQuery}
          onChange={handleSearch}
          aria-label="Search notes and folders"
        />
      </HeaderSection>
      <FileSystemList role="tree" aria-label="PARA file system">
        {folders.map((folder) => (
          <FileSystemItemComponent
            key={folder.id}
            item={folder}
            notes={notes}
            level={0}
            selectedPath={selectedPath}
            selectedNoteId={selectedNoteId}
            expandedFolders={expandedFolders}
            searchQuery={searchQuery}
            onSelectFolder={onSelectFolder}
            onSelectNote={onSelectNote}
            onToggleExpand={onToggleExpand}
            onCreateFolder={onCreateFolder}
          />
        ))}
      </FileSystemList>
    </FileSystemContainer>
  );
}

// Helper function
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
