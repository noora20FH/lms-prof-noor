'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockStudentCourses } from '@/data/mock/mock-data';

function StudentCourseDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = Number(searchParams.get('courseId'));

  const course = mockStudentCourses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 text-lg">Kursus tidak ditemukan</p>
      </div>
    );
  }

  const weeks = Array.from({ length: 17 }, (_, i) => i + 1);

  const handleWeekSelect = (week: number) => {
    router.push(`/student/courses/details/week?courseId=${courseId}&week=${week}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="rounded-3xl p-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)',
        }}
      >
        <button
          onClick={() => router.push('/student/courses')}
          className="mb-4 flex items-center text-sm text-white/70 transition-colors hover:text-white"
        >
          ← Kembali ke Kursus
        </button>
        <h2 className="text-3xl font-bold tracking-tight">{course.title}</h2>
        <p className="mt-2 text-white/70">{course.description}</p>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600">Progress Keseluruhan</span>
          <span className="text-[#0D542B] font-semibold text-2xl">{course.progress}%</span>
        </div>
        <Progress value={course.progress} className="h-3" />
      </div>

      {/* Course Weeks */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Weeks</h3>
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm divide-y divide-gray-200 overflow-hidden">
          {weeks.map((week) => (
            <button
              key={week}
              onClick={() => handleWeekSelect(week)}
              className="w-full p-6 hover:bg-gray-50 transition-colors text-left flex items-center justify-between border-b last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0D542B] to-[#004F3B] text-white font-semibold text-xl">
                  {week}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Week {week}</p>
                  <p className="text-sm text-gray-500">Materials and assignments</p>
                </div>
              </div>
              <span className="text-2xl text-gray-300">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StudentCourseDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading course detail...</div>}>
      <StudentCourseDetailContent />
    </Suspense>
  );
}