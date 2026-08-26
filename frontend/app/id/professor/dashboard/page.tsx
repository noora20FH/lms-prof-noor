"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "@/hooks/useAuthUser";
import { api, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";

type DashboardStats = {
  courses: number;
  active_students: number;
  pending_assignments: number;
};

type RecentSubmission = {
  id: number;
  student_name: string;
  nim: string;
  class_: string;
  assignment_title: string;
  course: string;
  course_id: number;
  week: number;
  submitted_at: string | null;
  status: "submitted" | "graded";
};

type DashboardResponse = {
  stats: DashboardStats;
  recent_submissions: RecentSubmission[];
};

const initialStats: DashboardStats = {
  courses: 0,
  active_students: 0,
  pending_assignments: 0,
};

function formatSubmittedAt(value: string | null): string {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ProfessorDashboard() {
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);

  const displayName = loading ? "..." : user?.name ?? "Dosen";

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get<DashboardResponse>(
          "/api/professor/dashboard"
        );

        setStats(data.stats ?? initialStats);
        setRecentSubmissions(data.recent_submissions ?? []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Gagal memuat dashboard dosen."));
      }
    };

    void loadDashboard();
  }, []);

  const handleViewSubmission = (submission: RecentSubmission) => {
    router.push(
      `/id/professor/courses/details?courseId=${submission.course_id}&week=${submission.week}`
    );
  };

  return (
    <div className="space-y-8">
      <div
        className="rounded-3xl p-8 text-white"
        style={{
          background:
            "linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)",
        }}
      >
        <h1 className="text-4xl font-bold tracking-tight">
          {"Dashboard Dosen"}
        </h1>
        <p className="mt-2 text-lg text-white/70">
          {`Selamat datang, ${displayName}`} 👋
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">{"Kelas"}</p>
          <p className="mt-2 text-5xl font-semibold text-[#0D542B]">
            {stats.courses}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">{"Mahasiswa Aktif"}</p>
          <p className="mt-2 text-5xl font-semibold text-[#0D542B]">
            {stats.active_students}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">{"Tugas Menunggu Penilaian"}</p>
          <p className="mt-2 text-5xl font-semibold text-[#0D542B]">
            {stats.pending_assignments}
          </p>
        </div>
      </div>

<div className="w-full min-w-0">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {"Pengumpulan Terbaru"}
          </h3>
        </div>

        <div className="w-full overflow-hidden rounded-2xl md:rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="w-full overflow-x-auto">
            
            <table className="w-full min-w-max">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  
                  <th className="whitespace-nowrap px-3 py-4 md:p-5 text-left text-sm md:text-base font-medium text-gray-700">
                    {"Mahasiswa"}
                  </th>
                  <th className="whitespace-nowrap px-3 py-4 md:p-5 text-left text-sm md:text-base font-medium text-gray-700">
                    {"Tugas"}
                  </th>
                  <th className="whitespace-nowrap px-3 py-4 md:p-5 text-left text-sm md:text-base font-medium text-gray-700">
                    {"Kelas"}
                  </th>
                  <th className="whitespace-nowrap px-3 py-4 md:p-5 text-left text-sm md:text-base font-medium text-gray-700">
                    {"Dikumpulkan"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 md:p-8 text-center text-sm md:text-base text-gray-500">
                      {"Belum ada pengumpulan tugas terbaru."}
                    </td>
                  </tr>
                ) : (
                  recentSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      onClick={() => handleViewSubmission(submission)}
                      className="cursor-pointer transition-colors hover:bg-gray-50"
                    >
                      {/* Padding responsif pada semua <td> */}
                      <td className="whitespace-nowrap px-3 py-4 md:p-5">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm md:text-base">
                            {submission.student_name}
                          </p>
                          <p className="mt-0.5 text-[11px] md:text-xs text-gray-500">
                            {submission.nim}
                          </p>
                          <p className="mt-0.5 text-[11px] md:text-xs font-medium text-[#0D542B]">
                            {submission.class_}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 md:p-5 font-medium text-gray-900 text-sm md:text-base">
                        {submission.assignment_title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 md:p-5 text-gray-600 text-sm md:text-base">
                        {submission.course}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 md:p-5 text-xs md:text-sm text-gray-500">
                        {formatSubmittedAt(submission.submitted_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
