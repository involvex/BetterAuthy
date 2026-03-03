import { Buffer } from 'buffer';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { registerSW } from 'virtual:pwa-register';

import { App } from './components/App';

// Fixes for browser-passworder
;(window as any).global ||= window;
;(globalThis as any).Buffer = Buffer;

// If a pwa on desktop, resize window a bit smaller
const isBrowser = matchMedia('(display-mode: browser)').matches;
if (!isBrowser) {
  window.resizeTo(500, 760);
}

// Enable virtual keyboard api
const nav = navigator as any;
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
