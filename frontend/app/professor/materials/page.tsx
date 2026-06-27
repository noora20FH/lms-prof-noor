'use client';

import { useEffect, useMemo, useState } from 'react';
import { api, csrf, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { File, FileText, Play, Plus, Trash2 } from 'lucide-react';
import AddProfessorMaterialModal from '@/components/professor/AddProfessorMaterialModal';

const TOTAL_WEEKS = 17;

type MaterialType = 'pdf' | 'ppt' | 'video_link' | 'yt_link';
type CreatableMaterialType = MaterialType;

type ProfessorCourse = {
  id: number;
  title: string;
  code?: string | null;
  description?: string | null;
  status?: 'active' | 'disabled';
  total_weeks?: number | null;
};

type Material = {
  id: number;
  courseId: number;
  weekNumber: number;
  title: string;
  type: MaterialType;
  contentUrl: string;
  unlockAt: string | null;
};

type ApiMaterial = {
  id: number;
  course_id: number;
  week_number: number;
  title: string;
  type: MaterialType;
  content_url: string | null;
  unlock_at: string | null;
};

type ApiWeek = {
  id: number;
  course_id: number;
  week_number: number;
  title: string;
  unlock_at: string | null;
  due_at: string | null;
  is_accessible: boolean;
  is_locked: boolean;
};

type SelectedWeek = {
  courseId: number;
  weekNumber: number;
  title: string;
  unlockAt: string | null;
};

type NewMaterialPayload = {
  courseId: number;
  weekNumber: number;
  title: string;
  type: CreatableMaterialType;
  contentUrl: string;
  unlockAt: string;
};

const DEFAULT_WEEK_TITLES: Record<number, string> = {
  1: 'Introduction to Fullstack',
  2: 'React Fundamentals',
  3: 'Laravel API & Authentication',
};

const getApiOrigin = () => {
  const baseUrl = api.defaults.baseURL ?? 'http://localhost:8000';

  try {
    return new URL(baseUrl).origin;
  } catch {
    return 'http://localhost:8000';
  }
};

const normalizeExternalUrl = (value: string) => {
  const cleanUrl = value.trim();

  if (!cleanUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(cleanUrl)) {
    return cleanUrl;
  }

  if (cleanUrl.startsWith('/')) {
    return `${getApiOrigin()}${cleanUrl}`;
  }

  return `https://${cleanUrl}`;
};

const mapApiMaterial = (material: ApiMaterial): Material => ({
  id: material.id,
  courseId: Number(material.course_id),
  weekNumber: Number(material.week_number),
  title: material.title,
  type: material.type,
  contentUrl: material.content_url ?? '',
  unlockAt: material.unlock_at ?? null,
});

export default function ProfessorMaterials() {
  const [courses, setCourses] = useState<ProfessorCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const [materials, setMaterials] = useState<Material[]>([]);
  const [weekSchedules, setWeekSchedules] = useState<ApiWeek[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<SelectedWeek | null>(null);

  const numericCourseId = Number(selectedCourseId);

  const selectedCourse = courses.find(
    (course) => String(course.id) === selectedCourseId
  );

  const weeks = useMemo(() => {
    const totalWeeks = selectedCourse?.total_weeks ?? TOTAL_WEEKS;

    return Array.from({ length: totalWeeks }, (_, index) => {
      const weekNumber = index + 1;

      return {
        weekNumber,
        title: DEFAULT_WEEK_TITLES[weekNumber] ?? `Week ${weekNumber}`,
      };
    });
  }, [selectedCourse?.total_weeks]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await api.get<{ courses: ProfessorCourse[] }>(
          '/api/professor/courses'
        );

        const loadedCourses = response.data.courses ?? [];

        setCourses(loadedCourses);

        if (loadedCourses.length > 0) {
          setSelectedCourseId(String(loadedCourses[0].id));
        }
      } catch (error) {
        window.alert(getErrorMessage(error, 'Gagal mengambil data mata kuliah.'));
      }
    };

    void loadCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourseId) {
      setMaterials([]);
      setWeekSchedules([]);
      return;
    }

    const loadMaterials = async () => {
      try {
        const response = await api.get<{
          materials: ApiMaterial[];
          weeks: ApiWeek[];
        }>('/api/professor/materials', {
          params: {
            course_id: Number(selectedCourseId),
          },
        });

        setMaterials((response.data.materials ?? []).map(mapApiMaterial));
        setWeekSchedules(response.data.weeks ?? []);
      } catch (error) {
        window.alert(getErrorMessage(error, 'Gagal mengambil data materi.'));
      }
    };

    void loadMaterials();
  }, [selectedCourseId]);

  const addMaterial = async (material: NewMaterialPayload) => {
    const contentUrl = normalizeExternalUrl(material.contentUrl);

    if (!material.courseId) {
      const message = 'Pilih mata kuliah terlebih dahulu.';
      window.alert(message);
      throw new Error(message);
    }

    if (!material.unlockAt) {
      const message = 'Tanggal dan waktu pembukaan week wajib diisi.';
      window.alert(message);
      throw new Error(message);
    }

    if (!contentUrl) {
      const message = 'Link / URL materi wajib diisi.';
      window.alert(message);
      throw new Error(message);
    }

    try {
      await csrf();

      const response = await api.post<{ material: ApiMaterial; week: ApiWeek }>(
        '/api/professor/materials',
        {
          course_id: material.courseId,
          week_number: material.weekNumber,
          week_title:
            DEFAULT_WEEK_TITLES[material.weekNumber] ??
            `Week ${material.weekNumber}`,
          title: material.title,
          type: material.type,
          content_url: contentUrl,
          unlock_at: material.unlockAt,
        }
      );

      const newMaterial = mapApiMaterial(response.data.material);

      setMaterials((previousMaterials) => [...previousMaterials, newMaterial]);
      setWeekSchedules((previousWeeks) => {
        const responseWeek = response.data.week;

        if (!responseWeek) {
          return previousWeeks;
        }

        const exists = previousWeeks.some(
          (week) => week.week_number === responseWeek.week_number
        );

        if (!exists) {
          return [...previousWeeks, responseWeek].sort(
            (a, b) => a.week_number - b.week_number
          );
        }

        return previousWeeks.map((week) =>
          week.week_number === responseWeek.week_number ? responseWeek : week
        );
      });
    } catch (error) {
      const message = getErrorMessage(error, 'Gagal menyimpan materi.');
      window.alert(message);
      throw new Error(message);
    }
  };

  const deleteMaterial = async (materialId: number) => {
    const confirmed = window.confirm('Hapus materi ini?');

    if (!confirmed) {
      return;
    }

    try {
      await csrf();
      await api.delete(`/api/professor/materials/${materialId}`);

      setMaterials((previousMaterials) =>
        previousMaterials.filter((material) => material.id !== materialId)
      );
    } catch (error) {
      window.alert(getErrorMessage(error, 'Gagal menghapus materi.'));
    }
  };

  const getMaterialIcon = (type: MaterialType) => {
    if (type === 'pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }

    if (type === 'ppt') {
      return <File className="h-5 w-5 text-blue-500" />;
    }

    if (type === 'video_link') {
      return <Play className="h-5 w-5 text-emerald-500" />;
    }

    if (type === 'yt_link') {
      return <Play className="h-5 w-5 text-red-500" />;
    }

    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getMaterialTypeLabel = (type: MaterialType) => {
    if (type === 'pdf') return 'PDF';
    if (type === 'ppt') return 'PPT';
    if (type === 'video_link') return 'Video';
    if (type === 'yt_link') return 'YouTube';

    return type;
  };

  const formatAccessSchedule = (unlockAt: string | null) => {
    if (!unlockAt) {
      return 'Jadwal akses belum ditentukan';
    }

    return `Dibuka ${new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    }).format(new Date(unlockAt))}`;
  };

  return (
    <div className="space-y-6">
      <div
        className="flex items-end justify-between rounded-3xl p-8 text-white"
        style={{
          background:
            'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)',
        }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manage Materials
          </h1>
          <p className="mt-1 text-white/80">
            Tambah dan kelola materi perkuliahan per minggu.
          </p>
        </div>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Pilih Mata Kuliah</CardTitle>
        </CardHeader>

        <CardContent>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue placeholder="Pilih mata kuliah" />
            </SelectTrigger>

            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={String(course.id)}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedCourse && (
            <p className="mt-3 text-sm text-gray-500">
              Mata kuliah aktif:{' '}
              <span className="font-medium text-gray-800">
                {selectedCourse.title}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-5">
        {weeks.map((week) => {
          const weekMaterials = materials.filter(
            (material) =>
              material.courseId === numericCourseId &&
              material.weekNumber === week.weekNumber
          );
          const weekSchedule = weekSchedules.find(
            (schedule) => schedule.week_number === week.weekNumber
          );

          return (
            <section
              key={week.weekNumber}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Minggu {week.weekNumber} - {week.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {weekMaterials.length} materi tersedia
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatAccessSchedule(weekSchedule?.unlock_at ?? null)}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    if (!numericCourseId) {
                      window.alert('Pilih mata kuliah terlebih dahulu.');
                      return;
                    }

                    setSelectedWeek({
                      courseId: numericCourseId,
                      weekNumber: week.weekNumber,
                      title: `Minggu ${week.weekNumber} - ${week.title}`,
                      unlockAt: weekSchedule?.unlock_at ?? null,
                    });
                  }}
                  className="w-fit bg-[#0D542B] hover:bg-[#0A3F21]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Materi
                </Button>
              </div>

              {weekMaterials.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                  <FileText className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                  <p className="font-medium text-gray-900">
                    Belum ada materi
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Tambahkan materi pertama untuk minggu ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {weekMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-5 transition-colors hover:bg-gray-100 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                          {getMaterialIcon(material.type)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">
                            {material.title}
                          </p>

{material.contentUrl ? (
  <a
    href={normalizeExternalUrl(material.contentUrl)}
    target="_blank"
    rel="noopener noreferrer"
    className="mt-1 inline-block text-sm font-medium text-[#0D542B] hover:underline"
  >
    Lihat materi →
  </a>
) : (
  <span className="mt-1 inline-block text-sm text-gray-400">
    Link belum tersedia
  </span>
)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-medium uppercase text-gray-500 shadow-sm">
                          {getMaterialTypeLabel(material.type)}
                        </span>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMaterial(material.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {selectedWeek && (
        <AddProfessorMaterialModal
          courseId={selectedWeek.courseId}
          weekNumber={selectedWeek.weekNumber}
          weekTitle={selectedWeek.title}
          initialUnlockAt={selectedWeek.unlockAt}
          onClose={() => setSelectedWeek(null)}
          onAdd={addMaterial}
        />
      )}
    </div>
  );
}
