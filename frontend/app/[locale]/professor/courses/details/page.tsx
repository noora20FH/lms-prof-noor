'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { api, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, BookOpen, ClipboardList, Users } from 'lucide-react';

type CourseDetail = {
  id: string;
  title: string;
  description: string;
  capacity: number;
  total_students: number;
  total_weeks: number;
  approved_students_count: number;
};

type CourseWeek = {
  id: number;
  course_id: number;
  week_number: number;
  title: string;
  materials_count: number;
  assignments_count: number;
};

type CourseDetailResponse = {
  course: CourseDetail;
  weeks: CourseWeek[];
  stats: {
    approved_students_count: number;
    assignments_count: number;
    total_weeks: number;
  };
};

function CourseDetailContent() {
  const t = useTranslations('ProfessorCourseDetail');
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get('courseId') ?? '1';

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [weeks, setWeeks] = useState<CourseWeek[]>([]);
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const [approvedStudentsCount, setApprovedStudentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourseDetail = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await api.get<CourseDetailResponse>(
          `/api/professor/courses/${courseId}/details`
        );

        setCourse(response.data.course);
        setWeeks(response.data.weeks);
        setAssignmentsCount(response.data.stats.assignments_count);
        setApprovedStudentsCount(response.data.stats.approved_students_count);
      } catch (error) {
        setCourse(null);
        setError(getErrorMessage(error, t('loadError')));
      } finally {
        setIsLoading(false);
      }
    };

    void loadCourseDetail();
  }, [courseId, t]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          {t('loading')}
        </CardContent>
      </Card>
    );
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push('/professor/courses')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </Button>

        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('courseNotFound')}
            </h2>
            <p className="mt-2 text-gray-500">
              {error || t('courseNotFoundDescription')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleWeekSelect = (week: number) => {
    router.push(
      `/professor/courses/details/week?courseId=${course.id}&week=${week}`
    );
  };

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
          onClick={() => router.push('/professor/courses')}
          className="mb-4 flex items-center text-sm text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('back')}
        </button>

        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="mt-2 max-w-2xl text-white/80">{course.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('registeredStudents')}
            </CardTitle>
            <Users className="h-5 w-5 text-emerald-700" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {approvedStudentsCount}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {t('studentsFromTotal', {
                total: course.total_students ?? course.capacity,
              })}
            </p>
            <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-2.5 rounded-full bg-emerald-600 transition-all"
                style={{
                  width: `${
                    course.total_students > 0
                      ? (approvedStudentsCount / course.total_students) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('totalWeeks')}
            </CardTitle>
            <BookOpen className="h-5 w-5 text-emerald-700" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {course.total_weeks}
            </div>
            <p className="mt-1 text-sm text-gray-500">{t('weeksDescription')}</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm transition-shadow hover:shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t('assignments')}
            </CardTitle>
            <ClipboardList className="h-5 w-5 text-emerald-700" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">
              {assignmentsCount}
            </div>
            <p className="mt-1 text-sm text-gray-500">{t('assignmentsDescription')}</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          {t('courseWeeks')}
        </h2>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {weeks.map((week) => {
            const materialCount = week.materials_count;
            const assignmentCount = week.assignments_count;

            return (
              <button
                key={week.week_number}
                onClick={() => handleWeekSelect(week.week_number)}
                className="flex w-full items-center justify-between border-b border-gray-200 p-4 text-left transition-colors last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D542B] to-[#004F3B] font-semibold text-white">
                    {week.week_number}
                  </div>

                  <div>
                    <p className="font-medium text-gray-900">
                      {week.title || t('weekTitle', { week: week.week_number })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('weekMeta', {
                        materials: materialCount,
                        assignments: assignmentCount,
                      })}
                    </p>
                  </div>
                </div>

                <span className="text-xl text-gray-400">→</span>
              </button>
            );
          })}

          {weeks.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {t('emptyWeeks')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailPage() {
  const t = useTranslations('ProfessorCourseDetail');

  return (
    <Suspense fallback={<div>{t('loading')}</div>}>
      <CourseDetailContent />
    </Suspense>
  );
}
