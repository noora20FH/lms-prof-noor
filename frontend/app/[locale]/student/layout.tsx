'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const studentUser = {
    name: "Noora Putri",
    role: "student" as const,
  };

  return (
    <div className="flex h-dvh bg-gray-50 overflow-hidden">   {/* h-dvh lebih reliable di mobile */}
      {/* Sidebar */}
      <Sidebar
        role={studentUser.role}
        userName={studentUser.name}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">   {/* ← TAMBAHKAN min-h-0 DI SINI */}
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b shadow-sm z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="h-10 w-10"
          >
            <Menu className="w-6 h-6" />
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-2xl tracking-tight text-[#0F172B]">LMS</span>
          </div>

          <LanguageSwitcher compact className="border-gray-200 bg-[#0F172B] text-white" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}