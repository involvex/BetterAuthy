import { decrypt } from '@metamask/browser-passworder';
import { useEffect } from 'react';
import PinField from 'react-pin-field';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

let unlocked = false;
export function PinCode({
  pinRef,
  encryptedCode,
  unlock,
  className,
}: {
  pinRef: React.RefObject<HTMLInputElement[] | null>;
  encryptedCode: string;
  unlock: (code: string) => void;
  className?: string;
}) {
  useEffect(() => {
    if (import.meta.env.DEV && !unlocked) {
      const code = import.meta.env.VITE_CODE as string | undefined;
      if (code) onCodeEntered(code);
      unlocked = true;
    } else {
      setTimeout(() => pinRef.current?.[0]?.focus(), 250);
    }
  }, []);

  const onCodeEntered = async (code: string) => {
    if (code?.length === 6) {
      try {
        const decrypted = (await decrypt(code, encryptedCode)) as { token: string };
        unlock(decrypted.token);
      } catch (err) {
        console.log(err, code);
        toast.error('Invalid code');
      }
    }

    if (pinRef.current) {
      pinRef.current.forEach((input) => {
        input.value = '';
      });
      pinRef.current[0].focus();
    }
  };

  return (
    <div className={twMerge('flex', className)}>
      <PinField
        length={6}
        className="border border-slate-500 w-10 sm:w-12 h-14 m-1.5 rounded-lg text-center text-6xl p-1 focus-visible:ring-3"
        type="password"
        inputMode="numeric"
        ref={pinRef}
        onComplete={onCodeEntered}
      />
    </div>
  );
}
