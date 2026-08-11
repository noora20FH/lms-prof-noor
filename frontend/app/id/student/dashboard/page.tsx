"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { api, getErrorMessage } from "@/lib/api";

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

interface DashboardResponse {
  courses?: DashboardCourse[];
  pending?: DashboardAssignment[];
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthUser();

  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [pending, setPending] = useState<DashboardAssignment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setDataLoading(false);
      return;
    }

    let cancelled = false;

    const fetchDashboardData = async () => {
      try {
        setDataLoading(true);
        setError("");

        const response = await api.get<DashboardResponse>(
          "/api/student/dashboard"
        );

        if (cancelled) return;

        setCourses(response.data.courses ?? []);
        setPending(response.data.pending ?? []);
      } catch (requestError) {
        if (cancelled) return;

        console.error("Failed to fetch dashboard data", requestError);
        setCourses([]);
        setPending([]);
        setError(
          getErrorMessage(
            requestError,
            "Dashboard data could not be loaded."
          )
        );
      } finally {
        if (!cancelled) {
          setDataLoading(false);
        }
      }
    };

    void fetchDashboardData();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  const handleCourseClick = (courseId: number) => {
    router.push(`/id/student/courses/details?courseId=${courseId}`);
  };

  const handleAssignmentClick = (courseId: number, week: number) => {
    router.push(`/id/student/courses/details/week?courseId=${courseId}&week=${week}`);
  };

  const displayName = authLoading ? "..." : user?.name ?? "Mahasiswa";

  if (authLoading || dataLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-gray-600">
        {"Memuat data..."}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div
        className="rounded-3xl p-8 text-white"
        style={{
          background: "linear-gradient(135deg, #0F172B 0%, #0D542B 100%)",
        }}
      >
        <h1 className="mb-2 text-3xl font-bold">
          {`Selamat datang, ${displayName}`}
        </h1>
        <p className="text-gray-300">
          {`Anda memiliki ${pending.length} tugas yang perlu diperhatikan.`}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-xl font-semibold">
            {"Kelas yang Diikuti"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {!error && courses.length === 0 ? (
              <p className="text-gray-500">{"Belum ada kelas yang diikuti."}</p>
            ) : (
              courses.map((course) => (
                <Card
                  key={course.id}
                  className="cursor-pointer border-0 shadow-sm transition-all hover:shadow-md"
                  onClick={() => handleCourseClick(course.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {"Mata Kuliah"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4 font-semibold">{course.title}</p>
                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-sm">
                        <span>{"Progres"}</span>
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

        <div>
          <h2 className="mb-4 text-xl font-semibold">
            {`Tugas Mendatang (${pending.length})`}
          </h2>
          <div className="space-y-4">
            {!error && pending.length === 0 ? (
              <p className="rounded-lg border p-4 text-center text-sm text-gray-500">
                {"Tidak ada tugas yang menunggu."}
              </p>
            ) : (
              pending.map((assignment) => (
                <Card
                  key={assignment.id}
                  className={`cursor-pointer border-0 shadow-sm transition-all hover:shadow-md ${
                    assignment.hasDeadline && assignment.isOverdue
                      ? "border-l-4 border-l-red-600"
                      : ""
                  }`}
                  onClick={() =>
                    handleAssignmentClick(assignment.courseId, assignment.week)
                  }
                >
                  <CardContent className="p-4">
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-sm text-gray-500">{assignment.course}</p>

                    <p
                      className={`mt-3 text-xs ${
                        !assignment.hasDeadline
                          ? "font-medium text-green-600"
                          : assignment.isOverdue
                            ? "font-bold text-red-700"
                            : "text-red-600"
                      }`}
                    >
                      {!assignment.hasDeadline
                        ? "Tanpa batas waktu"
                        : assignment.isOverdue
                          ? `${Math.abs(assignment.daysLeft)} hari terlambat`
                          : assignment.daysLeft === 0
                            ? "Jatuh tempo hari ini"
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