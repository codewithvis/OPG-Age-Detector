import { supabase } from "../services/supabase";
import { Session } from "@supabase/supabase-js";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

type AuthData = {
    session: Session | null;
    loading: boolean;
};
const AuthContext = createContext<AuthData>({
    session: null,
    loading: true,
});

export default function AuthProvider({children}: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async() => {
            try {
                const {data, error} = await supabase.auth.getSession();
                if (error) {
                    console.warn("Session restoration failed:", error.message);
                    // Clear invalid session to prevent refresh token errors
                    await supabase.auth.signOut().catch(() => {});
                    setSession(null);
                } else {
                    setSession(data.session);
                }
            } catch (err) {
                console.warn("Error fetching session:", err);
                setSession(null);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSession();
        
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            setSession(session);
            
            // Handle refresh token errors
            if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
                setSession(null);
            }
        });

        return () => {
            authListener?.subscription?.unsubscribe?.();
        };

    }, []);

    return <AuthContext.Provider value={{session, loading}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);