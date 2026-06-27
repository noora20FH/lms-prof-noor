'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type MaterialType = 'pdf' | 'ppt' | 'video_link' | 'yt_link';

type NewMaterialPayload = {
  courseId: number;
  weekNumber: number;
  title: string;
  type: MaterialType;
  contentUrl: string;
  unlockAt: string;
};

type AddProfessorMaterialModalProps = {
  courseId: number;
  weekNumber: number;
  weekTitle: string;
  initialUnlockAt?: string | null;
  onClose: () => void;
  onAdd: (material: NewMaterialPayload) => Promise<void>;
};

const toDateTimeLocal = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  localDate.setSeconds(0, 0);

  return localDate.toISOString().slice(0, 16);
};

export default function AddProfessorMaterialModal({
  courseId,
  weekNumber,
  weekTitle,
  initialUnlockAt,
  onClose,
  onAdd,
}: AddProfessorMaterialModalProps) {
  const initialDate = useMemo(
    () => toDateTimeLocal(initialUnlockAt),
    [initialUnlockAt]
  );

  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaterialType>('pdf');
  const [contentUrl, setContentUrl] = useState('');
  const [unlockAt, setUnlockAt] = useState(initialDate);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !contentUrl.trim() || !unlockAt) {
      window.alert('Judul, URL materi, dan waktu pembukaan wajib diisi.');
      return;
    }

    try {
      setIsSaving(true);

      await onAdd({
        courseId,
        weekNumber,
        title: title.trim(),
        type,
        contentUrl: contentUrl.trim(),
        unlockAt,
      });

      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Tambah Materi
            </h2>
            <p className="mt-1 text-sm text-gray-500">{weekTitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Judul Materi
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0D542B]"
              placeholder="Contoh: Pengantar Fullstack"
              maxLength={255}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tipe Materi
            </label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as MaterialType)}
              className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-[#0D542B]"
            >
              <option value="pdf">PDF</option>
              <option value="ppt">PPT</option>
              <option value="video_link">Video Link</option>
              <option value="yt_link">YouTube Link</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Link atau URL Materi
            </label>
            <input
              type="url"
              value={contentUrl}
              onChange={(event) => setContentUrl(event.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0D542B]"
              placeholder="https://..."
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Waktu Materi Mulai Dapat Diakses
            </label>
            <input
              type="datetime-local"
              value={unlockAt}
              onChange={(event) => setUnlockAt(event.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0D542B]"
              required
            />
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Seluruh materi dan assignment pada week ini akan terkunci bagi
              mahasiswa sampai waktu tersebut tercapai.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#0D542B] hover:bg-[#0A3F21]"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Materi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
