'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { mockStudentCourses, mockCourseMaterials } from '@/data/mock/mock-data';
import { ExternalLink, ArrowLeft } from 'lucide-react';

function StudentCourseWeekDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = Number(searchParams.get('courseId'));
  const weekNumber = Number(searchParams.get('week'));

  const course = mockStudentCourses.find((c) => c.id === courseId);

  if (!course) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 text-lg">Kursus tidak ditemukan</p>
      </div>
    );
  }

  // Ambil materi berdasarkan courseId dan week
  const materials = mockCourseMaterials.filter(
    (m) => m.courseId === courseId && m.week === weekNumber
  );

  const assignment = {
    id: 1,
    title: `Tugas Week ${weekNumber}`,
    description: 'Buat program sesuai spesifikasi yang diberikan',
    startDate: '2026-04-20',
    endDate: '2026-04-27',
    submitted: false,
  };

  const handleBack = () => {
    router.push(`/student/courses/details?courseId=${courseId}`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div
        className="rounded-3xl p-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)',
        }}
      >
        <button
          onClick={handleBack}
          className="mb-4 flex items-center text-sm text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Week List
        </button>
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="mt-2 text-white/70">Week {weekNumber}</p>
      </div>

      {/* MATERIALS */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Materials</h3>
        <div className="space-y-3">
          {materials.length > 0 ? (
            materials.map((material) => (
              <div
                key={material.id}
                className="bg-white rounded-3xl p-4 border border-gray-200 shadow-sm flex items-center justify-between transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-3xl">
                    {material.type === 'pdf' && '📄'}
                    {material.type === 'ppt' && '📊'}
                    {material.type === 'video_link' && '🎥'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{material.title}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {material.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <Button asChild className="bg-gradient-to-r from-[#0D542B] to-[#004F3B]">
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buka <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-8 text-center border border-gray-200">
              <p className="text-gray-500 italic">
                Belum ada materi untuk Week {weekNumber}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ASSIGNMENT */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {assignment.title}
              </h4>
              <p className="text-gray-600 mt-1">{assignment.description}</p>
            </div>
            {assignment.submitted && (
              <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-2xl text-sm font-medium">
                Submitted
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500">Start Date</p>
              <p className="font-medium text-gray-900">{assignment.startDate}</p>
            </div>
            <div>
              <p className="text-gray-500">Due Date</p>
              <p className="font-medium text-gray-900">{assignment.endDate}</p>
            </div>
          </div>

          {!assignment.submitted && (
            <div className="mt-8 pt-6 border-t border-gray-200 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:border-[#0D542B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Atau Submit Link
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:border-[#0D542B]"
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-[#0D542B] to-[#004F3B] h-12 text-base">
                Submit Assignment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentCourseWeekDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading week detail...</div>}>
      <StudentCourseWeekDetailContent />
    </Suspense>
  );
}