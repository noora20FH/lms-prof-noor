'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Submission } from '@/data/mock/mock-data';

type GradeSubmissionModalProps = {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (submissionId: string, score: number, feedback: string) => void;
};

export default function GradeSubmissionModal({
  submission,
  isOpen,
  onClose,
  onSave,
}: GradeSubmissionModalProps) {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  // Reset form hanya saat modal baru dibuka
  useEffect(() => {
    if (isOpen && submission) {
      setScore(submission.score?.toString() ?? '');
      setFeedback(submission.feedback ?? '');
    }
  }, [isOpen, submission]);   // ← Tambah isOpen di dependency

  const handleSave = () => {
    if (!submission) return;
    const numericScore = Number(score);

    if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
      alert('Nilai harus angka antara 0 - 100');
      return;
    }

    onSave(submission.id, numericScore, feedback);
    onClose();
  };

  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Grading Submission</DialogTitle>
          <DialogDescription>
            {submission.studentName} ({submission.nim}) — {submission.fileName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="score">Nilai (0 - 100)</Label>
            <Input
              id="score"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={score}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setScore(value);
              }}
              placeholder="Masukkan nilai"
              className="text-4xl font-bold text-center h-16 tracking-tighter"
            />
          </div>

          <div>
            <Label htmlFor="feedback">Feedback / Catatan</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tulis feedback untuk mahasiswa..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#0D542B] to-[#004F3B]"
          >
            Simpan Nilai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}