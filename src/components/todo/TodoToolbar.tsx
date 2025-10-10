import type { ChangeEvent } from 'react';
import styled, { css } from 'styled-components';
import type { TaskFilter, TaskSort } from '../../types/todo';
import TagPill from '../shared/TagPill';

export interface TodoToolbarProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  availableTags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
  sort: TaskSort;
  onSortChange: (sort: TaskSort) => void;
  onNewTask: () => void;
}

const ToolbarShell = styled.section`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--color-card);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  position: sticky;
  top: calc(var(--space-2) / 2);
  z-index: 1;
`;

const FilterCluster = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px;
  border-radius: 999px;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  border: none;
  background: transparent;
  color: ${(props) => (props.$active ? 'var(--color-card)' : 'var(--color-header)')};
  background-color: ${(props) => (props.$active ? 'var(--color-accent)' : 'transparent')};
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.85rem;
  padding: 8px 14px;
  transition: background-color var(--duration-fast) var(--easing), color var(--duration-fast) var(--easing),
    transform var(--duration-fast) var(--easing);
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-accent);
  }
`;

const TagSection = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const Label = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
`;

const SortSelect = styled.select`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  background: var(--color-card);
  color: var(--color-header);
  transition: border-color var(--duration-fast) var(--easing), box-shadow var(--duration-fast) var(--easing);

  &:focus-visible {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px rgba(255, 99, 99, 0.2);
  }
`;

const Spacer = styled.div`
  flex: 1 1 auto;
`;

const PrimaryButton = styled.button`
  border-radius: var(--radius-button);
  border: none;
  background: var(--color-accent);
  color: var(--color-card);
  font-weight: 600;
  font-size: 0.9rem;
  padding: 10px 18px;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--easing), box-shadow var(--duration-fast) var(--easing);
  box-shadow: 0 4px 12px rgba(255, 99, 99, 0.35);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-elevated);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-accent), inset 0 0 0 1px var(--color-card);
  }
`;

const TagList = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
`;

export function TodoToolbar({
  filter,
  onFilterChange,
  availableTags,
  activeTag,
  onTagChange,
  sort,
  onSortChange,
  onNewTask,
}: TodoToolbarProps) {
  const handleSort = (event: ChangeEvent<HTMLSelectElement>) => {
    onSortChange(event.target.value as TaskSort);
  };

  return (
    <ToolbarShell aria-label="To-do toolbar">
      <FilterCluster role="radiogroup" aria-label="Task filters">
        {[
          { id: 'all', label: 'All' },
          { id: 'today', label: 'Today' },
          { id: 'upcoming', label: 'Upcoming' },
        ].map(({ id, label }) => (
          <FilterButton
            type="button"
            key={id}
            role="radio"
            aria-checked={filter === id}
            $active={filter === id}
            onClick={() => onFilterChange(id as TaskFilter)}
          >
            {label}
          </FilterButton>
        ))}
      </FilterCluster>

      <TagSection>
        <Label>Tags</Label>
        <TagList role="list" aria-label="Filter by tag">
          <TagPill
            size="sm"
            tone={activeTag ? 'muted' : 'accent'}
            active={!activeTag}
            aria-pressed={!activeTag}
            onClick={() => onTagChange(null)}
          >
            All
          </TagPill>
          {availableTags.map((tag) => (
            <TagPill
              key={tag}
              size="sm"
              tone="outline"
              active={activeTag === tag}
              aria-pressed={activeTag === tag}
              onClick={() => onTagChange(activeTag === tag ? null : tag)}
            >
              {tag}
            </TagPill>
          ))}
        </TagList>
      </TagSection>

      <Spacer aria-hidden />

      <Label as="label" htmlFor="sort-menu">
        Sort
      </Label>
      <SortSelect id="sort-menu" value={sort} onChange={handleSort}>
        <option value="due">Due date</option>
        <option value="priority">Priority</option>
        <option value="updated">Updated</option>
      </SortSelect>

      <PrimaryButton onClick={onNewTask}>New Task</PrimaryButton>
    </ToolbarShell>
  );
}

export default TodoToolbar;
