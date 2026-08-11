"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { api, csrf, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Pencil, Plus, Trash2, Users } from "lucide-react";
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
  const t = useTranslations("ProfessorCourses");
  const [courses, setCourses] = useState<ProfessorCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] =
    useState<EditableCourseData | null>(null);

  useEffect(() => {
    void loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setError(getErrorMessage(error, t("loadError")));
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
      window.alert(getErrorMessage(error, t("addError")));
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
      window.alert(getErrorMessage(error, t("updateError")));
    }
  };

  const handleDeleteCourse = async (course: ProfessorCourse) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete "${course.title}"? This action cannot be undone.`
    );

    if (!isConfirmed) return;

    try {
      setDeletingCourseId(course.id);
      await csrf();
      await api.delete(`/api/professor/courses/${course.id}`);

      setCourses((previousCourses) =>
        previousCourses.filter((item) => item.id !== course.id)
      );

      if (selectedCourse?.id === course.id) {
        setSelectedCourse(null);
      }
    } catch (error) {
      window.alert(getErrorMessage(error, "Failed to delete the course."));
    } finally {
      setDeletingCourseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div
        className="flex items-end justify-between rounded-3xl p-8 text-white"
        style={{
          background:
            "linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)",
        }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-white/80">{t("subtitle")}</p>
        </div>

        <Button
          type="button"
          onClick={() => setIsAddCourseModalOpen(true)}
          className="bg-white text-[#0D542B] hover:bg-white/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("addCourse")}
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
            {t("loading")}
          </CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            {t("empty")}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openEditCourseModal(course)}
                        disabled={deletingCourseId === course.id}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        {t("edit")}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void handleDeleteCourse(course)}
                        disabled={deletingCourseId === course.id}
                        aria-label="Delete course"
                        title="Delete course"
                        className="h-9 w-9 p-0 text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <CardTitle className="text-xl">{course.title}</CardTitle>

                  <CardDescription className="line-clamp-2">
                    {course.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="mb-6 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>
                        {t("studentsCount", {
                          approved: approvedStudents,
                          total: course.totalStudents,
                        })}
                      </span>
                    </div>

                    <span
                      className={`rounded-2xl px-3 py-1 text-xs font-medium ${
                        isCourseActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {isCourseActive ? t("active") : t("disabled")}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    {isCourseActive ? (
                      <Button
                        asChild
                        className="flex-1 bg-[#0D542B] hover:bg-[#0A3F21]"
                      >
                        <Link href={`/professor/courses/details?courseId=${course.id}`}>
                          {t("manageMaterials")}
                        </Link>
                      </Button>
                    ) : (
                      <Button type="button" disabled className="flex-1">
                        {t("manageMaterials")}
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