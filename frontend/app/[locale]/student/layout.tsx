"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import Sidebar from "@/components/Sidebar";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, loading } = useAuthUser();

  const displayName = loading
    ? "Memuat..."
    : user?.name ?? "Mahasiswa";

  return (
    <div className="flex h-dvh overflow-hidden bg-gray-50">
      <Sidebar
        role="student"
        userName={displayName}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((current) => !current)}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="z-50 flex items-center justify-between border-b bg-white px-4 py-4 shadow-sm lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="h-10 w-10"
            aria-label="Buka menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="text-2xl font-bold tracking-tight text-[#0F172B]">
              LMS
            </span>
          </div>

          <LanguageSwitcher
            compact
            className="border-gray-200 bg-[#0F172B] text-white"
          />
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}