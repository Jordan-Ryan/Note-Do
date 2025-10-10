import type React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import styled, { css } from 'styled-components';
import SidebarItem from './SidebarItem';

export interface SidebarItemData {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItemData[];
  activeId: string;
  collapsed: boolean;
  mobile: boolean;
  drawerOpen: boolean;
  onSelect: (id: string) => void;
  onRequestClose: () => void;
  onToggleSidebar: () => void;
  toggleRef: React.RefObject<HTMLButtonElement>;
}

const SidebarContainer = styled.aside<{ $collapsed: boolean; $mobile: boolean; $drawerOpen: boolean }>`
  position: fixed;
  top: 64px;
  bottom: 0;
  left: 0;
  z-index: var(--z-sidebar);
  background: var(--color-sidebar);
  color: var(--color-text-on-dark);
  display: flex;
  flex-direction: column;
  width: ${({ $collapsed }) => ($collapsed ? '72px' : '280px')};
  padding: var(--space-2) var(--space-1);
  gap: var(--space-1);
  transition: width var(--duration-med) var(--easing), transform var(--duration-med) var(--easing),
    box-shadow var(--duration-fast) var(--easing);
  box-shadow: none;

  ${({ $mobile, $drawerOpen }) =>
    $mobile &&
    css`
      width: 280px;
      transform: ${$drawerOpen ? 'translateX(0)' : 'translateX(-100%)'};
      box-shadow: ${$drawerOpen ? 'var(--shadow-elevated)' : 'none'};
    `};

  @media (max-width: 768px) {
    padding: var(--space-2);
  }
`;

const Navigation = styled.nav`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: var(--z-overlay);
`;

const SidebarFooter = styled.div`
  margin-top: auto;
  padding: var(--space-1);
  display: flex;
  justify-content: flex-end;
`;

const CollapseButton = styled.button<{ $collapsed: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 16px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-on-dark);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--duration-fast) var(--easing), background-color var(--duration-fast) var(--easing),
    box-shadow var(--duration-fast) var(--easing);

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  svg {
    transform: rotate(${({ $collapsed }) => ($collapsed ? '0deg' : '180deg')});
    transition: transform var(--duration-fast) var(--easing);
  }
`;

export default function Sidebar({
  items,
  activeId,
  collapsed,
  mobile,
  drawerOpen,
  onSelect,
  onRequestClose,
  onToggleSidebar,
  toggleRef,
}: SidebarProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusableSelectors = useMemo(
    () =>
      [
        'button:not([disabled])',
        '[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(','),
    [],
  );

  useEffect(() => {
    if (mobile && drawerOpen) {
      const firstFocusable = containerRef.current?.querySelector<HTMLElement>(focusableSelectors);
      firstFocusable?.focus();
    }
  }, [mobile, drawerOpen, focusableSelectors]);

  useEffect(() => {
    if (!mobile || !drawerOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onRequestClose();
        toggleRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobile, drawerOpen, onRequestClose, toggleRef]);

  const handleKeyNavigation = (event: React.KeyboardEvent<HTMLUListElement>) => {
    const currentIndex = itemRefs.current.findIndex((item) => item === document.activeElement);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % itemRefs.current.length : 0;
      itemRefs.current[nextIndex]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const nextIndex = currentIndex > 0 ? currentIndex - 1 : itemRefs.current.length - 1;
      itemRefs.current[nextIndex]?.focus();
    } else if (event.key === 'Escape' && mobile && drawerOpen) {
      event.preventDefault();
      onRequestClose();
      toggleRef.current?.focus();
    } else if (event.key === 'Tab' && mobile && drawerOpen) {
      const focusable = containerRef.current?.querySelectorAll<HTMLElement>(focusableSelectors);
      if (!focusable || focusable.length === 0) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    }
  };

  return (
    <>
      {mobile && drawerOpen && <Backdrop onClick={onRequestClose} role="presentation" />}
      <SidebarContainer
        id="app-sidebar"
        ref={containerRef}
        $collapsed={collapsed}
        $mobile={mobile}
        $drawerOpen={drawerOpen}
        role="navigation"
        aria-label="Main navigation"
        aria-hidden={mobile ? !drawerOpen : undefined}
      >
        <Navigation>
          <NavList role="menu" aria-orientation="vertical" onKeyDown={handleKeyNavigation}>
            {items.map((item, index) => (
              <li key={item.id} role="none">
                <SidebarItem
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  icon={item.icon}
                  label={item.label}
                  active={item.id === activeId}
                  collapsed={collapsed}
                  onClick={() => onSelect(item.id)}
                  role="menuitem"
                  aria-current={item.id === activeId ? 'page' : undefined}
                />
              </li>
            ))}
          </NavList>
        </Navigation>
        <SidebarFooter>
          <CollapseButton
            type="button"
            onClick={onToggleSidebar}
            $collapsed={collapsed}
            aria-label={
              mobile
                ? drawerOpen
                  ? 'Close navigation'
                  : 'Open navigation'
                : collapsed
                ? 'Expand sidebar'
                : 'Collapse sidebar'
            }
            aria-expanded={mobile ? drawerOpen : !collapsed}
            aria-controls="app-sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M6 4.5 10 9l-4 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </CollapseButton>
        </SidebarFooter>
      </SidebarContainer>
    </>
  );
}
