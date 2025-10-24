"use client";

import { createContext, useContext, useEffect, useState } from "react";
import apiService from "@/lib/apiService";

export interface CurrentUser {
  id: string;
  email: string;
  username?: string | null;
  full_name?: string | null;
  is_active: boolean;
  multiempresa?: boolean | null;
  ultimo_acceso?: string | null;
  empresa?: {
    id: string;
    nombre: string;
    alias?: string | null;
    logo_url?: string | null;
    color_principal?: string | null;
    color_secundario?: string | null;
    color_terciario?: string | null;
    dominio?: string | null;
    activo?: boolean | null;
  } | null;
  rol?: {
    id: string;
    nombre: string;
    descripcion?: string | null;
    nivel?: number | null;
  } | null;
  perfil?: {
    nombre?: string | null;
    apellido_paterno?: string | null;
    apellido_materno?: string | null;
    titulo?: string | null;
    cedula_profesional?: string | null;
  } | null;
  contactos?: {
    telefono?: string | null;
    celular?: string | null;
  } | null;
  direccion?: {
    direccion?: string | null;
    ciudad?: string | null;
    estado?: string | null;
    codigo_postal?: string | null;
    pais?: string | null;
  } | null;
  two_factor_enabled?: boolean | null;
  two_factor_verified_at?: string | null;
}

interface UserContextValue {
  user: CurrentUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await apiService.getCurrentUser();
      setUser(data);
    } catch (_) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoading(false);
      return;
    }
    refresh();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de UserProvider");
  return ctx;
}



