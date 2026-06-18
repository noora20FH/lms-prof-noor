"use client";

import { mockStudentCourses, mockAssignments } from "@/data/mock/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";

export default function StudentDashboard() {
  const router = useRouter();
  const pending = mockAssignments.filter((a) => a.status === "pending");

  const handleCourseClick = (courseId: number) => {
    router.push(`/student/courses/details?courseId=${courseId}`);
  };
  // http://localhost:3000/student/courses/details/week?courseId=1&week=1
  const handleAssignmentClick = (courseId: number, week: number) => {
    router.push(
      `/student/courses/details/week?courseId=${courseId}&week=${week}`,
    );
  };
  const { user, loading } = useAuthUser();

  const displayName = loading ? "..." : (user?.name ?? "Mahasiswa");

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div
        className="rounded-3xl p-8 text-white"
        style={{
          background: "linear-gradient(135deg, #0F172B 0%, #0D542B 100%)",
        }}
      >
        <h1 className="text-4xl font-bold">Halo, {displayName}! 🎓</h1>
        <p className="text-white/70 mt-2 text-lg">
          {user?.nim && user?.class_
            ? `${user.nim} • ${user.class_}`
            : "Selamat datang kembali di LMS"}
        </p>
        <p className="text-emerald-200 mt-2">Lanjutkan perjalanan belajarmu</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mata Kuliah yang Diikuti - CLICKABLE */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            Mata Kuliah yang Diikuti
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockStudentCourses.map((course) => (
              <Card
                key={course.id}
                className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleCourseClick(course.id)}
              >
                <CardContent className="p-6">
                  <p className="font-semibold">{course.title}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tugas Pending - CLICKABLE */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Tugas Pending ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.map((assignment) => (
              <Card
                key={assignment.id}
                className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() =>
                  handleAssignmentClick(assignment.courseId, assignment.week)
                }
              >
                <CardContent className="p-4">
                  <p className="font-medium">{assignment.title}</p>
                  <p className="text-sm text-gray-500">{assignment.course}</p>
                  <p className="text-xs text-red-600 mt-3">
                    {assignment.daysLeft} hari lagi
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
