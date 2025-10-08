import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

type TimerStatus = 'idle' | 'running' | 'paused';

const TimerContainer = styled.div`
  --timer-expanded: 0;
  background: var(--color-card);
  color: var(--color-header);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) calc(var(--space-1) * 1.5);
  transition: box-shadow var(--duration-fast) var(--easing), transform var(--duration-fast) var(--easing);

  &:hover,
  &:focus-within {
    box-shadow: var(--shadow-elevated);
    transform: translateY(-1px);
    --timer-expanded: 1;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }
`;

const TimerSurface = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-1);
`;

const TimerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TaskName = styled.span`
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
`;

const TimeStamp = styled.span`
  font-size: 1.1rem;
  font-variant-numeric: tabular-nums;
`;

const TimerControls = styled.div`
  display: inline-flex;
  align-items: center;
  gap: calc(var(--space-1) * 0.75);
`;

const TimerButton = styled.button<{ $tone?: 'accent' | 'neutral' }>`
  border: none;
  border-radius: var(--radius-button);
  background: ${({ $tone }) => ($tone === 'accent' ? 'var(--color-accent)' : 'var(--color-surface)')};
  color: ${({ $tone }) => ($tone === 'accent' ? 'var(--color-text-on-dark)' : 'var(--color-header)')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  padding: calc(var(--space-1) * 0.75) var(--space-1);
  cursor: pointer;
  box-shadow: ${({ $tone }) => ($tone === 'accent' ? 'none' : 'var(--shadow-card)')};
  transition: background-color var(--duration-fast) var(--easing), transform var(--duration-fast) var(--easing),
    box-shadow var(--duration-fast) var(--easing);

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
`;

const ButtonLabel = styled.span`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  max-width: calc(var(--timer-expanded) * 80px);
  opacity: var(--timer-expanded);
  transition: opacity var(--duration-fast) var(--easing), max-width var(--duration-fast) var(--easing);
  white-space: nowrap;
  overflow: hidden;
`;

const Icon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
      <TimerSurface>
        <TimerDetails>
          <TaskName>{taskName}</TaskName>
          <TimeStamp aria-live="polite">{formatTime(elapsedMs)}</TimeStamp>
        </TimerDetails>
        <TimerControls>
          {status !== 'running' && (
            <TimerButton onClick={start} aria-label="Start task">
              <Icon aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4.5 3.5L10 7 4.5 10.5z" fill="currentColor" />
                </svg>
              </Icon>
              <ButtonLabel>Start</ButtonLabel>
            </TimerButton>
          )}
          {status === 'running' && (
            <TimerButton onClick={pause} aria-label="Pause task">
              <Icon aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 3h2v8H4zM8 3h2v8H8z" fill="currentColor" />
                </svg>
              </Icon>
              <ButtonLabel>Pause</ButtonLabel>
            </TimerButton>
          )}
          <TimerButton onClick={stop} aria-label="Stop task" $tone="accent" disabled={status === 'idle'}>
            <Icon aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="4" y="4" width="6" height="6" fill="currentColor" rx="1" />
              </svg>
            </Icon>
            <ButtonLabel>Stop</ButtonLabel>
          </TimerButton>
        </TimerControls>
      </TimerSurface>
    </TimerContainer>
  );
}
