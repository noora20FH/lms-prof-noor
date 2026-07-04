'use client';

import { FormEvent, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarClock, Lock, Unlock, X } from 'lucide-react';

type WeekAccessStatus = 'active' | 'locked' | 'scheduled';

type UpdateWeekAccessPayload = {
  accessStatus: WeekAccessStatus;
  unlockAt: string | null;
};

type EditWeekAccessModalProps = {
  weekTitle: string;
  initialStatus: WeekAccessStatus;
  initialUnlockAt?: string | null;
  onClose: () => void;
  onSave: (payload: UpdateWeekAccessPayload) => Promise<void>;
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

export default function EditWeekAccessModal({
  weekTitle,
  initialStatus,
  initialUnlockAt,
  onClose,
  onSave,
}: EditWeekAccessModalProps) {
  const initialDate = useMemo(
    () => toDateTimeLocal(initialUnlockAt),
    [initialUnlockAt]
  );

  const [accessStatus, setAccessStatus] =
    useState<WeekAccessStatus>(initialStatus);
  const [unlockAt, setUnlockAt] = useState(initialDate);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (accessStatus === 'scheduled' && !unlockAt) {
      window.alert('Tanggal dan waktu pembukaan wajib diisi.');
      return;
    }

    try {
      setIsSaving(true);

      await onSave({
        accessStatus,
        unlockAt: accessStatus === 'scheduled' ? unlockAt : null,
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
              Edit Akses Week
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
              Status Akses
            </label>

            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setAccessStatus('active')}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                  accessStatus === 'active'
                    ? 'border-[#0D542B] bg-emerald-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Unlock className="h-5 w-5 text-emerald-600" />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    Aktifkan Sekarang
                  </span>
                  <span className="block text-xs text-gray-500">
                    Mahasiswa langsung dapat membuka week ini.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAccessStatus('scheduled')}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                  accessStatus === 'scheduled'
                    ? 'border-[#0D542B] bg-emerald-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <CalendarClock className="h-5 w-5 text-amber-600" />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    Jadwalkan
                  </span>
                  <span className="block text-xs text-gray-500">
                    Week terbuka otomatis pada waktu yang ditentukan.
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAccessStatus('locked')}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors ${
                  accessStatus === 'locked'
                    ? 'border-[#0D542B] bg-emerald-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Lock className="h-5 w-5 text-gray-500" />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">
                    Kunci Week
                  </span>
                  <span className="block text-xs text-gray-500">
                    Mahasiswa tidak dapat membuka materi dan assignment.
                  </span>
                </span>
              </button>
            </div>
          </div>

          {accessStatus === 'scheduled' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Tanggal dan Waktu Pembukaan
              </label>
              <input
                type="datetime-local"
                value={unlockAt}
                onChange={(event) => setUnlockAt(event.target.value)}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0D542B]"
                required
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Batal
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#0D542B] hover:bg-[#0A3F21]"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
