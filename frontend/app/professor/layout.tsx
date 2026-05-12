import { Sidebar } from '@/components/Sidebar';

export default function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock user professor (nanti diganti dengan data real dari auth)
  const professorUser = {
    name: "Prof. Noor",
    role: "professor" as const,
    avatar: undefined,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        userName={professorUser.name}
        userRole={professorUser.role}
        avatar={professorUser.avatar}
      />
      <div className="flex-1 overflow-auto">
        <main className="p-8 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}