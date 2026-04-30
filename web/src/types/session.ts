export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  languagePref: string;
  emailVerified: boolean;
  roles: string[];
  mosqueIds: string[];
  stateIds: string[];
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullName: string;
    languagePref: string;
    roles: string[];
  };
};
