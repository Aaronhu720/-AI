import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from './api';

interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar_url: string | null;
  gender: 'male' | 'female' | null;
  age: number | null;
  height: number | null;
  current_weight: number | null;
  target_weight: number | null;
  onboarding_completed: boolean;
  is_member: boolean;
}

interface AuthState {
  isLoading: boolean;
  user: User | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('xiaoran-token');
    if (token) {
      api.get<User>('/auth/me')
        .then(setUser)
        .catch(() => localStorage.removeItem('xiaoran-token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  async function login(phone: string, password: string) {
    const res = await api.post<{ token: string; user: User }>('/auth/login', { phone, password });
    localStorage.setItem('xiaoran-token', res.token);
    setUser(res.user);
  }

  async function register(phone: string, password: string) {
    const res = await api.post<{ token: string; user: User }>('/auth/register', { phone, password });
    localStorage.setItem('xiaoran-token', res.token);
    setUser(res.user);
  }

  async function refreshUser() {
    const u = await api.get<User>('/auth/me');
    setUser(u);
  }

  function logout() {
    localStorage.removeItem('xiaoran-token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ isLoading, user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
