import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

const API_URL = "http://localhost:5000";

// ✅ User có avatar
interface User {
  id: string;
  name: string; // map từ username ở BE
  email: string;
  role: "admin" | "user";
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;

  // ✅ thêm để sync lại user (avatar mới)
  refreshMe: () => Promise<void>;
  // ✅ tiện set user và lưu localStorage đồng bộ
  setUserLocal: (u: User | null) => void;
}

interface BackendAuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    username?: string;
    role: "admin" | "user";
    avatar?: string; // ✅ nếu BE có trả
    phone?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const setUserLocal = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem("currentUser", JSON.stringify(u));
    else localStorage.removeItem("currentUser");
  };

  // ✅ gọi /api/users/me để lấy avatar mới nhất từ DB
  const refreshMe = async () => {
    const token = localStorage.getItem("token") || "";
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const me = await res.json();

      // map về đúng User type
      const nextUser: User = {
        id: me.id || me._id, // tùy BE trả gì
        email: me.email,
        name: me.username || me.email,
        role: me.role || "user",
        avatar: me.avatar,
        phone: me.phone,
      };

      setUserLocal(nextUser);
    } catch (err) {
      console.error("refreshMe error:", err);
    }
  };

  // ✅ Load user từ localStorage + sync lại từ DB
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) setUser(JSON.parse(storedUser));

    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: BackendAuthResponse = await res.json();

      if (!res.ok) {
        console.error("Login failed:", data.message);
        return false;
      }

      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.username || data.user.email,
        role: data.user.role,
        avatar: data.user.avatar,
        phone: data.user.phone,
      };

      // ✅ lưu token trước
      localStorage.setItem("token", data.token);
      // ✅ set user + lưu currentUser
      setUserLocal(userData);

      // ✅ optional: refresh lại từ /me để chắc chắn dữ liệu mới nhất
      await refreshMe();

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        refreshMe,
        setUserLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
