'use client';

import { mockRecentSubmissions } from '@/data/mock/mock-data';
import { Button } from '@/components/ui/button';

export default function ProfessorDashboard() {
  return (
    <div className="space-y-8">
      {/* Gradient Header */}
      <div
        className="rounded-3xl p-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)',
        }}
      >
        <h1 className="text-4xl font-bold tracking-tight">Dashboard Professor</h1>
        <p className="text-white/70 mt-2 text-lg">
          Selamat datang kembali, Prof. Noor 👋
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Mata Kuliah</p>
          <p className="text-5xl font-semibold text-[#0D542B] mt-2">5</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Mahasiswa Aktif</p>
          <p className="text-5xl font-semibold text-[#0D542B] mt-2">87</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Tugas Pending</p>
          <p className="text-5xl font-semibold text-[#0D542B] mt-2">12</p>
        </div>
      </div>

      {/* Recent Submissions Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Submitted Tasks Terbaru
          </h3>
          <Button
            variant="outline"
            className="text-[#0D542B] border-[#0D542B] hover:bg-[#0D542B] hover:text-white"
          >
            Lihat Semua Submission →
          </Button>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-5 text-gray-700 font-medium">Mahasiswa</th>
                  <th className="text-left p-5 text-gray-700 font-medium">Tugas</th>
                  <th className="text-left p-5 text-gray-700 font-medium">Mata Kuliah</th>
                  <th className="text-left p-5 text-gray-700 font-medium">Waktu Submit</th>
                  <th className="text-center p-5 text-gray-700 font-medium w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockRecentSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-5">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {submission.studentName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {submission.nim}
                        </p>
                      </div>
                    </td>
                    <td className="p-5 text-gray-900 font-medium">
                      {submission.assignmentTitle}
                    </td>
                    <td className="p-5 text-gray-600">{submission.course}</td>
                    <td className="p-5 text-gray-500 text-sm">
                      {submission.submittedAt}
                    </td>
                    <td className="p-5 text-center">
                      <button
                        onClick={() =>
                          alert(`Membuka submission dari ${submission.studentName}\nFile: ${submission.fileName}`)
                        }
                        className="inline-flex items-center gap-2 text-[#0D542B] hover:text-[#0A3F21] font-medium transition-colors"
                      >
                        Lihat
                        <span className="text-xl leading-none">→</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}