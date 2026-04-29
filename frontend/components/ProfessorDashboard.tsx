import { useState } from 'react';

const mockCourses = [
  { id: 1, title: 'Algoritma dan Pemrograman', students: 45, weeks: 17 },
  { id: 2, title: 'Basis Data', students: 38, weeks: 17 },
  { id: 3, title: 'Pemrograman Web', students: 42, weeks: 17 },
];

export function ProfessorDashboard() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg p-6 mb-6" style={{
        background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)'
      }}>
        <h2 className="text-2xl font-semibold text-white mb-1">Dashboard</h2>
        <p className="text-white/60">Welcome back, Professor</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="text-gray-600 text-sm mb-2">Total Courses</div>
          <div className="text-3xl font-semibold text-gray-900">{mockCourses.length}</div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="text-gray-600 text-sm mb-2">Total Students</div>
          <div className="text-3xl font-semibold text-gray-900">
            {mockCourses.reduce((sum, c) => sum + c.students, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="text-gray-600 text-sm mb-2">Active Assignments</div>
          <div className="text-3xl font-semibold text-gray-900">8</div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-200">
          <div className="p-4">
            <p className="text-gray-900">New submission: Tugas 5 - Algoritma dan Pemrograman</p>
            <p className="text-gray-500 text-sm mt-1">2 hours ago</p>
          </div>
          <div className="p-4">
            <p className="text-gray-900">Student enrolled: Basis Data</p>
            <p className="text-gray-500 text-sm mt-1">5 hours ago</p>
          </div>
          <div className="p-4">
            <p className="text-gray-900">New submission: Project Akhir - Pemrograman Web</p>
            <p className="text-gray-500 text-sm mt-1">1 day ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfessorCourses() {
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);

  if (selectedCourse && selectedWeek) {
    return <CourseWeekDetail courseId={selectedCourse} weekNumber={selectedWeek} onBack={() => setSelectedWeek(null)} />;
  }

  if (selectedCourse) {
    return <CourseDetail courseId={selectedCourse} onBack={() => setSelectedCourse(null)} onWeekSelect={setSelectedWeek} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg p-6 mb-6 flex justify-between items-center" style={{
        background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)'
      }}>
        <h2 className="text-2xl font-semibold text-white">My Courses</h2>
        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20">
          + Create Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => setSelectedCourse(course.id)}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">{course.title}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📚 17 weeks</p>
              <p>👥 {course.students} students</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CourseDetail({ courseId, onBack, onWeekSelect }: { courseId: number; onBack: () => void; onWeekSelect: (week: number) => void }) {
  const course = mockCourses.find(c => c.id === courseId);
  const weeks = Array.from({ length: 17 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      <div className="rounded-lg p-6 mb-6" style={{
        background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)'
      }}>
        <button onClick={onBack} className="text-white/60 hover:text-white mb-3">← Back</button>
        <h2 className="text-2xl font-semibold text-white">{course?.title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="text-gray-600 text-sm mb-2">Enrolled Students</div>
          <div className="text-3xl font-semibold text-gray-900">{course?.students}</div>
        </div>
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="text-gray-600 text-sm mb-2">Total Weeks</div>
          <div className="text-3xl font-semibold text-gray-900">17</div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Weeks</h3>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-200">
          {weeks.map((week) => (
            <button
              key={week}
              onClick={() => onWeekSelect(week)}
              className="w-full p-4 hover:bg-gray-50 transition-colors text-left flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0D542B] to-[#004F3B] flex items-center justify-center text-white font-semibold">
                  {week}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Week {week}</p>
                  <p className="text-sm text-gray-500">Materials and assignments</p>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseWeekDetail({ courseId, weekNumber, onBack }: { courseId: number; weekNumber: number; onBack: () => void }) {
  const course = mockCourses.find(c => c.id === courseId);
  const [activeTab, setActiveTab] = useState<'materials' | 'assignments'>('materials');
  const [showModal, setShowModal] = useState(false);

  const materials = [
    { id: 1, title: 'Slide Perkuliahan', type: 'ppt', url: '#' },
    { id: 2, title: 'Modul Praktikum', type: 'pdf', url: '#' },
    { id: 3, title: 'Video Tutorial', type: 'video_link', url: '#' },
  ];

  const assignments = [
    {
      id: 1,
      title: `Tugas Week ${weekNumber}`,
      description: 'Buat program sesuai spesifikasi yang diberikan',
      startDate: '2026-04-20',
      endDate: '2026-04-27',
      submissions: 28
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg p-6 mb-6" style={{
        background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)'
      }}>
        <button onClick={onBack} className="text-white/60 hover:text-white mb-3">← Back</button>
        <h2 className="text-2xl font-semibold text-white">{course?.title}</h2>
        <p className="text-white/60">Week {weekNumber}</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2 ${activeTab === 'materials' ? 'text-gray-900 border-b-2 border-[#0D542B]' : 'text-gray-500'}`}
        >
          Materials
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 ${activeTab === 'assignments' ? 'text-gray-900 border-b-2 border-[#0D542B]' : 'text-gray-500'}`}
        >
          Assignments
        </button>
      </div>

      {activeTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Course Materials</h3>
            <button className="px-4 py-2 bg-gradient-to-r from-[#0D542B] to-[#004F3B] hover:opacity-90 text-white rounded-lg transition-opacity">
              + Add Material
            </button>
          </div>
          <div className="space-y-3">
            {materials.map((material) => (
              <div key={material.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {material.type === 'pdf' && '📄'}
                    {material.type === 'ppt' && '📊'}
                    {material.type === 'video_link' && '🎥'}
                  </span>
                  <div>
                    <p className="text-gray-900">{material.title}</p>
                    <p className="text-gray-500 text-sm capitalize">{material.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#0D542B] to-[#004F3B] hover:opacity-90 text-white rounded-lg transition-opacity"
            >
              + Create Assignment
            </button>
          </div>
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{assignment.title}</h4>
                <p className="text-gray-600 mb-4">{assignment.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Start Date</p>
                    <p className="text-gray-900">{assignment.startDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Due Date</p>
                    <p className="text-gray-900">{assignment.endDate}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">Submissions: {assignment.submissions}/{course?.students}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <CreateAssignmentModal onClose={() => setShowModal(false)} weekNumber={weekNumber} />
      )}
    </div>
  );
}

function CreateAssignmentModal({ onClose, weekNumber }: { onClose: () => void; weekNumber: number }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    file: null as File | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Assignment created:', formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Create Assignment - Week {weekNumber}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Assignment Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0D542B] text-gray-900"
              placeholder="e.g., Tugas Week 1 - Introduction"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0D542B] text-gray-900 h-24"
              placeholder="Describe the assignment..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Start Date</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0D542B] text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Due Date</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0D542B] text-gray-900"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Upload Assignment File (Optional)</label>
            <input
              type="file"
              onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0D542B] text-gray-900"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
            />
            <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX, PPT, PPTX</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0D542B] to-[#004F3B] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Create Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProfessorStudents() {
  const students = [
    { id: 1, name: 'Budi Santoso', nim: '2021010001', class: 'TI-3A', courses: 3 },
    { id: 2, name: 'Siti Nurhaliza', nim: '2021010002', class: 'TI-3A', courses: 3 },
    { id: 3, name: 'Ahmad Zaki', nim: '2021010003', class: 'TI-3B', courses: 2 },
    { id: 4, name: 'Dewi Lestari', nim: '2021010004', class: 'TI-3A', courses: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg p-6 mb-6" style={{
        background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)'
      }}>
        <h2 className="text-2xl font-semibold text-white">Students</h2>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left p-4 text-gray-700">NIM</th>
              <th className="text-left p-4 text-gray-700">Name</th>
              <th className="text-left p-4 text-gray-700">Class</th>
              <th className="text-left p-4 text-gray-700">Enrolled Courses</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-600">{student.nim}</td>
                <td className="p-4 text-gray-900">{student.name}</td>
                <td className="p-4 text-gray-600">{student.class}</td>
                <td className="p-4 text-gray-600">{student.courses}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
