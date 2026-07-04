"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type CourseStatus = "active" | "disabled";

export type NewCoursePayload = {
  title: string;
  description: string;
  totalStudents: number;
  status: CourseStatus;
};

type CourseFormState = {
  title: string;
  description: string;
  totalStudents: string;
  status: CourseStatus;
};

type AddCourseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (course: NewCoursePayload) => Promise<void> | void;
};

const initialCourseForm: CourseFormState = {
  title: "",
  description: "",
  totalStudents: "",
  status: "active",
};

export default function AddCourseModal({
  isOpen,
  onClose,
  onAddCourse,
}: AddCourseModalProps) {
  const [courseForm, setCourseForm] =
    useState<CourseFormState>(initialCourseForm);

  if (!isOpen) {
    return null;
  }

  const updateCourseForm = (
    field: keyof CourseFormState,
    value: string
  ) => {
    setCourseForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  };

  const resetAndCloseModal = () => {
    setCourseForm(initialCourseForm);
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = courseForm.title.trim();
    const description = courseForm.description.trim();
    const totalStudents = Number(courseForm.totalStudents);

    if (!title || !description || !courseForm.totalStudents) {
      window.alert("Nama course, deskripsi, dan total mahasiswa wajib diisi.");
      return;
    }

    if (Number.isNaN(totalStudents) || totalStudents <= 0) {
      window.alert("Total mahasiswa harus lebih dari 0.");
      return;
    }

    await onAddCourse({
      title,
      description,
      totalStudents,
      status: courseForm.status,
    });

    resetAndCloseModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={resetAndCloseModal}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Tambah Course Baru
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Lengkapi data course yang akan ditambahkan.
            </p>
          </div>

          <button
            type="button"
            onClick={resetAndCloseModal}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label
              htmlFor="course-title"
              className="text-sm font-medium text-gray-700"
            >
              Nama Course
            </label>
            <input
              id="course-title"
              type="text"
              value={courseForm.title}
              onChange={(event) =>
                updateCourseForm("title", event.target.value)
              }
              placeholder="Contoh: Pemrograman Web Lanjut"
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0D542B] focus:ring-2 focus:ring-[#0D542B]/20"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="course-description"
              className="text-sm font-medium text-gray-700"
            >
              Deskripsi Course
            </label>
            <textarea
              id="course-description"
              value={courseForm.description}
              onChange={(event) =>
                updateCourseForm("description", event.target.value)
              }
              placeholder="Tuliskan deskripsi singkat course."
              rows={4}
              className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0D542B] focus:ring-2 focus:ring-[#0D542B]/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="course-total-students"
                className="text-sm font-medium text-gray-700"
              >
                Total Mahasiswa
              </label>
              <input
                id="course-total-students"
                type="number"
                min={1}
                value={courseForm.totalStudents}
                onChange={(event) =>
                  updateCourseForm("totalStudents", event.target.value)
                }
                placeholder="Contoh: 40"
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0D542B] focus:ring-2 focus:ring-[#0D542B]/20"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="course-status"
                className="text-sm font-medium text-gray-700"
              >
                Status Course
              </label>
              <select
                id="course-status"
                value={courseForm.status}
                onChange={(event) =>
                  updateCourseForm("status", event.target.value)
                }
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#0D542B] focus:ring-2 focus:ring-[#0D542B]/20"
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-5">
            <Button type="button" variant="outline" onClick={resetAndCloseModal}>
              Batal
            </Button>

            <Button type="submit" className="bg-[#0D542B] hover:bg-[#0A3F21]">
              Simpan Course
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}