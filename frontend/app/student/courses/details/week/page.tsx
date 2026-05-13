'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { mockStudentCourses } from '@/data/mock/mock-data';

export default function StudentCourseWeekDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = Number(searchParams.get('courseId'));
  const weekNumber = Number(searchParams.get('week'));

  const course = mockStudentCourses.find((c) => c.id === courseId);
  if (!course) return <p className="text-red-500">Kursus tidak ditemukan</p>;

  const materials = [
    { id: 1, title: 'Slide Perkuliahan', type: 'ppt' as const },
    { id: 2, title: 'Modul Praktikum', type: 'pdf' as const },
    { id: 3, title: 'Video Tutorial', type: 'video_link' as const },
  ];

  const assignment = {
    id: 1,
    title: `Tugas Week ${weekNumber}`,
    description: 'Buat program sesuai spesifikasi yang diberikan',
    startDate: '2026-04-20',
    endDate: '2026-04-27',
    submitted: false,
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-lg p-6 mb-6"
        style={{ background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)' }}
      >
        <button
          onClick={() => router.push(`/student/courses/details?courseId=${courseId}`)}
          className="text-white/60 hover:text-white mb-3 flex items-center gap-2"
        >
          ← Kembali ke Week List
        </button>
        <h2 className="text-2xl font-semibold text-white">{course.title}</h2>
        <p className="text-white/70">Week {weekNumber}</p>
      </div>

      {/* Materials */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Materials</h3>
        <div className="space-y-3">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {material.type === 'pdf' && '📄'}
                  {material.type === 'ppt' && '📊'}
                  {material.type === 'video_link' && '🎥'}
                </span>
                <div>
                  <p className="text-gray-900">{material.title}</p>
                  <p className="text-gray-500 text-sm capitalize">
                    {material.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-[#0D542B] to-[#004F3B]">
                Download
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Assignment */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h4>
              <p className="text-gray-600">{assignment.description}</p>
            </div>
            {assignment.submitted && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Submitted
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-gray-500">Start Date</p>
              <p className="text-gray-900">{assignment.startDate}</p>
            </div>
            <div>
              <p className="text-gray-500">Due Date</p>
              <p className="text-gray-900">{assignment.endDate}</p>
            </div>
          </div>

          {!assignment.submitted && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Upload File (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Or Submit Link</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-[#0D542B]"
                />
              </div>
              <Button className="w-full bg-gradient-to-r from-[#0D542B] to-[#004F3B]">
                Submit Assignment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}