import { decrypt, encrypt } from '@metamask/browser-passworder';
import { FaFingerprint } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { useUUID } from '../../hooks/useUUID';
import { register } from '../../util/webauthn';

export function WebauthnEnroll({ userRef, encryptedCode }: { userRef: string | undefined; encryptedCode: string }) {
  const uuid = useUUID();

  const biometricRegister = async () => {
    try {
      const pin = prompt('Enter pin to register biometric login') || '';
      const decryptedSecret = (await decrypt(pin, encryptedCode)) as { token: string };

      const credential = await register();
      const userHandle = credential?.userHandle || '';

      const encryptedSecret = await encrypt(userHandle, decryptedSecret);

      const userId = userRef || '';
      const current = await (await import('../../util/storage')).getUserData(userId);
      if (current) {
        const newWebauthn = [...(current.webauthn || []), { credentialId: credential?.credentialId, uuid, secret: encryptedSecret, userAgent: navigator.userAgent }];
        await (await import('../../util/storage')).updateUserData(userId, { webauthn: newWebauthn });
      }

      toast.success('Successfully enrolled biometric login');
    } catch (err) {
      console.error(err);
      toast.error('Error registering fingerprint');
    }
  };

  return (
    <button className="icon bg-primary text-slate-200" onClick={biometricRegister}>
      <FaFingerprint />
    </button>
  );
}
