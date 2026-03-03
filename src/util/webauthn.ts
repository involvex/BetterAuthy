// A large portion of this code was written by chatgpt

const challenge = Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32)));

export interface Credential {
  userHandle: string;
  credentialId: string;
}

export async function register(): Promise<Credential | null> {
  try {
    const userHandle = Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32)));
    // Use local session for user metadata if available
    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge, // Not really necessary since this is 100% local
      rp: {
        name: 'BetterAuthy',
      },
      user: {
        id: userHandle.buffer ? userHandle.buffer : new Uint8Array(userHandle).buffer,
        name: 'user@local',
        displayName: 'User',
      },

      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],

      authenticatorSelection: {
        requireResidentKey: true,
      },
    };

    const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential;

    return { userHandle: arrayBufferToBase64(userHandle), credentialId: arrayBufferToBase64(credential.rawId) };
  } catch (error) {
    console.error('Error registering credential:', error);
  }

  return null;
}

export async function authenticate(credentialId: string): Promise<string | null> {
  try {
    const id = base64ToArrayBuffer(credentialId);
    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [{ type: 'public-key', id }],
    };

    const credential = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential;

    const assertionResponse = credential?.response as AuthenticatorAssertionResponse | null;
    if (assertionResponse?.userHandle) {
      return arrayBufferToBase64(assertionResponse.userHandle);
    }
  } catch (error) {
    console.error('Error authenticating:', error);
  }

  return null;
}

function arrayBufferToString(bufferOrView: ArrayBuffer | ArrayBufferView): string {
  const uint8Array = bufferOrView instanceof ArrayBuffer ? new Uint8Array(bufferOrView) : new Uint8Array((bufferOrView as ArrayBufferView).buffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) binary += String.fromCharCode(uint8Array[i]);
  return binary;
}

function arrayBufferToBase64(bufferOrView: ArrayBuffer | ArrayBufferView): string {
  return btoa(arrayBufferToString(bufferOrView));
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const buffer = new ArrayBuffer(length);
  const bufferView = new Uint8Array(buffer);
  for (let i = 0; i < length; i++) {
    bufferView[i] = binaryString.charCodeAt(i);
  }
  return buffer;
}
