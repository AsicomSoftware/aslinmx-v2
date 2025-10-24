"use client";

import { usePathname } from "next/navigation";
import AppShell from "@/components/AppShell";
import { UserProvider } from "@/context/UserContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith("/login");
  return (
    <UserProvider>
      {isAuthRoute ? children : <AppShell>{children}</AppShell>}
    </UserProvider>
  );
}


