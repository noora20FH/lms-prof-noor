"use client";

import { mockCourses, mockAssignments } from "@/data/mock/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, FileText, Plus } from "lucide-react";

export default function ProfessorDashboard() {
  return (
    <div className="space-y-8">
      {/* Header Gradient */}
      <div className="rounded-3xl p-8 text-white" style={{
        background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 100%)'
      }}>
        <h1 className="text-4xl font-bold">Selamat Datang, Prof. Noor 👋</h1>
        <p className="text-emerald-200 mt-2">Berikut ringkasan aktivitas hari ini</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Mata Kuliah</CardTitle>
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-semibold text-[#0D542B]">{mockCourses.length}</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Mahasiswa Aktif</CardTitle>
            <Users className="h-6 w-6 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-semibold text-[#0D542B]">103</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Tugas Pending</CardTitle>
            <FileText className="h-6 w-6 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-semibold text-[#0D542B]">8</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses & Recent Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Mata Kuliah Saya</CardTitle>
              <Button size="sm" className="bg-[#0D542B]">
                <Plus className="mr-2 h-4 w-4" /> Tambah MK
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCourses.map(course => (
              <div key={course.id} className="flex justify-between items-center p-4 border rounded-2xl">
                <div>
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-gray-500">{course.enrolled} / {course.totalStudents} mahasiswa</p>
                </div>
                <Button variant="outline" size="sm">Detail</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Tugas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Isi sesuai kebutuhan */}
            <p className="text-gray-500 text-sm">Belum ada tugas pending (mock data)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}