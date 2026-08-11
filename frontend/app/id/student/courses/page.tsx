'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen } from 'lucide-react';
import { api, csrf, getErrorMessage } from '@/lib/api';

type EnrollmentStatus = 'pending' | 'approved' | null;

type StudentCourse = {
  id: number;
  title: string;
  code: string | null;
  description: string;
  professor: string | null;
  status: 'active';
  capacity: number;
  approved_students_count: number;
  total_weeks: number;
  accessible_weeks_count: number;
  progress: number;
  enrollment_id: number | null;
  enrollment_status: EnrollmentStatus;
  has_previous_enrollment: boolean;
  is_full: boolean;
};

type CoursesResponse = {
  courses: StudentCourse[];
};

export default function StudentCoursesPage() {
  const t = useTranslations('StudentCourses');
  const router = useRouter();

  const [courses, setCourses] = useState<StudentCourse[]>([]);
  const [showBrowseCourses, setShowBrowseCourses] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingCourseId, setProcessingCourseId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await api.get<CoursesResponse>('/api/student/courses');
      setCourses(response.data.courses ?? []);
    } catch (requestError) {
      setCourses([]);
      setError(getErrorMessage(requestError, t('loadError')));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  const myCourses = useMemo(
    () => courses.filter((course) => course.enrollment_status !== null),
    [courses]
  );

  const displayedCourses = showBrowseCourses ? courses : myCourses;

  const submitEnrollmentAction = async (
    course: StudentCourse,
    action: 'create' | 'update' | 'delete'
  ) => {
    try {
      setProcessingCourseId(course.id);
      await csrf();

      const endpoint = `/api/student/courses/${course.id}/enrollment`;

      if (action === 'create') {
        await api.post(endpoint);
      } else if (action === 'update') {
        await api.patch(endpoint);
      } else {
        await api.delete(endpoint);
      }

      await loadCourses();
    } catch (requestError) {
      window.alert(getErrorMessage(requestError, t('enrollmentError')));
    } finally {
      setProcessingCourseId(null);
    }
  };

  const handleCourseAction = async (course: StudentCourse) => {
    if (course.enrollment_status === 'approved') {
      router.push(`/student/courses/details?courseId=${course.id}`);
      return;
    }

    if (course.enrollment_status === 'pending') {
      const confirmed = window.confirm(
        t('confirmCancelEnrollment', { title: course.title })
      );

      if (confirmed) {
        await submitEnrollmentAction(course, 'delete');
      }
      return;
    }

    if (course.has_previous_enrollment) {
      await submitEnrollmentAction(course, 'update');
      return;
    }

    await submitEnrollmentAction(course, 'create');
  };

  const getCourseActionLabel = (course: StudentCourse): string => {
    if (processingCourseId === course.id) {
      return t('actions.processing');
    }

    if (course.enrollment_status === 'approved') {
      return t('actions.continueLearning');
    }

    if (course.enrollment_status === 'pending') {
      return t('actions.cancelRequest');
    }

    if (course.is_full) {
      return t('actions.courseFull');
    }

    if (course.has_previous_enrollment) {
      return t('actions.requestAgain');
    }

    return t('actions.enrollCourse');
  };

  const getCourseStatusLabel = (course: StudentCourse): string => {
    if (course.enrollment_status === 'approved') {
      return t('status.ongoing');
    }

    if (course.enrollment_status === 'pending') {
      return t('status.pending');
    }

    return course.is_full ? t('status.full') : t('status.available');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {showBrowseCourses ? t('browseTitle') : t('myCoursesTitle')}
          </h1>
          <p className="text-gray-500">
            {showBrowseCourses ? t('browseSubtitle') : t('myCoursesSubtitle')}
          </p>
        </div>
        <Button
          className="bg-[#0D542B]"
          onClick={() => setShowBrowseCourses((currentValue) => !currentValue)}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          {showBrowseCourses ? t('myCoursesTitle') : t('browseTitle')}
        </Button>
      </div>

      {isLoading && (
        <div className="py-10 text-center text-gray-500">
          {t('loading')}
        </div>
      )}

      {!isLoading && error && (
        <div className="py-10 text-center text-red-500">{error}</div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedCourses.map((course) => (
            <Card key={course.id} className="border-gray-200 transition-all hover:shadow-xl">
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-600">{t('progress')}</span>
                      <span className="font-semibold text-[#0D542B]">
                        {course.progress}%
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {t('studentsCapacity', {
                        approved: course.approved_students_count,
                        capacity: course.capacity,
                      })}
                    </span>
                    <span className="font-medium text-emerald-600">
                      {getCourseStatusLabel(course)}
                    </span>
                  </div>

                  <Button
                    onClick={() => void handleCourseAction(course)}
                    disabled={
                      processingCourseId === course.id ||
                      (course.enrollment_status === null && course.is_full)
                    }
                    className="w-full bg-[#0D542B] hover:bg-[#0A3F21]"
                  >
                    {getCourseActionLabel(course)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {displayedCourses.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-500">
              {showBrowseCourses ? t('emptyBrowse') : t('emptyMyCourses')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
