'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  ClipboardList, 
  LogOut,
  GraduationCap, 
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarProps {
  userName: string;
  userRole: 'professor' | 'student';
  avatar?: string;
}

export function Sidebar({ userName, userRole, avatar }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navItems = userRole === 'professor' 
    ? [
        { href: '/professor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/professor/courses', label: 'Courses', icon: BookOpen },
        { href: '/professor/students', label: 'Students', icon: Users },
        { href: '/professor/materials', label: 'Materials', icon: FileText },
      ]
    : [
        { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/student/courses', label: 'My Courses', icon: BookOpen },
        { href: '/student/assignments', label: 'Assignments', icon: ClipboardList },
      ];

  return (
    <div className="w-72 bg-[#0F172B] text-white h-screen flex flex-col border-r border-white/10">
      {/* Logo / Header */}
      <div className="px-6 py-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0D542B] rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">LMS</h1>
            <p className="text-xs text-white/60 -mt-1">Prof. Noor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                isActive(item.href)
                  ? "bg-[#0D542B] text-white shadow-inner"
                  : "hover:bg-white/10 text-white/80"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="mt-auto p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="h-9 w-9 border border-white/20">
            <AvatarImage src={avatar} />
            <AvatarFallback className="bg-[#0D542B] text-white">
              {userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-white/60 capitalize">{userRole}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-white/80 hover:text-white hover:bg-white/10 mt-2"
          onClick={() => {
            // nanti connect ke logout logic
            window.location.href = '/';
          }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}