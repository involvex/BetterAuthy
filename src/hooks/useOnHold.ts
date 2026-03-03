import { LongPressCallbackReason, useLongPress } from 'use-long-press';
import type { KeyboardEvent } from 'react';

export function useOnHold(onClick: () => void, onHold: () => void, duration: number = 600) {
  const longPress = useLongPress(onClick, {
    threshold: duration,
    onCancel: (e, { reason }) => {
      if (reason === LongPressCallbackReason.CancelledByRelease) {
        onHold();
      }
    },
  });

  return () => {
    return {
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      },
      ...longPress(),
    };
  };
}
