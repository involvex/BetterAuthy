import { encrypt } from '@metamask/browser-passworder';
import { useEffect, useState } from 'react';
import { FaBroadcastTower } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';
import { useLockTimer } from '~hooks/useLockTimer';
import { useMigrateData } from '~hooks/useMigrateData';

import { CodeContext } from '../contexts/CodeContext';
import { useOnline } from '../hooks/useOnline';
import { useServiceWorker } from '../hooks/useServiceWorker';
import { useUserData } from '../hooks/useUserData';
import { exportKeys, importKeys } from '../util/keys';
import { Lock } from './Lock/Lock';
import { Login } from './Login';
import { LogoPage } from './Logo';
import { Menu } from './Menu';
import { Progress } from './Progress';
import { TokenList } from './TokenList';
import { getUserId } from '../util/session';
import { setUserData, updateUserData } from '../util/storage';

export function App() {
  // Client-side session based on GitHub OAuth
  useServiceWorker();

  const userId = getUserId();
  if (userId === undefined) {
    return (
      <LogoPage>
        <Login />
      </LogoPage>
    );
  }

  return <Authorized userId={userId} />;
}

async function promptPin(token?: string): Promise<string | undefined> {
  let code = '';
  let tries = 0;
  while (code.length !== 6 && tries < 3) {
    code = prompt('Set a new 6 digit pin') || '';
    tries++;
  }
  if (code.length === 6) {
    const newCode = prompt('Re-enter 6 digit pin') || '';
    if (newCode !== code) {
      toast.error('Pins do not match');
      return;
    }
  }

  if (code.length === 6) {
    if (!token) {
      token = crypto.getRandomValues(new Uint32Array(32)).toString();
    }

    try {
      const blob = await encrypt(code, { token });
      return blob;
    } catch (err) {
      console.error(err);
    }
  }
}

function OnlineStatus({ className }: { className?: string }) {
  const [toastShown, setToastShown] = useState(false);
  const online = useOnline();

  const warning =
    'It looks like you are currently offline. It is not recommend to add/edit keys offline to avoid sync conflicts.';

  useEffect(() => {
    if (!online && !toastShown) {
      toast.error(warning, {
        autoClose: 5000,
      });
      setToastShown(true);
    }
  }, [online, toastShown]);

  if (online) return null;
  return (
    <FaBroadcastTower
      className={twMerge('text-danger fixed bottom-2 left-2 text-2xl z-20 ' + className)}
      title={warning}
    />
  );
}

function Authorized({ userId }: { userId: string }) {
  const { data, loading, error, userKey } = useUserData();

  const [token, setToken] = useState<string>();
  const [editMode, setEditMode] = useState(false);
  const [editKey, setEditKey] = useState(false);

  useMigrateData(userKey, data);
  useLockTimer(setToken);

  useEffect(() => {
    if (!loading && !error && !data) {
      promptPin().then((code) => {
        if (code)
          setUserData(userId, { keys: [], recentKeys: [], email: '', code, webauthn: [] }).catch((e) =>
            toast.error('Failed to create user')
          );
        else toast.error('Failed to create user');
      });
    }
  }, [data, loading, error]);

  const updatePin = async () => {
    if (!confirm('Would you like to update your pin?')) return;
    const code = await promptPin(token);

    if (code && userKey) updateUserData(userKey, { code });
    else toast.error('Failed to update pin');
  };

  if (loading || error || !data)
    return (
      <LogoPage>
        {error && <p>Error: {error.message}</p>}
        {!data && <p>No data</p>}
      </LogoPage>
    );

  if (!token)
    return (
      <>
        <OnlineStatus className="!bottom-4 !left-4 top-auto" />
        <Lock unlock={(code) => setToken(code)} encryptedCode={data?.code!} data={data} userRef={userKey} />
      </>
    );

  return (
    <CodeContext.Provider value={token}>
      <OnlineStatus />
      <TokenList
        userData={data}
        userRef={userKey}
        editMode={editMode}
        setEditMode={setEditMode}
        editKey={editKey}
        setEditKey={setEditKey}
        lock={() => setToken(undefined)}
      />
      <Progress />
      <Menu
        lock={() => setToken(undefined)}
        updateCode={updatePin}
        editMode={editMode}
        setEditKey={setEditKey}
        setEditMode={setEditMode}
        exportKeys={() => exportKeys(token, data)}
        importKeys={() => importKeys(token, data, userKey)}
      />
    </CodeContext.Provider>
  );
}
