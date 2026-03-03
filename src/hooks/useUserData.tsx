import { useEffect, useState } from 'react';
import { getUserData } from '../util/storage';
import { getUserId } from '../util/session';
import type { UserData } from '../types/auth';

export function useUserData() {
  const [data, setData] = useState<UserData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    const userId = getUserId();
    if (!userId) {
      setData(undefined);
      setLoading(false);
      return;
    }

    getUserData(userId)
      .then((d) => {
        if (!mounted) return;
        if (d) {
          const normalized: UserData = {
            ...d,
            keys: (d.keys || []).map((k) => ({ ...k, archived: k.archived ?? false })),
          };
          setData(normalized);
        } else setData(undefined);
        setLoading(false);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e as Error);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error, userKey: getUserId() };
}
