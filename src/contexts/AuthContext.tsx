import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

interface Profile {
  id: string;
  user_id: string;
  role: 'developer' | 'company';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, role: 'developer' | 'company') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      console.log('Profile fetched from DB:', data);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, 'Session:', !!session, 'User:', !!session?.user);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Create temporary profile from user_metadata while DB profile loads
          const userRole = session.user.user_metadata?.role as 'developer' | 'company';
          console.log('User role from metadata:', userRole);
          if (userRole) {
            const tempProfile = {
              id: '', // Will be updated from DB
              user_id: session.user.id,
              role: userRole,
              created_at: '',
              updated_at: ''
            };
            console.log('Setting temporary profile:', tempProfile);
            setProfile(tempProfile);
          }
          
          // Defer profile fetch to avoid auth state listener issues
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Create temporary profile from user_metadata while DB profile loads
        const userRole = session.user.user_metadata?.role as 'developer' | 'company';
        if (userRole) {
          setProfile({
            id: '',
            user_id: session.user.id,
            role: userRole,
            created_at: '',
            updated_at: ''
          });
        }
        
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, role: 'developer' | 'company') => {
    const redirectUrl = `${window.location.origin}/confirm`;
    console.log('SignUp - Redirect URL set to:', redirectUrl);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          role
        }
      }
    });

    console.log("👉 Resultado signUp:", { data, error });

     if (error) {
      toast({
        title: "Error en el registro",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }

    // caso: usuario ya existe (session null pero user presente)
    if (data.user && !data.session) {
      toast({
        title: "Email ya registrado",
        description: "Ese correo ya está en uso. Inicia sesión o confirma tu cuenta desde el email.",
        variant: "destructive",
        action: (
          <ToastAction 
            altText="Reenviar email de confirmación"
            onClick={() => resendConfirmation(email)}
          >
            Reenviar email
          </ToastAction>
        )
      });
      return { error: new Error("Email ya registrado") };
    }

    toast({
      title: "¡Registro exitoso!",
      description: "Revisa tu email para confirmar tu cuenta.",
    });

    return { error: null };
  };


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Error en el login",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const resendConfirmation = async (email: string) => {
    const redirectUrl = `${window.location.origin}/confirm`;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      // Handle rate limiting error specifically
      if (error.message.includes('For security purposes') || error.message.includes('rate limit')) {
        toast({
          title: "Espera un momento",
          description: "Por seguridad, debes esperar antes de solicitar otro email. Es posible que ya se haya enviado uno.",
          variant: "default"
        });
      } else {
        toast({
          title: "Error al reenviar",
          description: error.message,
          variant: "destructive"
        });
      }
      return { error };
    }

    toast({
      title: "Email reenviado",
      description: "Se ha enviado un nuevo email de confirmación. Revisa tu bandeja de entrada.",
    });

    return { error: null };
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resendConfirmation
  };

  return (
    <AuthContext.Provider value={value}>
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