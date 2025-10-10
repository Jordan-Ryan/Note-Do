import type { RefObject } from 'react';
import styled from 'styled-components';
import TaskTimer from '../widgets/TaskTimer';

interface HeaderProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  toggleRef: RefObject<HTMLButtonElement>;
}

const HeaderBar = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: var(--z-header);
  background: var(--color-header);
  color: var(--color-text-on-dark);
  display: flex;
  align-items: center;
  padding: 0 var(--space-2);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04);
`;

const HeaderContent = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
`;

const Cluster = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
`;

const ToggleButton = styled.button<{ $open: boolean }>`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 999px;
  background: var(--color-card);
  color: var(--color-header);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--easing), box-shadow var(--duration-fast) var(--easing);

  &:hover {
    box-shadow: var(--shadow-card);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  svg {
    transform: rotate(${({ $open }) => ($open ? '180deg' : '0deg')});
    transition: transform var(--duration-fast) var(--easing);
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
`;

const SearchField = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  background: var(--color-card);
  border-radius: 999px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-subtle);
  color: var(--color-header);
  padding: 0 calc(var(--space-2) + 2px);
  min-width: clamp(220px, 40vw, 520px);
  transition: box-shadow var(--duration-fast) var(--easing), border-color var(--duration-fast) var(--easing);

  &:focus-within {
    box-shadow: 0 0 0 2px var(--color-accent);
    border-color: transparent;
  }
`;

const SearchIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: calc(var(--space-2) - 4px);
  color: var(--color-text-muted);
`;

const SearchInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  color: var(--color-header);
  font-size: 0.95rem;
  width: 100%;
  padding: calc(var(--space-2) - 4px) 0;

  &::placeholder {
    color: var(--color-text-muted);
  }
`;

const RightCluster = styled(Cluster)`
  gap: var(--space-1);
`;

const HiddenLabel = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export default function Header({ isMobile, isSidebarOpen, onToggleSidebar, toggleRef }: HeaderProps) {
  const searchId = 'global-search';

  return (
    <HeaderBar>
      <HeaderContent>
        <Cluster>
          <ToggleButton
            ref={toggleRef}
            type="button"
            onClick={onToggleSidebar}
            aria-label={
              isMobile
                ? isSidebarOpen
                  ? 'Close navigation'
                  : 'Open navigation'
                : isSidebarOpen
                ? 'Collapse sidebar'
                : 'Expand sidebar'
            }
            aria-expanded={isSidebarOpen}
            aria-controls="app-sidebar"
            $open={isSidebarOpen}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M6 4.5L10 9l-4 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ToggleButton>
          <Logo>asos</Logo>
          <SearchField htmlFor={searchId}>
            <HiddenLabel>Search tasks, notes, and events</HiddenLabel>
            <SearchIcon aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12.5 12.5L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </SearchIcon>
            <SearchInput id={searchId} type="search" placeholder="Search tasks, notes, events…" />
          </SearchField>
        </Cluster>
        <RightCluster>
          <TaskTimer />
        </RightCluster>
      </HeaderContent>
    </HeaderBar>
  );
}
