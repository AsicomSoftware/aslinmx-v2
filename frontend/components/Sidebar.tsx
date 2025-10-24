"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import LogoDx from "@/assets/logos/logo_dx-legal.png";
import {
  FiHome,
  FiAlertTriangle,
  FiCalendar,
  FiBriefcase,
  FiUsers,
  FiSliders,
  FiBarChart2,
  FiSettings,
  FiClock,
  FiHelpCircle,
} from "react-icons/fi";
import { FaFileContract } from "react-icons/fa";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/siniestros", label: "Siniestros" },
  { href: "/agenda", label: "Agenda" },
  { href: "/empresas", label: "Empresas" },
  { href: "/usuarios", label: "Usuarios y Roles" },
  { href: "/parametros", label: "Parámetros" },
  { href: "/reportes", label: "Reportes" },
  { href: "/configuracion", label: "Configuración" },
  { href: "/historico", label: "Histórico" },
  { href: "/soporte", label: "Ayuda y Soporte" },
];

const iconMap: Record<string, JSX.Element> = {
  "/dashboard": <FiHome className="w-5 h-5" />,
  "/siniestros": <FaFileContract className="w-5 h-5" />,
  "/agenda": <FiCalendar className="w-5 h-5" />,
  "/empresas": <FiBriefcase className="w-5 h-5" />,
  "/usuarios": <FiUsers className="w-5 h-5" />,
  "/parametros": <FiSliders className="w-5 h-5" />,
  "/reportes": <FiBarChart2 className="w-5 h-5" />,
  "/configuracion": <FiSettings className="w-5 h-5" />,
  "/historico": <FiClock className="w-5 h-5" />,
  "/soporte": <FiHelpCircle className="w-5 h-5" />,
};

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      const toggleEl = (e.target as HTMLElement).closest(
        "[data-sidebar-toggle]"
      );
      if (toggleEl) setOpen((prev: boolean) => !prev);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <aside
      className={`fixed z-40 inset-y-0 left-0 h-screen w-64 transform transition-transform duration-200 ease-in-out bg-primary-500 text-white lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="h-50 flex items-center px-4 font-semibold tracking-wide border-b border-white/10">
        <Image
          src={LogoDx}
          alt="DX Legal"
          className="w-full h-auto object-contain"
          priority
        />
      </div>
      <nav className="py-4">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/10"
          >
            {iconMap[item.href]}
            <span className="truncate">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
