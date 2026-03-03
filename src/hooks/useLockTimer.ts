import { useRef } from 'react';

import { useVisibilityChange } from './useVisibilityChange';

export function useLockTimer(setToken: (token: string | undefined) => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Lock the token after 15 seconds of inactivity
  useVisibilityChange((visible) => {
    if (visible) {
      // If coming back soon after being hidden, keep the token
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    } else {
      // Set a timer to clear the token after 15 seconds
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToken(undefined), 15 * 1000);
    }
  });
}
