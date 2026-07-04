'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const professorUser = {
    name: "Prof. Noor",
    role: "professor" as const,
  };

  return (
    <div className="flex h-dvh bg-gray-50 overflow-hidden">
      <Sidebar
        role={professorUser.role}
        userName={professorUser.name}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-h-0">   {/* ← TAMBAHKAN min-h-0 */}
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

          <div className="w-10" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}