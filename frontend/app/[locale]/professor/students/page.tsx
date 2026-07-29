'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import AddStudentModal, {
  type InviteStudentPayload,
} from '@/components/professor/AddStudentModal';
import { api, csrf, getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export type StudentStatus = 'approved' | 'pending';
type StudentView = 'active' | 'deleted';

export type ProfessorStudent = {
  id: number;
  enrollmentId: number;
  name: string;
  nim: string;
  class_: string | null;
  email: string;
  status: StudentStatus;
  course: string;
  courseId: number;
  deletedAt: string | null;
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
  deleted_at?: string | null;
};

type StudentsResponse = {
  students: ApiProfessorStudent[];
  total?: number;
};

function mapStudent(student: ApiProfessorStudent): ProfessorStudent {
  return {
    id: Number(student.id),
    enrollmentId: Number(student.enrollment_id),
    name: student.name,
    nim: student.nim ?? '',
    class_: student.class_ ?? null,
    email: student.email,
    status: student.status,
    course: student.course,
    courseId: Number(student.courseId),
    deletedAt: student.deleted_at ?? null,
  };
}

export default function ProfessorStudents() {
  const t = useTranslations('ProfessorStudents');

  const [students, setStudents] = useState<ProfessorStudent[]>([]);
  const [deletedStudents, setDeletedStudents] = useState<ProfessorStudent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<'all' | StudentStatus>('all');
  const [studentView, setStudentView] = useState<StudentView>('active');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<ProfessorStudent | null>(null);
  const [processingEnrollmentId, setProcessingEnrollmentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);

      const [activeResponse, deletedResponse] = await Promise.all([
        api.get<StudentsResponse>('/api/professor/students'),
        api.get<StudentsResponse>('/api/professor/students/trashed'),
      ]);

      setStudents((activeResponse.data.students ?? []).map(mapStudent));
      setDeletedStudents((deletedResponse.data.students ?? []).map(mapStudent));
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
    const source = studentView === 'active' ? students : deletedStudents;
    const keyword = searchQuery.trim().toLowerCase();

    return source.filter((student) => {
      const matchesSearch =
        !keyword ||
        student.name.toLowerCase().includes(keyword) ||
        student.nim.toLowerCase().includes(keyword) ||
        student.email.toLowerCase().includes(keyword) ||
        student.course.toLowerCase().includes(keyword);

      const matchesStatus =
        studentView === 'deleted' ||
        activeStatus === 'all' ||
        student.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [students, deletedStudents, searchQuery, activeStatus, studentView]);

  const handleApproveStudent = async (enrollmentId: number) => {
    try {
      setProcessingEnrollmentId(enrollmentId);
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
    } finally {
      setProcessingEnrollmentId(null);
    }
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;

    try {
      setProcessingEnrollmentId(studentToDelete.enrollmentId);
      await csrf();
      await api.delete(`/api/professor/students/${studentToDelete.enrollmentId}`);

      toast.success(
        `${studentToDelete.name} berhasil dihapus dari ${studentToDelete.course}.`
      );
      setStudentToDelete(null);
      await fetchStudents();
    } catch (err) {
      toast.error(
        getErrorMessage(err, 'Data mahasiswa gagal dihapus. Silakan coba kembali.')
      );
    } finally {
      setProcessingEnrollmentId(null);
    }
  };

  const handleRestoreStudent = async (student: ProfessorStudent) => {
    try {
      setProcessingEnrollmentId(student.enrollmentId);
      await csrf();
      await api.patch(`/api/professor/students/${student.enrollmentId}/restore`);

      toast.success(`${student.name} berhasil dipulihkan ke ${student.course}.`);
      await fetchStudents();
    } catch (err) {
      toast.error(
        getErrorMessage(err, 'Data mahasiswa gagal dipulihkan. Silakan coba kembali.')
      );
    } finally {
      setProcessingEnrollmentId(null);
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
      setStudentView('active');
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

  const formatDeletedAt = (value: string | null) => {
    if (!value) return '-';

    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        <button
          type="button"
          onClick={() => setStudentView('deleted')}
          className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-red-200 hover:bg-red-50/40"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Data terhapus</p>
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {deletedStudents.length}
          </p>
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="mb-5 flex w-fit rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setStudentView('active')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                studentView === 'active'
                  ? 'bg-white text-[#0D542B] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Mahasiswa aktif ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setStudentView('deleted')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                studentView === 'deleted'
                  ? 'bg-white text-red-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Data terhapus ({deletedStudents.length})
            </button>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {studentView === 'active'
                  ? t('allStudents', { count: filteredStudents.length })
                  : `Data mahasiswa terhapus (${filteredStudents.length})`}
              </h2>
              <p className="text-sm text-gray-500">
                {studentView === 'active'
                  ? t('manageByEnrollment')
                  : 'Data di bawah masih tersimpan dan dapat dipulihkan kembali.'}
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

              {studentView === 'active' && (
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
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-gray-500">{t('loading')}</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-10 text-center">
            {studentView === 'active' ? (
              <Users className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            ) : (
              <Trash2 className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            )}
            <h3 className="font-semibold text-gray-900">
              {studentView === 'active' ? t('emptyTitle') : 'Belum ada data terhapus'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {studentView === 'active'
                ? t('emptyDescription')
                : 'Mahasiswa yang dihapus dari mata kuliah akan tampil di sini.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <div
                key={student.enrollmentId}
                className={`flex flex-col gap-4 p-6 transition-colors md:flex-row md:items-center md:justify-between ${
                  studentView === 'deleted'
                    ? 'bg-gray-50/60 hover:bg-gray-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl font-medium ${
                      studentView === 'deleted'
                        ? 'bg-gray-200 text-gray-600'
                        : 'bg-[#0D542B]/10 text-[#0D542B]'
                    }`}
                  >
                    {getInitialName(student.name)}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">{student.name}</p>
                    <p className="text-sm text-gray-500">
                      {student.nim || '-'} • {student.class_ || '-'} • {student.email} •{' '}
                      {student.course}
                    </p>
                    {studentView === 'deleted' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Dihapus pada {formatDeletedAt(student.deletedAt)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {studentView === 'deleted' ? (
                    <>
                      <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">
                        <Trash2 className="mr-1 h-3 w-3" />
                        Dihapus
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processingEnrollmentId === student.enrollmentId}
                        onClick={() => void handleRestoreStudent(student)}
                        className="border-[#0D542B] text-[#0D542B] hover:bg-[#0D542B]/5"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {processingEnrollmentId === student.enrollmentId
                          ? 'Memulihkan...'
                          : 'Recovery'}
                      </Button>
                    </>
                  ) : (
                    <>
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
                          disabled={processingEnrollmentId === student.enrollmentId}
                          onClick={() => void handleApproveStudent(student.enrollmentId)}
                          className="bg-[#0D542B] hover:bg-[#0A3F21]"
                        >
                          {processingEnrollmentId === student.enrollmentId
                            ? 'Memproses...'
                            : t('approve')}
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        disabled={processingEnrollmentId === student.enrollmentId}
                        onClick={() => setStudentToDelete(student)}
                        className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50 hover:text-red-800"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  )}
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

      {studentToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && processingEnrollmentId === null) {
              setStudentToDelete(null);
            }
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-student-title"
            aria-describedby="delete-student-description"
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <button
                type="button"
                aria-label="Tutup konfirmasi"
                disabled={processingEnrollmentId !== null}
                onClick={() => setStudentToDelete(null)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5">
              <h3 id="delete-student-title" className="text-xl font-semibold text-gray-900">
                Hapus mahasiswa dari mata kuliah?
              </h3>
              <p id="delete-student-description" className="mt-2 text-sm leading-6 text-gray-600">
                Tindakan ini akan menghapus akses mahasiswa pada mata kuliah terkait.
                Data tidak dihapus permanen dan masih dapat dipulihkan melalui menu
                <strong> Data terhapus</strong>.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm font-semibold text-gray-900">{studentToDelete.name}</p>
              <dl className="mt-3 grid grid-cols-[90px_1fr] gap-x-3 gap-y-2 text-sm">
                <dt className="text-gray-500">NIM</dt>
                <dd className="font-medium text-gray-800">{studentToDelete.nim || '-'}</dd>
                <dt className="text-gray-500">Kelas</dt>
                <dd className="font-medium text-gray-800">{studentToDelete.class_ || '-'}</dd>
                <dt className="text-gray-500">Email</dt>
                <dd className="break-all font-medium text-gray-800">{studentToDelete.email}</dd>
                <dt className="text-gray-500">Mata kuliah</dt>
                <dd className="font-medium text-gray-800">{studentToDelete.course}</dd>
              </dl>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                disabled={processingEnrollmentId !== null}
                onClick={() => setStudentToDelete(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={processingEnrollmentId !== null}
                onClick={() => void handleDeleteStudent()}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {processingEnrollmentId === studentToDelete.enrollmentId
                  ? 'Menghapus...'
                  : 'Ya, hapus mahasiswa'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
