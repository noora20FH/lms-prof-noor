'use client';

import { useEffect, useState } from 'react';
import { api, getErrorMessage } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";

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
        setError(getErrorMessage(err, "Gagal memuat tugas."));
        setPending([]);
        setSubmitted([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchAssignments();
  }, []);

  const handleSubmitNow = (courseId: number, week: number) => {
    router.push(`/id/student/courses/details/week?courseId=${courseId}&week=${week}`);
  };

  const renderHeader = () => (
    <div
      className="rounded-3xl p-8 text-white"
      style={{
        background:
          'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)',
      }}
    >
      <h1 className="text-4xl font-bold">{"Tugas"}</h1>
      <p className="mt-2 text-emerald-200">{"Pantau dan selesaikan tugas Anda tepat waktu."}</p>
    </div>
  );

  const getDaysLeftText = (daysLeft: number) => {
    if (daysLeft < 0) {
      return `${Math.abs(daysLeft)} hari terlambat`;
    }

    if (daysLeft === 0) {
      return "Jatuh tempo hari ini";
    }

    return `${daysLeft} hari lagi`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {renderHeader()}
        <div className="flex justify-center py-12">
          <p className="text-gray-500">{"Memuat..."}</p>
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
          {`Tugas Belum Dikumpulkan (${pending.length})`}
        </h3>
        <div className="space-y-4">
          {pending.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center text-gray-500">
                {"Tidak ada tugas yang perlu dikumpulkan."}
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
                      {"Batas waktu"}: <span className="font-medium">{assignment.dueDate}</span>
                    </p>
                    <Button
                      onClick={() => handleSubmitNow(assignment.courseId, assignment.week)}
                      className="bg-[#0D542B] px-8 hover:bg-[#0D542B]/90"
                    >
                      {"Kumpulkan Sekarang"}
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
          {`Tugas Terkumpul (${submitted.length})`}
        </h3>
        <div className="space-y-4">
          {submitted.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center text-gray-500">
                {"Belum ada tugas yang dikumpulkan."}
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
                      {"Sudah dikumpulkan"}
                    </span>
                  </div>
                  {assignment.submittedDate && (
                    <p className="mt-4 text-sm text-gray-600">
                      {"Dikumpulkan pada"}: <span className="font-medium">{assignment.submittedDate}</span>
                    </p>
                  )}
                  {assignment.score && (
                    <p className="mt-1 text-sm text-emerald-600">
                      {"Nilai"}: <span className="font-bold">{assignment.score}</span>
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
