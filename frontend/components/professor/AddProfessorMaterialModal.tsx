'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MaterialType = 'pdf' | 'ppt' | 'video_link' | 'yt_link';

type AddProfessorMaterialModalProps = {
  courseId: number;
  weekNumber: number;
  weekTitle?: string;
  onClose: () => void;
  onAdd: (material: {
    courseId: number;
    weekNumber: number;
    title: string;
    type: MaterialType;
    contentUrl: string;
  }) => Promise<void> | void;
};

export default function AddProfessorMaterialModal({
  courseId,
  weekNumber,
  weekTitle,
  onClose,
  onAdd,
}: AddProfessorMaterialModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaterialType>('pdf');
  const [contentUrl, setContentUrl] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !contentUrl.trim()) {
      return;
    }

    try {
      await onAdd({
        courseId,
        weekNumber,
        title: title.trim(),
        type,
        contentUrl: contentUrl.trim(),
      });

      onClose();
    } catch {
      // Error message is handled by the parent page so the UI stays unchanged.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Tambah Materi Baru
            </h2>
            <p className="text-sm text-gray-500">
              {weekTitle ? weekTitle : 'Tambahkan materi ke minggu terpilih'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Judul Materi
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Contoh: Slide Minggu 1 - Next.js Overview.pdf"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tipe Materi
            </label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as MaterialType)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            >
              <option value="pdf">PDF</option>
              <option value="ppt">PPT</option>
              <option value="video_link">Video</option>
              <option value="yt_link">YouTube Link</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Link / URL
            </label>
            <input
              type="url"
              value={contentUrl}
              onChange={(event) => setContentUrl(event.target.value)}
              placeholder="https://example.com/material.pdf"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>

            <Button type="submit" className="bg-[#0D542B] hover:bg-[#0A3F21]">
              Simpan Materi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
