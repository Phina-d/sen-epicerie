import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../utils/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      const {
        data,
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error(
          "❌ Erreur lors de la récupération de la session :",
          error
        );
      }

      if (mounted) {
        setUser(data?.session?.user || null);
        setLoading(false);
      }
    };

    getInitialSession();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    const {
      error,
    } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setUser(null);
  };

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur de AuthProvider."
    );
  }

  return context;
}