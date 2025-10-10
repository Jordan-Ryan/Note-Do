import { useState, useCallback } from 'react';
import styled from 'styled-components';
import type { PARAItem, PARACategory } from '../../types/para';

const TreeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

const FolderItem = styled.div<{ $level: number; $selected: boolean; $expanded: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  padding-left: ${({ $level }) => 12 + $level * 16}px;
  border-radius: var(--radius-button);
  cursor: pointer;
  transition: all var(--duration-fast) var(--easing);
  font-size: 0.875rem;
  color: var(--color-header);
  background: ${({ $selected }) => ($selected ? 'rgba(255, 99, 99, 0.15)' : 'transparent')};
  border-left: ${({ $selected }) => ($selected ? '3px solid var(--color-accent)' : '3px solid transparent')};
  font-weight: ${({ $selected }) => ($selected ? '600' : '400')};

  &:hover {
    background: ${({ $selected }) => ($selected ? 'rgba(255, 99, 99, 0.20)' : 'rgba(0, 0, 0, 0.08)')};
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

const FolderIcon = styled.div<{ $type: PARACategory }>`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $type }) => {
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

const FolderName = styled.span`
  flex: 1;
  font-weight: 500;
`;

const NotesCount = styled.span`
  font-size: 0.75rem;
  color: var(--color-text-muted);
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
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

const getIcon = (type: PARACategory) => {
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

interface FolderTreeItemProps {
  item: PARAItem;
  level: number;
  selectedPath: string[];
  expandedFolders: Set<string>;
  onSelect: (path: string[]) => void;
  onToggleExpand: (id: string) => void;
}

const FolderTreeItem = ({ item, level, selectedPath, expandedFolders, onSelect, onToggleExpand }: FolderTreeItemProps) => {
  const isExpanded = expandedFolders.has(item.id);
  const isSelected = selectedPath[0] === item.id;
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = useCallback(() => {
    onSelect([item.id]);
  }, [item.id, onSelect]);

  const handleExpandClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleExpand(item.id);
    }
  }, [item.id, hasChildren, onToggleExpand]);

  return (
    <>
      <FolderItem
        $level={level}
        $selected={isSelected}
        $expanded={isExpanded}
        onClick={handleClick}
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
        <FolderIcon $type={item.type}>
          {getIcon(item.type)}
        </FolderIcon>
        <FolderName>{item.name}</FolderName>
        {item.notesCount !== undefined && item.notesCount > 0 && (
          <NotesCount>{item.notesCount}</NotesCount>
        )}
      </FolderItem>
      {isExpanded && hasChildren && item.children?.map((child) => (
        <FolderTreeItem
          key={child.id}
          item={child}
          level={level + 1}
          selectedPath={selectedPath}
          expandedFolders={expandedFolders}
          onSelect={onSelect}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </>
  );
};

export interface PARAFolderTreeProps {
  folders: PARAItem[];
  selectedPath: string[];
  expandedFolders: Set<string>;
  onSelectFolder: (path: string[]) => void;
  onToggleExpand: (id: string) => void;
}

export default function PARAFolderTree({
  folders,
  selectedPath,
  expandedFolders,
  onSelectFolder,
  onToggleExpand,
}: PARAFolderTreeProps) {
  return (
    <TreeContainer role="tree" aria-label="PARA folder structure">
      {folders.map((folder) => (
        <FolderTreeItem
          key={folder.id}
          item={folder}
          level={0}
          selectedPath={selectedPath}
          expandedFolders={expandedFolders}
          onSelect={onSelectFolder}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </TreeContainer>
  );
}
