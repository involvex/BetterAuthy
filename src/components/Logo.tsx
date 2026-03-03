import { twJoin, twMerge } from 'tailwind-merge';
import type { HTMLAttributes } from 'react';

import image from '../images/logo.png';

export function Logo({ className }: { className?: string }) {
  return <img src={image} className={twMerge('h-52', className)} />;
}

interface LogoPageProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function LogoPage({ className, children, ...props }: LogoPageProps) {
  return (
    <div className="w-screen h-[100svh] flex flex-col justify-center items-center gap-5" {...props}>
      <h1 className="text-center m-0 -mb-1">BetterAuthy 2FA</h1>
      <Logo className={className} />
      {children}

      <span
        className={twJoin(
          'absolute bottom-1.5 right-2 leading-tight whitespace-pre text-right',
          (import.meta.env.PROD ? 'text-[8px]' : 'text-sm')
        )}
      >
        {new Date(__BUILD_TIME__).toLocaleString().replace(', ', '\n')}
      </span>
    </div>
  );
}
