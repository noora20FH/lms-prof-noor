'use client';

import axios from 'axios';
import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { api, csrf, getErrorMessage } from '@/lib/api';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Link2,
  Loader2,
  LockKeyhole,
} from 'lucide-react';

type MaterialType = 'pdf' | 'ppt' | 'video_link' | 'yt_link'| 'presensi_link';

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
  content_url: string | null;
};

type SubmissionData = {
  id: number;
  file_url?: string | null;
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

type SubmitAssignmentPayload = {
  message: string;
  data: SubmissionData;
};

type AssignmentAvailability = 'open' | 'not_started' | 'closed';

function formatDate(value: string | null): string {
  if (!value) return '-';

  return new Intl.DateTimeFormat("id-ID", {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value));
}

function formatDateTime(value: string | null): string {
  if (!value) return '-';

  return new Intl.DateTimeFormat("id-ID", {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value));
}

function getMaterialIcon(type: MaterialType): string {
  if (type === 'pdf') return '📄';
  if (type === 'ppt') return '📊';
  if (type === 'video_link') return '🎬'
  if (type === 'yt_link') return '🎬';
  if (type === 'presensi_link') return '👥';
  return '📄';
}

function getAssignmentAvailability(assignment: AssignmentData): AssignmentAvailability {
  const now = new Date();

  if (assignment.start_date && now < new Date(assignment.start_date)) {
    return 'not_started';
  }

  if (assignment.end_date) {
    const deadline = new Date(assignment.end_date);
    deadline.setHours(23, 59, 59, 999);

    if (now > deadline) {
      return 'closed';
    }
  }

  return 'open';
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
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
  const [submissionLinks, setSubmissionLinks] = useState<Record<number, string>>({});
  const [submissionErrors, setSubmissionErrors] = useState<Record<number, string>>({});
  const [submissionMessages, setSubmissionMessages] = useState<Record<number, string>>({});
  const [submittingAssignmentId, setSubmittingAssignmentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Number.isInteger(courseId) || courseId <= 0 || !Number.isInteger(weekNumber) || weekNumber <= 0) {
      setError("ID kelas atau minggu tidak valid.");
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

        setError(getErrorMessage(requestError, "Gagal memuat materi minggu ini."));
      } finally {
        setIsLoading(false);
      }
    };

    void loadWeekDetail();
  }, [courseId, weekNumber]);

  const handleBack = () => {
    router.push(`/id/student/courses/details?courseId=${courseId}`);
  };

  const handleSubmitAssignment = async (
    event: FormEvent<HTMLFormElement>,
    assignmentId: number
  ) => {
    event.preventDefault();

    const linkUrl = (submissionLinks[assignmentId] ?? '').trim();

    setSubmissionErrors((current) => ({ ...current, [assignmentId]: '' }));
    setSubmissionMessages((current) => ({ ...current, [assignmentId]: '' }));

    if (!linkUrl) {
      setSubmissionErrors((current) => ({
        ...current,
        [assignmentId]: "Tautan pengumpulan wajib diisi.",
      }));
      return;
    }

    if (!isValidHttpUrl(linkUrl)) {
      setSubmissionErrors((current) => ({
        ...current,
        [assignmentId]: "Masukkan tautan yang valid.",
      }));
      return;
    }

    try {
      setSubmittingAssignmentId(assignmentId);
      await csrf();

      const response = await api.post<SubmitAssignmentPayload>(
        `/api/student/assignments/${assignmentId}/submission`,
        { link_url: linkUrl }
      );

      setAssignments((current) =>
        current.map((assignment) =>
          assignment.id === assignmentId
            ? { ...assignment, my_submission: response.data.data }
            : assignment
        )
      );
      setSubmissionLinks((current) => ({ ...current, [assignmentId]: '' }));
      setSubmissionMessages((current) => ({
        ...current,
        [assignmentId]: response.data.message,
      }));
    } catch (requestError) {
      setSubmissionErrors((current) => ({
        ...current,
        [assignmentId]: getErrorMessage(requestError, "Gagal mengumpulkan tugas."),
      }));
    } finally {
      setSubmittingAssignmentId(null);
    }
  };

  const getMaterialLabel = (type: MaterialType): string => {
    return ({ pdf: "PDF", ppt: "PPT", video_link: "Video", yt_link: "YouTube", presensi_link: "Link Presensi" }[type] ?? type);
  };

  if (isLoading) {
    return <div className="p-8 text-center">{"Memuat..."}</div>;
  }

  if (!course || !week) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {"Kembali ke Daftar Minggu"}
        </Button>

        <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          {isLocked && (
            <LockKeyhole className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          )}
          <p className={`text-lg font-medium ${isLocked ? 'text-gray-900' : 'text-red-500'}`}>
            {isLocked ? "Minggu ini masih terkunci" : "Data minggu belum tersedia"}
          </p>
          <p className="mt-2 text-gray-500">
            {error || "Silakan kembali ke daftar minggu pembelajaran."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          {"Kembali ke Daftar Minggu"}
        </button>
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="mt-2 text-white/70">
          {`Minggu ${week.week_number}`}
        </p>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {"Materi"}
        </h3>
        <div className="space-y-3">
          {materials.length > 0 ? (
            materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between rounded-3xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
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

                {material.content_url && isValidHttpUrl(material.content_url) ? (
                  <Button
                    asChild
                    className="bg-gradient-to-r from-[#0D542B] to-[#004F3B]"
                  >
                    <a
                      href={material.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {"Buka"}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <Button disabled>
                    Link tidak tersedia
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-500 italic">
                {`Belum ada materi untuk Minggu ${week.week_number}.`}
              </p>
            </div>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          {"Tugas"}
        </h3>

        {assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const submission = assignment.my_submission;
              const availability = getAssignmentAvailability(assignment);
              const isSubmitting = submittingAssignmentId === assignment.id;

              return (
                <div
                  key={assignment.id}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {assignment.title}
                      </h4>
                      <p className="mt-1 text-gray-600">
                        {assignment.description || '-'}
                      </p>
                    </div>

                    {submission && (
                      <span className={`w-fit rounded-2xl px-4 py-1 text-sm font-medium ${
                        submission.status === 'graded'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                      >
                        {submission.status === 'graded' ? "Sudah Dinilai" : "Sudah Dikumpulkan"}
                      </span>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-gray-500">{"Mulai"}</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(assignment.start_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">{"Batas Waktu"}</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(assignment.end_date)}
                      </p>
                    </div>
                  </div>

                  {assignment.gdrive_submission_link && (
                    <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-5">
                      <p className="mb-2 text-sm font-medium text-amber-700">
                        {"Link"}
                      </p>
                      <a
                        href={assignment.gdrive_submission_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center break-all text-sm font-medium text-[#0D542B] hover:underline"
                      >
                        {"Buka Google Drive"}
                        <ExternalLink className="ml-2 h-4 w-4 shrink-0" />
                      </a>
                      {assignment.submission_note && (
                        <p className="mt-4 border-t border-amber-200 pt-3 text-xs leading-relaxed text-amber-700">
                          {assignment.submission_note}
                        </p>
                      )}
                    </div>
                  )}

                  {submission ? (
                    <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-emerald-800">
                            {"Tugas sudah dikumpulkan"}
                          </p>
                          <p className="mt-1 text-sm text-emerald-700">
                            {formatDateTime(submission.submitted_at)} {"WIB"}
                          </p>

                          {submission.link_url && (
                            <a
                              href={submission.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 inline-flex max-w-full items-center break-all text-sm font-medium text-[#0D542B] hover:underline"
                            >
                              <Link2 className="mr-2 h-4 w-4 shrink-0" />
                              {submission.link_url}
                            </a>
                          )}

                          {submission.status === 'graded' && (
                            <div className="mt-4 border-t border-emerald-200 pt-4">
                              <p className="text-sm text-emerald-700">
                                {"Nilai"}: <span className="font-semibold">{submission.score ?? '-'}</span>
                              </p>
                              {submission.feedback && (
                                <p className="mt-2 text-sm text-emerald-700">
                                  {"Umpan balik"}: {submission.feedback}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : availability === 'open' ? (
                    <form
                      onSubmit={(event) => handleSubmitAssignment(event, assignment.id)}
                      className="mt-8 space-y-4 border-t border-gray-200 pt-6"
                    >
                      <div>
                        <label
                          htmlFor={`submission-link-${assignment.id}`}
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          {"Tautan Tugas"}
                        </label>
                        <div className="relative">
                          <Link2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            id={`submission-link-${assignment.id}`}
                            type="url"
                            value={submissionLinks[assignment.id] ?? ''}
                            onChange={(event) => {
                              const value = event.target.value;
                              setSubmissionLinks((current) => ({
                                ...current,
                                [assignment.id]: value,
                              }));
                              setSubmissionErrors((current) => ({
                                ...current,
                                [assignment.id]: '',
                              }));
                            }}
                            placeholder="https://drive.google.com/..."
                            className="w-full rounded-2xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {"Pastikan tautan dapat diakses oleh dosen."}
                        </p>
                      </div>

                      {submissionErrors[assignment.id] && (
                        <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{submissionErrors[assignment.id]}</span>
                        </div>
                      )}

                      {submissionMessages[assignment.id] && (
                        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                          <span>{submissionMessages[assignment.id]}</span>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting || !(submissionLinks[assignment.id] ?? '').trim()}
                        className="h-12 w-full bg-gradient-to-r from-[#0D542B] to-[#004F3B] text-base"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {"Mengumpulkan..."}
                          </>
                        ) : (
                          "Kumpulkan Tugas"
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="mt-8 flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {availability === 'not_started'
                            ? "Pengumpulan belum dibuka"
                            : "Pengumpulan sudah ditutup"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {availability === 'not_started'
                            ? `Pengumpulan dibuka pada ${formatDate(assignment.start_date)}`
                            : `Pengumpulan ditutup pada ${formatDate(assignment.end_date)}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center">
            <p className="text-gray-500 italic">
              {`Belum ada tugas untuk Minggu ${week.week_number}.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentCourseWeekDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">{"Memuat..."}</div>}>
      <StudentCourseWeekDetailContent />
    </Suspense>
  );
}
