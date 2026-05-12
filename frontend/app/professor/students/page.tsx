'use client';

import { mockCourses } from '@/data/mock/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, Clock } from 'lucide-react';

export default function ProfessorStudents() {
  // Mock students untuk demo (nanti diganti dari API enrollment)
  const mockStudents = [
    { id: 1, name: "Ahmad Fauzi", nim: "230810101", status: "approved", course: "Pemrograman Web Lanjutan" },
    { id: 2, name: "Siti Nurhaliza", nim: "230810102", status: "pending", course: "Pemrograman Web Lanjutan" },
    { id: 3, name: "Budi Santoso", nim: "230810103", status: "approved", course: "Basis Data dan SQL" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-gray-500">Daftar mahasiswa & persetujuan enrollment</p>
        </div>
        <Button className="bg-[#0D542B]">+ Undang Mahasiswa</Button>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">All Students ({mockStudents.length})</h2>
          <div className="flex gap-2">
            <Badge variant="secondary">Approved</Badge>
            <Badge variant="outline">Pending</Badge>
          </div>
        </div>

        <div className="divide-y">
          {mockStudents.map((student) => (
            <div key={student.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-[#0D542B]/10 text-[#0D542B] rounded-2xl flex items-center justify-center font-medium">
                  {student.name.substring(0, 2)}
                </div>
                <div>
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.nim} • {student.course}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {student.status === 'approved' ? (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <CheckCircle className="w-3 h-3 mr-1" /> Approved
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-300 text-amber-700">
                    <Clock className="w-3 h-3 mr-1" /> Pending
                  </Badge>
                )}
                <Button size="sm" variant="outline">Detail</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}