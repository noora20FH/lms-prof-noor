'use client';

import { useEffect, useState } from 'react';
import { api, csrf, getErrorMessage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  CalendarClock,
  File,
  FileText,
  Lock,
  Pencil,
  Play,
  Plus,
  Trash2,
  Unlock,
} from 'lucide-react';
import AddProfessorMaterialModal from '@/components/professor/AddProfessorMaterialModal';
import EditWeekAccessModal from '@/components/professor/EditWeekAccessModal';

type MaterialType = 'pdf' | 'ppt' | 'video_link' | 'yt_link' | 'presensi_link';
type WeekAccessStatus = 'active' | 'locked' | 'scheduled';

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
  access_status?: WeekAccessStatus;
};

type NewMaterialPayload = {
  courseId: number;
  weekNumber: number;
  title: string;
  type: MaterialType;
  contentUrl: string;
  unlockAt: string;
};

type UpdateWeekAccessPayload = {
  accessStatus: WeekAccessStatus;
  unlockAt: string | null;
};

type ProfessorWeekMaterialsProps = {
  courseId: string | number;
  weekNumber: number;
  weekTitle?: string;
};

const getApiOrigin = (): string => {
  const baseUrl = api.defaults.baseURL;

  if (!baseUrl) {
    throw new Error('Base URL API belum dikonfigurasi.');
  }

  return new URL(baseUrl).origin;
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

export default function ProfessorWeekMaterials({
  courseId,
  weekNumber,
  weekTitle,
}: ProfessorWeekMaterialsProps) {
  const numericCourseId = Number(courseId);
  const resolvedWeekTitle = weekTitle?.trim() || `Minggu ${weekNumber}`;

  const [materials, setMaterials] = useState<Material[]>([]);
  const [weekSchedule, setWeekSchedule] = useState<ApiWeek | null>(null);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showEditAccessModal, setShowEditAccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMaterials = async () => {
    if (!numericCourseId || !weekNumber) {
      setMaterials([]);
      setWeekSchedule(null);
      setError('Course ID atau week tidak valid.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await api.get<{
        materials: ApiMaterial[];
        weeks: ApiWeek[];
      }>('/api/professor/materials', {
        params: {
          course_id: numericCourseId,
          week_number: weekNumber,
        },
      });

      const currentWeekMaterials = (response.data.materials ?? [])
        .map(mapApiMaterial)
        .filter(
          (material) =>
            material.courseId === numericCourseId &&
            material.weekNumber === weekNumber,
        );

      const currentWeek = (response.data.weeks ?? []).find(
        (week) =>
          Number(week.course_id) === numericCourseId &&
          Number(week.week_number) === weekNumber,
      );

      setMaterials(currentWeekMaterials);
      setWeekSchedule(currentWeek ?? null);
    } catch (loadError) {
      setMaterials([]);
      setWeekSchedule(null);
      setError(getErrorMessage(loadError, 'Gagal memuat materi.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericCourseId, weekNumber]);

  const addMaterial = async (material: NewMaterialPayload) => {
    const contentUrl = normalizeExternalUrl(material.contentUrl);

    if (!material.courseId) {
      const message = 'Kelas tidak valid.';
      window.alert(message);
      throw new Error(message);
    }

    if (!material.unlockAt) {
      const message = 'Jadwal buka wajib diisi.';
      window.alert(message);
      throw new Error(message);
    }

    if (!contentUrl) {
      const message = 'Tautan materi wajib diisi.';
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
          week_title: resolvedWeekTitle,
          title: material.title,
          type: material.type,
          content_url: contentUrl,
          unlock_at: material.unlockAt,
        },
      );

      const newMaterial = mapApiMaterial(response.data.material);

      setMaterials((previousMaterials) => {
        if (
          newMaterial.courseId !== numericCourseId ||
          newMaterial.weekNumber !== weekNumber
        ) {
          return previousMaterials;
        }

        return [...previousMaterials, newMaterial];
      });

      if (response.data.week) {
        setWeekSchedule(response.data.week);
      }
    } catch (saveError) {
      const message = getErrorMessage(saveError, 'Gagal menyimpan materi.');
      window.alert(message);
      throw new Error(message);
    }
  };

  const updateWeekAccess = async (payload: UpdateWeekAccessPayload) => {
    try {
      await csrf();

      const response = await api.patch<{ message: string; week: ApiWeek }>(
        `/api/professor/courses/${numericCourseId}/weeks/${weekNumber}/access`,
        {
          access_status: payload.accessStatus,
          unlock_at: payload.unlockAt,
        },
      );

      setWeekSchedule(response.data.week);
      window.alert(response.data.message);
    } catch (updateError) {
      const message = getErrorMessage(
        updateError,
        'Gagal memperbarui akses minggu.',
      );
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
        previousMaterials.filter((material) => material.id !== materialId),
      );
    } catch (deleteError) {
      window.alert(getErrorMessage(deleteError, 'Gagal menghapus materi.'));
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
    if (type === 'presensi_link') {
      return <FileText className="h-5 w-5 text-indigo-500" />;
    }

    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const getMaterialTypeLabel = (type: MaterialType) => {
    if (type === 'pdf') return 'PDF';
    if (type === 'ppt') return 'PPT';
    if (type === 'video_link') return 'Video';
    if (type === 'yt_link') return 'YouTube';
    if (type === 'presensi_link') return 'Link Presensi';

    return type;
  };

  const getWeekAccessStatus = (week?: ApiWeek | null): WeekAccessStatus => {
    if (week?.access_status) {
      return week.access_status;
    }

    if (!week?.unlock_at) {
      return 'locked';
    }

    return new Date(week.unlock_at).getTime() <= Date.now()
      ? 'active'
      : 'scheduled';
  };

  const getAccessStatusLabel = (status: WeekAccessStatus) => {
    if (status === 'active') return 'Terbuka';
    if (status === 'scheduled') return 'Terjadwal';
    return 'Terkunci';
  };

  const getAccessStatusClassName = (status: WeekAccessStatus) => {
    if (status === 'active') {
      return 'bg-emerald-100 text-emerald-700';
    }

    if (status === 'scheduled') {
      return 'bg-amber-100 text-amber-700';
    }

    return 'bg-gray-100 text-gray-600';
  };

  const formatAccessSchedule = (unlockAt: string | null) => {
    if (!unlockAt) {
      return 'Belum dijadwalkan';
    }

    const date = new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'Asia/Jakarta',
    }).format(new Date(unlockAt));

    return `Dibuka ${date}`;
  };

  const accessStatus = getWeekAccessStatus(weekSchedule);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          Memuat materi...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Materi</h2>
            <p className="mt-1 text-sm text-gray-500">
              {`${materials.length} materi tersedia pada ${resolvedWeekTitle}`}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${getAccessStatusClassName(
                  accessStatus,
                )}`}
              >
                {accessStatus === 'active' && <Unlock className="h-3.5 w-3.5" />}
                {accessStatus === 'scheduled' && (
                  <CalendarClock className="h-3.5 w-3.5" />
                )}
                {accessStatus === 'locked' && <Lock className="h-3.5 w-3.5" />}
                {getAccessStatusLabel(accessStatus)}
              </span>

              <span className="text-xs text-gray-400">
                {formatAccessSchedule(weekSchedule?.unlock_at ?? null)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditAccessModal(true)}
              className="w-fit"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Atur Akses
            </Button>

            <Button
              type="button"
              onClick={() => setShowAddMaterialModal(true)}
              className="w-fit bg-[#0D542B] hover:bg-[#0A3F21]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Materi
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 md:flex-row md:items-center md:justify-between">
            <span>{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadMaterials()}>
              Coba Lagi
            </Button>
          </div>
        )}

        {materials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
            <FileText className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="font-medium text-gray-900">Belum ada materi</p>
            <p className="mt-1 text-sm text-gray-500">
              Tambahkan materi untuk minggu ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex flex-col gap-4 rounded-2xl bg-gray-50 p-5 transition-colors hover:bg-gray-100 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                    {getMaterialIcon(material.type)}
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-gray-900">{material.title}</p>

                    {material.contentUrl ? (
                      <a
                        href={normalizeExternalUrl(material.contentUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-sm font-medium text-[#0D542B] hover:underline"
                      >
                        Lihat Materi
                      </a>
                    ) : (
                      <span className="mt-1 inline-block text-sm text-gray-400">
                        Tautan belum tersedia
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
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showEditAccessModal && (
        <EditWeekAccessModal
          weekTitle={resolvedWeekTitle}
          initialStatus={accessStatus}
          initialUnlockAt={weekSchedule?.unlock_at ?? null}
          onClose={() => setShowEditAccessModal(false)}
          onSave={updateWeekAccess}
        />
      )}

      {showAddMaterialModal && (
        <AddProfessorMaterialModal
          courseId={numericCourseId}
          weekNumber={weekNumber}
          weekTitle={resolvedWeekTitle}
          initialUnlockAt={weekSchedule?.unlock_at ?? null}
          onClose={() => setShowAddMaterialModal(false)}
          onAdd={addMaterial}
        />
      )}
    </div>
  );
}
