'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, BookOpen, Users, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = {
  professor: [
    { label: "Dashboard", href: "/professor/dashboard", icon: LayoutDashboard },
    { label: "Mata Kuliah", href: "/professor/courses", icon: BookOpen },
    { label: "Materi", href: "/professor/materials", icon: FileText },
    { label: "Mahasiswa", href: "/professor/students", icon: Users },
    
  ],
  student: [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Mata Kuliah", href: "/student/courses", icon: BookOpen },
    { label: "Tugas Saya", href: "/student/assignments", icon: FileText },
  ],
} as const;

interface SidebarProps {
  role: "professor" | "student";
  userName?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  role,
  userName = "User",
  isOpen,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const items = navItems[role];

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Drawer - FULL WIDTH di Mobile */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 bg-[#0F172B] text-white h-dvh flex flex-col",
          "border-r border-white/10 transition-transform duration-300 z-[110] shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "w-full lg:w-72"          // ← FULL WIDTH di mobile
        )}
      >
        {/* HEADER */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={onToggle}
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="w-9 h-9 bg-[#0D542B] rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
            📚
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">LMS</h1>
            <p className="text-xs text-emerald-400 -mt-1">Prof. M. Noor Hidayat</p>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => window.innerWidth < 1024 && onToggle()}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-medium transition-all ${
                  isActive
                    ? "bg-[#0D542B] text-white"
                    : "hover:bg-white/10 text-white/80"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-white/10 mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 h-12 text-base"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Keluar
          </Button>
        </div>
      </div>
    </>
  );
}