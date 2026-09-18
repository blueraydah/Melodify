import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserStats: (stats: Partial<User['stats']>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateAvatar(username: string): string {
  const colors = ['0ea5e9', 'd946ef', 'f59e0b', '10b981', 'ef4444', '8b5cf6'];
  const colorIndex = username.length % colors.length;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${colors[colorIndex]}&color=fff&size=200`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('melodify_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('melodify_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('melodify_users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          email: foundUser.email,
          username: foundUser.username,
          avatar: foundUser.avatar || generateAvatar(foundUser.username),
          createdAt: new Date(foundUser.createdAt),
          preferences: {
            theme: 'dark',
            audioQuality: 'lossless',
            autoplay: true,
            explicitContent: true,
            equalizerPreset: 'flat',
          },
          stats: {
            listeningTime: 0,
            songsPlayed: 0,
            likedSongs: [],
            recentlyPlayed: [],
            favoriteGenres: [],
          },
        };
        
        setUser(userData);
        localStorage.setItem('melodify_user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const signup = useCallback(async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('melodify_users') || '[]');
      
      if (users.some((u: any) => u.email === email)) {
        return false;
      }
      
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        username,
        password,
        avatar: generateAvatar(username),
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      localStorage.setItem('melodify_users', JSON.stringify(users));
      
      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        avatar: newUser.avatar,
        createdAt: new Date(newUser.createdAt),
        preferences: {
          theme: 'dark',
          audioQuality: 'lossless',
          autoplay: true,
          explicitContent: true,
          equalizerPreset: 'flat',
        },
        stats: {
          listeningTime: 0,
          songsPlayed: 0,
          likedSongs: [],
          recentlyPlayed: [],
          favoriteGenres: [],
        },
      };
      
      setUser(userData);
      localStorage.setItem('melodify_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('melodify_user');
  }, []);

  const updateUserStats = useCallback((stats: Partial<User['stats']>) => {
    if (user) {
      const updatedUser = {
        ...user,
        stats: {
          ...user.stats,
          ...stats,
        },
      };
      setUser(updatedUser);
      localStorage.setItem('melodify_user', JSON.stringify(updatedUser));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
      updateUserStats,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
