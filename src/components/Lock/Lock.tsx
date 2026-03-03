// userRef is now a string id (local storage)

import { useRef } from 'react';

// import { OS, useOsType } from '../../hooks/useOsType';
import { useUUID } from '../../hooks/useUUID';
import { UserData } from '../../hooks/useUserData';
import { LogoPage } from '../Logo';
import { Logout } from './Logout';
import { PinCode } from './PinCode';
import { WebauthnEnroll } from './WebauthnEnroll';
import { WebauthnLogin } from './WebauthnLogin';

export function Lock({
  unlock,
  encryptedCode,
  data,
  userRef,
}: {
  unlock: (code: string) => void;
  encryptedCode: string;
  data?: UserData;
  userRef: string | undefined;
}) {
  const pinRef = useRef<HTMLInputElement[]>(null);
  const uuid = useUUID();
  // const os = useOsType();

  // For now, always have option to sign up with webauthn
  const webauthnEnabled = true;

  // const devEnabled = true;
  // TODO: Figure out a better way to determine when to show webauthn button
  // const webauthnEnabled =
  //   navigator.credentials &&
  //   (os === OS.Android || os === OS.iOS || os === OS.Mac || (devEnabled && process.env.NODE_ENV === 'development'));
  const webauthn = data?.webauthn?.find((a) => a.uuid === uuid);

  return (
    <LogoPage
      onClick={(e: any) => {
        const node = e.target?.nodeName;
        if (pinRef.current && (node === 'DIV' || node === 'IMG' || node === 'H1')) pinRef.current[0].focus();
      }}
      style={{ marginTop: 'calc(-1 * env(keyboard-inset-height) / 2)' }}
    >
      <div className="flex fixed top-4 right-4 gap-2">
        {webauthnEnabled && !webauthn && <WebauthnEnroll encryptedCode={encryptedCode} userRef={userRef} />}
        <Logout />
      </div>

      <PinCode pinRef={pinRef} encryptedCode={encryptedCode} unlock={unlock} />

      {webauthnEnabled && webauthn && <WebauthnLogin unlock={unlock} userRef={userRef} webauthn={webauthn} />}
    </LogoPage>
  );
}
