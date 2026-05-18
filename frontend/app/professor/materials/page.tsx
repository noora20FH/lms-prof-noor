'use client';

import { useMemo, useState } from 'react';
import {
  mockProfessorCourses,
  mockMaterials,
  type Material,
} from '@/data/mock/mock-data';
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

type MaterialType = 'pdf' | 'ppt' | 'video' | 'yt_link';

type SelectedWeek = {
  courseId: number;
  weekNumber: number;
  title: string;
};

type NewMaterialPayload = {
  courseId: number;
  weekNumber: number;
  title: string;
  type: MaterialType;
  contentUrl: string;
};

const DEFAULT_WEEK_TITLES: Record<number, string> = {
  1: 'Introduction to Fullstack',
  2: 'React Fundamentals',
  3: 'Laravel API & Authentication',
};

export default function ProfessorMaterials() {
  const [selectedCourseId, setSelectedCourseId] = useState(
    mockProfessorCourses[0]?.id ?? ''
  );

  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [selectedWeek, setSelectedWeek] = useState<SelectedWeek | null>(null);

  const numericCourseId = Number(selectedCourseId);

  const selectedCourse = mockProfessorCourses.find(
    (course) => course.id === selectedCourseId
  );

  const weeks = useMemo(() => {
    return Array.from({ length: TOTAL_WEEKS }, (_, index) => {
      const weekNumber = index + 1;

      return {
        weekNumber,
        title: DEFAULT_WEEK_TITLES[weekNumber] ?? `Week ${weekNumber}`,
      };
    });
  }, []);

  const addMaterial = (material: NewMaterialPayload) => {
    const newMaterial: Material = {
      id:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      courseId: material.courseId,
      weekNumber: material.weekNumber,
      title: material.title,
      type: material.type,
      contentUrl: material.contentUrl,
    };

    setMaterials((previousMaterials) => [...previousMaterials, newMaterial]);
  };

  const deleteMaterial = (materialId: string) => {
    const confirmed = window.confirm('Hapus materi ini?');

    if (!confirmed) {
      return;
    }

    setMaterials((previousMaterials) =>
      previousMaterials.filter((material) => material.id !== materialId)
    );
  };

  const getMaterialIcon = (type: MaterialType) => {
    if (type === 'pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    }

    if (type === 'ppt') {
      return <File className="h-5 w-5 text-blue-500" />;
    }

    if (type === 'video') {
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
    if (type === 'video') return 'Video';
    if (type === 'yt_link') return 'YouTube';

    return type;
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
              {mockProfessorCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
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
                </div>

                <Button
                  type="button"
                  onClick={() =>
                    setSelectedWeek({
                      courseId: numericCourseId,
                      weekNumber: week.weekNumber,
                      title: `Minggu ${week.weekNumber} - ${week.title}`,
                    })
                  }
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

                          <a
                            href={material.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-sm font-medium text-[#0D542B] hover:underline"
                          >
                            Lihat materi →
                          </a>
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
          onClose={() => setSelectedWeek(null)}
          onAdd={addMaterial}
        />
      )}
    </div>
  );
}