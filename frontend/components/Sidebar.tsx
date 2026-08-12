"use client";

import {
  LogOut,
  LayoutDashboard,
  BookOpen,
  Users,
  FileText,
  UserRound,
  X,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = {
  professor: [
    {
      label: "Dashboard",
      href: "/id/professor/dashboard",
      icon: LayoutDashboard,
    },
    { label: "Mata Kuliah", href: "/id/professor/courses", icon: BookOpen },
    { label: "Mahasiswa", href: "/id/professor/students", icon: Users },
  ],
  student: [
    {
      label: "Dashboard",
      href: "/id/student/dashboard",
      icon: LayoutDashboard,
    },
    { label: "Mata Kuliah", href: "/id/student/courses", icon: BookOpen },
    { label: "Tugas", href: "/id/student/assignments", icon: FileText },
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
  const router = useRouter();
  const items = navItems[role];
  const profileHref =
    role === "professor" ? "/id/professor/profile" : "/id/student/profile";

  const isProfileActive =
    pathname === profileHref || pathname.startsWith(`${profileHref}/`);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/id/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-[100] backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 bg-[#0F172B] text-white h-dvh flex flex-col",
          "border-r border-white/10 transition-transform duration-300 z-[110] shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "w-full lg:w-72",
        )}
      >
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={onToggle}
            aria-label="Tutup menu"
          >
            <X className="w-6 h-6" />
          </Button>

          <div className="w-9 h-9 bg-[#0D542B] rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
            📚
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">LMS</h1>
            <p className="text-xs text-emerald-400 -mt-1">
              Prof. M. Noor Hidayat
            </p>
          </div>
        </div>

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

        <div className="p-4 border-t border-white/10 mt-auto space-y-3">
          <Link
            href={profileHref}
            onClick={() => window.innerWidth < 1024 && onToggle()}
            aria-current={isProfileActive ? "page" : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl px-3 py-3",
              "transition-colors",
              isProfileActive
                ? "bg-[#0D542B] text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
              <UserRound className="h-5 w-5" />
            </div>

            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="text-xs text-white/60">Profil</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10 h-12 text-base"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Keluar
          </Button>
        </div>
      </div>
    </>
  );
}
