import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';

type Tone = 'default' | 'accent' | 'muted' | 'outline';
type Size = 'sm' | 'md';

export interface TagPillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  active?: boolean;
  tone?: Tone;
  size?: Size;
}

const toneStyles: Record<Tone, ReturnType<typeof css>> = {
  default: css`
    background: rgba(0, 0, 0, 0.04);
    color: inherit;
  `,
  accent: css`
    background: rgba(255, 99, 99, 0.14);
    color: var(--color-accent);
  `,
  muted: css`
    background: rgba(0, 0, 0, 0.04);
    color: var(--color-text-muted);
  `,
  outline: css`
    background: transparent;
    color: inherit;
    border: 1px solid var(--color-border);
  `,
};

const sizeStyles: Record<Size, ReturnType<typeof css>> = {
  sm: css`
    height: 24px;
    font-size: 0.75rem;
    padding: 0 10px;
    gap: 8px;
  `,
  md: css`
    height: 28px;
    font-size: 0.8125rem;
    padding: 0 12px;
    gap: 8px;
  `,
};

const PillButton = styled.button<{ $active?: boolean; $tone: Tone; $size: Size }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  transition: transform var(--duration-fast) var(--easing), box-shadow var(--duration-fast) var(--easing),
    background var(--duration-fast) var(--easing), color var(--duration-fast) var(--easing);
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  line-height: 1;
  user-select: none;
  position: relative;

  ${(props) => toneStyles[props.$tone]};
  ${(props) => sizeStyles[props.$size]};

  ${(props) =>
    props.$active &&
    css`
      box-shadow: 0 0 0 2px rgba(255, 99, 99, 0.2);
      background: rgba(255, 99, 99, 0.22);
      color: var(--color-accent);
    `}

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-card);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-accent);
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
    transform: none;
    box-shadow: none;
  }
`;

export function TagPill({ children, tone = 'default', size = 'md', active, ...rest }: TagPillProps) {
  return (
    <PillButton type="button" $tone={tone} $size={size} $active={active} {...rest}>
      {children}
    </PillButton>
  );
}

export default TagPill;
