'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (active) {
          setUser(session?.user ?? null);
          if (session?.user) {
            // Ensure profile exists in the background to prevent blocking UI render
            ensureProfileExists(session.user.id, session.user.email);
          }
        }
      } catch (error) {
        console.error('Error during initial session check:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!active) return;
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (event === 'SIGNED_IN' && session?.user) {
          ensureProfileExists(session.user.id, session.user.email);
          router.push('/');
        } else if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
        
        setLoading(false);
      }
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (loading) return;

    const isPublicPath = 
      pathname === '/login' || 
      pathname.startsWith('/auth/callback') || 
      pathname.startsWith('/invite/');

    if (!user && !isPublicPath) {
      router.push('/login');
    }
  }, [user, loading, pathname, router]);


  const ensureProfileExists = async (userId: string, email?: string) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      if (existingProfile) {
        // Profile already exists
        return;
      }
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // Error other than "no rows returned"
        console.error('Error checking profile:', fetchError);
        return;
      }
      
      // Profile doesn't exist, create it
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            full_name: email?.split('@')[0] || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]);
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
      }
    } catch (error) {
      console.error('Error in ensureProfileExists:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
