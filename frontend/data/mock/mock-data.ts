// frontend/data/mock/mock-data.ts

export type Course = {
  id: string;
  title: string;
  description: string;
  professor: string;
  enrolled: number;
  totalStudents: number;
  progress?: number; // untuk student
};

export type Week = {
  id: string;
  weekNumber: number;
  title: string;
  materials: number;
  assignments: number;
};

// Mock Data
export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Pemrograman Web Lanjutan",
    description: "Membangun aplikasi fullstack dengan Next.js + Laravel",
    professor: "Prof. Noor",
    enrolled: 34,
    totalStudents: 45,
  },
  {
    id: "2",
    title: "Basis Data dan SQL",
    description: "Desain database, query optimization, dan normalisasi",
    professor: "Prof. Noor",
    enrolled: 28,
    totalStudents: 40,
  },
  {
    id: "3",
    title: "UI/UX Design",
    description: "Figma, Tailwind, dan design system",
    professor: "Prof. Noor",
    enrolled: 41,
    totalStudents: 50,
  },
];

export type Assignment = {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  daysLeft: number;
  status: "pending" | "submitted" | "graded";
  submittedDate?: string;
  score?: number;
};

export const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Tugas 1 - CRUD API dengan Laravel",
    course: "Pemrograman Web Lanjutan",
    dueDate: "2026-05-10",
    daysLeft: 3,
    status: "pending",
  },
  {
    id: "2",
    title: "Tugas 2 - Database Design & ERD",
    course: "Basis Data dan SQL",
    dueDate: "2026-05-05",
    daysLeft: 8,
    status: "submitted",
    submittedDate: "2026-04-28",
    score: 92,
  },
  {
    id: "3",
    title: "Tugas 3 - Responsive UI Figma to Tailwind",
    course: "UI/UX Design",
    dueDate: "2026-05-15",
    daysLeft: 12,
    status: "pending",
  },
  {
    id: "4",
    title: "Quiz Minggu 4 - Authentication",
    course: "Pemrograman Web Lanjutan",
    dueDate: "2026-04-20",
    daysLeft: -5,
    status: "submitted",
    submittedDate: "2026-04-18",
    score: 85,
  },
];

export const mockProfessorCourses = mockCourses;

export const mockStudentCourses = mockCourses.map(c => ({
  ...c,
  progress: Math.floor(Math.random() * 40) + 60,
}));
// Tambahkan di bawah mockStudentCourses
export type Material = {
  id: string;
  weekId: string;
  title: string;
  type: 'pdf' | 'ppt' | 'video' | 'yt_link';
  contentUrl: string;
};

export const mockWeeks: Week[] = [
  { id: 'w1', weekNumber: 1, title: 'Introduction to Fullstack', materials: 2, assignments: 1 },
  { id: 'w2', weekNumber: 2, title: 'React Fundamentals', materials: 3, assignments: 1 },
  { id: 'w3', weekNumber: 3, title: 'Laravel API & Authentication', materials: 1, assignments: 2 },
];

export const mockMaterials: Material[] = [
  { id: 'm1', weekId: 'w1', title: 'Slide Minggu 1 - Next.js Overview.pdf', type: 'pdf', contentUrl: '#' },
  { id: 'm2', weekId: 'w1', title: 'Video: Setup Project (YouTube)', type: 'yt_link', contentUrl: 'https://youtube.com/...' },
  { id: 'm3', weekId: 'w2', title: 'Component Design System.pptx', type: 'ppt', contentUrl: '#' },
];