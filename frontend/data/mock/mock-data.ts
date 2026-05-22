// frontend/data/mock/mock-data.ts
export type CourseStatus = "active" | "disabled";

export type Course = {
  id: string;
  title: string;
  description: string;
  professor: string;
  enrolled: number;
  totalStudents: number;
  totalWeeks?: number;
  progress?: number;
  status: CourseStatus;
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
    totalWeeks: 17,
    status: "active",
  },
  {
    id: "2",
    title: "Basis Data dan SQL",
    description: "Desain database, query optimization, dan normalisasi",
    professor: "Prof. Noor",
    enrolled: 28,
    totalStudents: 40,
    totalWeeks: 17,
    status: "active",
  },
  {
    id: "3",
    title: "UI/UX Design",
    description: "Figma, Tailwind, dan design system",
    professor: "Prof. Noor",
    enrolled: 41,
    totalStudents: 50,
    totalWeeks: 17,
    status: "disabled",
  },
];

export type Assignment = {
  id: string;
  title: string;
  course: string;
  courseId: number; // ← tambahkan ini
  week: number;     // ← tambahkan ini
  dueDate: string;
  daysLeft: number;
  status: "pending" | "submitted" | "graded";
  submittedDate?: string;
  score?: number;
};

export const mockAssignments: Assignment[] = [
  {id: "1",
    title: "Tugas 1 - CRUD API",
    course: "Algoritma dan Pemrograman",
    courseId: 1,           // ← tambahkan ini
    week: 1,               // ← tambahkan ini
    dueDate: "2026-05-10",
    status: "pending" as const,
    daysLeft: 5,
  },
  {
    id: "2",
    title: "Tugas 3 - Responsive UI",
    course: "Pemrograman Web",
    courseId: 3,
    week: 3,
    dueDate: "2026-05-15",
    status: "pending" as const,
    daysLeft: 10,
  },
  {
    id: "3",
    title: "Tugas 1 - CRUD API dengan Laravel",
    course: "Pemrograman Web Lanjutan",
    courseId: 1,
    week: 1,
    dueDate: "2026-05-10",
    daysLeft: 3,
    status: "pending",
  },
  {
    id: "4",
    title: "Tugas 2 - Database Design & ERD",
    course: "Basis Data dan SQL",
    courseId: 2,
    week: 2,
    dueDate: "2026-05-05",
    daysLeft: 8,
    status: "submitted",
    submittedDate: "2026-04-28",
    score: 92,
  },
  {
    id: "5",
    title: "Tugas 3 - Responsive UI Figma to Tailwind",
    course: "UI/UX Design",
    courseId: 3,
    week: 3,
    dueDate: "2026-05-15",
    daysLeft: 12,
    status: "pending",
  },
  {
    id: "6",
    title: "Quiz Minggu 4 - Authentication",
    course: "Pemrograman Web Lanjutan",
    courseId: 1,
    week: 4,
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
  courseId: number;
  weekNumber: number;
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
  {
    id: 'm1',
    courseId: 1,
    weekNumber: 1,
    title: 'Slide Minggu 1 - Next.js Overview.pdf',
    type: 'pdf',
    contentUrl: '#',
  },
  {
    id: 'm2',
    courseId: 1,
    weekNumber: 1,
    title: 'Video: Setup Project (YouTube)',
    type: 'yt_link',
    contentUrl: 'https://youtube.com/...',
  },
  {
    id: 'm3',
    courseId: 1,
    weekNumber: 2,
    title: 'Component Design System.pptx',
    type: 'ppt',
    contentUrl: '#',
  },
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

export interface CourseMaterial {
  id: number;
  courseId: number;
  week: number;
  title: string;
  type: 'ppt' | 'pdf' | 'video_link';
  url: string;           // link yang akan dibuka
}

export const mockCourseMaterials: CourseMaterial[] = [
  {
    id: 1,
    courseId: 1,
    week: 1,
    title: 'Slide Perkuliahan',
    type: 'ppt',
    url: 'https://example.com/slides-week1.pptx',
  },
  {
    id: 2,
    courseId: 1,
    week: 1,
    title: 'Modul Praktikum',
    type: 'pdf',
    url: 'https://example.com/modul-praktikum-week1.pdf',
  },
  {
    id: 3,
    courseId: 1,
    week: 1,
    title: 'Video Tutorial',
    type: 'video_link',
    url: 'https://youtu.be/example-week1',
  },
  {
    id: 4,
    courseId: 1,
    week: 2,
    title: 'Slide Perkuliahan Week 2',
    type: 'ppt',
    url: 'https://example.com/slides-week2.pptx',
  },
  {
    id: 5,
    courseId: 2,
    week: 1,
    title: 'Modul Basis Data',
    type: 'pdf',
    url: 'https://example.com/basisdata-modul.pdf',
  },
  {
    id: 6,
    courseId: 2,
    week: 1,
    title: 'Video Tutorial Basis Data',
    type: 'video_link',
    url: 'https://example.com/basisdata-video.mp4',
  },
  // Tambahkan materi lain sesuai kebutuhan
];

export type StudentStatus = 'approved' | 'pending';

export type ProfessorStudent = {
  id: number;
  name: string;
  nim: string;
  status: StudentStatus;
  course: string;
  courseId: number;
};

export const mockProfessorStudents: ProfessorStudent[] = [
  {
    id: 1,
    name: 'Ahmad Fauzi',
    nim: '230810101',
    status: 'approved',
    course: 'Pemrograman Web Lanjutan',
    courseId: 1,
  },
  {
    id: 2,
    name: 'Siti Nurhaliza',
    nim: '230810102',
    status: 'pending',
    course: 'Pemrograman Web Lanjutan',
    courseId: 1,
  },
  {
    id: 3,
    name: 'Budi Santoso',
    nim: '230810103',
    status: 'approved',
    course: 'Basis Data dan SQL',
    courseId: 2,
  },
];

// Tambahkan setelah mockAssignments
export type Submission = {
  id: string;
  assignmentId: string;
  studentId: number;
  studentName: string;
  nim: string;
  fileName: string;
  fileUrl: string;           // link download
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
};

export const mockSubmissions: Submission[] = [
  {
    id: 'sub1',
    assignmentId: '1',                    // Tugas 1 - CRUD API
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nim: '230810101',
    fileName: 'DEMO TUGAS PDF.pdf',
    fileUrl: '/DEMO TUGAS PDF.pdf',       // ← File dari public/DEMO TUGAS PDF.pdf
    submittedAt: '2026-05-05T10:30:00',
    score: 88,
    feedback: 'Bagus, tapi perlu optimasi query.',
    status: 'graded',
  },
  {
    id: 'sub2',
    assignmentId: '1',
    studentId: 2,
    studentName: 'Siti Nurhaliza',
    nim: '230810102',
    fileName: 'DEMO TUGAS PDF.pdf',
    fileUrl: '/DEMO TUGAS PDF.pdf',
    submittedAt: '2026-05-06T14:20:00',
    score: undefined,
    status: 'submitted',
  },
  {
    id: 'sub3',
    assignmentId: '3',                    // Tugas 1 CRUD Laravel
    studentId: 1,
    studentName: 'Ahmad Fauzi',
    nim: '230810101',
    fileName: 'DEMO TUGAS PDF.pdf',
    fileUrl: '/DEMO TUGAS PDF.pdf',
    submittedAt: '2026-05-04T09:15:00',
    score: 95,
    status: 'graded',
  },
  {
    id: 'sub4',
    assignmentId: '4',
    studentId: 3,
    studentName: 'Budi Santoso',
    nim: '230810103',
    fileName: 'DEMO TUGAS PDF.pdf',
    fileUrl: '/DEMO TUGAS PDF.pdf',
    submittedAt: '2026-05-07T11:45:00',
    score: 82,
    status: 'graded',
  },
];