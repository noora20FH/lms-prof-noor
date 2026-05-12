import { Sidebar } from '@/components/Sidebar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock user student (nanti diganti dengan data real dari auth)
  const studentUser = {
    name: "Ahmad Fauzi",           // ← ini yang bakal dinamis nanti
    role: "student" as const,
    avatar: undefined,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        userName={studentUser.name}
        userRole={studentUser.role}
        avatar={studentUser.avatar}
      />
      <div className="flex-1 overflow-auto">
        <main className="p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}