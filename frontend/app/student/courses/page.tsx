"use client";

import { mockStudentCourses } from "@/data/mock/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function StudentCourses() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Mata Kuliah Saya</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockStudentCourses.map(course => (
          <Card key={course.id} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold">{course.title}</h3>
              <Progress value={course.progress} className="my-4" />
              <p className="text-sm text-gray-500">{course.progress}% selesai</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}