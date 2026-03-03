export interface WebauthnEntry {
  credentialId: string;
  uuid: string;
  secret: string;
  userAgent: string;
}

export interface Key {
  name: string;
  secret: string;
  archived: boolean;
}

export interface UserData {
  email: string;
  keys: Key[];
  recentKeys: string[];
  code: string;
  webauthn: WebauthnEntry[];
}
