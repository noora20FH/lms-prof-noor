'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import { LockKeyhole } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { api, getErrorMessage } from '@/lib/api';

type CourseData = {
  id: number;
  title: string;
  description: string | null;
};

type WeekData = {
  id: number;
  week_number: number;
  title: string;
  unlock_at: string | null;
  due_at: string | null;
  materials_count: number;
  assignments_count: number;
  is_accessible: boolean;
  is_locked: boolean;
};

type CourseWeeksPayload = {
  course: CourseData;
  data: WeekData[];
};

function StudentCourseDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = Number(searchParams.get('courseId'));

  const [course, setCourse] = useState<CourseData | null>(null);
  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Number.isInteger(courseId) || courseId <= 0) {
      setError("ID kelas tidak valid.");
      setIsLoading(false);
      return;
    }

    const loadCourseWeeks = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get<CourseWeeksPayload>(
          `/api/student/courses/${courseId}/weeks`
        );

        setCourse(response.data.course);
        setWeeks(response.data.data ?? []);
      } catch (requestError) {
        setCourse(null);
        setWeeks([]);
        setError(getErrorMessage(requestError, "Gagal memuat detail kelas."));
      } finally {
        setIsLoading(false);
      }
    };

    void loadCourseWeeks();
  }, [courseId]);

  const progress = useMemo(() => {
    if (weeks.length === 0) {
      return 0;
    }

    const accessibleWeeks = weeks.filter((week) => week.is_accessible).length;
    return Math.round((accessibleWeeks / weeks.length) * 100);
  }, [weeks]);

  const formatUnlockDate = (value: string | null): string => {
    if (!value) {
      return "Akses belum dijadwalkan";
    }

    const date = new Intl.DateTimeFormat("id-ID", {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    }).format(new Date(value));

    return `Dibuka ${date}`;
  };

  const handleWeekSelect = (week: WeekData) => {
    if (week.is_locked) {
      return;
    }

    router.push(
      `/id/student/courses/details/week?courseId=${courseId}&week=${week.week_number}`
    );
  };

  if (isLoading) {
    return <div className="p-8 text-center">{"Memuat..."}</div>;
  }

  if (!course) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-red-500">
          {error || "Kelas tidak ditemukan"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl p-8 text-white"
        style={{
          background:
            'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)',
        }}
      >
        <button
          type="button"
          onClick={() => router.push('/id/student/courses')}
          className="mb-4 flex items-center text-sm text-white/70 transition-colors hover:text-white"
        >
          ← {"Kembali ke Kelas"}
        </button>
        <h2 className="text-3xl font-bold tracking-tight">{course.title}</h2>
        <p className="mt-2 text-white/70">{course.description}</p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-gray-600">{"Progres Keseluruhan"}</span>
          <span className="text-2xl font-semibold text-[#0D542B]">
            {progress}%
          </span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {"Minggu Pembelajaran"}
        </h3>
        <div className="divide-y divide-gray-200 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          {weeks.map((week) => (
            <button
              key={week.id}
              type="button"
              disabled={week.is_locked}
              onClick={() => handleWeekSelect(week)}
              className={`flex w-full items-center justify-between border-b p-6 text-left transition-colors last:border-b-0 ${
                week.is_locked
                  ? 'cursor-not-allowed bg-gray-50 opacity-70'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-semibold ${
                    week.is_locked
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-gradient-to-br from-[#0D542B] to-[#004F3B] text-white'
                  }`}
                >
                  {week.week_number}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {week.title || `Minggu ${week.week_number}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {`${week.materials_count} materi • ${week.assignments_count} tugas`}
                  </p>
                  {week.is_locked && (
                    <p className="mt-1 text-xs text-gray-500">
                      {formatUnlockDate(week.unlock_at)}
                    </p>
                  )}
                </div>
              </div>

              {week.is_locked ? (
                <LockKeyhole className="h-5 w-5 text-gray-400" />
              ) : (
                <span className="text-2xl text-gray-300">→</span>
              )}
            </button>
          ))}

          {weeks.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {"Belum ada minggu pembelajaran."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentCourseDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">{"Memuat..."}</div>}>
      <StudentCourseDetailContent />
    </Suspense>
  );
}
