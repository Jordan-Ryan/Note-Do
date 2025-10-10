import { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ToastRegion = styled.div`
  position: fixed;
  bottom: var(--space-2);
  right: var(--space-2);
  display: grid;
  gap: 8px;
  z-index: var(--z-overlay);
`;

const Toast = styled.div`
  min-width: 160px;
  padding: 12px 16px;
  border-radius: var(--radius-card);
  background: var(--color-card);
  box-shadow: var(--shadow-elevated);
  border: 1px solid var(--border-subtle, var(--color-border, #e5e5e5));
  color: var(--color-header);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: ${fadeInUp} var(--duration-med) var(--easing);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const AccentDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 12px;
  background: var(--color-accent);
  flex-shrink: 0;
`;

export interface InlineToast {
  id: string;
  message: string;
  duration?: number;
}

export interface InlineToastsProps {
  toasts: InlineToast[];
  onRemove(id: string): void;
  'aria-live'?: 'polite' | 'assertive';
}

export function InlineToasts({ toasts, onRemove, 'aria-live': ariaLive = 'polite' }: InlineToastsProps) {
  useEffect(() => {
    const timers = toasts.map((toast) => {
      const timeout = window.setTimeout(() => onRemove(toast.id), toast.duration ?? 2400);
      return () => window.clearTimeout(timeout);
    });
    return () => {
      timers.forEach((stop) => stop());
    };
  }, [toasts, onRemove]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <ToastRegion aria-live={ariaLive} aria-atomic="true">
      {toasts.map((toast) => (
        <Toast key={toast.id}>
          <AccentDot aria-hidden="true" />
          <span>{toast.message}</span>
        </Toast>
      ))}
    </ToastRegion>
  );
}

export default InlineToasts;
