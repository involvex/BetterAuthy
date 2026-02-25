import { FocusTrap } from 'focus-trap-react';
import { JSX } from 'react';
import { FaTimes } from 'react-icons/fa';
import { twMerge } from 'tailwind-merge';

export function Modal({
  onClose,
  title,
  children,
  open,
}: {
  onClose: () => void;
  title: string;
  children: JSX.Element;
  open: boolean;
}): JSX.Element {
  return (
    <div
      className={twMerge(
        'fixed z-30 inset-0 bg-slate-900/75 flex justify-center items-center backdrop-blur-sm transition-all',
        !open && 'pointer-events-none opacity-0'
      )}
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      }}
    >
      <FocusTrap active={open}>
        <div
          className="bg-slate-800/50 rounded-lg p-8 w-full backdrop-blur-2xl border-slate-600/50 border"
          onClick={(e) => e.stopPropagation()}
          style={{ marginTop: 'calc(-1 * env(keyboard-inset-height))', maxWidth: 'min(80vw, 600px)' }}
        >
          <div className="flex items-center mb-8">
            <h2 className="flex-1 text-xl font-medium">{title}</h2>
            <button onClick={onClose} className="px-2 bg-slate-600" tabIndex={open ? 0 : -1}>
              <FaTimes />
            </button>
          </div>

          {open && children}
        </div>
      </FocusTrap>
    </div>
  );
}
