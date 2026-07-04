'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type AddMaterialModalProps = {
  weekNumber: number;
  onClose: () => void;
};

export default function AddMaterialModal({
  weekNumber,
  onClose,
}: AddMaterialModalProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Nanti bagian ini bisa dihubungkan ke API atau state management
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Add Material
            </h3>
            <p className="text-sm text-gray-500">Week {weekNumber}</p>
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
              Material Title
            </label>
            <input
              type="text"
              placeholder="Contoh: Slide Perkuliahan Week 1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Material Type
            </label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]">
              <option value="pdf">PDF</option>
              <option value="ppt">PPT</option>
              <option value="video_link">Video Link</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Material URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/material.pdf"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Tambahkan catatan singkat untuk material ini"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" className="bg-[#0D542B] hover:bg-[#0A3F21]">
              Save Material
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}