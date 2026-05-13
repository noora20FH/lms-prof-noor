'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockStudentCourses } from '@/data/mock/mock-data';

export default function StudentCourseDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = Number(searchParams.get('courseId'));

  const course = mockStudentCourses.find((c) => c.id === courseId);
  if (!course) return <p className="text-red-500">Kursus tidak ditemukan</p>;

  const weeks = Array.from({ length: 17 }, (_, i) => i + 1);

  const handleWeekSelect = (week: number) => {
    router.push(`/student/courses/details/week?courseId=${courseId}&week=${week}`);
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-lg p-6 mb-6"
        style={{ background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)' }}
      >
        <button
          onClick={() => router.push('/student/courses')}
          className="text-white/60 hover:text-white mb-3 flex items-center gap-2"
        >
          ← Kembali ke Kursus
        </button>
        <h2 className="text-2xl font-semibold text-white">{course.title}</h2>
        <p className="text-white/70 mt-1">{course.description}</p>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-600">Progress Keseluruhan</span>
          <span className="text-[#0D542B] font-semibold text-xl">{course.progress}%</span>
        </div>
        <Progress value={course.progress} className="h-3" />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Weeks</h3>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-200">
          {weeks.map((week) => (
            <button
              key={week}
              onClick={() => handleWeekSelect(week)}
              className="w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0D542B] to-[#004F3B] flex items-center justify-center text-white font-semibold">
                  {week}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Week {week}</p>
                  <p className="text-sm text-gray-500">Materials and assignments</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}