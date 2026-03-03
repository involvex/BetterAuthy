import { decrypt } from '@metamask/browser-passworder';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FaArchive, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { twJoin } from 'tailwind-merge';
import { TOTP } from 'totp-generator';

import { CodeContext } from '../contexts/CodeContext';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useIsMobile } from '../hooks/useIsMobile';
import { useOnHold } from '../hooks/useOnHold';
import { Key } from '../hooks/useUserData';
import { AppIcon } from './AppIcon';
import { updateUserData } from '../util/storage';

enum HiddenType {
  Hidden,
  FirstVisible,
  Visible,
}

export const secretCache = new Map<string, string>();

export function TokenCard({
  data,
  userRef,
  timestamp,
  onEdit,
  setEditMode,
  editMode,
  addRecentKey,
}: {
  data: Key;
  userRef: string | undefined;
  timestamp: Date;
  onEdit: () => void;
  setEditMode: (value: boolean) => void;
  editMode: boolean;
  addRecentKey: (name: string) => void;
}) {
  const encryptionToken = useContext(CodeContext) || '';
  const [secret, setSecret] = useState(secretCache.get(data.name) || '');
  const [hidden, setHidden] = useState<HiddenType>(HiddenType.Hidden);
  const [token, setToken] = useState('Token Error');
  const isMobile = useIsMobile();
  const [copy] = useCopyToClipboard();

  const onClick = useCallback(() => {
    if (editMode) onEdit();
    else if (hidden === HiddenType.Hidden) setHidden(HiddenType.FirstVisible);
    else copyToken();
  }, [editMode, hidden]);

  const bindHold = useOnHold(() => setEditMode(!editMode), onClick);

  useEffect(() => {
    if (secret.length > 0) setHidden(HiddenType.Visible);
  }, []);

  useEffect(() => {
    if (hidden === HiddenType.Hidden) return;

    if (secretCache.has(data.name)) {
      setSecret(secretCache.get(data.name) || '');
      return;
    }

    decrypt(encryptionToken, data.secret)
      .then((decrypted) => {
        setSecret((decrypted as { secret: string }).secret);
        secretCache.set(data.name, (decrypted as { secret: string }).secret);
      })
      .catch((err) => {
        console.error(err);
        setSecret('Error');
        secretCache.delete(data.name);
      });
  }, [data.secret, encryptionToken, hidden]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    // Hide code shortly after revealed
    if (hidden !== HiddenType.Hidden) {
      timeout = setTimeout(() => {
        setHidden(HiddenType.Hidden);
      }, 30 * 1000);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [hidden]);

  const timeChunk = Math.floor(timestamp.getTime() / 30000);

  useEffect(() => {
    if (secret.length === 0 || secret === 'Error' || hidden === HiddenType.Hidden) {
      setToken('Token Error');
      return;
    }

    TOTP.generate(secret.replace(/\s+/g, ''), { timestamp: timeChunk * 30000 })
      .then(({ otp }) => setToken(otp))
      .catch((err) => {
        console.error(err);
        setToken('Token Error');
      });
  }, [secret, timeChunk, hidden]);

  const copyToken = useCallback(() => {
    copy(token).then((result) => {
      if (result && token !== 'Token Error') toast.success(data.name + ' code copied', { autoClose: 2500 });
      else toast.error('Failed to copy code', { autoClose: 2500 });
    });
    addRecentKey(data.name);
  }, [token, data, isMobile, copy]);

  useEffect(() => {
    if (hidden === HiddenType.FirstVisible && token !== 'Token Error') {
      copyToken();
      setHidden(HiddenType.Visible);
    }
  }, [hidden, token]);

  if (data.archived && !editMode) return null;

  return (
    <div
      className={twJoin(
        'p-3 bg-slate-800 border border-slate-700 shadow-centered rounded-lg select-none flex gap-6 justify-between items-center relative cursor-pointer transition-all duration-300 rotate-0 bg-opacity-30 hover:bg-slate-700 hover:bg-opacity-40',
        editMode && 'animate-wiggle',
        data.archived && 'opacity-50'
      )}
      style={{ animationDelay: `${Math.random() * 250}ms` }}
      tabIndex={0}
      {...bindHold()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      <div className="flex gap-4">
        <AppIcon name={data.name} />
        <div className="flex flex-col items-start justify-center">
          <h2 className="font-bold capitalize">{data.name}</h2>
          <div>
            {hidden === HiddenType.Hidden ? (
              '*** ***'
            ) : secret.length === 0 ? (
              'Decrypting...'
            ) : token === 'Token Error' ? (
              'Token Error'
            ) : (
              <>
                <span className="mr-2">{token.slice(0, 3)}</span>
                <span>{token.slice(3, 6)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <button
        className="remove absolute -top-3 right-6 !p-1 text-slate-800 bg-white border border-slate-400 rounded-full sm:hover:bg-warning transition-all duration-300"
        style={{ pointerEvents: editMode ? 'auto' : 'none', opacity: editMode ? 1 : 0 }}
        tabIndex={editMode ? 0 : -1}
        onClick={async (e) => {
          e.stopPropagation();

          const confirm = window.confirm(
            `Are you sure you want to ${data.archived ? 'unarchive' : 'archive'} ${data.name}?`
          );
          if (confirm) {
            // Update archived status locally
            const userId = userRef || '';
            const current = await (await import('../util/storage')).getUserData(userId);
            if (current) {
              const newKeys = current.keys.map((k) => (k.name === data.name ? { ...k, archived: !k.archived } : k));
              await (await import('../util/storage')).updateUserData(userId, { keys: newKeys });
            }
          }
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <FaArchive />
      </button>

      <button
        className="remove absolute -top-3 -right-3 !p-1 text-slate-800 bg-white border border-slate-400 rounded-full hover:text-white sm:hover:bg-danger transition-all duration-300"
        style={{ pointerEvents: editMode ? 'auto' : 'none', opacity: editMode ? 1 : 0 }}
        tabIndex={editMode ? 0 : -1}
        onClick={async (e) => {
          e.stopPropagation();

          const confirm = window.confirm(`Are you sure you want to remove ${data.name}? This cannot be undone!`);
          if (confirm) {
            const confirm2 = window.confirm(`Are you really sure you want to delete ${data.name}?`);
            if (confirm2) {
              const userId = userRef || '';
              const storage = await import('../util/storage');
              const current = await storage.getUserData(userId);
              if (current) {
                const newKeys = current.keys.filter((k) => !(k.name === data.name && k.secret === data.secret));
                await storage.updateUserData(userId, { keys: newKeys });
              }
            }
          }
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <FaTimes />
      </button>
    </div>
  );
}
