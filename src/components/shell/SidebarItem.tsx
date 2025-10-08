import { forwardRef } from 'react';
import styled, { css } from 'styled-components';

interface SidebarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}

const ItemButton = styled.button<{ $active: boolean; $collapsed: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  justify-content: ${({ $collapsed }) => ($collapsed ? 'center' : 'flex-start')};
  padding: var(--space-1);
  border: none;
  border-radius: var(--radius-button);
  background: ${({ $active }) => ($active ? 'var(--color-accent)' : 'transparent')};
  color: var(--color-text-on-dark);
  cursor: pointer;
  position: relative;
  transition: background-color var(--duration-fast) var(--easing), filter var(--duration-fast) var(--easing),
    box-shadow var(--duration-fast) var(--easing), color var(--duration-fast) var(--easing);

  ${({ $active }) =>
    !$active &&
    css`
      color: var(--color-text-on-dark);
      opacity: 0.9;
    `};

  &:hover {
    filter: brightness(1.1);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-accent);
  }
`;

const IconSlot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const Label = styled.span`
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 600;
  color: inherit;
`;

const Tooltip = styled.span`
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translate(-4px, -50%);
  background: var(--color-header);
  color: var(--color-text-on-dark);
  padding: 4px 8px;
  border-radius: var(--radius-button);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-fast) var(--easing), transform var(--duration-fast) var(--easing);
  white-space: nowrap;

  ${ItemButton}:hover &,
  ${ItemButton}:focus-visible & {
    opacity: 1;
    transform: translate(0, -50%);
  }
`;

const SidebarItem = forwardRef<HTMLButtonElement, SidebarItemProps>(
  ({ icon, label, active, collapsed, ...buttonProps }, ref) => (
    <ItemButton
      ref={ref}
      $active={active}
      $collapsed={collapsed}
      aria-label={collapsed ? label : undefined}
      title={collapsed ? label : undefined}
      {...buttonProps}
    >
      <IconSlot>{icon}</IconSlot>
      {!collapsed && <Label>{label}</Label>}
      {collapsed && <Tooltip role="tooltip">{label}</Tooltip>}
    </ItemButton>
  ),
);

SidebarItem.displayName = 'SidebarItem';

export default SidebarItem;
