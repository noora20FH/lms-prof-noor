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

// export const mockStudentCourses = mockCourses.map(c => ({
//   ...c,
//   progress: Math.floor(Math.random() * 40) + 60,
// }));

// app/data/mock/mock-data.tsx
export const mockStudentCourses = [
  {
    id: 1,
    title: 'Algoritma dan Pemrograman',
    description: 'Pemahaman dasar algoritma dan struktur data dengan bahasa pemrograman modern.',
    progress: 75,
    enrolled: 42,
    totalStudents: 50,
  },
  {
    id: 2,
    title: 'Basis Data',
    description: 'Desain, implementasi, dan pengelolaan database relasional.',
    progress: 60,
    enrolled: 38,
    totalStudents: 45,
  },
  {
    id: 3,
    title: 'Pemrograman Web',
    description: 'Membangun aplikasi web modern dengan Next.js dan Laravel.',
    progress: 45,
    enrolled: 35,
    totalStudents: 40,
  },
];

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

// src/data/mock/mock-data.ts
export const mockRecentSubmissions = [
  {
    id: 1,
    studentName: "Budi Santoso",
    nim: "2021010001",
    course: "Algoritma dan Pemrograman",
    assignmentTitle: "Tugas 5 - Sorting Algorithm",
    submittedAt: "2 jam yang lalu",
    fileName: "sorting_solution.pdf",
  },
  {
    id: 2,
    studentName: "Siti Nurhaliza",
    nim: "2021010002",
    course: "Basis Data",
    assignmentTitle: "Project ERD Design",
    submittedAt: "3 jam yang lalu",
    fileName: "erd_final.pdf",
  },
  {
    id: 3,
    studentName: "Ahmad Zaki",
    nim: "2021010003",
    course: "Pemrograman Web",
    assignmentTitle: "Tugas 4 - React Components",
    submittedAt: "1 hari yang lalu",
    fileName: "frontend_app.zip",
  },
  {
    id: 4,
    studentName: "Dewi Lestari",
    nim: "2021010004",
    course: "Algoritma dan Pemrograman",
    assignmentTitle: "Tugas 5 - Sorting Algorithm",
    submittedAt: "1 hari yang lalu",
    fileName: "bubble_sort.py",
  },
];