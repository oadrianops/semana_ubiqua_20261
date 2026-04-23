import { api } from './api';
import { generateClientFingerprint } from '../lib/fingerprint';
import type { User } from '../store/auth';

export interface RegisterInput {
  cpf: string;
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', {
      ...input,
      clientFingerprint: generateClientFingerprint(),
    });
    return data;
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', {
      ...input,
      clientFingerprint: generateClientFingerprint(),
    });
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};
