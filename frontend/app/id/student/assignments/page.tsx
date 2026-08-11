'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api, getErrorMessage } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/navigation';

interface AssignmentItem {
  id: number;
  title: string;
  course: string;
  courseId: number;
  week: number;
  dueDate: string;
  daysLeft: number;
  status: 'pending' | 'submitted' | 'graded';
  submittedDate?: string | null;
  score?: number | null;
}

export default function StudentAssignments() {
  const t = useTranslations('StudentAssignments');
  const router = useRouter();

  const [pending, setPending] = useState<AssignmentItem[]>([]);
  const [submitted, setSubmitted] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get<{
          pending: AssignmentItem[];
          submitted: AssignmentItem[];
        }>('/api/student/assignments');

        setPending(res.data.pending || []);
        setSubmitted(res.data.submitted || []);
      } catch (err) {
        setError(getErrorMessage(err, t('loadError')));
        setPending([]);
        setSubmitted([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchAssignments();
  }, [t]);

  const handleSubmitNow = (courseId: number, week: number) => {
    router.push(`/student/courses/details/week?courseId=${courseId}&week=${week}`);
  };

  const renderHeader = () => (
    <div
      className="rounded-3xl p-8 text-white"
      style={{
        background:
          'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)',
      }}
    >
      <h1 className="text-4xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-emerald-200">{t('subtitle')}</p>
    </div>
  );

  const getDaysLeftText = (daysLeft: number) => {
    if (daysLeft < 0) {
      return t('overdue', { days: Math.abs(daysLeft) });
    }

    if (daysLeft === 0) {
      return t('dueToday');
    }

    return t('daysLeft', { days: daysLeft });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {renderHeader()}
        <div className="flex justify-center py-12">
          <p className="text-gray-500">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        {renderHeader()}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {renderHeader()}

      <div>
        <h3 className="mb-6 text-2xl font-semibold text-gray-900">
          {t('pendingTitle', { count: pending.length })}
        </h3>
        <div className="space-y-4">
          {pending.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center text-gray-500">
                {t('noPending')}
              </CardContent>
            </Card>
          ) : (
            pending.map((assignment) => (
              <Card
                key={assignment.id}
                className="border-0 shadow-sm transition-shadow hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-semibold">
                        {assignment.title}
                      </h4>
                      <p className="text-gray-500">{assignment.course}</p>
                    </div>
                    <span
                      className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                        assignment.daysLeft < 0
                          ? 'bg-red-600 text-white shadow-sm'
                          : assignment.daysLeft <= 3
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {getDaysLeftText(assignment.daysLeft)}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      {t('due')}: <span className="font-medium">{assignment.dueDate}</span>
                    </p>
                    <Button
                      onClick={() => handleSubmitNow(assignment.courseId, assignment.week)}
                      className="bg-[#0D542B] px-8 hover:bg-[#0D542B]/90"
                    >
                      {t('submitNow')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-6 text-2xl font-semibold text-gray-900">
          {t('submittedTitle', { count: submitted.length })}
        </h3>
        <div className="space-y-4">
          {submitted.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center text-gray-500">
                {t('noSubmitted')}
              </CardContent>
            </Card>
          ) : (
            submitted.map((assignment) => (
              <Card key={assignment.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xl font-semibold">
                        {assignment.title}
                      </h4>
                      <p className="text-gray-500">{assignment.course}</p>
                    </div>
                    <span className="rounded-2xl bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">
                      {t('submittedBadge')}
                    </span>
                  </div>
                  {assignment.submittedDate && (
                    <p className="mt-4 text-sm text-gray-600">
                      {t('submittedOn')}: <span className="font-medium">{assignment.submittedDate}</span>
                    </p>
                  )}
                  {assignment.score && (
                    <p className="mt-1 text-sm text-emerald-600">
                      {t('score')}: <span className="font-bold">{assignment.score}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
