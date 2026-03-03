import { decrypt, encrypt } from '@metamask/browser-passworder';
import { toast } from 'react-toastify';

import { Key, UserData } from '../hooks/useUserData';

export async function exportKeys(token: string, data: UserData): Promise<void> {
  const toastId = toast('Exporting keys ⏳️\nThis might take some time...', {
    autoClose: false,
    progress: 1 / data.keys.length,
    hideProgressBar: false,
  });

  const keys = [];

  for (let i = 0; i < data.keys.length; i++) {
    const key = data.keys[i];
    const decoded = (await decrypt(token, key.secret)) as { secret: string };
    keys.push({ ...key, secret: decoded.secret });

    toast.update(toastId, { progress: i / data.keys.length });
  }

  toast.done(toastId);

  const blob = new Blob([JSON.stringify(keys, undefined, 2)], { type: 'text/json' });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'keys.json';
  a.click();
  URL.revokeObjectURL(url);
}

export async function importKeys(token: string, data: UserData, userRef: string | undefined): Promise<void> {
  const input = document.createElement('input');
  input.type = 'file';
  input.addEventListener('change', (e) => {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      // Read JSON file
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (e.target) {
            const keys: Key[] = JSON.parse(e.target.result as string);

            let skipped = 0;
            let imported = 0;
            for (const key of keys) {
              if (!key.name || !key.secret) throw 'Invalid file format';

              const { archived, name } = key;
              // Skip existing keys
              if (data.keys.some((k) => k.name.toLowerCase() === name.toLowerCase())) {
                skipped++;
              } else {
                const encryptedSecret = await encrypt(token, key.secret);
                const userId = userRef || '';
                const current = await (await import('../util/storage')).getUserData(userId);
                if (current) {
                  await (await import('../util/storage')).updateUserData(userId, { keys: [...current.keys, { name, secret: encryptedSecret, archived }] });
                } else {
                  await (await import('../util/storage')).setUserData(userId, { keys: [{ name, secret: encryptedSecret, archived }], recentKeys: [], email: '', code: '', webauthn: [] });
                }
                imported++;
              }
            }

            if (skipped > 0) toast.warning(`${skipped} keys were skipped because they already exist`);
            if (imported > 0) toast.success(`Imported ${keys.length - skipped} keys`);
          }
        } catch (err) {
          console.error(err);
          toast.error((err as any) || 'Error importing keys');
        }
      };

      reader.readAsText(file);
    }
  });
  input.click();
}
