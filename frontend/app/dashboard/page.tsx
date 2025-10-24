/**
* Página del Dashboard (simplificada)
* Solo muestra un mensaje de bienvenida
*/

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user: currentUser, loading } = useUser();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {`Bienvenido${currentUser ? `, ${currentUser.full_name || currentUser.email}` : ""} 👋`}
        </h1>
        <p className="mt-2 text-gray-600">Nos alegra verte de nuevo.</p>
      </div>
    </div>
  );
}

