export const demoAccounts = {
  professor: {
    email: 'prof@university.ac.id',
    password: 'password',
    role: 'professor' as const,
    redirectTo: '/professor/dashboard' as const,
  },
  student: {
    email: 'student@university.ac.id',
    password: 'password',
    role: 'student' as const,
    redirectTo: '/student/dashboard' as const,
  },
} as const;

export type DemoAccount = typeof demoAccounts[keyof typeof demoAccounts];