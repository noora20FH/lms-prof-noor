import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

type AssignmentFormData = {
  id?: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  gdriveSubmissionLink: string;
  submissionNote: string;           // ← FIELD NOTE BARU
};

type CreateAssignmentModalProps = {
  weekNumber: number;
  onClose: () => void;
  onCreate?: (data: AssignmentFormData) => Promise<void> | void;
  onUpdate?: (data: AssignmentFormData) => Promise<void> | void;
  initialData?: Partial<AssignmentFormData>;   // untuk Edit mode
  isEdit?: boolean;
};

export default function CreateAssignmentModal({
  weekNumber,
  onClose,
  onCreate,
  onUpdate,
  initialData,
  isEdit = false,
}: CreateAssignmentModalProps) {
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: `Tugas Week ${weekNumber}`,
    description: '',
    startDate: '',
    dueDate: '',
    gdriveSubmissionLink: '',
    submissionNote: 'Note: upload tugas di gdrive ini, lalu copy link tugas kalian untuk di upload di halaman Submit tugas',
    ...initialData,
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isEdit && onUpdate) {
      await onUpdate(formData);
    } else if (onCreate) {
      await onCreate(formData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEdit ? 'Edit Assignment' : 'Create Assignment'}
            </h3>
            <p className="text-sm text-gray-500">Week {weekNumber}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Assignment Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
                required
              />
            </div>
          </div>

          {/* GDrive Link */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Link Pengumpulan Tugas (Google Drive)
            </label>
            <input
              type="url"
              name="gdriveSubmissionLink"
              value={formData.gdriveSubmissionLink}
              onChange={handleChange}
              placeholder="https://drive.google.com/drive/folders/..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            />
          </div>

          {/* NEW: Field Note / Catatan */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Catatan / Note untuk Mahasiswa
            </label>
            <textarea
              name="submissionNote"
              value={formData.submissionNote}
              onChange={handleChange}
              rows={2}
              placeholder="Catatan tambahan untuk pengumpulan tugas..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-[#0D542B] focus:ring-1 focus:ring-[#0D542B]"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#0D542B] hover:bg-[#0A3F21]"
            >
              {isEdit ? 'Update Assignment' : 'Save Assignment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}