'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Clock,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import AddStudentModal, {
  type InviteStudentPayload,
} from '@/components/professor/AddStudentModal';
import { api, csrf, getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export type StudentStatus = 'approved' | 'pending';

export type ProfessorStudent = {
  id: number;
  enrollmentId: number;
  name: string;
  nim: string;
  className: string | null;
  email: string;
  status: StudentStatus;
  course: string;
  courseId: number;
};

type ApiProfessorStudent = {
  id: number;
  enrollment_id: number;
  name: string;
  nim?: string | null;
  class_?: string | null;
  email: string;
  status: StudentStatus;
  course: string;
  courseId: number;
};

export default function ProfessorStudents() {
  const t = useTranslations('ProfessorStudents');

  const [students, setStudents] = useState<ProfessorStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<'all' | StudentStatus>('all');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get<{ students: ApiProfessorStudent[] }>(
        '/api/professor/students'
      );

      const mapped: ProfessorStudent[] = (data.students ?? []).map((student) => ({
        id: Number(student.id),
        enrollmentId: Number(student.enrollment_id),
        name: student.name,
        nim: student.nim ?? '',
        className: student.class_ ?? null,
        email: student.email,
        status: student.status,
        course: student.course,
        courseId: Number(student.courseId),
      }));

      setStudents(mapped);
    } catch (err) {
      toast.error(getErrorMessage(err, t('loadError')));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approvedCount = students.filter((student) => student.status === 'approved').length;
  const pendingCount = students.filter((student) => student.status === 'pending').length;

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const keyword = searchQuery.toLowerCase();
      const matchesSearch =
        student.name.toLowerCase().includes(keyword) ||
        student.nim.toLowerCase().includes(keyword) ||
        student.course.toLowerCase().includes(keyword);
      const matchesStatus = activeStatus === 'all' || student.status === activeStatus;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, activeStatus]);

  const handleApproveStudent = async (enrollmentId: number) => {
    try {
      await csrf();
      await api.post(`/api/professor/students/${enrollmentId}/approve`);

      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.enrollmentId === enrollmentId
            ? { ...student, status: 'approved' }
            : student
        )
      );

      toast.success(t('approveSuccess'));
    } catch (err) {
      toast.error(getErrorMessage(err, t('approveError')));
    }
  };

  const handleAddStudent = async (newStudentData: InviteStudentPayload) => {
    try {
      await csrf();

      const { data } = await api.post<{ message?: string }>(
        '/api/professor/students/enroll',
        {
          course_id: newStudentData.courseId,
          student_ids: [newStudentData.studentId],
        }
      );

      toast.success(data.message ?? t('addSuccess'));
      setShowAddStudentModal(false);
      await fetchStudents();
    } catch (err) {
      const message = getErrorMessage(err, t('addError'));
      toast.error(message);
      throw new Error(message);
    }
  };

  const getInitialName = (name: string) => {
    return name
      .split(' ')
      .map((item) => item.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500">{t('subtitle')}</p>
        </div>
        <Button
          onClick={() => setShowAddStudentModal(true)}
          className="bg-[#0D542B] hover:bg-[#0A3F21]"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {t('inviteStudent')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('totalStudents')}</p>
            <Users className="h-5 w-5 text-[#0D542B]" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {students.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('approved')}</p>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {approvedCount}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t('pending')}</p>
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {pendingCount}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('allStudents', { count: filteredStudents.length })}
            </h2>
            <p className="text-sm text-gray-500">
              {t('manageByEnrollment')}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full rounded-xl border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B] sm:w-72"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setActiveStatus('all')}>
                <Badge
                  variant={activeStatus === 'all' ? 'default' : 'outline'}
                  className={
                    activeStatus === 'all'
                      ? 'bg-[#0D542B] text-white hover:bg-[#0D542B]'
                      : 'cursor-pointer'
                  }
                >
                  {t('all')}
                </Badge>
              </button>
              <button type="button" onClick={() => setActiveStatus('approved')}>
                <Badge
                  variant={activeStatus === 'approved' ? 'default' : 'secondary'}
                  className={
                    activeStatus === 'approved'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-600'
                      : 'cursor-pointer bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                  }
                >
                  {t('approved')}
                </Badge>
              </button>
              <button type="button" onClick={() => setActiveStatus('pending')}>
                <Badge
                  variant={activeStatus === 'pending' ? 'default' : 'outline'}
                  className={
                    activeStatus === 'pending'
                      ? 'bg-amber-500 text-white hover:bg-amber-500'
                      : 'cursor-pointer border-amber-300 text-amber-700'
                  }
                >
                  {t('pending')}
                </Badge>
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-gray-500">{t('loading')}</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <h3 className="font-semibold text-gray-900">{t('emptyTitle')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('emptyDescription')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <div
                key={student.enrollmentId}
                className="flex flex-col gap-4 p-6 transition-colors hover:bg-gray-50 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0D542B]/10 font-medium text-[#0D542B]">
                    {getInitialName(student.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">
                      {student.nim} • {student.course}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {student.status === 'approved' ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {t('approved')}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      <Clock className="mr-1 h-3 w-3" />
                      {t('pending')}
                    </Badge>
                  )}
                  {student.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleApproveStudent(student.enrollmentId)}
                      className="bg-[#0D542B] hover:bg-[#0A3F21]"
                    >
                      {t('approve')}
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    {t('detail')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddStudentModal && (
        <AddStudentModal
          onClose={() => setShowAddStudentModal(false)}
          onAddStudent={handleAddStudent}
        />
      )}
    </div>
  );
}
