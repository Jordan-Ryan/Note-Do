import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import Header from './components/shell/Header';
import Sidebar from './components/shell/Sidebar';
import type { SidebarItemData } from './components/shell/Sidebar';
import { useMediaQuery } from './hooks/useMediaQuery';

const ShellWrapper = styled.div`
  --sidebar-w: 280px;
  min-height: 100vh;
  background: var(--color-surface);
`;

const MainArea = styled.main`
  margin-top: 64px;
  margin-left: var(--sidebar-w);
  transition: margin-left var(--duration-med) var(--easing);
  padding: calc(var(--space-2) * 1.5) var(--space-2);

  @media (max-width: 768px) {
    margin-left: 0;
    padding-bottom: calc(var(--space-2) * 2);
  }
`;

const ContentCard = styled.section`
  background: var(--color-card);
  box-shadow: var(--shadow-card);
  border-radius: var(--radius-card);
  padding: calc(var(--space-2) * 1.5);
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  gap: var(--space-2);
`;

const PlaceholderTitle = styled.h1`
  margin: 0;
  font-size: 1.75rem;
  letter-spacing: -0.01em;
`;

const PlaceholderText = styled.p`
  margin: 0;
  color: var(--color-header);
  opacity: 0.72;
  max-width: 60ch;
`;

const SubtleText = styled(PlaceholderText)`
  color: var(--color-text-muted);
  opacity: 1;
`;

export interface AppShellProps {
  children?: React.ReactNode;
}

type IconKey = 'calendar-day' | 'calendar' | 'list' | 'note' | 'settings';

const ICONS: Record<IconKey, JSX.Element> = {
  'calendar-day': (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="7" cy="12" r="1.5" fill="currentColor" />
      <path d="M10 11h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.75" y="3.75" width="14.5" height="13.5" rx="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 2.75v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 2.75v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M2.75 8h14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  list: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M7 5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 10h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M7 15h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="4" cy="5" r="1" fill="currentColor" />
      <circle cx="4" cy="10" r="1" fill="currentColor" />
      <circle cx="4" cy="15" r="1" fill="currentColor" />
    </svg>
  ),
  note: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 3h7l3 3v11H5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 3v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9h6M7 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.5 11.5a5.5 5.5 0 0 1 0-3l1.62-.27a1 1 0 0 0 .76-.57l.73-1.53a5.5 5.5 0 0 1 3.78 0l.73 1.53a1 1 0 0 0 .76.57l1.62.27a5.5 5.5 0 0 1 0 3l-1.62.27a1 1 0 0 0-.76.57l-.73 1.53a5.5 5.5 0 0 1-3.78 0l-.73-1.53a1 1 0 0 0-.76-.57z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const NAV_ITEMS: ReadonlyArray<{ id: string; label: string; icon: IconKey }> = [
  { id: 'day', label: 'Day View', icon: 'calendar-day' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'todo', label: 'To-Do', icon: 'list' },
  { id: 'notes', label: 'Notes', icon: 'note' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export default function AppShell({ children }: AppShellProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeRoute, setActiveRoute] = useState('day');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const sidebarItems = useMemo<SidebarItemData[]>(
    () => NAV_ITEMS.map(({ id, label, icon }) => ({ id, label, icon: ICONS[icon] })),
    [],
  );

  useEffect(() => {
    if (isMobile) {
      setIsDrawerOpen(false);
    } else {
      setIsSidebarExpanded(true);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile && isDrawerOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
    return undefined;
  }, [isMobile, isDrawerOpen]);

  const sidebarWidth = useMemo(() => {
    if (isMobile) {
      return 0;
    }
    return isSidebarExpanded ? 280 : 72;
  }, [isMobile, isSidebarExpanded]);

  const shellStyle = useMemo(
    () => ({ '--sidebar-w': `${sidebarWidth}px` } as CSSProperties),
    [sidebarWidth],
  );

  const handleToggleSidebar = () => {
    if (isMobile) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setIsSidebarExpanded((prev) => !prev);
    }
  };

  const handleSelectRoute = (id: string) => {
    setActiveRoute(id);
    if (isMobile) {
      setIsDrawerOpen(false);
      requestAnimationFrame(() => {
        toggleRef.current?.focus();
      });
    }
  };

  return (
    <ShellWrapper style={shellStyle}>
      <Header
        isMobile={isMobile}
        isSidebarOpen={isMobile ? isDrawerOpen : isSidebarExpanded}
        onToggleSidebar={handleToggleSidebar}
        toggleRef={toggleRef}
      />
      <Sidebar
        items={sidebarItems}
        activeId={activeRoute}
        collapsed={!isMobile && !isSidebarExpanded}
        mobile={isMobile}
        drawerOpen={isDrawerOpen}
        onSelect={handleSelectRoute}
        onRequestClose={() => {
          setIsDrawerOpen(false);
          toggleRef.current?.focus();
        }}
        toggleRef={toggleRef}
      />
      <MainArea>
        {children ?? (
          <ContentCard>
            <PlaceholderTitle>Plan your day with clarity</PlaceholderTitle>
            <PlaceholderText>
              Use the navigation to jump between day view, calendar, to-do lists, notes, and settings. This shell keeps
              your focus on the work ahead while staying minimal and high-contrast.
            </PlaceholderText>
            <SubtleText>
              Future pages will mount here inside the fixed header and collapsible sidebar layout.
            </SubtleText>
          </ContentCard>
        )}
      </MainArea>
    </ShellWrapper>
  );
}
