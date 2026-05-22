'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  mockAssignments,
  mockCourseMaterials,
  mockProfessorCourses,
  mockSubmissions,
  type Submission,
} from '@/data/mock/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Download,
  Eye,
  FileText,
  MoreVertical,
  Presentation,
  Video,
  X,
} from 'lucide-react';
import CreateAssignmentModal from '@/components/professor/CreateAssignmentModal';
import AddMaterialModal from '@/components/professor/AddMaterialModal';
import GradeSubmissionModal from '@/components/professor/GradeSubmissionModal';

type ActiveTab = 'materials' | 'assignments' | 'submissions';

function getMaterialIcon(type: string) {
  if (type === 'pdf') {
    return <FileText className="h-6 w-6 text-red-600" />;
  }
  if (type === 'ppt') {
    return <Presentation className="h-6 w-6 text-orange-600" />;
  }
  if (type === 'video_link') {
    return <Video className="h-6 w-6 text-blue-600" />;
  }
  return <FileText className="h-6 w-6 text-gray-600" />;
}

function formatMaterialType(type: string) {
  if (type === 'pdf') return 'PDF';
  if (type === 'ppt') return 'PPT';
  if (type === 'video_link') return 'Video Link';
  return type;
}

function getAssignmentStatusClass(status: string) {
  if (status === 'graded') return 'bg-blue-100 text-blue-700';
  if (status === 'submitted') return 'bg-emerald-100 text-emerald-700';
  return 'bg-yellow-100 text-yellow-700';
}

function CourseWeekDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawCourseId = searchParams.get('courseId') ?? '1';
  const numericCourseId = Number(rawCourseId);
  const weekNumber = Number(searchParams.get('week')) || 1;

  const [activeTab, setActiveTab] = useState<ActiveTab>('materials');
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);

  // State untuk modal preview & grading
  const [previewFile, setPreviewFile] = useState<Submission | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);

  const course = mockProfessorCourses.find((item) => item.id === rawCourseId);

  const materials = useMemo(() => {
    return mockCourseMaterials.filter(
      (material) =>
        material.courseId === numericCourseId && material.week === weekNumber
    );
  }, [numericCourseId, weekNumber]);

  const assignments = useMemo(() => {
    return mockAssignments.filter(
      (assignment) =>
        assignment.courseId === numericCourseId && assignment.week === weekNumber
    );
  }, [numericCourseId, weekNumber]);

  const weekSubmissions = useMemo(() => {
    const assignmentIds = assignments.map((a) => a.id);
    return submissions.filter((sub) => assignmentIds.includes(sub.assignmentId));
  }, [assignments, submissions]);

  const getSubmissionsForAssignment = (assignmentId: string) =>
    weekSubmissions.filter((sub) => sub.assignmentId === assignmentId);

  const isPreviewable = (fileName: string) =>
    fileName.toLowerCase().endsWith('.pdf');

  // Fungsi update nilai (real-time)
  const handleSaveGrade = (submissionId: string, score: number, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === submissionId
          ? { ...sub, score, feedback, status: 'graded' as const }
          : sub
      )
    );
  };

  if (!course) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push('/professor/courses')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Course tidak ditemukan
            </h2>
            <p className="mt-2 text-gray-500">
              Data mata kuliah dengan ID tersebut belum tersedia.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div
        className="rounded-3xl p-8 text-white"
        style={{
          background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)',
        }}
      >
        <button
          type="button"
          onClick={() => router.push(`/professor/courses/details?courseId=${course.id}`)}
          className="mb-4 flex items-center text-sm text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="mt-2 text-white/70">Week {weekNumber}</p>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'materials'
              ? 'border-b-2 border-[#0D542B] text-gray-900'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Materials
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'assignments'
              ? 'border-b-2 border-[#0D542B] text-gray-900'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Assignments
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'submissions'
              ? 'border-b-2 border-[#0D542B] text-gray-900'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Submitted Tasks
        </button>
      </div>

      {/* MATERIALS TAB */}
      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Course Materials</h2>
            <Button
              onClick={() => setShowAddMaterialModal(true)}
              className="bg-gradient-to-r from-[#0D542B] to-[#004F3B] text-white hover:opacity-90"
            >
              + Add Material
            </Button>
          </div>
          {materials.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                <p className="text-gray-500">Belum ada material untuk Week {weekNumber}.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <Card key={material.id} className="border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                        {getMaterialIcon(material.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{material.title}</p>
                        <p className="text-sm text-gray-500">{formatMaterialType(material.type)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm">
                        <a href={material.url} target="_blank" rel="noopener noreferrer">
                          Open
                        </a>
                      </Button>
                      <button type="button" className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
            <Button
              onClick={() => setShowCreateAssignmentModal(true)}
              className="bg-gradient-to-r from-[#0D542B] to-[#004F3B] text-white hover:opacity-90"
            >
              + Create Assignment
            </Button>
          </div>
          {/* ... (assignments card) */}
          {assignments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardList className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                <p className="text-gray-500">Belum ada assignment untuk Week {weekNumber}.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {assignments.map((assignment) => {
                const submissionsCount = getSubmissionsForAssignment(assignment.id).length;
                return (
                  <Card key={assignment.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{assignment.course}</p>
                        </div>
                        <span className={`rounded-2xl px-3 py-1 text-xs font-medium capitalize ${getAssignmentStatusClass(assignment.status)}`}>
                          {assignment.status}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                        <div className="rounded-xl bg-gray-50 p-4">
                          <p className="text-gray-500">Due Date</p>
                          <div className="mt-1 flex items-center gap-2 text-gray-900">
                            <CalendarDays className="h-4 w-4" />
                            <span>{assignment.dueDate}</span>
                          </div>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-4">
                          <p className="text-gray-500">Days Left</p>
                          <p className={`mt-1 font-medium ${assignment.daysLeft < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            {assignment.daysLeft < 0 ? `${Math.abs(assignment.daysLeft)} hari lewat` : `${assignment.daysLeft} hari`}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <ClipboardList className="h-4 w-4" />
                          <span>{submissionsCount} mahasiswa sudah mengumpulkan</span>
                        </div>
                        <Button variant="link" size="sm" onClick={() => setActiveTab('submissions')} className="text-[#0D542B]">
                          Lihat semua →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBMITTED TASKS TAB (dengan nilai + modal) */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Submitted Tasks</h2>
            <div className="text-sm text-gray-500">
              Total: <span className="font-medium text-gray-900">{weekSubmissions.length}</span> submission
            </div>
          </div>

          {weekSubmissions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ClipboardList className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                <p className="text-gray-500">Belum ada mahasiswa yang mengumpulkan tugas di week ini.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {assignments.map((assignment) => {
                const subs = getSubmissionsForAssignment(assignment.id);
                if (subs.length === 0) return null;

                return (
                  <Card key={assignment.id} className="border border-gray-200 shadow-sm">
                    <CardContent className="p-6">
                      <h3 className="text-base font-semibold text-gray-900 border-b pb-3 mb-4">
                        {assignment.title}
                      </h3>
                      <div className="space-y-4">
                        {subs.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 hover:shadow transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-2xl">📄</div>
                              <div>
                                <p className="font-semibold text-gray-900">{sub.studentName}</p>
                                <p className="text-sm text-gray-500">{sub.nim}</p>
                                <p className="mt-1 text-sm text-gray-600">{sub.fileName}</p>
                                <p className="text-xs text-gray-400 mt-1">Dikumpulkan: {sub.submittedAt}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {sub.score !== undefined && (
                                <div className="text-center min-w-[60px]">
                                  <span className="text-xs text-gray-500 block">Nilai</span>
                                  <span className="text-3xl font-bold text-emerald-600">{sub.score}</span>
                                </div>
                              )}

                              {isPreviewable(sub.fileName) && (
                                <Button variant="outline" size="sm" onClick={() => setPreviewFile(sub)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                              )}

                              <Button variant="outline" size="sm" asChild>
                                <a href={sub.fileUrl} download>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>

                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-[#0D542B] to-[#004F3B]"
                                onClick={() => setGradingSubmission(sub)}
                              >
                                {sub.score !== undefined ? 'Edit Nilai' : 'Beri Nilai'}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL PREVIEW PDF */}
      {previewFile && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
          <div className="bg-white w-full max-w-7xl mx-4 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <div className="flex items-center justify-between border-b px-6 py-4 bg-white">
              <div>
                <p className="font-semibold text-gray-900">{previewFile.studentName}</p>
                <p className="text-sm text-gray-500">{previewFile.fileName}</p>
              </div>
              <button onClick={() => setPreviewFile(null)} className="rounded-full p-3 hover:bg-gray-100">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 p-4 bg-gray-100 overflow-auto">
              <iframe
                src={previewFile.fileUrl}
                className="w-full h-full min-h-[70vh] rounded-2xl border border-gray-200 shadow-inner"
                title={previewFile.fileName}
              />
            </div>
            <div className="flex justify-end gap-3 border-t px-6 py-4 bg-white">
              <Button variant="outline" onClick={() => setPreviewFile(null)}>
                Tutup
              </Button>
              <Button asChild>
                <a href={previewFile.fileUrl} download={previewFile.fileName}>
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GRADING */}
      <GradeSubmissionModal
        submission={gradingSubmission}
        isOpen={!!gradingSubmission}
        onClose={() => setGradingSubmission(null)}
        onSave={handleSaveGrade}
      />

      {/* Modals lain */}
      {showAddMaterialModal && <AddMaterialModal weekNumber={weekNumber} onClose={() => setShowAddMaterialModal(false)} />}
      {showCreateAssignmentModal && <CreateAssignmentModal weekNumber={weekNumber} onClose={() => setShowCreateAssignmentModal(false)} />}
    </div>
  );
}

export default function CourseWeekDetailPage() {
  return (
    <Suspense fallback={<div>Loading week detail...</div>}>
      <CourseWeekDetailContent />
    </Suspense>
  );
}