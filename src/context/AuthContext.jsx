import { createContext, useContext, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = useAuth();
  const displayName = auth.user?.user_metadata?.full_name || "مستخدم";
  const value = useMemo(() => ({ ...auth, displayName }), [auth, displayName]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext يجب أن يُستخدم داخل AuthProvider");
  }
  return context;
};
