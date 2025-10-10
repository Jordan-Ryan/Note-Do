import styled from 'styled-components';

export interface TodoBulkBarProps {
  selectedCount: number;
  onCompleteSelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

const BulkBarShell = styled.aside`
  position: sticky;
  bottom: var(--space-2);
  margin-top: var(--space-2);
  margin-bottom: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-card);
  background: rgba(44, 44, 44, 0.92);
  color: var(--color-text-on-dark);
  box-shadow: var(--shadow-elevated);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  justify-content: space-between;
`;

const Actions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'ghost' }>`
  border-radius: var(--radius-button);
  border: 1px solid transparent;
  padding: 8px 14px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: transform var(--duration-fast) var(--easing), box-shadow var(--duration-fast) var(--easing),
    background var(--duration-fast) var(--easing), border-color var(--duration-fast) var(--easing);
  color: ${(props) => {
    switch (props.$variant) {
      case 'ghost':
        return 'var(--color-text-on-dark)';
      case 'secondary':
        return 'var(--color-accent)';
      default:
        return 'var(--color-card)';
    }
  }};
  background: ${(props) => {
    switch (props.$variant) {
      case 'secondary':
        return 'rgba(255, 99, 99, 0.16)';
      case 'ghost':
        return 'transparent';
      default:
        return 'var(--color-accent)';
    }
  }};
  border-color: ${(props) => (props.$variant === 'ghost' ? 'rgba(255, 255, 255, 0.25)' : 'transparent')};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${(props) => (props.$variant === 'ghost' ? 'none' : 'var(--shadow-elevated)')};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-accent);
  }
`;

export function TodoBulkBar({
  selectedCount,
  onCompleteSelected,
  onDeleteSelected,
  onClearSelection,
}: TodoBulkBarProps) {
  return (
    <BulkBarShell aria-live="polite" aria-label="Bulk actions">
      <div>{selectedCount} selected</div>
      <Actions>
        <ActionButton type="button" $variant="secondary" onClick={onCompleteSelected}>
          Complete
        </ActionButton>
        <ActionButton type="button" onClick={onDeleteSelected}>
          Delete
        </ActionButton>
        <ActionButton type="button" $variant="ghost" onClick={onClearSelection}>
          Clear selection
        </ActionButton>
      </Actions>
    </BulkBarShell>
  );
}

export default TodoBulkBar;
