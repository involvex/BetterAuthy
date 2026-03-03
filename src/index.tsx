import { Buffer } from 'buffer';
import { createRoot } from 'react-dom/client';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { App } from './components/App';

// Fixes for browser-passworder
type WindowWithGlobal = Window & { global?: Window };
const win = window as WindowWithGlobal;
win.global ||= win;

type GlobalWithBuffer = typeof globalThis & { Buffer: typeof Buffer };
(globalThis as GlobalWithBuffer).Buffer = Buffer;

// If a pwa on desktop, resize window a bit smaller
const isBrowser = matchMedia('(display-mode: browser)').matches;
if (!isBrowser) {
  window.resizeTo(500, 760);
}

// Enable virtual keyboard api
type NavigatorWithVirtualKeyboard = Navigator & {
  virtualKeyboard?: {
    overlaysContent?: boolean;
  };
};
const nav = navigator as NavigatorWithVirtualKeyboard;
if (nav.virtualKeyboard) nav.virtualKeyboard.overlaysContent = true;

function Container() {
  return (
    <>
      <App />
      <ToastContainer
        theme="dark"
        position="bottom-center"
        transition={Zoom}
        hideProgressBar
        closeButton={false}
        autoClose={5000}
      />
    </>
  );
}

createRoot(document.getElementById('root')!).render(<Container />);
