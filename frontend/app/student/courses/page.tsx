'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen } from 'lucide-react';
import { mockStudentCourses } from '@/data/mock/mock-data';

export default function StudentCoursesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-gray-500">Mata kuliah yang sedang kamu ambil</p>
        </div>
        <Button className="bg-[#0D542B]">
          <BookOpen className="mr-2 h-4 w-4" />
          Browse Courses
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockStudentCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-xl transition-all border-gray-200">
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold text-[#0D542B]">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{course.enrolled} / {course.totalStudents} mahasiswa</span>
                  <span className="text-emerald-600 font-medium">Ongoing</span>
                </div>

                <Button
                  onClick={() => router.push(`/student/courses/details?courseId=${course.id}`)}
                  className="w-full bg-[#0D542B] hover:bg-[#0A3F21]"
                >
                  Lanjut Belajar →
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}