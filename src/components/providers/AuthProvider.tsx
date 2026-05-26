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
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Ensure profile exists for logged-in user
        await ensureProfileExists(session.user.id, session.user.email);
      }
      
      setLoading(false);
      
      if (!session && pathname !== '/login') {
        router.push('/login');
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (event === 'SIGNED_IN' && session?.user) {
          // Create profile on first sign in
          await ensureProfileExists(session.user.id, session.user.email);
          router.push('/');
        } else if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router, pathname]);

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
