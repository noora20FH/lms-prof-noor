"use client";

import { useState } from "react";
import Link from "next/link";
import {
  mockProfessorCourses,
  mockProfessorStudents,
} from "@/data/mock/mock-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Pencil, Plus, Users } from "lucide-react";
import AddCourseModal, {
  type NewCoursePayload,
} from "@/components/professor/AddCourseModal";
import EditCourseModal, {
  type CourseStatus,
  type EditableCourseData,
  type UpdateCoursePayload,
} from "@/components/professor/EditCourseModal";

type ProfessorCourse = {
  id: string;
  title: string;
  description: string;
  totalStudents: number;
  status: CourseStatus;
};

const normalizeCourseStatus = (status?: string): CourseStatus => {
  return status === "disabled" ? "disabled" : "active";
};

const getApprovedStudentCountByCourse = (courseId: string) => {
  return mockProfessorStudents.filter((student) => {
    const isSameCourse = String(student.courseId) === String(courseId);
    const isApproved = String(student.status).toLowerCase() === "approved";

    return isSameCourse && isApproved;
  }).length;
};

export default function ProfessorCourses() {
  const [courses, setCourses] = useState<ProfessorCourse[]>(
    mockProfessorCourses.map((course) => ({
      id: String(course.id),
      title: course.title,
      description: course.description,
      totalStudents: course.totalStudents,
      status: normalizeCourseStatus(
        (course as { status?: string }).status
      ),
    }))
  );

  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] =
    useState<EditableCourseData | null>(null);

  const handleAddCourse = (course: NewCoursePayload) => {
    const newCoursePayload = course as NewCoursePayload & {
      status?: CourseStatus;
    };

    const newCourse: ProfessorCourse = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `course-${Date.now()}`,
      title: course.title,
      description: course.description,
      totalStudents: course.totalStudents,
      status: newCoursePayload.status ?? "active",
    };

    setCourses((previousCourses) => [newCourse, ...previousCourses]);
  };

  const openEditCourseModal = (course: ProfessorCourse) => {
    setSelectedCourse(course);
  };

  const closeEditCourseModal = () => {
    setSelectedCourse(null);
  };

  const handleUpdateCourse = (updatedCourse: UpdateCoursePayload) => {
    setCourses((previousCourses) =>
      previousCourses.map((course) =>
        course.id === updatedCourse.id
          ? {
              ...course,
              title: updatedCourse.title,
              description: updatedCourse.description,
              totalStudents: updatedCourse.totalStudents,
              status: updatedCourse.status,
            }
          : course
      )
    );
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl p-8 text-white flex justify-between items-end"
        style={{
          background:
            "linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)",
        }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-white/80 mt-1">
            Kelola mata kuliah yang kamu ajar
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setIsAddCourseModalOpen(true)}
          className="bg-white text-[#0D542B] hover:bg-white/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const approvedStudents = getApprovedStudentCountByCourse(course.id);
          const isCourseActive = course.status === "active";

          return (
            <Card
              key={course.id}
              className={`border border-gray-200 transition-all duration-300 ${
                isCourseActive
                  ? "hover:shadow-xl"
                  : "bg-gray-50 opacity-75"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                      isCourseActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openEditCourseModal(course)}
                    className="shrink-0"
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                </div>

                <CardTitle className="text-xl">{course.title}</CardTitle>

                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {approvedStudents} / {course.totalStudents} mahasiswa
                    </span>
                  </div>

                  <span
                    className={`text-xs px-3 py-1 rounded-2xl font-medium ${
                      isCourseActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {isCourseActive ? "Active" : "Disabled"}
                  </span>
                </div>

                <div className="flex gap-3">
                  {isCourseActive ? (
                    <Button
                      asChild
                      className="flex-1 bg-[#0D542B] hover:bg-[#0A3F21]"
                    >
                      <Link
                        href={`/professor/courses/details?courseId=${course.id}`}
                      >
                        Kelola Materi
                      </Link>
                    </Button>
                  ) : (
                    <Button type="button" disabled className="flex-1">
                      Kelola Materi
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onAddCourse={handleAddCourse}
      />

      <EditCourseModal
        isOpen={Boolean(selectedCourse)}
        course={selectedCourse}
        onClose={closeEditCourseModal}
        onUpdateCourse={handleUpdateCourse}
      />
    </div>
  );
}