import { supabase } from "../services/supabase";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { useStore } from "../store/useStore";

type AuthData = {
    session: Session | null;
    loading: boolean;
    refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthData>({
    session: null,
    loading: true,
    refreshSession: async () => {},
});

export default function AuthProvider({children}: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const { setUser, setRecentAnalyses } = useStore();

    const fetchProfileAndAnalyses = async (userId: string) => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profile) {
                setUser({
                    id: profile.id,
                    full_name: profile.full_name,
                    license_id: profile.dental_license_student_id,
                    role: profile.role,
                    org_id: profile.org_id,
                    clinic_id: profile.clinic_id,
                    clinic_name: profile.clinic_name,
                    profile_photo_url: profile.profile_photo_url,
                });
            }

            const { data: analyses } = await supabase
                .from('analyses')
                .select('*, patients(name)')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (analyses) {
                setRecentAnalyses(analyses);
            }
        } catch (err) {
            console.warn("Error fetching user data:", err);
        }
    };

    const refreshSession = async () => {
        try {
            const { data, error } = await supabase.auth.refreshSession();
            if (error) {
                console.warn("Session refresh failed:", error.message);
                setSession(null);
                setUser(null);
            } else {
                setSession(data.session);
                if (data.session?.user?.id) {
                    fetchProfileAndAnalyses(data.session.user.id);
                }
            }
        } catch (err) {
            console.warn("Error refreshing session:", err);
            setSession(null);
            setUser(null);
        }
    };

    useEffect(() => {
        const fetchSession = async() => {
            try {
                const {data, error} = await supabase.auth.getSession();
                if (error) {
                    console.warn("Session restoration failed:", error.message);
                    setSession(null);
                } else {
                    setSession(data.session);
                    if (data.session?.user?.id) {
                        fetchProfileAndAnalyses(data.session.user.id);
                    }
                }
            } catch (err) {
                console.warn("Error fetching session:", err);
                setSession(null);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSession();
        
        const { data: authListener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            setSession(session);
            if (session?.user?.id) {
                fetchProfileAndAnalyses(session.user.id);
            } else {
                setUser(null);
                setRecentAnalyses([]);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };

    }, []);

    return <AuthContext.Provider value={{session, loading, refreshSession}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
