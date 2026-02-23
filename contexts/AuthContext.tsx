import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'customer' | 'salon_owner';
  avatar_url: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isDevAuth: boolean;
  signUp: (email: string, password: string, fullName: string, role: 'customer' | 'salon_owner') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER_ID = 'dev-test-user-id';
const MOCK_PROFILE: Profile = {
  id: MOCK_USER_ID,
  email: 'test@test.com',
  full_name: 'Test User',
  phone: '',
  role: 'customer',
  avatar_url: null,
};

function createMockSession(email: string): Session {
  const user = {
    id: MOCK_USER_ID,
    email: email || 'test@test.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
  } as User;
  return { user, access_token: '', refresh_token: '', expires_in: 0, expires_at: 0 } as Session;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isDevAuth = !isSupabaseConfigured();

  useEffect(() => {
    if (isDevAuth) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        setLoading(false);
      })();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, [isDevAuth]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (data && !error) {
      setProfile(data);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'customer' | 'salon_owner') => {
    if (isDevAuth) {
      const mockSession = createMockSession(email);
      setSession(mockSession);
      setUser(mockSession.user);
      setProfile({ ...MOCK_PROFILE, email, full_name: fullName, role });
      return { error: null };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (data.user && !error) {
      await supabase
        .from('profiles')
        .update({ role, full_name: fullName })
        .eq('id', data.user.id);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (isDevAuth) {
      const mockSession = createMockSession(email);
      setSession(mockSession);
      setUser(mockSession.user);
      setProfile({ ...MOCK_PROFILE, email, full_name: email.split('@')[0] || 'Test User' });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    if (isDevAuth) {
      setSession(null);
      setUser(null);
      setProfile(null);
      return;
    }
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user') };
    if (isDevAuth) {
      if (profile) setProfile({ ...profile, ...updates });
      return { error: null };
    }
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    }

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loading,
        isDevAuth,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
