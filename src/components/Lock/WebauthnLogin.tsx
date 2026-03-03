import { decrypt } from '@metamask/browser-passworder';
import { FaFingerprint } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { useEffectOnce } from '../../hooks/useEffectOnce';
import { useOnHold } from '../../hooks/useOnHold';
import type { WebauthnEntry } from '../../types/auth';
import { useVisibilityChange } from '../../hooks/useVisibilityChange';
import { authenticate } from '../../util/webauthn';

export function WebauthnLogin({
  webauthn,
  userRef,
  unlock,
}: {
  webauthn: WebauthnEntry;
  userRef: string | undefined;
  unlock: (code: string) => void;
}) {
  useVisibilityChange((visible) => {
    if (visible && webauthn) biometricLogin();
  });

  // Attempt to login with biometric auth on startup, only once
  useEffectOnce('webauthn', () => {
    if (webauthn) {
      biometricLogin();
    }
  });

  const bindHold = useOnHold(
    () => {
      if (webauthn && confirm('Reset Biometric Auth?')) {
        (async () => {
          const userId = userRef || '';
          const current = await (await import('../../util/storage')).getUserData(userId);
          if (current) {
            const newWebauthn = current.webauthn.filter((w) => w.credentialId !== webauthn.credentialId);
            await (await import('../../util/storage')).updateUserData(userId, { webauthn: newWebauthn });
          }
        })();
      }
    },
    () => biometricLogin(),
    3000
  );

  const biometricLogin = async () => {
    try {
      if (!webauthn) throw 'webauthn not defined';

      const userHandle = await authenticate(webauthn.credentialId).catch(console.error);
      const decryptedSecret = (await decrypt(userHandle || '', webauthn.secret)) as { token: string };

      unlock(decryptedSecret.token);
    } catch (err) {
      console.error(err);
      toast.error('Invalid biometric login');
    }
  };

  return (
    <button className="p-3 rounded-full bg-tertiary text-slate-200 border-2 border-slate-600" {...bindHold()}>
      <FaFingerprint size={30} />
    </button>
  );
}
