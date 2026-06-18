import { createContext, useEffect, useMemo, useState } from "react";
import adminApi from "../api/adminAxios";

export const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem("admin");
    return stored ? JSON.parse(stored) : null;
  });
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("adminToken") || "");

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem("adminToken", adminToken);
    } else {
      localStorage.removeItem("adminToken");
    }
  }, [adminToken]);

  useEffect(() => {
    if (admin) {
      localStorage.setItem("admin", JSON.stringify(admin));
    } else {
      localStorage.removeItem("admin");
    }
  }, [admin]);

  const login = async (credentials) => {
    const { data } = await adminApi.post("/admin/login", credentials);
    setAdminToken(data.token);
    setAdmin(data.admin);
    return data;
  };

  const logout = () => {
    setAdminToken("");
    setAdmin(null);
  };

  const value = useMemo(
    () => ({
      admin,
      adminToken,
      isAdminAuthenticated: Boolean(adminToken),
      login,
      logout,
    }),
    [admin, adminToken]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
