export type UserProfile = {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: UserProfile;
};

export type StoredSession = { accessToken: string; expiresAt: number };
export type Session = StoredSession & { user: UserProfile };
