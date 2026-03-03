import { useEffect, useState } from 'react';
import { getUserData } from '../util/storage';
import { getUserId } from '../util/session';

export interface UserData {
  email: string;
  keys: Key[];
  recentKeys: string[];
  code: string;
  webauthn: Auth[];
}

export interface Auth {
  credentialId: string;
  uuid: string;
  secret: string;
  userAgent: string;
}

export interface Key {
  name: string;
  secret: string;
  archived: boolean;
}

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
        // normalize missing archived fields and other shape differences
        if (d) {
          const normalized = { ...d, keys: (d.keys || []).map((k) => ({ archived: false, ...k })) };
          setData(normalized as unknown as UserData);
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
