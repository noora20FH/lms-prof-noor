"use client";

import { mockAssignments } from "@/data/mock/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StudentAssignments() {
  const pending = mockAssignments.filter(a => a.status === "pending");
  const submitted = mockAssignments.filter(a => a.status === "submitted" || a.status === "graded");

  return (
    <div className="space-y-8">
      {/* Header Gradient (persis dari Figma) */}
      <div 
        className="rounded-3xl p-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)'
        }}
      >
        <h1 className="text-4xl font-bold">Assignments</h1>
        <p className="text-emerald-200 mt-2">Kelola semua tugasmu di sini</p>
      </div>

      {/* Pending Assignments */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">
          Pending ({pending.length})
        </h3>
        <div className="space-y-4">
          {pending.map((assignment) => (
            <Card key={assignment.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-semibold">{assignment.title}</h4>
                    <p className="text-gray-500">{assignment.course}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-2xl text-sm font-medium ${
                    assignment.daysLeft <= 3 
                      ? "bg-red-100 text-red-700" 
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {assignment.daysLeft} hari lagi
                  </span>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <p className="text-sm text-gray-600">
                    Due: <span className="font-medium">{assignment.dueDate}</span>
                  </p>
                  <Button 
                    className="bg-[#0D542B] hover:bg-[#0D542B]/90 px-8"
                  >
                    Submit Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Submitted Assignments */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">
          Submitted ({submitted.length})
        </h3>
        <div className="space-y-4">
          {submitted.map((assignment) => (
            <Card key={assignment.id} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-semibold">{assignment.title}</h4>
                    <p className="text-gray-500">{assignment.course}</p>
                  </div>
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-2xl text-sm font-medium">
                    Submitted
                  </span>
                </div>
                {assignment.submittedDate && (
                  <p className="text-sm text-gray-600 mt-4">
                    Submitted on: <span className="font-medium">{assignment.submittedDate}</span>
                  </p>
                )}
                {assignment.score && (
                  <p className="text-sm text-emerald-600 mt-1">
                    Nilai: <span className="font-bold">{assignment.score}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}