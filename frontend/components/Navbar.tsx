"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUser } from "@/context/UserContext";

export default function Navbar() {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useUser();

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      logout();
      toast.success("Sesión cerrada");
      router.push("/login");
    } catch (_) {
      router.push("/login");
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 z-30 bg-degradado-primario text-white h-16">
      <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            aria-label="Abrir menú"
            className="p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40 lg:hidden"
            onClick={() => {}}
            data-sidebar-toggle
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
          <span className="font-bold tracking-wide">
            {user?.empresa?.nombre || "Aslin 2.0"}
          </span>
        </div>

        <div className="hidden md:flex items-center flex-1 mx-4 max-w-xl">
          <div className="relative w-full">
            <input
              type="text"
              placeholder={`Buscar en siniestros de ${(user?.empresa?.nombre || "Aslin 2.0").toLowerCase()}...`}
              className="w-full rounded-md bg-white/15 placeholder-white/70 text-white pl-10 pr-4 py-2 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/40"
            />
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.25 5.25a7.5 7.5 0 0011.4 11.4z"
                />
              </svg>
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            className="flex items-center gap-2 p-2 rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <div className="w-8 h-8 rounded-full bg-white/30 grid place-items-center font-semibold">
              <span>{user?.full_name?.charAt(0).toUpperCase()}</span>
            </div>
            <span className="hidden sm:inline line-clamp-1 truncate max-w-[200px]">
              {user?.full_name || user?.email || "Mi Cuenta"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${
                profileOpen ? "rotate-180" : "rotate-0"
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-auto bg-white text-gray-800 rounded-md shadow-lg ring-1 ring-black/5 z-50">
              <div className="px-4 py-3 border-b">
                <p className="font-medium">
                  {user?.full_name || user?.email || "Mi Cuenta"}
                </p>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {user?.email}
                </p>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {user?.rol?.nombre || "Sin rol"}
                </p>
              </div>
              <ul className="py-1">
                <li>
                  <a className="block px-4 py-2 hover:bg-gray-50" href="/perfil">
                    Mi perfil
                  </a>
                </li>
                <li>
                  <a className="block px-4 py-2 hover:bg-gray-50" href="#">
                    Áreas asignadas
                  </a>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
