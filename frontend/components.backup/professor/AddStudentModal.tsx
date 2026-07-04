'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, UserPlus, X } from 'lucide-react';
import { api, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';

export type InviteStudentPayload = {
  courseId: number;
  studentId: number;
};

type AddStudentModalProps = {
  onClose: () => void;
  onAddStudent: (payload: InviteStudentPayload) => Promise<void>;
};

type ProfessorCourse = {
  id: string | number;
  title: string;
  status?: 'active' | 'disabled';
};

type AvailableStudent = {
  id: number;
  name: string;
  nim?: string | null;
  class_?: string | null;
  email: string;
};

export default function AddStudentModal({
  onClose,
  onAddStudent,
}: AddStudentModalProps) {
  const [courses, setCourses] = useState<ProfessorCourse[]>([]);
  const [students, setStudents] = useState<AvailableStudent[]>([]);
  const [courseId, setCourseId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoadingCourses(true);
        setError('');

        const { data } = await api.get<{ courses: ProfessorCourse[] }>(
          '/api/professor/courses'
        );

        const activeCourses = (data.courses ?? []).filter(
          (course) => course.status !== 'disabled'
        );

        setCourses(activeCourses);

        if (activeCourses.length > 0) {
          setCourseId(String(activeCourses[0].id));
        }
      } catch (loadError) {
        setError(getErrorMessage(loadError, 'Gagal memuat mata kuliah.'));
      } finally {
        setIsLoadingCourses(false);
      }
    };

    void loadCourses();
  }, []);

  useEffect(() => {
    if (!courseId) {
      setStudents([]);
      setStudentId('');
      return;
    }

    const loadAvailableStudents = async () => {
      try {
        setIsLoadingStudents(true);
        setError('');
        setStudentId('');

        const { data } = await api.get<{ students: AvailableStudent[] }>(
          '/api/professor/students/available',
          {
            params: {
              course_id: Number(courseId),
            },
          }
        );

        setStudents(data.students ?? []);
      } catch (loadError) {
        setStudents([]);
        setError(
          getErrorMessage(loadError, 'Gagal memuat mahasiswa yang tersedia.')
        );
      } finally {
        setIsLoadingStudents(false);
      }
    };

    void loadAvailableStudents();
  }, [courseId]);

  const selectedStudent = useMemo(
    () => students.find((student) => String(student.id) === studentId),
    [studentId, students]
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!courseId || !studentId) {
      setError('Pilih mata kuliah dan mahasiswa terlebih dahulu.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await onAddStudent({
        courseId: Number(courseId),
        studentId: Number(studentId),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : getErrorMessage(submitError, 'Gagal mengundang mahasiswa.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Undang Mahasiswa
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Pilih mata kuliah dan mahasiswa yang akan didaftarkan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="invite-course"
              className="text-sm font-medium text-gray-700"
            >
              Mata Kuliah
            </label>
            <select
              id="invite-course"
              value={courseId}
              onChange={(event) => setCourseId(event.target.value)}
              disabled={isLoadingCourses || isSubmitting}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B] disabled:bg-gray-100"
              required
            >
              <option value="">
                {isLoadingCourses ? 'Memuat mata kuliah...' : 'Pilih mata kuliah'}
              </option>
              {courses.map((course) => (
                <option key={course.id} value={String(course.id)}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="invite-student"
              className="text-sm font-medium text-gray-700"
            >
              Mahasiswa
            </label>
            <select
              id="invite-student"
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              disabled={!courseId || isLoadingStudents || isSubmitting}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B] disabled:bg-gray-100"
              required
            >
              <option value="">
                {isLoadingStudents
                  ? 'Memuat mahasiswa...'
                  : students.length === 0 && courseId
                    ? 'Semua mahasiswa sudah terdaftar'
                    : 'Pilih mahasiswa'}
              </option>
              {students.map((student) => (
                <option key={student.id} value={String(student.id)}>
                  {student.name} {student.nim ? `- ${student.nim}` : ''}
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm">
              <p className="font-medium text-gray-900">{selectedStudent.name}</p>
              <p className="mt-1 text-gray-500">
                {selectedStudent.nim || 'NIM belum diisi'}
                {selectedStudent.class_ ? ` • ${selectedStudent.class_}` : ''}
              </p>
              <p className="text-gray-500">{selectedStudent.email}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isLoadingCourses ||
                isLoadingStudents ||
                !courseId ||
                !studentId
              }
              className="bg-[#0D542B] hover:bg-[#0A3F21]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Undang Mahasiswa
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
