import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

type TimerStatus = 'idle' | 'running' | 'paused';

const TimerContainer = styled.div`
  width: min(360px, 100%);
  min-width: 260px;
  height: 48px;
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: 8px 14px;
  border-radius: 18px;
  background: linear-gradient(
      160deg,
      color-mix(in srgb, var(--color-header) 88%, var(--color-card) 12%),
      color-mix(in srgb, var(--color-header) 72%, var(--color-accent) 28%)
    ),
    color-mix(in srgb, var(--color-header) 92%, transparent);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 12px 20px rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-text-on-dark);
  position: relative;
  isolation: isolate;
  transition: transform var(--duration-fast) var(--easing), box-shadow var(--duration-fast) var(--easing);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.18), transparent 60%);
    opacity: 0.9;
    pointer-events: none;
    z-index: -1;
  }

  &:hover,
  &:focus-within {
    transform: translateY(-1px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 16px 24px rgba(0, 0, 0, 0.38);
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.6);
    outline-offset: 2px;
  }
`;

const IconBadge = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: linear-gradient(
      150deg,
      color-mix(in srgb, var(--color-card) 35%, transparent),
      color-mix(in srgb, var(--color-accent) 40%, transparent)
    ),
    rgba(255, 255, 255, 0.06);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.35);
`;

const TimerSurface = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex: 1;
  min-width: 0;
`;

const TimerDetails = styled.div`
  display: grid;
  gap: 2px;
  min-width: 0;
  position: relative;
`;

const TimeStamp = styled.span`
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
`;

const TaskName = styled.span`
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.85;
`;

const HiddenStatus = styled.span`
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
const TimerControls = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const ControlButton = styled.button<{ $variant?: 'accent' | 'ghost' }>`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: none;
  background: ${({ $variant }) =>
    $variant === 'accent'
      ? 'linear-gradient(150deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 90%, #ffffff 10%))'
      : 'rgba(255, 255, 255, 0.12)'};
  color: ${({ $variant }) => ($variant === 'accent' ? 'var(--color-text-on-dark)' : 'rgba(255, 255, 255, 0.92)')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ $variant }) =>
    $variant === 'accent' ? '0 8px 16px color-mix(in srgb, var(--color-accent) 55%, transparent)' : 'none'};
  cursor: pointer;
  transition: transform var(--duration-fast) var(--easing), box-shadow var(--duration-fast) var(--easing),
    background var(--duration-fast) var(--easing);

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ $variant }) =>
      $variant === 'accent'
        ? '0 10px 18px color-mix(in srgb, var(--color-accent) 65%, transparent)'
        : '0 4px 12px rgba(0, 0, 0, 0.25)'};
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.6);
    outline-offset: 2px;
  }
`;

export default function TaskTimer() {
  const [status, setStatus] = useState<TimerStatus>('idle');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [taskName] = useState('Focus Session');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (status === 'running') {
      const startedAt = Date.now() - elapsedMs;
      intervalRef.current = window.setInterval(() => {
        setElapsedMs(Date.now() - startedAt);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, elapsedMs]);

  useEffect(() => {
    if (status !== 'running' && intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [status]);

  const start = () => {
    setStatus('running');
  };

  const pause = () => {
    setStatus('paused');
  };

  const stop = () => {
    setStatus('idle');
    setElapsedMs(0);
  };

  const toggle = () => {
    if (status === 'running') {
      pause();
    } else {
      start();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      toggle();
    } else if (event.key.toLowerCase() === 's') {
      event.preventDefault();
      stop();
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <TimerContainer role="group" tabIndex={0} onKeyDown={handleKeyDown} aria-label="Task timer">
      <IconBadge aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M13.5 5.5 11.8 7.2a3.5 3.5 0 0 1-4.95 0L5.2 5.55"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.25 10.5 4.5 12.25M13.5 12.25 11.75 10.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M9 2.75a3.25 3.25 0 0 1 3.25 3.25v2.5A3.25 3.25 0 0 1 9 11.75a3.25 3.25 0 0 1-3.25-3.25V6A3.25 3.25 0 0 1 9 2.75Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </IconBadge>
      <TimerSurface>
        <TimerDetails>
          <HiddenStatus aria-live="polite">
            {status === 'running' ? 'Timer running' : status === 'paused' ? 'Timer paused' : 'Timer ready'}
          </HiddenStatus>
          <TaskName>{taskName}</TaskName>
          <TimeStamp aria-live="polite">{formatTime(elapsedMs)}</TimeStamp>
        </TimerDetails>
        <TimerControls>
          {status !== 'running' && (
            <ControlButton type="button" onClick={start} aria-label="Start task">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 4.5 11 8l-5 3.5z" fill="currentColor" />
              </svg>
            </ControlButton>
          )}
          {status === 'running' && (
            <ControlButton type="button" onClick={pause} aria-label="Pause task">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 4h1.8v8H6zM8.2 4H10v8H8.2z" fill="currentColor" />
              </svg>
            </ControlButton>
          )}
          <ControlButton
            type="button"
            onClick={stop}
            aria-label="Stop task"
            $variant="accent"
            disabled={status === 'idle'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="5" y="5" width="6" height="6" rx="1.2" fill="currentColor" />
            </svg>
          </ControlButton>
        </TimerControls>
      </TimerSurface>
    </TimerContainer>
  );
}
