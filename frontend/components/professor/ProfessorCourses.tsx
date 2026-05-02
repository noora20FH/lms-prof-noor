'use client';

import { mockProfessorCourses } from '@/data/mock/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, BookOpen } from 'lucide-react';

export default function ProfessorCourses() {
  return (
    <div className="space-y-6">
      {/* Header gradient mirip prototype */}
      <div 
        className="rounded-3xl p-8 text-white flex justify-between items-end"
        style={{ background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)' }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-white/80 mt-1">Kelola mata kuliah yang kamu ajar</p>
        </div>
        <Button className="bg-white text-[#0D542B] hover:bg-white/90">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProfessorCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-xl transition-all duration-300 border border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{course.enrolled} / {course.totalStudents} mahasiswa</span>
                </div>
                <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-2xl font-medium">Active</span>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 bg-[#0D542B] hover:bg-[#0A3F21]">Kelola Materi</Button>
                <Button variant="outline" className="flex-1">Lihat Detail</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}