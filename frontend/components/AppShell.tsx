"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <Navbar />
      <main className="!pt-16 lg:pl-64 p-4 lg:p-6 bg-gray-50 min-h-screen">{children}</main>
    </div>
  );
}


