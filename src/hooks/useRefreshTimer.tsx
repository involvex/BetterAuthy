import { useEffect, useState } from 'react';

export function useRefreshTimer() {
  const [timestamp, setTimestamp] = useState(new Date());

  useEffect(() => {
    // 30 second refresh (updated at 0 seconds, 30 seconds, 60 seconds, etc.)
    let timestampInt: ReturnType<typeof setInterval> | undefined;
    setTimeout(
      () => {
        setTimestamp(new Date());
        timestampInt = setInterval(() => setTimestamp(new Date()), 30000);
      },
      30000 - (new Date().getTime() % 30000)
    );

    return () => {
      if (timestampInt) clearInterval(timestampInt);
    };
  }, []);

  return { timestamp };
}

export function useSecondTimer() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // 1 second refresh
    const timeInt = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(timeInt);
    };
  }, []);

  return { time };
}
