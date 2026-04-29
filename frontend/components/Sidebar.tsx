interface SidebarProps {
  role: 'professor' | 'student';
  currentView: string;
  onViewChange: (view: string) => void;
  userName: string;
  onLogout: () => void;
}

export function Sidebar({ role, currentView, onViewChange, userName, onLogout }: SidebarProps) {
  const professorMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'courses', label: 'My Courses', icon: '📚' },
    { id: 'students', label: 'Students', icon: '👥' },
  ];

  const studentMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'courses', label: 'My Courses', icon: '📚' },
    { id: 'assignments', label: 'Assignments', icon: '📝' },
  ];

  const menus = role === 'professor' ? professorMenus : studentMenus;

  return (
    <div className="w-64 h-screen border-r border-white/10 flex flex-col" style={{
      background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)'
    }}>
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-semibold text-white">LMS Portal</h1>
        <p className="text-sm text-white/60 mt-1 capitalize">{role}</p>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => onViewChange(menu.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === menu.id
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>{menu.icon}</span>
            <span>{menu.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="mb-3 px-2">
          <p className="text-sm text-white/80">{userName}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
