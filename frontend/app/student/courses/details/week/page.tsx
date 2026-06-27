'use client';

import axios from 'axios';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { api, getErrorMessage } from '@/lib/api';
import { ExternalLink, ArrowLeft, LockKeyhole } from 'lucide-react';

type MaterialType = 'pdf' | 'ppt' | 'video_link' | 'yt_link';

type CourseData = {
  id: number;
  title: string;
  description: string | null;
};

type WeekData = {
  id: number;
  week_number: number;
  title: string | null;
  unlock_at: string;
  due_at: string | null;
};

type MaterialData = {
  id: number;
  title: string;
  type: MaterialType;
  access_url: string;
};

type SubmissionData = {
  id: number;
  file_url: string | null;
  link_url: string | null;
  submitted_at: string | null;
  score: number | null;
  feedback: string | null;
  status: 'submitted' | 'graded';
};

type AssignmentData = {
  id: number;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  file_url: string | null;
  gdrive_submission_link: string | null;
  submission_note: string | null;
  my_submission: SubmissionData | null;
};

type WeekDetailPayload = {
  data: {
    course: CourseData;
    week: WeekData;
    materials: MaterialData[];
    assignments: AssignmentData[];
  };
};

function formatDate(value: string | null): string {
  if (!value) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value));
}

function getMaterialIcon(type: MaterialType): string {
  if (type === 'pdf') return '📄';
  if (type === 'ppt') return '📊';
  return '🎥';
}

function getMaterialLabel(type: MaterialType): string {
  if (type === 'video_link') return 'video link';
  if (type === 'yt_link') return 'youtube link';
  return type;
}

function StudentCourseWeekDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = Number(searchParams.get('courseId'));
  const weekNumber = Number(searchParams.get('week'));

  const [course, setCourse] = useState<CourseData | null>(null);
  const [week, setWeek] = useState<WeekData | null>(null);
  const [materials, setMaterials] = useState<MaterialData[]>([]);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Number.isInteger(courseId) || courseId <= 0 || !Number.isInteger(weekNumber) || weekNumber <= 0) {
      setError('Course atau week tidak valid.');
      setIsLoading(false);
      return;
    }

    const loadWeekDetail = async () => {
      try {
        setIsLoading(true);
        setIsLocked(false);
        setError('');

        const response = await api.get<WeekDetailPayload>(
          `/api/student/courses/${courseId}/weeks/${weekNumber}`
        );

        setCourse(response.data.data.course);
        setWeek(response.data.data.week);
        setMaterials(response.data.data.materials);
        setAssignments(response.data.data.assignments);
      } catch (requestError) {
        setCourse(null);
        setWeek(null);
        setMaterials([]);
        setAssignments([]);

        if (axios.isAxiosError(requestError) && requestError.response?.status === 403) {
          setIsLocked(
            requestError.response?.data?.message === 'Week ini belum dapat diakses.'
          );
        }

        setError(getErrorMessage(requestError, 'Gagal mengambil detail week.'));
      } finally {
        setIsLoading(false);
      }
    };

    void loadWeekDetail();
  }, [courseId, weekNumber]);

  const handleBack = () => {
    router.push(`/student/courses/details?courseId=${courseId}`);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading week detail...</div>;
  }

  if (!course || !week) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Week List
        </Button>

        <div className="bg-white rounded-3xl p-8 text-center border border-gray-200 shadow-sm">
          {isLocked && (
            <LockKeyhole className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          )}
          <p className={`text-lg font-medium ${isLocked ? 'text-gray-900' : 'text-red-500'}`}>
            {isLocked ? 'Week Belum Dapat Diakses' : 'Data week tidak tersedia'}
          </p>
          <p className="mt-2 text-gray-500">
            {error || 'Silakan kembali ke daftar week.'}
          </p>
        </div>
      </div>
    );
  }

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
          type="button"
          onClick={handleBack}
          className="mb-4 flex items-center text-sm text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Week List
        </button>
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="mt-2 text-white/70">Week {week.week_number}</p>
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
                    {getMaterialIcon(material.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{material.title}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {getMaterialLabel(material.type)}
                    </p>
                  </div>
                </div>

                <Button asChild className="bg-gradient-to-r from-[#0D542B] to-[#004F3B]">
                  <a
                    href={material.access_url}
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
                Belum ada materi untuk Week {week.week_number}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ASSIGNMENT */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>

        {assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const submitted = assignment.my_submission !== null;

              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {assignment.title}
                      </h4>
                      <p className="text-gray-600 mt-1">
                        {assignment.description || '-'}
                      </p>
                    </div>
                    {submitted && (
                      <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-2xl text-sm font-medium">
                        Submitted
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(assignment.start_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(assignment.end_date)}
                      </p>
                    </div>
                  </div>

                  {assignment.gdrive_submission_link && (
                    <div className="mt-6 rounded-2xl bg-amber-50 p-5 border border-amber-100">
                      <p className="mb-2 text-sm font-medium text-amber-700">
                        Link Pengumpulan Tugas
                      </p>
                      <a
                        href={assignment.gdrive_submission_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block break-all text-sm font-medium text-[#0D542B] hover:underline"
                      >
                        {assignment.gdrive_submission_link}
                      </a>
                      {assignment.submission_note && (
                        <p className="mt-4 border-t border-amber-200 pt-3 text-xs leading-relaxed text-amber-600">
                          {assignment.submission_note}
                        </p>
                      )}
                    </div>
                  )}

                  {!submitted && (
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
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-200">
            <p className="text-gray-500 italic">
              Belum ada assignment untuk Week {week.week_number}.
            </p>
          </div>
        )}
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
