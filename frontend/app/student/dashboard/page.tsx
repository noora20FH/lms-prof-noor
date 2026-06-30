"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { api } from "@/lib/api";

// Interface tipe data
interface DashboardCourse {
  id: number;
  title: string;
  progress: number;
}

interface DashboardAssignment {
  id: number;
  title: string;
  course: string;
  courseId: number;
  week: number;
  daysLeft: number;
  isOverdue: boolean;
  hasDeadline: boolean;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthUser();
  
  // State manajemen data
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [pending, setPending] = useState<DashboardAssignment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fungsi Fetch API Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/api/student/dashboard');
        setCourses(response.data.courses);
        setPending(response.data.pending);
      } catch (error) {
        console.error("Gagal mengambil data dashboard", error);
      } finally {
        setDataLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Handler navigasi
  const handleCourseClick = (courseId: number) => {
    router.push(`/student/courses/details?courseId=${courseId}`);
  };
  
  const handleAssignmentClick = (courseId: number, week: number) => {
    router.push(`/student/courses/details/week?courseId=${courseId}&week=${week}`);
  };

  const displayName = authLoading ? "..." : (user?.name ?? "Mahasiswa");

  // Loading Screen
  if (authLoading || dataLoading) {
    return <div className="p-8 text-center text-white flex justify-center items-center h-full">Memuat Dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Bagian Header Welcome */}
      <div
        className="rounded-3xl p-8 text-white"
        style={{
          background: "linear-gradient(135deg, #0F172B 0%, #0D542B 100%)",
        }}
      >
        <h1 className="text-3xl font-bold mb-2">Selamat datang, {displayName}!</h1>
        <p className="text-gray-300">
          Lanjutkan pembelajaran Anda. Anda memiliki {pending.length} tugas yang perlu diselesaikan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Kelas yang Sedang Diikuti */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Kelas yang Sedang Diikuti</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {courses.length === 0 ? (
              <p className="text-gray-500">Anda belum mengikuti kelas apapun.</p>
            ) : (
              courses.map((course) => (
                <Card
                  key={course.id}
                  className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-500 font-medium">
                      Mata Kuliah
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold mb-4">{course.title}</p>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Kolom Kanan: Tugas Pending */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Tugas Pending ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.length === 0 ? (
              <p className="text-gray-500 text-sm border p-4 rounded-lg text-center">
                Tidak ada tugas tertunda. Bagus sekali!
              </p>
            ) : (
              pending.map((assignment) => (
                <Card
                  key={assignment.id}
                  className={`border-0 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    !assignment.hasDeadline ? "" :
                    assignment.isOverdue ? "border-l-4 border-l-red-600" : ""
                  }`}
                  onClick={() =>
                    handleAssignmentClick(assignment.courseId, assignment.week)
                  }
                >
                  <CardContent className="p-4">
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-sm text-gray-500">{assignment.course}</p>
                    
                    {/* Logika Teks Tenggat Waktu */}
                    <p className={`text-xs mt-3 ${
                        !assignment.hasDeadline ? 'text-green-600 font-medium' :
                        assignment.isOverdue ? 'text-red-700 font-bold' : 'text-red-600'
                      }`}
                    >
                      {!assignment.hasDeadline 
                        ? 'Tidak ada tenggat waktu' 
                        : assignment.isOverdue 
                          ? `Terlambat ${Math.abs(assignment.daysLeft)} hari` 
                          : assignment.daysLeft === 0 
                            ? 'Tenggat hari ini' 
                            : `${assignment.daysLeft} hari lagi`}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}