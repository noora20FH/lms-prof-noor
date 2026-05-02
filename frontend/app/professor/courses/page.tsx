"use client";

import { mockCourses } from "@/data/mock/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfessorCourses() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mata Kuliah Saya</h1>
        <Button className="bg-[#0D542B]">+ Tambah Mata Kuliah</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockCourses.map(course => (
          <Card key={course.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg">{course.title}</h3>
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">{course.description}</p>
              <div className="mt-6 flex justify-between text-sm">
                <span className="text-emerald-600">{course.enrolled} mahasiswa</span>
                <Button variant="outline" size="sm">Kelola</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}