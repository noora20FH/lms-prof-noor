"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
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

function getIntlLocale(locale: string) {
  if (locale === "zh") return "zh-CN";
  if (locale === "en") return "en-US";
  return "id-ID";
}

function formatSubmittedAt(value: string | null, locale: string): string {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ProfessorDashboard() {
  const t = useTranslations("ProfessorDashboard");
  const locale = useLocale();
  const router = useRouter();
  const { user, loading } = useAuthUser();
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);

  const displayName = loading ? "..." : user?.name ?? t("defaultName");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data } = await api.get<DashboardResponse>(
          "/api/professor/dashboard"
        );

        setStats(data.stats ?? initialStats);
        setRecentSubmissions(data.recent_submissions ?? []);
      } catch (error) {
        toast.error(getErrorMessage(error, t("loadError")));
      }
    };

    void loadDashboard();
  }, [t]);

  const handleViewSubmission = (submission: RecentSubmission) => {
    router.push(
      `/professor/courses/details?courseId=${submission.course_id}&week=${submission.week}`
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
          {t("title")}
        </h1>
        <p className="mt-2 text-lg text-white/70">
          {t("welcome", { name: displayName })} 👋
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">{t("courses")}</p>
          <p className="mt-2 text-5xl font-semibold text-[#0D542B]">
            {stats.courses}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">{t("activeStudents")}</p>
          <p className="mt-2 text-5xl font-semibold text-[#0D542B]">
            {stats.active_students}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">{t("pendingAssignments")}</p>
          <p className="mt-2 text-5xl font-semibold text-[#0D542B]">
            {stats.pending_assignments}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("recentSubmissions")}
          </h3>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="p-5 text-left font-medium text-gray-700">
                    {t("student")}
                  </th>
                  <th className="p-5 text-left font-medium text-gray-700">
                    {t("assignment")}
                  </th>
                  <th className="p-5 text-left font-medium text-gray-700">
                    {t("course")}
                  </th>
                  <th className="p-5 text-left font-medium text-gray-700">
                    {t("submittedAt")}
                  </th>
                  <th className="w-40 p-5 text-center font-medium text-gray-700">
                    {t("action")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      {t("emptyRecentSubmissions")}
                    </td>
                  </tr>
                ) : (
                  recentSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="p-5">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {submission.student_name}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {submission.nim}
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-[#0D542B]">
                            {submission.class_}
                          </p>
                        </div>
                      </td>
                      <td className="p-5 font-medium text-gray-900">
                        {submission.assignment_title}
                      </td>
                      <td className="p-5 text-gray-600">{submission.course}</td>
                      <td className="p-5 text-sm text-gray-500">
                        {formatSubmittedAt(submission.submitted_at, locale)}
                      </td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() => handleViewSubmission(submission)}
                          className="inline-flex items-center gap-2 font-medium text-[#0D542B] transition-colors hover:text-[#0A3F21] hover:underline"
                        >
                          {t("view")}
                          <span className="text-xl leading-none">→</span>
                        </button>
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
