

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockCourses } from '@/data/mock/mock-data';

type AddStudentModalProps = {
  onClose: () => void;
  onAddStudent: (student: {
    name: string;
    nim: string;
    status: 'approved' | 'pending';
    course: string;
  }) => void;
};

export default function AddStudentModal({
  onClose,
  onAddStudent,
}: AddStudentModalProps) {
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [course, setCourse] = useState(mockCourses[0]?.title ?? '');
  const [status, setStatus] = useState<'approved' | 'pending'>('pending');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !nim.trim() || !course.trim()) {
      return;
    }

    onAddStudent({
      name,
      nim,
      course,
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Undang Mahasiswa
            </h2>
            <p className="text-sm text-gray-500">
              Tambahkan mahasiswa ke kelas mata kuliah.
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
              Nama Mahasiswa
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Ahmad Fauzi"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              NIM
            </label>
            <input
              type="text"
              value={nim}
              onChange={(event) => setNim(event.target.value)}
              placeholder="Contoh: 230810101"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Mata Kuliah
            </label>
            <select
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            >
              {mockCourses.map((item) => (
                <option key={item.id} value={item.title}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status Enrollment
            </label>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as 'approved' | 'pending')
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>

            <Button type="submit" className="bg-[#0D542B] hover:bg-[#0A3F21]">
              Simpan Mahasiswa
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}