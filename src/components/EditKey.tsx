import { decrypt, encrypt } from '@metamask/browser-passworder';
import { useContext, useEffect, useState } from 'react';
import { FaEye, FaEyeSlash, FaQrcode } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { CodeContext } from '../contexts/CodeContext';
import { AppIcon } from './AppIcon';
import { QR } from './QR';
import { secretCache } from './TokenCard';

interface EditKeyProps {
  name?: string;
  secret?: string;
  archived?: boolean;
  userRef: string | undefined;
  close: () => void;
}

export function EditKey(props: EditKeyProps) {
  const [name, setName] = useState(props.name || '');
  const [secret, setSecret] = useState('');
  const [scan, setScan] = useState(false);
  const [masked, setMasked] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [decrypting, setDecrypting] = useState(false);

  const token = useContext(CodeContext) || '';

  const editing = props.name || props.secret;

  useEffect(() => {
    if (props.name && props.secret) {
      if (secretCache.has(props.name)) {
        setSecret(secretCache.get(props.name)!);
        return;
      }

      setDecrypting(true);
      decrypt(token, props.secret)
        .then((decrypted) => {
          setSecret((decrypted as { secret: string }).secret);
        })
        .catch((err) => {
          console.error(err);
          toast.error('Failed to decrypt token.', { autoClose: 2500 });
          props.close();
        })
        .finally(() => setDecrypting(false));
    }
  }, []);

  const addKey = async (name: string, secret: string) => {
    if (name === '' || secret === '') {
      toast.error('Name and secret are required');
      return;
    }

    if (editing && props.name === name && props.secret === secret) {
      props.close();
      return;
    }

    try {
      setUpdating(true);
        if (editing) {
        const userId = props.userRef || '';
        const current = await (await import('../util/storage')).getUserData(userId);
        if (current) {
          const newKeys = current.keys.filter((k) => !(k.name === props.name && k.secret === props.secret));
          await (await import('../util/storage')).updateUserData(userId, { keys: newKeys });
          if (props.name) secretCache.delete(props.name);
        }
      }

      const encryptedSecret = await encrypt(token, { secret });
      const userId = props.userRef || '';
      const current = await (await import('../util/storage')).getUserData(userId);
      if (current) {
        const newKeys = [
          ...current.keys,
          { name, secret: encryptedSecret, archived: props.archived ?? false },
        ];
        await (await import('../util/storage')).updateUserData(userId, { keys: newKeys });
      } else {
        await (await import('../util/storage')).setUserData(userId, {
          keys: [{ name, secret: encryptedSecret, archived: props.archived ?? false }],
          recentKeys: [],
          email: '',
          code: '',
          webauthn: [],
        });
      }
      setName('');
      setSecret('');
      setMasked(true);
      props.close();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add key');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <div
        className="flex flex-col gap-8"
        onKeyDown={(e) => {
          if (e.key === 'Enter') addKey(name, secret);
        }}
      >
        <div className="flex gap-4 items-center">
          <AppIcon name={name} className="w-14 h-14 sm:w-16 sm:h-16" />
          <div className="flex flex-col gap-3 w-full">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Site name"
              autoFocus
              autoComplete="false"
              type="text"
            />

            <div className="relative">
              <input
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder={decrypting ? 'Decrypting' : 'Secret'}
                autoComplete="false"
                type={masked ? 'password' : 'text'}
                disabled={decrypting}
              />
              <button
                className="absolute right-0 top-0 bottom-0 flex items-center cursor-pointer bg-transparent"
                onClick={() => setMasked(!masked)}
              >
                {masked ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {!editing && (
            <button onClick={() => setScan(true)}>
              <FaQrcode />
            </button>
          )}
          <button onClick={() => addKey(name, secret)} className="flex-1" disabled={updating}>
            {updating ? (editing ? 'Saving' : 'Adding') : editing ? 'Save' : 'Add'}
          </button>
        </div>
      </div>

      {scan && (
        <QR
          close={() => setScan(false)}
          onScan={(name, secret) => {
            setName(name);
            setSecret(secret);
          }}
        />
      )}
    </>
  );
}
