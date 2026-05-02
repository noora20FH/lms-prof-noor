"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, BookOpen, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = {
  professor: [
    { label: "Dashboard", href: "/professor/dashboard", icon: LayoutDashboard },
    { label: "Mata Kuliah", href: "/professor/courses", icon: BookOpen },
    { label: "Mahasiswa", href: "/professor/students", icon: Users },
  ],
  student: [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { label: "Mata Kuliah", href: "/student/courses", icon: BookOpen },
    { label: "Tugas Saya", href: "/student/assignments", icon: FileText },
  ],
} as const;

export default function Sidebar({ role }: { role: "professor" | "student" }) {
  const pathname = usePathname();
  const items = navItems[role];

  return (
    <div className="w-72 bg-[#0F172B] text-white h-screen flex flex-col border-r border-white/10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0D542B] rounded-2xl flex items-center justify-center text-2xl">📚</div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">LMS</h1>
            <p className="text-xs text-emerald-400 -mt-1">Prof. Noor</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-medium transition-all ${
                isActive
                  ? "bg-[#0D542B] text-white shadow-inner"
                  : "hover:bg-white/10 text-white/80"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

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
  );
}