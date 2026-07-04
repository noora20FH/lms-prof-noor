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

  const displayName = loading ? "..." : (user?.name ?? "Professor");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get<DashboardResponse>(
          "/api/professor/dashboard",
        );

        setStats(data.stats ?? initialStats);
        setRecentSubmissions(data.recent_submissions ?? []);
      } catch (error) {
        toast.error(getErrorMessage(error, "Gagal memuat data dashboard."));
      }
    };

    void loadDashboard();
  }, []);

  const handleViewSubmission = (submission: RecentSubmission) => {
    router.push(
      `/professor/courses/details?courseId=${submission.course_id}&week=${submission.week}`,
    );
  };

  return (
    <div className="space-y-8">
      {/* Gradient Header */}
      <div
        className="rounded-3xl p-8 text-white"
        style={{
          background:
            "linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)",
        }}
      >
        <h1 className="text-4xl font-bold tracking-tight">
          Dashboard Professor
        </h1>
        <p className="text-white/70 mt-2 text-lg">
          Selamat datang kembali, {displayName} 👋
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Mata Kuliah</p>
          <p className="text-5xl font-semibold text-[#0D542B] mt-2">
            {stats.courses}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Mahasiswa Aktif</p>
          <p className="text-5xl font-semibold text-[#0D542B] mt-2">
            {stats.active_students}
          </p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Tugas Pending</p>
          <p className="text-5xl font-semibold text-[#0D542B] mt-2">
            {stats.pending_assignments}
          </p>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Submitted Tasks Terbaru
          </h3>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-5 text-gray-700 font-medium">
                    Mahasiswa
                  </th>
                  <th className="text-left p-5 text-gray-700 font-medium">
                    Tugas
                  </th>
                  <th className="text-left p-5 text-gray-700 font-medium">
                    Mata Kuliah
                  </th>
                  <th className="text-left p-5 text-gray-700 font-medium">
                    Waktu Submit
                  </th>
                  <th className="text-center p-5 text-gray-700 font-medium w-40">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-5">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {submission.student_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {submission.nim}
                        </p>
                        <p className="text-xs text-[#0D542B] font-medium mt-0.5">
                          {submission.class_}
                        </p>
                      </div>
                    </td>
                    <td className="p-5 text-gray-900 font-medium">
                      {submission.assignment_title}
                    </td>
                    <td className="p-5 text-gray-600">{submission.course}</td>
                    <td className="p-5 text-gray-500 text-sm">
                      {formatSubmittedAt(submission.submitted_at)}
                    </td>
                    <td className="p-5 text-center">
                      <button
                        onClick={() => handleViewSubmission(submission)}
                        className="inline-flex items-center gap-2 text-[#0D542B] hover:text-[#0A3F21] font-medium transition-colors hover:underline"
                      >
                        Lihat
                        <span className="text-xl leading-none">→</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
