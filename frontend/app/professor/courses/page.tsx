"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, csrf, getErrorMessage } from "@/lib/api";
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
  approvedStudents: number;
  status: CourseStatus;
};

type ApiCourse = {
  id: string;
  title: string;
  description: string | null;
  status: CourseStatus;
  capacity?: number;
  total_students?: number;
  approved_students_count?: number;
};

const normalizeCourseStatus = (status?: string): CourseStatus => {
  return status === "disabled" ? "disabled" : "active";
};

const mapApiCourse = (course: ApiCourse): ProfessorCourse => ({
  id: String(course.id),
  title: course.title,
  description: course.description ?? "",
  totalStudents: Number(course.total_students ?? course.capacity ?? 50),
  approvedStudents: Number(course.approved_students_count ?? 0),
  status: normalizeCourseStatus(course.status),
});

export default function ProfessorCourses() {
  const [courses, setCourses] = useState<ProfessorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] =
    useState<EditableCourseData | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await api.get<{ courses: ApiCourse[] }>(
        "/api/professor/courses"
      );

      setCourses(response.data.courses.map(mapApiCourse));
    } catch (error) {
      setError(getErrorMessage(error, "Gagal mengambil data mata kuliah."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = async (course: NewCoursePayload) => {
    try {
      await csrf();

      const response = await api.post<{ course: ApiCourse }>(
        "/api/professor/courses",
        {
          title: course.title,
          description: course.description,
          total_students: course.totalStudents,
          capacity: course.totalStudents,
          status: course.status,
          total_weeks: 17,
        }
      );

      setCourses((previousCourses) => [
        mapApiCourse(response.data.course),
        ...previousCourses,
      ]);
    } catch (error) {
      window.alert(getErrorMessage(error, "Gagal menambahkan mata kuliah."));
    }
  };

  const openEditCourseModal = (course: ProfessorCourse) => {
    setSelectedCourse(course);
  };

  const closeEditCourseModal = () => {
    setSelectedCourse(null);
  };

  const handleUpdateCourse = async (updatedCourse: UpdateCoursePayload) => {
    try {
      await csrf();

      const response = await api.put<{ course: ApiCourse }>(
        `/api/professor/courses/${updatedCourse.id}`,
        {
          title: updatedCourse.title,
          description: updatedCourse.description,
          total_students: updatedCourse.totalStudents,
          capacity: updatedCourse.totalStudents,
          status: updatedCourse.status,
        }
      );

      const mappedCourse = mapApiCourse(response.data.course);

      setCourses((previousCourses) =>
        previousCourses.map((course) =>
          course.id === mappedCourse.id ? mappedCourse : course
        )
      );
    } catch (error) {
      window.alert(getErrorMessage(error, "Gagal memperbarui mata kuliah."));
    }
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

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Memuat mata kuliah...
          </CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            Belum ada mata kuliah. Klik Tambah Course untuk membuat mata kuliah baru.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const approvedStudents = course.approvedStudents;
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
      )}

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
