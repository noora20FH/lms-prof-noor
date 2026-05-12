"use client";

import { mockStudentCourses, mockAssignments } from "@/data/mock/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function StudentDashboard() {
  const pending = mockAssignments.filter(a => a.status === "pending");

  return (
    <div className="space-y-8">
      <div className="rounded-3xl p-8 text-white" style={{
        background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 100%)'
      }}>
        <h1 className="text-4xl font-bold">Halo, Noora Putri! 🎓</h1>
        <p className="text-emerald-200 mt-2">Lanjutkan perjalanan belajarmu</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mata Kuliah */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Mata Kuliah yang Diikuti</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockStudentCourses.map(course => (
              <Card key={course.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <p className="font-semibold">{course.title}</p>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tugas Pending */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Tugas Pending ({pending.length})</h2>
          <div className="space-y-4">
            {pending.map(assignment => (
              <Card key={assignment.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <p className="font-medium">{assignment.title}</p>
                  <p className="text-sm text-gray-500">{assignment.course}</p>
                  <p className="text-xs text-red-600 mt-3">
                    {assignment.daysLeft} hari lagi
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}